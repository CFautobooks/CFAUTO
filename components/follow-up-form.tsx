"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { RecoveryScore } from "@/components/recovery-score";
import { StatusBadge } from "@/components/status-badge";
import { demoFollowUpCases } from "@/lib/demo-data";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { FollowUpCase, FollowUpStatus, OutreachChannel } from "@/lib/types";

type FormState = {
  title: string;
  amount: string;
  due_date: string;
  next_follow_up_at: string;
  channel: OutreachChannel;
  draft_subject: string;
  draft_body: string;
  notes: string;
  status: FollowUpStatus;
};

function toForm(followUpCase: FollowUpCase): FormState {
  return {
    title: followUpCase.title,
    amount: String((followUpCase.amount_cents / 100).toFixed(2)),
    due_date: followUpCase.due_date ?? "",
    next_follow_up_at: followUpCase.next_follow_up_at?.slice(0, 16) ?? "",
    channel: followUpCase.channel,
    draft_subject: followUpCase.draft_subject ?? "",
    draft_body: followUpCase.draft_body ?? "",
    notes: followUpCase.notes ?? "",
    status: followUpCase.status,
  };
}

export function FollowUpForm({ followUpId }: { followUpId: string }) {
  const router = useRouter();
  const [followUpCase, setFollowUpCase] = useState<FollowUpCase | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const showDemo = useMemo(() => followUpId.startsWith("demo"), [followUpId]);

  useEffect(() => {
    async function loadFollowUp() {
      setLoading(true);
      setMessage("");

      if (showDemo) {
        const demo =
          demoFollowUpCases.find((item) => item.id === followUpId) ?? demoFollowUpCases[0];
        setFollowUpCase(demo);
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

        const response = await fetch(`/api/follow-ups/${followUpId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load follow-up.");
        setFollowUpCase(payload.case);
        setForm(toForm(payload.case));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load follow-up.");
      } finally {
        setLoading(false);
      }
    }

    loadFollowUp();
  }, [followUpId, router, showDemo]);

  async function save(status?: FollowUpStatus) {
    if (!form || !followUpCase) return;
    const nextForm = { ...form, status: status ?? form.status };
    setSaving(true);
    setMessage("");

    if (showDemo) {
      setForm(nextForm);
      setMessage("Demo follow-up updated locally. Connect Supabase to save real data.");
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

      const response = await fetch(`/api/follow-ups/${followUpCase.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nextForm,
          amount_cents: Math.round(Number(nextForm.amount || 0) * 100),
          due_date: nextForm.due_date || null,
          next_follow_up_at: nextForm.next_follow_up_at || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save follow-up.");

      setFollowUpCase(payload.case);
      setForm(toForm(payload.case));
      setMessage(status === "scheduled" ? "Follow-up scheduled." : "Follow-up saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save follow-up.");
    } finally {
      setSaving(false);
    }
  }

  async function generateDraft() {
    if (!form || !followUpCase) return;
    setGenerating(true);
    setMessage("");

    if (showDemo) {
      setForm({
        ...form,
        draft_subject: form.draft_subject || `Following up on ${form.title}`,
        draft_body:
          form.draft_body ||
          "Hi there, just checking in to see if you had any questions or would like help moving this forward.",
        status: "drafted",
      });
      setMessage("Demo draft generated locally.");
      setGenerating(false);
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

      const response = await fetch("/api/follow-ups/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ case_id: followUpCase.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to generate draft.");

      setForm({
        ...form,
        draft_subject: payload.draft.subject,
        draft_body: payload.draft.body,
        channel: payload.draft.channel,
        status: "drafted",
      });
      setMessage(payload.draft.recommended_next_step);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate draft.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" />
        Loading follow-up...
      </div>
    );
  }

  if (!form || !followUpCase) {
    return (
      <div className="rounded-3xl bg-white p-8 text-rose-700 shadow-sm ring-1 ring-rose-100">
        {message || "Follow-up not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {followUpCase.customer?.company_name || "Customer follow-up"}
            </p>
            <h2 className="text-2xl font-bold text-[#0b1f3a]">{form.title}</h2>
          </div>
          <StatusBadge status={form.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Follow-up title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Field label="Amount at risk" type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
          <Field label="Due date" type="date" value={form.due_date} onChange={(value) => setForm({ ...form, due_date: value })} />
          <Field label="Next follow-up" type="datetime-local" value={form.next_follow_up_at} onChange={(value) => setForm({ ...form, next_follow_up_at: value })} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Channel</span>
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
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as FollowUpStatus })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {["new", "drafted", "scheduled", "sent", "replied", "recovered", "paused", "closed"].map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Subject</span>
          <input
            value={form.draft_subject}
            onChange={(event) => setForm({ ...form, draft_subject: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Message body</span>
          <textarea
            value={form.draft_body}
            onChange={(event) => setForm({ ...form, draft_body: event.target.value })}
            rows={7}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Internal notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            rows={3}
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
            onClick={generateDraft}
            disabled={generating || saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Generate AI draft
          </button>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving || generating}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save changes
          </button>
          <button
            type="button"
            onClick={() => save("scheduled")}
            disabled={saving || generating}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Schedule follow-up
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <RecoveryScore score={followUpCase.recovery_score} />
          <p className="mt-4 text-sm text-slate-600">
            Score combines value at risk, overdue age and silence since last contact so teams can
            focus on the highest-leverage follow-ups first.
          </p>
        </div>
        <div className="rounded-3xl bg-[#0b1f3a] p-6 text-white">
          <h3 className="text-lg font-bold">Send safely</h3>
          <p className="mt-2 text-sm text-slate-200">
            Review every draft before enabling automation. Add payment links, booking links and SMS
            consent checks through Settings integrations.
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
