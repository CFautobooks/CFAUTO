import { NextResponse } from "next/server";
import { audit, getMockStore, simulateCallerReply, simulateMissedCall } from "@/lib/mock-store";
import { formDataToRecord, sendSms, validateTwilioSignature } from "@/lib/twilio";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const form = formDataToRecord(formData);
    const url = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/inbound-sms`
      : request.url;

    if (!validateTwilioSignature({ url, form, signature: request.headers.get("x-twilio-signature") })) {
      return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 403 });
    }

    const callerPhone = form.From || form.caller_phone;
    const body = form.Body || form.body;
    if (!callerPhone || !body) {
      return NextResponse.json({ error: "Caller phone and SMS body are required." }, { status: 400 });
    }

    const current = getMockStore();
    if (!current.conversation || current.conversation.caller_phone !== callerPhone) {
      await simulateMissedCall(callerPhone);
    }

    const before = await simulateCallerReply(body);
    const lastMessage = before.messages.at(-1);

    if (lastMessage?.sender_type === "ai" && lastMessage.direction === "outbound") {
      await sendSms({
        to: callerPhone,
        from: form.To,
        body: lastMessage.body,
      });
    }

    audit("twilio.inbound_sms", {
      callerPhone,
      category: before.conversation?.category,
      conversationStatus: before.conversation?.status,
    });

    return NextResponse.json({
      ok: true,
      conversation: before.conversation,
      lead: before.lead,
      owner_notifications: before.ownerNotifications,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to handle inbound SMS." },
      { status: 500 },
    );
  }
}
