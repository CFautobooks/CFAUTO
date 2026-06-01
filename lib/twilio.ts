import crypto from "crypto";

export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_PHONE_NUMBER),
  );
}

export async function sendSms(params: { to: string; body: string; from?: string }) {
  if (!isTwilioConfigured()) {
    console.info("[callback-ai:mock-sms]", params);
    return {
      sid: `mock-${crypto.randomUUID()}`,
      status: "mocked",
      to: params.to,
      body: params.body,
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = params.from || process.env.TWILIO_PHONE_NUMBER;
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams({
    To: params.to,
    Body: params.body,
  });

  if (messagingServiceSid) {
    form.set("MessagingServiceSid", messagingServiceSid);
  } else if (from) {
    form.set("From", from);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Twilio SMS failed.");
  }

  return payload;
}

export function validateTwilioSignature(params: {
  url: string;
  form: Record<string, string>;
  signature: string | null;
}) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !params.signature) {
    return !authToken;
  }

  const data =
    params.url +
    Object.keys(params.form)
      .sort()
      .map((key) => `${key}${params.form[key]}`)
      .join("");
  const expected = crypto.createHmac("sha1", authToken).update(data).digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(params.signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export function formDataToRecord(formData: FormData) {
  const record: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    record[key] = String(value);
  }
  return record;
}
