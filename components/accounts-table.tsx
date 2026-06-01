"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { RecoveryScore } from "@/components/recovery-score";
import { StatusBadge } from "@/components/status-badge";
import { demoFollowUpCases } from "@/lib/demo-data";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { FollowUpCase } from "@/lib/types";

export function AccountsTable() {
  const [cases, setCases] = useState<FollowUpCase[]>(demoFollowUpCases);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCases() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setMessage("Showing demo follow-ups. Log in to view your own recovery pipeline.");
          return;
        }

        const response = await fetch("/api/accounts", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load accounts.");
        setCases(payload.cases.length > 0 ? payload.cases : []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? `${error.message} Showing demo follow-ups.`
            : "Showing demo follow-ups.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" />
        Loading recovery accounts...
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <EmptyState
        title="No open follow-ups yet"
        description="Import invoices, quotes or stale leads to build your first recovery queue."
        href="/import"
        action="Import accounts"
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
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
          <span>Customer</span>
          <span>Type</span>
          <span>Source</span>
          <span>Amount</span>
          <span>Score</span>
          <span>Status</span>
        </div>
        {cases.map((followUpCase) => (
          <Link
            href={`/follow-ups/${followUpCase.id}`}
            key={followUpCase.id}
            className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]"
          >
            <span>
              <span className="block font-bold text-[#0b1f3a]">
                {followUpCase.customer?.company_name || "Unknown customer"}
              </span>
              <span className="text-sm text-slate-500">{followUpCase.title}</span>
            </span>
            <span className="text-sm capitalize text-slate-600">{followUpCase.case_type.replace("_", " ")}</span>
            <span className="text-sm capitalize text-slate-600">{followUpCase.source}</span>
            <span className="font-bold">
              ${(followUpCase.amount_cents / 100).toLocaleString()} {followUpCase.currency}
            </span>
            <RecoveryScore score={followUpCase.recovery_score} />
            <StatusBadge status={followUpCase.status} />
          </Link>
        ))}
      </div>
    </>
  );
}
