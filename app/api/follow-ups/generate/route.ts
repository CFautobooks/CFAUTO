import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFollowUpDraft } from "@/lib/follow-up";
import { createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

const bodySchema = z.object({
  case_id: z.string().uuid(),
  tone: z.enum(["friendly", "professional", "firm"]).optional(),
});

export async function POST(request: Request) {
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

    const body = bodySchema.parse(await request.json());
    const { data: followUpCase, error } = await supabase
      .from("follow_up_cases")
      .select("*, customer:customers(*)")
      .eq("id", body.case_id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new Error(error.message);

    const draft = await generateFollowUpDraft({
      followUpCase,
      preferredTone: body.tone,
    });

    const { data: updatedCase, error: updateError } = await supabase
      .from("follow_up_cases")
      .update({
        draft_subject: draft.subject,
        draft_body: draft.body,
        channel: draft.channel,
        recovery_score: draft.recovery_score,
        status: "drafted",
      })
      .eq("id", followUpCase.id)
      .eq("user_id", user.id)
      .select("*, customer:customers(*)")
      .single();

    if (updateError) throw new Error(updateError.message);

    await supabase.from("follow_up_messages").insert({
      case_id: updatedCase.id,
      user_id: user.id,
      channel: draft.channel,
      subject: draft.subject,
      body: draft.body,
      status: "draft",
      provider: draft.channel === "sms" ? "twilio" : null,
    });

    return NextResponse.json({ draft, case: updatedCase });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate follow-up draft." },
      { status: 500 },
    );
  }
}
