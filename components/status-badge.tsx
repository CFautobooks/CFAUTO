import { clsx } from "clsx";
import type { FollowUpStatus } from "@/lib/types";

const labels: Record<FollowUpStatus, string> = {
  new: "New",
  drafted: "Drafted",
  scheduled: "Scheduled",
  sent: "Sent",
  replied: "Replied",
  recovered: "Recovered",
  paused: "Paused",
  closed: "Closed",
};

const classes: Record<FollowUpStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  drafted: "bg-blue-100 text-blue-700",
  scheduled: "bg-indigo-100 text-indigo-700",
  sent: "bg-amber-100 text-amber-800",
  replied: "bg-purple-100 text-purple-700",
  recovered: "bg-emerald-100 text-emerald-700",
  paused: "bg-orange-100 text-orange-700",
  closed: "bg-zinc-100 text-zinc-700",
};

export function StatusBadge({ status }: { status: FollowUpStatus }) {
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
