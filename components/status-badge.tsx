import { clsx } from "clsx";
import type { LeadStatus } from "@/lib/types";

const labels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
  personal: "Personal",
  wrong_number: "Wrong number",
  emergency: "Emergency",
};

const classes: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  booked: "bg-indigo-100 text-indigo-700",
  quoted: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-zinc-100 text-zinc-700",
  spam: "bg-orange-100 text-orange-800",
  personal: "bg-sky-100 text-sky-700",
  wrong_number: "bg-amber-100 text-amber-800",
  emergency: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        classes[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
