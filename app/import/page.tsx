import { AppShell } from "@/components/app-shell";
import { ImportPanel } from "@/components/import-panel";
import { PageHeader } from "@/components/page-header";

export default function ImportPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Import"
        title="Import invoices, quotes and stale leads"
        description="Start manually, then connect Gmail, Outlook, QuickBooks, Stripe, Square, Calendly, HubSpot, Jobber, ServiceTitan and Twilio from Settings."
      />
      <ImportPanel />
    </AppShell>
  );
}
