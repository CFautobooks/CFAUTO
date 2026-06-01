import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

const updateSchema = z.object({
  supplier_name: z.string().optional(),
  supplier_abn: z.string().optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  description: z.string().optional(),
  category: z.string().optional(),
  subtotal: z.number().optional(),
  gst_amount: z.number().optional(),
  total_amount: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["uploaded", "extracted", "needs_review", "approved", "exported"]).optional(),
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
      .from("transactions")
      .select("*, transaction_line_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ transaction: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load transaction.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await authenticatedClient(request);
    const body = updateSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("transactions")
      .update({
        ...body,
        invoice_date: body.invoice_date || null,
        due_date: body.due_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, transaction_line_items(*)")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ transaction: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save transaction.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 500 });
  }
}
