import { NextResponse } from "next/server";
import { z } from "zod";
import { simulateMissedCall } from "@/lib/mock-store";

const bodySchema = z.object({
  caller_phone: z.string().min(5).default("+61411111222"),
  caller_name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const simulator = await simulateMissedCall(body.caller_phone, body.caller_name);

    return NextResponse.json({ simulator });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to simulate missed call." },
      { status: 400 },
    );
  }
}
