import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "up",
  description = "vs. last month",
}) {
  const isPositive = trend === "up";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-bold ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>
        <span className="text-xs text-slate-400">
          {description}
        </span>
      </div>
    </div>
  );
}
