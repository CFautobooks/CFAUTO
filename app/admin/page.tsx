import { AdminSummary } from "@/components/admin-summary";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function AdminPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin"
        title="Platform activity"
        description="Carmichael Financials admin view for users, uploads, extraction failures and review queues."
      />

      <AdminSummary />

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[#0b1f3a]">Failed extraction queue</h2>
        <div className="mt-5 space-y-3">
          {[
            "Low image quality prevented reliable GST detection.",
            "OpenAI response missing supplier ABN.",
            "PDF text extraction failed; image fallback required.",
          ].map((failure, index) => (
            <div key={failure} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-semibold text-slate-800">Extraction log #{index + 1}</p>
              <p className="mt-1 text-sm text-slate-600">{failure}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
