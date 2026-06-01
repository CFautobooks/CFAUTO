import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfidenceScore } from "@/components/confidence-score";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats } from "@/lib/constants";
import { demoTransactions } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Bookkeeping command centre"
        description="Track uploaded documents, review low-confidence extractions and approve clean transactions for future export."
        action={
          <Link
            href="/upload"
            className="rounded-full bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Upload invoice
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
            <h2 className="text-xl font-bold text-[#0b1f3a]">Recent transactions</h2>
            <Link href="/transactions" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="space-y-4">
            {demoTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/review/${transaction.id}`}
                className="grid gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-bold text-[#0b1f3a]">{transaction.supplier_name}</p>
                  <p className="text-sm text-slate-500">
                    {transaction.category} · ${transaction.total_amount?.toFixed(2)} AUD
                  </p>
                </div>
                <ConfidenceScore score={transaction.confidence_score} />
                <StatusBadge status={transaction.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Carmichael Financials service</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Need done-for-you bookkeeping? CF AutoBooks can support a managed review process for
            Carmichael Financials clients, with admin visibility over uploads and failed
            extractions.
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
