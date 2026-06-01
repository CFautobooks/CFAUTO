import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SimulatorPanel } from "@/components/simulator-panel";

export default function SimulatorPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Test simulator"
        title="Simulate a missed call and AI SMS conversation"
        description="Test the complete missed-call recovery loop locally without Twilio, OpenAI or Supabase credentials."
      />
      <SimulatorPanel />
    </AppShell>
  );
}
