import { clsx } from "clsx";
import type { TransactionStatus } from "@/lib/types";

const labels: Record<TransactionStatus, string> = {
  uploaded: "Uploaded",
  extracted: "Extracted",
  needs_review: "Needs review",
  approved: "Approved",
  exported: "Exported",
};

const classes: Record<TransactionStatus, string> = {
  uploaded: "bg-slate-100 text-slate-700",
  extracted: "bg-blue-100 text-blue-700",
  needs_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  exported: "bg-purple-100 text-purple-700",
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
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
