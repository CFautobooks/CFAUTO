import OpenAI from "openai";
import { z } from "zod";
import type { FollowUpCase, FollowUpDraft } from "@/lib/types";

const draftSchema = z.object({
  subject: z.string().default("Quick follow-up"),
  body: z.string().default(""),
  channel: z.enum(["email", "sms", "phone"]).default("email"),
  tone: z.enum(["friendly", "professional", "firm"]).default("professional"),
  recovery_score: z.number().default(50),
  recommended_next_step: z.string().default("Review the message, then schedule the follow-up."),
});

export function calculateRecoveryScore(
  followUpCase: Pick<FollowUpCase, "amount_cents" | "due_date" | "last_contacted_at">,
) {
  const amountScore = Math.min(35, Math.round(followUpCase.amount_cents / 15000));
  const overdueDays = followUpCase.due_date
    ? Math.max(0, Math.floor((Date.now() - new Date(followUpCase.due_date).getTime()) / 86400000))
    : 1;
  const overdueScore = Math.min(35, overdueDays * 4);
  const silenceDays = followUpCase.last_contacted_at
    ? Math.max(0, Math.floor((Date.now() - new Date(followUpCase.last_contacted_at).getTime()) / 86400000))
    : 7;
  const silenceScore = Math.min(30, silenceDays * 3);

  return Math.max(10, Math.min(100, amountScore + overdueScore + silenceScore));
}

export function normaliseDraft(input: unknown): FollowUpDraft {
  const parsed = draftSchema.parse(input);
  const score =
    parsed.recovery_score > 0 && parsed.recovery_score <= 1
      ? Math.round(parsed.recovery_score * 100)
      : Math.round(parsed.recovery_score);

  return {
    ...parsed,
    recovery_score: Math.max(0, Math.min(100, score)),
  };
}

export async function generateFollowUpDraft(params: {
  followUpCase: FollowUpCase;
  businessName?: string;
  preferredTone?: "friendly" | "professional" | "firm";
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackDraft(params.followUpCase, params.preferredTone);
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const customer = params.followUpCase.customer;

  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write concise, compliant follow-up messages for service businesses. Return only valid JSON with subject, body, channel, tone, recovery_score and recommended_next_step.",
      },
      {
        role: "user",
        content: JSON.stringify({
          business_name: params.businessName || "the business",
          preferred_tone: params.preferredTone || "professional",
          customer: {
            company_name: customer?.company_name,
            contact_name: customer?.contact_name,
            email: customer?.email,
            phone: customer?.phone,
          },
          case: params.followUpCase,
          rules: [
            "Do not threaten or shame the customer.",
            "If the channel is SMS, keep the body under 320 characters.",
            "Include one clear call to action.",
            "Mention payment or booking links generically as placeholders only.",
          ],
        }),
      },
    ],
    temperature: 0.3,
  });

  const response = completion.choices[0]?.message.content;
  if (!response) {
    return fallbackDraft(params.followUpCase, params.preferredTone);
  }

  return normaliseDraft(JSON.parse(response));
}

export function fallbackDraft(
  followUpCase: FollowUpCase,
  tone: "friendly" | "professional" | "firm" = "professional",
): FollowUpDraft {
  const customerName = followUpCase.customer?.contact_name || "there";
  const amount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: followUpCase.currency || "AUD",
  }).format(followUpCase.amount_cents / 100);
  const score = calculateRecoveryScore(followUpCase);
  const subject =
    followUpCase.case_type === "invoice"
      ? `Quick reminder about ${followUpCase.title}`
      : `Following up on ${followUpCase.title}`;
  const body =
    followUpCase.case_type === "invoice"
      ? `Hi ${customerName}, a quick reminder that ${followUpCase.title} for ${amount} is still open. If everything looks right, you can use the payment link on the invoice. If you have questions, just reply here.`
      : `Hi ${customerName}, just checking in on ${followUpCase.title}. Would you like to move ahead, book a quick call, or ask any questions before deciding?`;

  return {
    subject,
    body,
    channel: followUpCase.channel,
    tone,
    recovery_score: score,
    recommended_next_step: "Review the draft, add a payment or booking link, then schedule it.",
  };
}
