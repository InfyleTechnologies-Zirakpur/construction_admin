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
  colors.blue,
  colors.success,
  colors.warning,
  colors.primary,
];

export default function ProjectStatusChart({ data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_6px_18px_rgba(30,42,56,0.04)] transition-all hover:shadow-lg">
      <div className="border-b border-line p-6">
        <h2 className="text-lg font-bold text-dark">
          Project Status
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Distribution of project statuses
        </p>
      </div>
      <div className="p-6">

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}