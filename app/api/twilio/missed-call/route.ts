import { NextResponse } from "next/server";
import { defaultFirstSms } from "@/lib/constants";
import { formDataToRecord, sendSms, validateTwilioSignature } from "@/lib/twilio";
import { audit, simulateMissedCall } from "@/lib/mock-store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const form = formDataToRecord(formData);
    const url = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/missed-call`
      : request.url;

    if (!validateTwilioSignature({ url, form, signature: request.headers.get("x-twilio-signature") })) {
      return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 403 });
    }

    const callerPhone = form.From || form.Caller || form.caller_phone;
    const businessNumber = form.To || form.Called || form.business_number;
    if (!callerPhone) {
      return NextResponse.json({ error: "Caller phone is required." }, { status: 400 });
    }

    // The mock store models the full missed-call flow without requiring Supabase or Twilio.
    const simulator = await simulateMissedCall(callerPhone, form.CallerName);
    const body = defaultFirstSms.replace("[Business Name]", simulator.business.name);
    await sendSms({ to: callerPhone, from: businessNumber, body });

    audit("twilio.missed_call", {
      callerPhone,
      businessNumber,
      callSid: form.CallSid,
      mockMode: true,
    });

    return NextResponse.json({
      ok: true,
      mode: "mock_or_twilio",
      missed_call: simulator.missedCall,
      conversation: simulator.conversation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to handle missed call." },
      { status: 500 },
    );
  }
}
