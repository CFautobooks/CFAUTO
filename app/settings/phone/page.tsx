import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { demoBusiness } from "@/lib/demo-data";

export default function PhoneSettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Phone settings"
        title="Business number and missed-call rules"
        description="Configure the Twilio number, forwarding instructions, blocked callers and reply eligibility rules."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Phone configuration</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Business phone", demoBusiness.main_phone],
              ["Twilio number", "+61 2 5550 0199"],
              ["Forward missed calls to", demoBusiness.main_phone],
              ["Owner alert phone", "+61 400 111 222"],
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
                <input defaultValue={value} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </label>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            {[
              "Auto-reply after missed call",
              "Check blocked numbers before replying",
              "Skip saved personal contacts",
              "Prevent duplicate replies within 24 hours",
            ].map((rule) => (
              <label key={rule} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">{rule}</span>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-emerald-600" />
              </label>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Call forwarding placeholder</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Point your business line missed-call forwarding to the Twilio number. In production,
            Twilio sends unanswered calls to <code>/api/twilio/missed-call</code>, then CallBack AI
            decides whether to text the caller.
          </p>
          <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
            Webhook URL:
            <br />
            <span className="break-all text-emerald-200">/api/twilio/missed-call</span>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
