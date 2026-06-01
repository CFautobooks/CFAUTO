import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats } from "@/lib/constants";
import { demoConversations, demoLeads } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Missed-call recovery command centre"
        description="Track missed calls, AI conversations, captured leads, emergencies and ignored personal or spam calls."
        action={
          <Link
            href="/simulator"
            className="rounded-full bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Test missed call
          </Link>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Icon size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-black text-[#0b1f3a]">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0b1f3a]">Recent conversations</h2>
            <Link href="/conversations" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="space-y-4">
            {demoConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href="/conversations"
                className="grid gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-bold text-[#0b1f3a]">{conversation.caller_phone}</p>
                  <p className="text-sm text-slate-500">
                    {conversation.category.replace("_", " ")} · {conversation.urgency} urgency
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                  {conversation.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Lead status pipeline</h2>
          <div className="mt-5 space-y-3">
            {demoLeads.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{lead.name}</p>
                    <p className="text-sm text-slate-300">{lead.enquiry_type}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
