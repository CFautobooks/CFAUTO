"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfidenceScore } from "@/components/confidence-score";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { demoTransactions } from "@/lib/demo-data";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Transaction } from "@/lib/types";

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setMessage("Showing demo transactions. Log in to view your own uploads.");
          return;
        }

        const response = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load transactions.");
        setTransactions(payload.transactions.length > 0 ? payload.transactions : []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? `${error.message} Showing demo transactions.`
            : "Showing demo transactions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" />
        Loading transactions...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Upload your first invoice or receipt to create an extracted transaction."
        href="/upload"
        action="Upload document"
      />
    );
  }

  return (
    <>
      {message ? (
        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
          <span>Supplier</span>
          <span>Invoice</span>
          <span>Category</span>
          <span>Total</span>
          <span>Confidence</span>
          <span>Status</span>
        </div>
        {transactions.map((transaction) => (
          <Link
            href={`/review/${transaction.id}`}
            key={transaction.id}
            className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
          >
            <span>
              <span className="block font-bold text-[#0b1f3a]">
                {transaction.supplier_name || "Unknown supplier"}
              </span>
              <span className="text-sm text-slate-500">{transaction.supplier_abn}</span>
            </span>
            <span className="text-sm text-slate-600">{transaction.invoice_number || "-"}</span>
            <span className="text-sm text-slate-600">{transaction.category || "-"}</span>
            <span className="font-bold">
              ${Number(transaction.total_amount ?? 0).toFixed(2)} AUD
            </span>
            <ConfidenceScore score={transaction.confidence_score} />
            <StatusBadge status={transaction.status} />
          </Link>
        ))}
      </div>
    </>
  );
}
