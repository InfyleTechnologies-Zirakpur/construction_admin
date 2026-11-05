import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { colors } from "../../theme/colors";

export default function UserGrowthChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Platform Growth
            </h2>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">User & company growth trend</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
            <Line
              type="monotone"
              name="Users"
              dataKey="users"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.primary }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              name="Companies"
              dataKey="companies"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
