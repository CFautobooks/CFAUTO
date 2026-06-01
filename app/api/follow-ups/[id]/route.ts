import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

const updateSchema = z.object({
  title: z.string().optional(),
  amount_cents: z.number().optional(),
  due_date: z.string().nullable().optional(),
  next_follow_up_at: z.string().nullable().optional(),
  channel: z.enum(["email", "sms", "phone"]).optional(),
  draft_subject: z.string().optional(),
  draft_body: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "drafted", "scheduled", "sent", "replied", "recovered", "paused", "closed"]).optional(),
});

async function authenticatedClient(request: Request) {
  const accessToken = readBearerToken(request);
  if (!accessToken) {
    throw new Error("Authentication is required.");
  }

  const supabase = createRouteSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Invalid session.");
  }

  return { supabase, user };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await authenticatedClient(request);
    const { data, error } = await supabase
      .from("follow_up_cases")
      .select("*, customer:customers(*), messages:follow_up_messages(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ case: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load follow-up.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await authenticatedClient(request);
    const body = updateSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("follow_up_cases")
      .update({
        ...body,
        due_date: body.due_date || null,
        next_follow_up_at: body.next_follow_up_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, customer:customers(*)")
      .single();

    if (error) throw new Error(error.message);

    if (body.draft_body || body.draft_subject) {
      await supabase.from("follow_up_messages").insert({
        case_id: id,
        user_id: user.id,
        channel: data.channel,
        subject: data.draft_subject,
        body: data.draft_body,
        status: data.status === "scheduled" ? "queued" : "draft",
        provider: data.channel === "sms" ? "twilio" : null,
        scheduled_at: data.next_follow_up_at,
      });
    }

    return NextResponse.json({ case: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save follow-up.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}
