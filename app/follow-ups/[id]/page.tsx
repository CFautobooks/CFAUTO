import { AppShell } from "@/components/app-shell";
import { FollowUpForm } from "@/components/follow-up-form";
import { PageHeader } from "@/components/page-header";

export default async function FollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Follow-up"
        title="Review and schedule message"
        description="Edit the AI draft, choose the next channel, and schedule follow-up without losing the human approval step."
      />
      <FollowUpForm followUpId={id} />
    </AppShell>
  );
}
