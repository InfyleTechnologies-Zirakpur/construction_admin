export default function OperationalStats({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <h2 className="text-base font-bold text-slate-900">
          Operational Statistics
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Platform health and operational readiness
        </p>
      </div>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-600">
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {item.value}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
