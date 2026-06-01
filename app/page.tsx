import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareText, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { appName, industries, parentBusiness, pricingPlans } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="overflow-hidden bg-[#0b1f3a] text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-500 p-3">
              <PhoneCall size={24} />
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
              Miss a call. Don&apos;t lose the customer.
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Turn missed calls into customers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              CallBack AI instantly texts missed callers, has a short AI conversation, captures
              lead details, flags emergencies, ignores spam and sends the owner a clean summary.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-400"
              >
                Start free demo <ArrowRight size={18} />
              </Link>
              <Link
                href="/simulator"
                className="rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Try simulator
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="mb-4 text-sm font-bold text-emerald-600">Missed-call recovery preview</p>
              {[
                ["Missed caller", "+61 411 222 333"],
                ["AI reply", "Sorry we missed your call. What can we help with?"],
                ["Category", "New lead"],
                ["Urgency", "Medium"],
                ["Owner summary", "Aircon quote, Bondi, callback after 3pm"],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 flex justify-between rounded-2xl bg-white p-4">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                Status: lead captured and owner notified
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "Missed call detected",
            text: "Twilio webhooks identify the business number and create a missed-call record instantly.",
          },
          {
            icon: MessageSquareText,
            title: "AI follows up by SMS",
            text: "The caller gets a short branded text and the AI asks one question at a time.",
          },
          {
            icon: ShieldCheck,
            title: "Smart classification",
            text: "New lead, existing customer, emergency, personal, spam and wrong-number calls are handled differently.",
          },
          {
            icon: CheckCircle2,
            title: "Clean owner summaries",
            text: "When the AI has enough detail, it stops and sends the owner the name, need, urgency, location and callback time.",
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

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Built for</p>
          <h2 className="mt-3 text-3xl font-black text-[#0b1f3a]">Any business that loses leads from missed calls</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {industries.map((industry) => (
              <div key={industry} className="rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Pricing</p>
            <h2 className="mt-3 text-3xl font-black text-[#0b1f3a]">Simple plans before Stripe checkout</h2>
          </div>
          <Link href="/pricing" className="rounded-full bg-[#0b1f3a] px-5 py-3 font-bold text-white">
            View all plans
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#0b1f3a]">{plan.name}</h3>
              <p className="mt-4 text-4xl font-black">{plan.price}<span className="text-base font-semibold">/month</span></p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0b1f3a] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black">Ready to stop losing missed-call leads?</h2>
          <p className="mt-4 text-slate-200">
            Use the simulator to test the core missed-call flow without Twilio or OpenAI keys.
          </p>
          <Link href="/simulator" className="mt-8 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold">
            Test CallBack AI
          </Link>
        </div>
      </section>
    </main>
  );
}
