import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSms } from "@/lib/twilio";

const bodySchema = z.object({
  to: z.string().min(5),
  body: z.string().min(1).max(1200),
  from: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await sendSms(body);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send SMS." },
      { status: 400 },
    );
  }
}
