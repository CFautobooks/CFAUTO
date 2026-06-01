import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";
import { appName, parentBusiness } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="overflow-hidden bg-[#0b1f3a] text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-500 p-3">
              <Send size={24} />
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
              Built for service businesses that need faster replies and faster payments
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Recover unpaid invoices, unanswered quotes and stale leads automatically.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              RecoverFlow imports revenue opportunities from your inbox, accounting tools, payment
              processors, calendars and CRMs, then drafts polite follow-ups your team can approve.
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
                View recovery dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="mb-4 text-sm font-bold text-emerald-600">Recovery preview</p>
              {[
                ["Customer", "Harbour Electrical Co"],
                ["Opportunity", "Commercial fit-out quote"],
                ["Revenue at risk", "$4,850"],
                ["Next action", "Email follow-up"],
                ["Recovery score", "88%"],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 flex justify-between rounded-2xl bg-white p-4">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                Status: draft ready for approval
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "AI follow-up drafts",
            text: "Generate polite email and SMS reminders for unpaid invoices, open quotes and stale leads.",
          },
          {
            icon: ShieldCheck,
            title: "Human approval controls",
            text: "Review, edit, schedule and pause every message before turning on automation.",
          },
          {
            icon: MessageSquareText,
            title: "All key tools mapped",
            text: "Scaffolded integrations for Gmail, Outlook, QuickBooks, Stripe, Square, Calendly, HubSpot, Jobber, ServiceTitan and Twilio.",
          },
          {
            icon: CheckCircle2,
            title: "ROI dashboard",
            text: "Track revenue at risk, recovered dollars, replies, failed sends and pending follow-ups.",
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
