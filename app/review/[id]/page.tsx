import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ReviewForm } from "@/components/review-form";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Review"
        title="Review extracted transaction"
        description="Check the AI extraction, adjust GST or category details, add notes and approve the transaction."
      />
      <ReviewForm transactionId={id} />
    </AppShell>
  );
}
