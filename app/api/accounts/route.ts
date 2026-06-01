import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateRecoveryScore, fallbackDraft } from "@/lib/follow-up";
import { createAdminSupabaseClient, createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";
import type { FollowUpCase } from "@/lib/types";

const createCaseSchema = z.object({
  company_name: z.string().min(1),
  contact_name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  title: z.string().min(1),
  case_type: z.enum(["invoice", "quote", "lead", "appointment", "repeat_service"]),
  source: z.enum([
    "manual",
    "csv",
    "gmail",
    "outlook",
    "quickbooks",
    "stripe",
    "square",
    "calendly",
    "hubspot",
    "jobber",
    "servicetitan",
    "twilio",
  ]),
  amount_cents: z.number().nonnegative().default(0),
  due_date: z.string().nullable().optional(),
  channel: z.enum(["email", "sms", "phone"]).default("email"),
});

async function authenticatedUser(request: Request) {
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

  return { accessToken, supabase, user };
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await authenticatedUser(request);
    const { data, error } = await supabase
      .from("follow_up_cases")
      .select("*, customer:customers(*)")
      .eq("user_id", user.id)
      .order("recovery_score", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ cases: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load accounts.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await authenticatedUser(request);
    const body = createCaseSchema.parse(await request.json());
    const supabase = createAdminSupabaseClient();

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        company_name: body.company_name,
        contact_name: body.contact_name || null,
        email: body.email || null,
        phone: body.phone || null,
        lifecycle_stage: body.case_type === "lead" ? "lead" : body.case_type === "quote" ? "quoted" : "customer",
        total_revenue_at_risk: body.amount_cents / 100,
      })
      .select("*")
      .single();

    if (customerError) throw new Error(customerError.message);

    const score = calculateRecoveryScore({
      amount_cents: body.amount_cents,
      due_date: body.due_date ?? null,
      last_contacted_at: null,
    });

    const draftCase: FollowUpCase = {
      id: "new",
      user_id: user.id,
      business_id: null,
      customer_id: customer.id,
      customer,
      case_type: body.case_type,
      title: body.title,
      source: body.source,
      amount_cents: body.amount_cents,
      currency: "AUD",
      due_date: body.due_date ?? null,
      last_contacted_at: null,
      next_follow_up_at: null,
      recovery_score: score,
      status: "new",
      channel: body.channel,
      draft_subject: null,
      draft_body: null,
      sequence_name: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const draft = fallbackDraft(draftCase);

    const { data: followUpCase, error: caseError } = await supabase
      .from("follow_up_cases")
      .insert({
        user_id: user.id,
        customer_id: customer.id,
        case_type: body.case_type,
        title: body.title,
        source: body.source,
        amount_cents: body.amount_cents,
        currency: "AUD",
        due_date: body.due_date ?? null,
        recovery_score: score,
        status: "drafted",
        channel: body.channel,
        draft_subject: draft.subject,
        draft_body: draft.body,
      })
      .select("*, customer:customers(*)")
      .single();

    if (caseError) throw new Error(caseError.message);

    return NextResponse.json({ case: followUpCase }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}
