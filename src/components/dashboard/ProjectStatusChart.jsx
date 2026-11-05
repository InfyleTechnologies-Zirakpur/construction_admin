import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { colors } from "../../theme/colors";

const COLORS = [
  colors.primary,
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#64748b",
];

export default function ProjectStatusChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <h2 className="text-base font-bold text-slate-900">
          Project Status
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribution across active lifecycle stages
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={90}
              innerRadius={55}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
