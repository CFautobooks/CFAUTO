"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { appName } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createBrowserSupabaseClient();
      const response =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (response.error) throw response.error;

      if (mode === "signup" && !response.data.session) {
        setMessage("Check your inbox to confirm your email address.");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed. Check your Supabase configuration.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0b1f3a] lg:grid-cols-[1fr_520px]">
      <section className="hidden items-center px-12 text-white lg:flex">
        <div>
          <Link href="/" className="text-xl font-bold">
            {appName}
          </Link>
          <h1 className="mt-10 max-w-2xl text-6xl font-black tracking-tight">
            Turn paperwork into review-ready bookkeeping data.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
            Secure login for businesses, bookkeepers and Carmichael Financials staff.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0b1f3a]">
            {mode === "login" ? "Login to CF AutoBooks" : "Sign up for CF AutoBooks"}
          </h2>

          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          {message ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>
          ) : null}

          <button
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {mode === "login" ? "Login" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-5 w-full text-sm font-semibold text-emerald-700"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
