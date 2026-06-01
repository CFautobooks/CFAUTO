import { defaultFirstSms } from "@/lib/constants";
import { handleAiConversation, normalisePhone, sanitizeText } from "@/lib/callback-ai";
import {
  demoBusiness,
  demoContacts,
  demoConversations,
  demoLeads,
  demoMessages,
  demoMissedCalls,
  demoSettings,
} from "@/lib/demo-data";
import type { Conversation, Lead, Message, MissedCall, SimulatorState } from "@/lib/types";

type Store = SimulatorState & {
  rateLimits: Record<string, number[]>;
};

const globalForStore = globalThis as typeof globalThis & {
  __callbackAiStore?: Store;
};

function createStore(): Store {
  return {
    business: demoBusiness,
    settings: demoSettings,
    missedCall: demoMissedCalls[0],
    conversation: demoConversations[0],
    messages: demoMessages.filter((message) => message.conversation_id === "conversation-1"),
    lead: demoLeads[0],
    ownerNotifications: [
      "Lead captured: Mia needs an aircon install quote in Bondi. Callback today after 3pm.",
    ],
    rateLimits: {},
  };
}

export function getMockStore() {
  globalForStore.__callbackAiStore ??= createStore();
  return globalForStore.__callbackAiStore;
}

export function getDemoLists() {
  return {
    business: demoBusiness,
    settings: demoSettings,
    missedCalls: demoMissedCalls,
    conversations: demoConversations,
    messages: demoMessages,
    leads: demoLeads,
    contacts: demoContacts,
  };
}

export function resetSimulator() {
  globalForStore.__callbackAiStore = {
    ...createStore(),
    missedCall: null,
    conversation: null,
    messages: [],
    lead: null,
    ownerNotifications: [],
  };
  return globalForStore.__callbackAiStore;
}

export function checkRateLimit(key: string, limit = 12, windowMs = 60_000) {
  const store = getMockStore();
  const now = Date.now();
  const recent = (store.rateLimits[key] ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    return false;
  }
  store.rateLimits[key] = [...recent, now];
  return true;
}

export async function simulateMissedCall(callerPhone: string, callerName?: string) {
  const store = resetSimulator();
  const phone = normalisePhone(callerPhone || "+61411111222");
  const now = new Date().toISOString();

  const missedCall: MissedCall = {
    id: crypto.randomUUID(),
    business_id: store.business.id,
    caller_phone: phone,
    caller_name: sanitizeText(callerName ?? "", 80) || null,
    twilio_call_sid: `mock-${crypto.randomUUID()}`,
    call_time: now,
    status: "auto_replied",
    auto_reply_sent: true,
    ignored_reason: null,
    created_at: now,
  };

  const conversation: Conversation = {
    id: crypto.randomUUID(),
    business_id: store.business.id,
    missed_call_id: missedCall.id,
    caller_phone: phone,
    category: "unknown",
    status: "active",
    ai_summary: null,
    confidence_score: 0,
    urgency: "medium",
    created_at: now,
    updated_at: now,
  };

  const firstMessage: Message = {
    id: crypto.randomUUID(),
    conversation_id: conversation.id,
    sender_type: "ai",
    sender_phone: store.business.main_phone,
    body: defaultFirstSms.replace("[Business Name]", store.business.name),
    twilio_message_sid: "mock-sms-first",
    direction: "outbound",
    created_at: now,
  };

  store.missedCall = missedCall;
  store.conversation = conversation;
  store.messages = [firstMessage];
  store.lead = null;
  audit("simulator.missed_call", { callerPhone: phone });

  return store;
}

