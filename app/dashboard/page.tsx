import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { RecoveryScore } from "@/components/recovery-score";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats } from "@/lib/constants";
import { demoFollowUpCases } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Revenue recovery command centre"
        description="Track money at risk, approve follow-up drafts and see which invoices, quotes and leads need attention first."
        action={
          <Link
            href="/import"
            className="rounded-full bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Import account
          </Link>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
            <h2 className="text-xl font-bold text-[#0b1f3a]">Priority follow-ups</h2>
            <Link href="/accounts" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="space-y-4">
            {demoFollowUpCases.map((followUpCase) => (
              <Link
                key={followUpCase.id}
                href={`/follow-ups/${followUpCase.id}`}
                className="grid gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-bold text-[#0b1f3a]">{followUpCase.customer?.company_name}</p>
                  <p className="text-sm text-slate-500">
                    {followUpCase.title} · ${(followUpCase.amount_cents / 100).toLocaleString()}{" "}
                    {followUpCase.currency}
                  </p>
                </div>
                <RecoveryScore score={followUpCase.recovery_score} />
                <StatusBadge status={followUpCase.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">What RecoverFlow automates</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Import open invoices, quotes, form leads, missed appointments and repeat-service
            windows. RecoverFlow drafts the next best email or SMS, stops when a customer replies,
            and attributes recovered revenue back to the follow-up.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-bold text-[#0b1f3a]"
          >
            Compare plans
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
