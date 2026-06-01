"use client";

import { useEffect, useState } from "react";
import { Loader2, PhoneCall, RotateCcw, Send } from "lucide-react";
import type { SimulatorState } from "@/lib/types";

const starterReplies = [
  "Need a quote for aircon install in Bondi.",
  "My name is Mia Chen, at Bondi NSW, today after 3pm works.",
  "My switchboard is smoking.",
  "Hey mate it's your brother call me back.",
  "Wrong number sorry.",
];

export function SimulatorPanel() {
  const [state, setState] = useState<SimulatorState | null>(null);
  const [callerPhone, setCallerPhone] = useState("+61411222333");
  const [callerName, setCallerName] = useState("Mia Chen");
  const [reply, setReply] = useState(starterReplies[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const response = await fetch("/api/simulator/state");
    const payload = await response.json();
    setState(payload.simulator);
  }

  async function startMissedCall() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/simulator/missed-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caller_phone: callerPhone, caller_name: callerName }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to simulate missed call.");
      setState(payload.simulator);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to simulate missed call.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(body = reply) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/simulator/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to process reply.");
      setState(payload.simulator);
      setReply("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to process reply.");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setLoading(true);
    await fetch("/api/simulator/state", { method: "DELETE" });
    await loadState();
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grow">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Fake caller phone</span>
            <input
              value={callerPhone}
              onChange={(event) => setCallerPhone(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="grow">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Caller name</span>
            <input
              value={callerName}
              onChange={(event) => setCallerName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <button
            type="button"
            onClick={startMissedCall}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <PhoneCall size={18} />}
            Simulate missed call
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {starterReplies.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setReply(sample)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(state?.messages ?? []).map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.sender_type === "caller"
                    ? "ml-auto bg-emerald-600 text-white"
                    : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                <p className="mb-1 text-xs font-bold opacity-70">
                  {message.sender_type === "caller" ? "Caller" : "CallBack AI"}
                </p>
                {message.body}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Type a caller SMS reply..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={() => sendReply()}
              disabled={loading || !reply.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0b1f3a] px-5 py-3 font-bold text-white disabled:opacity-60"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>

        {error ? <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      </section>

      <aside className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#0b1f3a]">Live extraction</h2>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <Info label="Category" value={state?.conversation?.category.replace("_", " ") || "-"} />
            <Info label="Status" value={state?.conversation?.status || "-"} />
            <Info label="Urgency" value={state?.conversation?.urgency || "-"} />
            <Info label="Confidence" value={`${state?.conversation?.confidence_score ?? 0}%`} />
            <Info label="Lead" value={state?.lead ? `${state.lead.name} - ${state.lead.enquiry_type}` : "Not complete yet"} />
          </dl>
        </section>

        <section className="rounded-3xl bg-[#0b1f3a] p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Owner notifications</h2>
          <div className="mt-4 space-y-3">
            {(state?.ownerNotifications ?? []).length === 0 ? (
              <p className="text-sm text-slate-300">No owner summary sent yet.</p>
            ) : (
              state?.ownerNotifications.map((notification) => (
                <div key={notification} className="rounded-2xl bg-white/10 p-4 text-sm text-slate-100">
                  {notification}
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-3">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-right font-bold capitalize text-slate-800">{value}</dd>
    </div>
  );
}
