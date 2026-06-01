"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { integrationCatalog } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { CaseType, IntegrationProvider, OutreachChannel } from "@/lib/types";

type ImportForm = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  title: string;
  case_type: CaseType;
  source: IntegrationProvider | "csv" | "manual";
  amount: string;
  due_date: string;
  channel: OutreachChannel;
};

const initialForm: ImportForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  title: "",
  case_type: "invoice",
  source: "manual",
  amount: "",
  due_date: "",
  channel: "email",
};

export function ImportPanel() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createCase() {
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          amount_cents: Math.round(Number(form.amount || 0) * 100),
          due_date: form.due_date || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create follow-up.");

      router.push(`/follow-ups/${payload.case.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create follow-up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[#0b1f3a]">Create a recovery account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Add one invoice, quote, lead or appointment manually while your integrations are being
          connected. CSV and product syncs feed this same queue.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Company" value={form.company_name} onChange={(value) => setForm({ ...form, company_name: value })} />
          <Field label="Contact name" value={form.contact_name} onChange={(value) => setForm({ ...form, contact_name: value })} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <Field label="Follow-up title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Field label="Amount at risk" type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
          <Field label="Due date" type="date" value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Case type</span>
            <select
              value={form.case_type}
              onChange={(event) => setForm({ ...form, case_type: event.target.value as CaseType })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="invoice">Unpaid invoice</option>
              <option value="quote">Unanswered quote</option>
              <option value="lead">Cold lead</option>
              <option value="appointment">Missed appointment</option>
              <option value="repeat_service">Repeat service</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Source</span>
            <select
              value={form.source}
              onChange={(event) => setForm({ ...form, source: event.target.value as ImportForm["source"] })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="manual">Manual</option>
              <option value="csv">CSV</option>
              {integrationCatalog.map((integration) => (
                <option key={integration.provider} value={integration.provider}>
                  {integration.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred channel</span>
            <select
              value={form.channel}
              onChange={(event) => setForm({ ...form, channel: event.target.value as OutreachChannel })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone task</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={18} />
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={createCase}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          {loading ? "Creating recovery account..." : "Create follow-up"}
        </button>
      </section>

      <aside className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
        <h2 className="text-xl font-bold">Import sources included</h2>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          RecoverFlow is structured for CSV import plus the full product set: Gmail, Outlook,
          QuickBooks, Stripe, Square, Calendly, HubSpot, Jobber, ServiceTitan and Twilio.
        </p>
        <div className="mt-5 grid gap-3">
          {integrationCatalog.slice(0, 6).map((integration) => (
            <div key={integration.provider} className="rounded-2xl bg-white/10 p-3">
              <p className="font-semibold">{integration.name}</p>
              <p className="text-xs text-slate-300">{integration.category}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}
