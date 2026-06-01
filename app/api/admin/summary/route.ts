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
    const [profiles, openCases, messagesSent, failedSends, recoveredCases] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("follow_up_cases")
        .select("id", { count: "exact", head: true })
        .not("status", "in", "(recovered,closed)"),
      supabase
        .from("follow_up_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "sent"),
      supabase
        .from("follow_up_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
      supabase
        .from("follow_up_cases")
        .select("id", { count: "exact", head: true })
        .eq("status", "recovered"),
    ]);

    return NextResponse.json({
      users: profiles.count ?? 0,
      open_cases: openCases.count ?? 0,
      messages_sent: messagesSent.count ?? 0,
      failed_sends: failedSends.count ?? 0,
      recovered_cases: recoveredCases.count ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load admin summary." },
      { status: 500 },
    );
  }
}
