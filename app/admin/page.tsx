import { AdminSummary } from "@/components/admin-summary";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function AdminPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin"
        title="Platform activity"
        description="Admin view for users, open recovery cases, outbound message failures and recovered revenue events."
      />

      <AdminSummary />

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[#0b1f3a]">Operational alerts</h2>
        <div className="mt-5 space-y-3">
          {[
            "Twilio delivery failed for three SMS reminders awaiting retry.",
            "Stripe webhook has not confirmed payment status for invoice INV-1187.",
            "HubSpot sync found duplicate contacts for Harbour Electrical Co.",
          ].map((alert, index) => (
            <div key={alert} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-semibold text-slate-800">Alert #{index + 1}</p>
              <p className="mt-1 text-sm text-slate-600">{alert}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
