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
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_6px_18px_rgba(30,42,56,0.04)] transition-all hover:shadow-lg">
      <div className="border-b border-line p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-dark">
                Platform Growth
              </h2>
              <TrendingUp size={20} className="text-primary" />
            </div>
            <p className="mt-1 text-sm text-text-secondary">User growth over the last 6 months</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.line}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="users"
              stroke={colors.primary}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
              }}
            />

            <Line
              type="monotone"
              dataKey="companies"
              stroke={colors.blue}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}