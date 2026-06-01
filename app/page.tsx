import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { appName, parentBusiness } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="overflow-hidden bg-[#0b1f3a] text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-500 p-3">
              <FileText size={24} />
            </span>
            <span>
              <span className="block text-xl font-bold">{appName}</span>
              <span className="text-sm text-slate-300">{parentBusiness}</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-semibold text-slate-200 sm:block">
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0b1f3a]"
            >
              Login
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_460px]">
          <div>
            <div className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              Built for Australian tradies, bookkeepers and small businesses
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              AI bookkeeping that gets receipts ready for review.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Upload invoices and receipts, extract GST and supplier data, review confidence scores,
              and keep clean transaction records ready for future MYOB and Xero integration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-400"
              >
                Start free demo <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                View MVP dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="mb-4 text-sm font-bold text-emerald-600">Extraction preview</p>
              {[
                ["Supplier", "Bunnings Warehouse"],
                ["ABN", "26 008 672 179"],
                ["GST", "$24.55"],
                ["Category", "Equipment and tools"],
                ["Confidence", "97%"],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 flex justify-between rounded-2xl bg-white p-4">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                Status: extracted and ready for review
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "AI extraction",
            text: "Strict JSON extraction for suppliers, ABNs, invoice dates, GST, totals and line items.",
          },
          {
            icon: ShieldCheck,
            title: "Secure by design",
            text: "Supabase Auth, Storage and Row Level Security keep users scoped to their own data.",
          },
          {
            icon: CheckCircle2,
            title: "Bookkeeper-ready",
            text: "Review workflows, notes, clients and admin visibility for failed extractions.",
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <Icon className="mb-5 text-emerald-600" size={32} />
              <h2 className="text-xl font-bold text-[#0b1f3a]">{feature.title}</h2>
              <p className="mt-3 text-slate-600">{feature.text}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
