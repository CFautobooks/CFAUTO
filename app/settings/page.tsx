import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Business and integrations"
        description="Configure your business profile and prepare accounting integrations for the next release."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Business details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Business name",
              "ABN",
              "Default GST treatment",
              "Primary contact",
              "Email",
              "Phone",
            ].map((field) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{field}</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white">
            Save settings
          </button>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Accounting integrations</h2>
          <p className="mt-2 text-sm text-slate-600">
            Integration records are included in the database schema. Live MYOB and Xero
            connections are marked coming soon for this MVP.
          </p>
          {["MYOB", "Xero"].map((integration) => (
            <div
              key={integration}
              className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <p className="font-bold text-[#0b1f3a]">{integration}</p>
                <p className="text-sm text-slate-500">Export approved transactions</p>
              </div>
              <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500">
                Coming soon
              </button>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
