import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { pricingPlans } from "@/lib/constants";

export default function PricingPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Pricing"
        title="Missed-call recovery pricing"
        description="Stripe-ready pricing UI. Checkout is intentionally not enabled yet."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-6 shadow-sm ring-1 ${
              plan.highlighted
                ? "bg-[#0b1f3a] text-white ring-[#0b1f3a]"
                : "bg-white text-slate-900 ring-slate-200"
            }`}
          >
            <p className={plan.highlighted ? "text-emerald-200" : "text-emerald-600"}>
              {plan.name === "Starter" ? "For sole traders" : plan.name === "Growth" ? "For growing teams" : "For high-volume teams"}
            </p>
            <h2 className="mt-3 text-2xl font-bold">{plan.name}</h2>
            <p className="mt-5 text-4xl font-black">
              {plan.price}
              {plan.price.startsWith("$") ? <span className="text-base font-semibold">/month</span> : null}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm">
                  <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className={`mt-8 inline-flex w-full justify-center rounded-2xl px-4 py-3 font-bold ${
                plan.highlighted ? "bg-white text-[#0b1f3a]" : "bg-emerald-600 text-white"
              }`}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
