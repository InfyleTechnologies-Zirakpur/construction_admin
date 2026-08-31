export default function OperationalStats({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          Operational Statistics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current platform performance
        </p>
      </div>
      <div className="p-6">

      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">
                {item.label}
              </span>

              <span className="text-sm font-bold text-slate-900">
                {item.value}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}