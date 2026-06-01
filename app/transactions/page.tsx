import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { TransactionsTable } from "@/components/transactions-table";

export default function TransactionsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Transactions"
        title="Transaction list"
        description="Search and review extracted invoices and receipts before future MYOB or Xero export."
      />
      <TransactionsTable />
    </AppShell>
  );
}
