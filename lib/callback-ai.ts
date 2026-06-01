import OpenAI from "openai";
import { z } from "zod";
import { demoBusiness, demoSettings } from "@/lib/demo-data";
import type {
  AiConversationResult,
  Business,
  BusinessSettings,
  ConversationCategory,
  Message,
  Urgency,
} from "@/lib/types";

const aiResultSchema = z.object({
  reply_to_caller: z.string().default("Thanks. The owner will call you back soon."),
  category: z.enum([
    "new_lead",
    "existing_customer",
    "emergency",
    "personal",
    "spam",
    "wrong_number",
    "unknown",
  ]),
  lead_complete: z.boolean().default(false),
  urgency: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  extracted_details: z.object({
    name: z.string().default(""),
    phone: z.string().default(""),
    enquiry_type: z.string().default(""),
    job_description: z.string().default(""),
    address: z.string().default(""),
    preferred_callback_time: z.string().default(""),
  }),
  summary_for_owner: z.string().default(""),
  confidence_score: z.number().default(0),
  should_notify_owner_now: z.boolean().default(false),
  should_stop_ai: z.boolean().default(false),
});

export function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function normalisePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function normaliseAiResult(input: unknown): AiConversationResult {
  const parsed = aiResultSchema.parse(input);
  const confidence =
    parsed.confidence_score > 0 && parsed.confidence_score <= 1
      ? Math.round(parsed.confidence_score * 100)
      : Math.round(parsed.confidence_score);

  return {
    ...parsed,
    confidence_score: Math.max(0, Math.min(100, confidence)),
  };
}

export async function handleAiConversation(params: {
  business?: Business;
  settings?: BusinessSettings;
  callerPhone: string;
  messages: Message[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return mockAiConversation(params);
  }

  const business = params.business ?? demoBusiness;
  const settings = params.settings ?? demoSettings;
  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const history = params.messages.map((message) => ({
    sender: message.sender_type,
    body: sanitizeText(message.body),
    created_at: message.created_at,
  }));

  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          `You are the missed-call SMS assistant for ${business.name}.`,
          "Act as the business, not as OpenAI.",
          "Be polite, short and professional. Ask one question at a time.",
          "Never promise exact availability. Never provide medical, legal or financial advice.",
          "Stop when enough lead details are collected: name, reason, enquiry type, urgency, location if relevant, preferred callback time.",
          "Identify personal calls, spam, wrong numbers and emergencies.",
          "For emergencies, tell the caller to contact emergency services if unsafe and notify the owner immediately.",
          "Return strict JSON only with this exact shape:",
          JSON.stringify({
            reply_to_caller: "",
            category:
              "new_lead | existing_customer | emergency | personal | spam | wrong_number | unknown",
            lead_complete: false,
            urgency: "low | medium | high | emergency",
            extracted_details: {
              name: "",
              phone: "",
              enquiry_type: "",
              job_description: "",
              address: "",
              preferred_callback_time: "",
            },
            summary_for_owner: "",
            confidence_score: 0,
            should_notify_owner_now: false,
            should_stop_ai: false,
          }),
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          business,
          settings: {
            emergency_keywords: settings.emergency_keywords,
            ignored_keywords: settings.ignored_keywords,
            max_ai_messages_per_conversation: settings.max_ai_messages_per_conversation,
          },
          caller_phone: params.callerPhone,
          conversation_history: history,
        }),
      },
    ],
    temperature: 0.2,
  });

  const response = completion.choices[0]?.message.content;
  if (!response) {
    return mockAiConversation(params);
  }

  return normaliseAiResult(JSON.parse(response));
}

