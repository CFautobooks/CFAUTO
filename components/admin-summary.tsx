"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const fallback = {
  users: 48,
  uploads: 1284,
  failed_extractions: 9,
  needs_review: 17,
};

export function AdminSummary() {
  const [metrics, setMetrics] = useState(fallback);
  const [message, setMessage] = useState("Demo admin metrics shown until an admin session is connected.");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const response = await fetch("/api/admin/summary", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load admin metrics.");
        setMetrics(payload);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Demo admin metrics shown.");
      }
    }

    load();
  }, []);

  return (
    <>
      {message ? (
        <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      ) : null}
      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["Users", metrics.users],
          ["Uploads", metrics.uploads],
          ["Failed extractions", metrics.failed_extractions],
          ["Needs review", metrics.needs_review],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-black text-[#0b1f3a]">{value}</p>
          </div>
        ))}
      </section>
    </>
  );
}
