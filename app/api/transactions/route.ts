import { NextResponse } from "next/server";
import { createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const accessToken = readBearerToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const supabase = createRouteSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*, transaction_line_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ transactions: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load transactions." },
      { status: 500 },
    );
  }
}