export function mockAiConversation(params: {
  callerPhone: string;
  messages: Message[];
}): AiConversationResult {
  const inbound = params.messages
    .filter((message) => message.sender_type === "caller")
    .map((message) => message.body)
    .join(" ")
    .toLowerCase();
  const latestInbound =
    params.messages.filter((message) => message.sender_type === "caller").at(-1)?.body ?? "";
  const text = inbound || latestInbound.toLowerCase();
  const details = extractMockDetails(text, params.callerPhone);

  if (/(brother|mum|mom|dad|wife|husband|mate|call me back|personal)/i.test(text)) {
    return makeResult({
      reply: "Thanks, I will let the owner know you called.",
      category: "personal",
      urgency: "low",
      complete: true,
      stop: true,
      notify: true,
      summary: `Personal call from ${params.callerPhone}.`,
      details,
      confidence: 94,
    });
  }

  if (/(wrong number|not who|mistake)/i.test(text)) {
    return makeResult({
      reply: "No worries, thanks for letting us know.",
      category: "wrong_number",
      urgency: "low",
      complete: true,
      stop: true,
      notify: false,
      summary: `Wrong number from ${params.callerPhone}.`,
      details,
      confidence: 96,
    });
  }

  if (/(spam|sell|seo|marketing|crypto|loan)/i.test(text)) {
    return makeResult({
      reply: "Thanks. We will pass this on if it is relevant.",
      category: "spam",
      urgency: "low",
      complete: true,
      stop: true,
      notify: false,
      summary: `Likely spam or sales call from ${params.callerPhone}.`,
      details,
      confidence: 88,
    });
  }

  if (/(smoke|fire|sparking|shock|flood|burst|gas|unsafe|emergency)/i.test(text)) {
    return makeResult({
      reply:
        "That sounds urgent. If anyone is unsafe, please call emergency services now. I have alerted the owner and they will respond as soon as possible.",
      category: "emergency",
      urgency: "emergency",
      complete: true,
      stop: true,
      notify: true,
      summary: `Emergency missed-call enquiry from ${params.callerPhone}: ${sanitizeText(latestInbound, 300)}`,
      details: { ...details, enquiry_type: details.enquiry_type || "Emergency" },
      confidence: 98,
    });
  }

  const hasName = Boolean(details.name);
  const hasJob = Boolean(details.job_description || details.enquiry_type);
  const hasLocation = Boolean(details.address);
  const hasCallback = Boolean(details.preferred_callback_time);

  if (!hasJob) {
    return makeResult({
      reply: "Thanks for calling. What can we help you with?",
      category: "unknown",
      urgency: "medium",
      complete: false,
      stop: false,
      notify: false,
      summary: "",
      details,
      confidence: 52,
    });
  }

  if (!hasName) {
    return makeResult({
      reply: "Thanks. What is your name?",
      category: "new_lead",
      urgency: "medium",
      complete: false,
      stop: false,
      notify: false,
      summary: "",
      details,
      confidence: 74,
    });
  }

  if (!hasLocation) {
    return makeResult({
      reply: "Thanks. What suburb or address is the job for?",
      category: "new_lead",
      urgency: "medium",
      complete: false,
      stop: false,
      notify: false,
      summary: "",
      details,
      confidence: 78,
    });
  }

  if (!hasCallback) {
    return makeResult({
      reply: "Got it. What time would suit you best for a callback?",
      category: "new_lead",
      urgency: "medium",
      complete: false,
      stop: false,
      notify: false,
      summary: "",
      details,
      confidence: 82,
    });
  }

  return makeResult({
    reply:
      "Thanks, I have the details. The owner will review this and call you back as soon as they can.",
    category: "new_lead",
    urgency: "medium",
    complete: true,
    stop: true,
    notify: true,
    summary: `${details.name || "Caller"} needs ${details.enquiry_type || "help"} at ${details.address}. Preferred callback: ${details.preferred_callback_time}.`,
    details,
    confidence: 91,
  });
}

function extractMockDetails(text: string, phone: string): AiConversationResult["extracted_details"] {
  const original = sanitizeText(text, 800);
  const nameMatch = original.match(/(?:name is|i'm|im|this is|it's|its)\s+([a-z][a-z\s'-]{1,40})/i);
  const addressMatch = original.match(
    /\b(?:at|in|near|address is)\s+([a-z0-9][a-z0-9\s,'-]{2,80})(?:\.|,|$)/i,
  );
  const callbackMatch = original.match(
    /(today after \d+\s?(?:am|pm)?|tomorrow morning|tomorrow afternoon|after \d+\s?(?:am|pm)?|anytime|this afternoon|this morning)/i,
  );
  const enquiry =
    /(aircon|ac|heat pump)/i.test(original)
      ? "Aircon install or repair"
      : /(quote|estimate)/i.test(original)
        ? "Quote request"
        : /(appointment|booking|book)/i.test(original)
          ? "Appointment request"
          : /(switchboard|power|light|electrical|sparking)/i.test(original)
            ? "Electrical job"
            : /(clean|cleaning)/i.test(original)
              ? "Cleaning enquiry"
              : "";

  return {
    name: nameMatch?.[1]?.trim().replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "",
    phone,
    enquiry_type: enquiry,
    job_description: original,
    address: addressMatch?.[1]?.trim() ?? "",
    preferred_callback_time: callbackMatch?.[1]?.trim() ?? "",
  };
}

function makeResult(params: {
  reply: string;
  category: ConversationCategory;
  complete: boolean;
  urgency: Urgency;
  details: AiConversationResult["extracted_details"];
  summary: string;
  confidence: number;
  notify: boolean;
  stop: boolean;
}): AiConversationResult {
  return {
    reply_to_caller: params.reply,
    category: params.category,
    lead_complete: params.complete,
    urgency: params.urgency,
    extracted_details: params.details,
    summary_for_owner: params.summary,
    confidence_score: params.confidence,
    should_notify_owner_now: params.notify,
    should_stop_ai: params.stop,
  };
}
