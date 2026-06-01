import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { demoLeads } from "@/lib/demo-data";

export default function LeadsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Leads inbox"
        title="Captured missed-call leads"
        description="Every completed AI conversation becomes a lead with urgency, enquiry type, callback preference and owner notes."
      />

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid-cols-[1.2fr_1fr_1.4fr_1fr_auto]">
          <span>Name</span>
          <span>Phone</span>
          <span>Enquiry</span>
          <span>Urgency</span>
          <span>Status</span>
        </div>
        {demoLeads.map((lead) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1.4fr_1fr_auto]"
          >
            <span>
              <span className="block font-bold text-[#0b1f3a]">{lead.name}</span>
              <span className="text-sm text-slate-500">{lead.preferred_callback_time || "No callback time yet"}</span>
            </span>
            <span className="text-sm text-slate-600">{lead.phone}</span>
            <span className="text-sm text-slate-600">{lead.enquiry_type}</span>
            <span className="text-sm font-bold capitalize text-slate-700">{lead.urgency}</span>
            <StatusBadge status={lead.status} />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
