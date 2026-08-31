import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "up",
  description = "Compared to last month",
}) {
  const isPositive = trend === "up";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/5 transition-transform group-hover:scale-110" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition group-hover:scale-110">
          <Icon size={24} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={16} />
          ) : (
            <ArrowDownRight size={16} />
          )}

          {change}
        </span>

        <span className="text-xs text-slate-400">
          {description}
        </span>
      </div>
    </div>
  );
}