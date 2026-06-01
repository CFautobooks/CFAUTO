import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { demoSettings } from "@/lib/demo-data";

export default function AiSettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="AI response settings"
        title="Control how CallBack AI talks to callers"
        description="Tune the first SMS, emergency escalation, ignored keywords and the maximum AI message count."
      />

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">First missed-call SMS</span>
            <textarea
              rows={3}
              defaultValue="Hi, thanks for calling [Business Name]. Sorry we missed your call. What can we help with?"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Max AI messages per conversation</span>
            <input
              type="number"
              defaultValue={demoSettings.max_ai_messages_per_conversation}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">After-hours message</span>
            <input
              defaultValue={demoSettings.after_hours_message}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Emergency keywords</span>
            <textarea
              rows={4}
              defaultValue={demoSettings.emergency_keywords.join(", ")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Ignored keywords</span>
            <textarea
              rows={4}
              defaultValue={demoSettings.ignored_keywords.join(", ")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          Guardrails: ask one question at a time, avoid advice, never promise availability, stop on
          personal/spam/wrong-number calls, and escalate emergencies immediately.
        </div>
      </section>
    </AppShell>
  );
}
