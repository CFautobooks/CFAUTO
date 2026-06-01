import { NextResponse } from "next/server";
import { getDemoLists, getMockStore, resetSimulator } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({
    simulator: getMockStore(),
    demo: getDemoLists(),
  });
}

export async function DELETE() {
  return NextResponse.json({ simulator: resetSimulator() });
}
