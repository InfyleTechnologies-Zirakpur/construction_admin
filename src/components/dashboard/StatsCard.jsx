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
    <div className="group relative overflow-hidden rounded-xl border border-line bg-white p-5 shadow-[0_6px_18px_rgba(30,42,56,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-100/50 transition-transform group-hover:scale-110" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-dark">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-600 p-3 text-white transition group-hover:scale-110">
          <Icon size={24} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? "text-success-600" : "text-error"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={16} />
          ) : (
            <ArrowDownRight size={16} />
          )}

          {change}
        </span>

        <span className="text-xs text-text-muted">
          {description}
        </span>
      </div>
    </div>
  );
}