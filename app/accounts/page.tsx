import { AppShell } from "@/components/app-shell";
import { AccountsTable } from "@/components/accounts-table";
import { PageHeader } from "@/components/page-header";

export default function AccountsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Accounts"
        title="Revenue recovery queue"
        description="Prioritize unpaid invoices, unanswered quotes, stale leads, missed appointments and repeat-service opportunities."
      />
      <AccountsTable />
    </AppShell>
  );
}
