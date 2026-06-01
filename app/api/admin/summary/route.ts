import { NextResponse } from "next/server";
import { createAdminSupabaseClient, createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const accessToken = readBearerToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const authClient = createRouteSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
    }

    const supabase = createAdminSupabaseClient();
    const [profiles, missedCalls, conversations, leads, emergencies] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("missed_calls").select("id", { count: "exact", head: true }),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "emergency"),
    ]);

    return NextResponse.json({
      users: profiles.count ?? 0,
      missed_calls: missedCalls.count ?? 0,
      conversations: conversations.count ?? 0,
      leads: leads.count ?? 0,
      emergencies: emergencies.count ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load admin summary." },
      { status: 500 },
    );
  }
}
