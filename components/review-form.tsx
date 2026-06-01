"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { categories } from "@/lib/constants";
import { demoTransactions } from "@/lib/demo-data";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { ConfidenceScore } from "@/components/confidence-score";
import { StatusBadge } from "@/components/status-badge";

type FormState = {
  supplier_name: string;
  supplier_abn: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  description: string;
  category: string;
  subtotal: string;
  gst_amount: string;
  total_amount: string;
  notes: string;
  status: TransactionStatus;
};

function toForm(transaction: Transaction): FormState {
  return {
    supplier_name: transaction.supplier_name ?? "",
    supplier_abn: transaction.supplier_abn ?? "",
    invoice_number: transaction.invoice_number ?? "",
    invoice_date: transaction.invoice_date ?? "",
    due_date: transaction.due_date ?? "",
    description: transaction.description ?? "",
    category: transaction.category ?? "",
    subtotal: String(transaction.subtotal ?? 0),
    gst_amount: String(transaction.gst_amount ?? 0),
    total_amount: String(transaction.total_amount ?? 0),
    notes: transaction.notes ?? "",
    status: transaction.status,
  };
}

export function ReviewForm({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const confidence = transaction?.confidence_score ?? 0;
  const showDemo = useMemo(() => transactionId.startsWith("demo"), [transactionId]);

  useEffect(() => {
    async function loadTransaction() {
      setLoading(true);
      setMessage("");

      if (showDemo) {
        const demo = demoTransactions.find((item) => item.id === transactionId) ?? demoTransactions[0];
        setTransaction(demo);
        setForm(toForm(demo));
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load transaction.");
        setTransaction(payload.transaction);
        setForm(toForm(payload.transaction));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load transaction.");
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [router, showDemo, transactionId]);

  async function save(status?: TransactionStatus) {
    if (!form || !transaction) return;
    const nextForm = { ...form, status: status ?? form.status };
    setSaving(true);
    setMessage("");

    if (showDemo) {
      setForm(nextForm);
      setMessage("Demo transaction updated locally. Connect Supabase to save real data.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nextForm,
          subtotal: Number(nextForm.subtotal),
          gst_amount: Number(nextForm.gst_amount),
          total_amount: Number(nextForm.total_amount),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save transaction.");

      setTransaction(payload.transaction);
      setForm(toForm(payload.transaction));
      setMessage(status === "approved" ? "Transaction approved." : "Transaction saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" />
        Loading extracted transaction...
      </div>
    );
  }

  if (!form || !transaction) {
    return (
      <div className="rounded-3xl bg-white p-8 text-rose-700 shadow-sm ring-1 ring-rose-100">
        {message || "Transaction not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Review and approve</p>
            <h2 className="text-2xl font-bold text-[#0b1f3a]">
              {form.supplier_name || "Extracted transaction"}
            </h2>
          </div>
          <StatusBadge status={form.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Supplier name" value={form.supplier_name} onChange={(value) => setForm({ ...form, supplier_name: value })} />
          <Field label="Supplier ABN" value={form.supplier_abn} onChange={(value) => setForm({ ...form, supplier_abn: value })} />
          <Field label="Invoice number" value={form.invoice_number} onChange={(value) => setForm({ ...form, invoice_number: value })} />
          <Field label="Invoice date" type="date" value={form.invoice_date} onChange={(value) => setForm({ ...form, invoice_date: value })} />
          <Field label="Due date" type="date" value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <Field label="Subtotal" type="number" value={form.subtotal} onChange={(value) => setForm({ ...form, subtotal: value })} />
          <Field label="GST amount" type="number" value={form.gst_amount} onChange={(value) => setForm({ ...form, gst_amount: value })} />
          <Field label="Total amount" type="number" value={form.total_amount} onChange={(value) => setForm({ ...form, total_amount: value })} />
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            rows={3}
            placeholder="Add context for your bookkeeper or Carmichael Financials."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        {message ? (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save changes
          </button>
          <button
            type="button"
            onClick={() => save("approved")}
            disabled={saving}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve transaction
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <ConfidenceScore score={confidence} />
          <p className="mt-4 text-sm text-slate-600">
            Transactions below 95% confidence are marked as needing review so details can be checked
            before export.
          </p>
        </div>
        <div className="rounded-3xl bg-[#0b1f3a] p-6 text-white">
          <h3 className="text-lg font-bold">Next integration step</h3>
          <p className="mt-2 text-sm text-slate-200">
            Approved records are stored for future MYOB and Xero export. Integration buttons are
            visible in Settings and marked coming soon.
          </p>
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
