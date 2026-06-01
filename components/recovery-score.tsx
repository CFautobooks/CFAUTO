import { clsx } from "clsx";

export function RecoveryScore({ score }: { score?: number | null }) {
  const value = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const colour =
    value >= 80 ? "bg-emerald-500" : value >= 55 ? "bg-amber-500" : "bg-sky-500";

  return (
    <div className="min-w-32">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>Recovery score</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={clsx("h-2 rounded-full", colour)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
