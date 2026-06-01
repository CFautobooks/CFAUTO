"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { appName, navItems, parentBusiness } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { clsx } from "clsx";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function signOut() {
    try {
      await createBrowserSupabaseClient().auth.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-[#0b1f3a] px-5 py-6 text-white lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-2xl bg-emerald-500 p-3 text-white">
            <FileText size={24} />
          </span>
          <span>
            <span className="block text-xl font-bold">{appName}</span>
            <span className="text-sm text-slate-300">{parentBusiness}</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-white text-[#0b1f3a] shadow"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-5 bottom-6 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">MYOB and Xero</p>
          <p className="mt-1">Integration buttons are ready as placeholders for the next phase.</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-bold text-[#0b1f3a] lg:hidden">
              {appName}
            </Link>
            <div className="hidden text-sm text-slate-500 lg:block">
              AI bookkeeping for Australian small businesses
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/upload"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Upload document
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                type="button"
              >
                <LogOut size={16} className="inline-block" /> Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
