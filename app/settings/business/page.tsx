import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { demoBusiness } from "@/lib/demo-data";

export default function BusinessProfilePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Business profile"
        title="Company profile"
        description="This information personalizes missed-call texts and owner summaries."
      />

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Business name", demoBusiness.name],
            ["Industry", demoBusiness.industry],
            ["Timezone", demoBusiness.timezone],
            ["Main phone", demoBusiness.main_phone],
            ["Owner email", "owner@example.com"],
            ["Website", "https://example.com"],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
              <input defaultValue={value} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white">
          Save profile
        </button>
      </section>
    </AppShell>
  );
}