export async function simulateCallerReply(body: string) {
  const store = getMockStore();
  if (!store.conversation) {
    await simulateMissedCall("+61411111222");
  }

  const conversation = store.conversation;
  if (!conversation) {
    throw new Error("Unable to create simulator conversation.");
  }

  if (!checkRateLimit(conversation.caller_phone)) {
    throw new Error("Too many messages from this caller. Please wait and try again.");
  }

  const now = new Date().toISOString();
  const inbound: Message = {
    id: crypto.randomUUID(),
    conversation_id: conversation.id,
    sender_type: "caller",
    sender_phone: conversation.caller_phone,
    body: sanitizeText(body),
    twilio_message_sid: `mock-in-${crypto.randomUUID()}`,
    direction: "inbound",
    created_at: now,
  };
  store.messages.push(inbound);

  const aiMessageCount = store.messages.filter((message) => message.sender_type === "ai").length;
  if (aiMessageCount >= store.settings.max_ai_messages_per_conversation) {
    conversation.status = "stopped";
    conversation.ai_summary = "AI stopped because the max message limit was reached.";
    conversation.updated_at = now;
    audit("simulator.max_ai_messages", { conversationId: conversation.id });
    return store;
  }

  const result = await handleAiConversation({
    business: store.business,
    settings: store.settings,
    callerPhone: conversation.caller_phone,
    messages: store.messages,
  });

  conversation.category = result.category;
  conversation.urgency = result.urgency;
  conversation.confidence_score = result.confidence_score;
  conversation.status = result.should_stop_ai
    ? result.urgency === "emergency"
      ? "escalated"
      : "complete"
    : "active";
  conversation.ai_summary = result.summary_for_owner || conversation.ai_summary;
  conversation.updated_at = now;

  if (result.reply_to_caller && !result.should_stop_ai) {
    store.messages.push({
      id: crypto.randomUUID(),
      conversation_id: conversation.id,
      sender_type: "ai",
      sender_phone: store.business.main_phone,
      body: result.reply_to_caller,
      twilio_message_sid: `mock-out-${crypto.randomUUID()}`,
      direction: "outbound",
      created_at: new Date().toISOString(),
    });
  } else if (result.reply_to_caller) {
    store.messages.push({
      id: crypto.randomUUID(),
      conversation_id: conversation.id,
      sender_type: "ai",
      sender_phone: store.business.main_phone,
      body: result.reply_to_caller,
      twilio_message_sid: `mock-out-${crypto.randomUUID()}`,
      direction: "outbound",
      created_at: new Date().toISOString(),
    });
  }

  if (result.lead_complete || result.category === "emergency") {
    store.lead = upsertLeadFromAi(store, result);
  }

  if (result.should_notify_owner_now) {
    store.ownerNotifications.push(result.summary_for_owner || `Caller ${conversation.caller_phone} needs attention.`);
    audit("owner.notified", { conversationId: conversation.id, urgency: result.urgency });
  }

  audit("simulator.sms_reply", { category: result.category, complete: result.lead_complete });
  return store;
}

function upsertLeadFromAi(store: Store, result: Awaited<ReturnType<typeof handleAiConversation>>): Lead {
  const now = new Date().toISOString();
  const details = result.extracted_details;
  const status =
    result.category === "emergency"
      ? "emergency"
      : result.category === "spam"
        ? "spam"
        : result.category === "personal"
          ? "personal"
          : result.category === "wrong_number"
            ? "wrong_number"
            : "new";
  const lead: Lead = {
    id: store.lead?.id ?? crypto.randomUUID(),
    business_id: store.business.id,
    conversation_id: store.conversation?.id ?? "",
    name: details.name || store.missedCall?.caller_name || "Unknown caller",
    phone: details.phone || store.conversation?.caller_phone || "",
    enquiry_type: details.enquiry_type || result.category.replace("_", " "),
    job_description: details.job_description || result.summary_for_owner,
    urgency: result.urgency,
    address: details.address,
    preferred_callback_time: details.preferred_callback_time,
    status,
    estimated_value: result.category === "new_lead" ? 1800 : null,
    notes: result.summary_for_owner,
    created_at: store.lead?.created_at ?? now,
    updated_at: now,
  };
  return lead;
}

export function audit(action: string, metadata: Record<string, unknown>) {
  console.info("[callback-ai:audit]", action, metadata);
}
