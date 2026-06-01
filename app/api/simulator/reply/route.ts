import { NextResponse } from "next/server";
import { z } from "zod";
import { simulateCallerReply } from "@/lib/mock-store";

const bodySchema = z.object({
  body: z.string().min(1).max(1200),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const simulator = await simulateCallerReply(body.body);

    return NextResponse.json({ simulator });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process caller reply." },
      { status: 400 },
    );
  }
}
