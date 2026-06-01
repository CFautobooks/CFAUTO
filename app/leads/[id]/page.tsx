import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { demoConversations, demoLeads, demoMessages } from "@/lib/demo-data";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = demoLeads.find((item) => item.id === id) ?? demoLeads[0];
  const conversation = demoConversations.find((item) => item.id === lead.conversation_id);
  const messages = demoMessages.filter((message) => message.conversation_id === lead.conversation_id);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Lead detail"
        title={lead.name}
        description="Review the captured missed-call details, AI summary and conversation transcript."
        action={<StatusBadge status={lead.status} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Lead details</h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Phone" value={lead.phone} />
            <Info label="Enquiry type" value={lead.enquiry_type} />
            <Info label="Urgency" value={lead.urgency} />
            <Info label="Estimated value" value={lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "-"} />
            <Info label="Address/location" value={lead.address || "-"} />
            <Info label="Preferred callback" value={lead.preferred_callback_time || "-"} />
          </dl>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Job description</p>
            <p className="mt-2 text-slate-800">{lead.job_description}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">Owner summary</p>
            <p className="mt-2 text-emerald-900">{conversation?.ai_summary || lead.notes}</p>
          </div>
        </section>

        <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Conversation</h2>
          <div className="mt-5 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-4 text-sm ${
                  message.sender_type === "caller" ? "bg-emerald-50 text-emerald-950" : "bg-slate-50 text-slate-800"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {message.sender_type === "caller" ? "Caller" : "CallBack AI"}
                </p>
                {message.body}
              </div>
            ))}
          </div>
          <Link href="/conversations" className="mt-6 inline-flex rounded-full bg-[#0b1f3a] px-5 py-3 font-bold text-white">
            View all conversations
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold capitalize text-[#0b1f3a]">{value}</dd>
    </div>
  );
}
