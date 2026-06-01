import { CalendarClock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { followUpSequences } from "@/lib/constants";

export default function SequencesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Sequences"
        title="Automation rules and templates"
        description="Define when RecoverFlow drafts, schedules, pauses and escalates follow-ups for each revenue recovery workflow."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {followUpSequences.map((sequence) => (
          <section key={sequence.name} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CalendarClock size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#0b1f3a]">{sequence.name}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{sequence.trigger}</p>
            <ol className="mt-5 space-y-3">
              {sequence.steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl border border-slate-100 p-4 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <button className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">
              Edit sequence
            </button>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
