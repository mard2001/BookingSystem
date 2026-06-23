// components/charts/RevenueBySportDonutChart.jsx

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#378ADD",
  "#1D9E75",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const formatPeso = (value) =>
  `₱${Number(value || 0).toLocaleString()}`;

export default function RevenueBySportDonutChart({
  data = [],
  height = 320,
}) {
  // Group revenue by sport
  const chartData = Object.values(
    data.reduce((acc, item) => {
      const sport = item.courtSport;

      if (!acc[sport]) {
        acc[sport] = {
          name: sport,
          revenue: 0,
        };
      }

      acc[sport].revenue += Number(item.total_sport_revenue || 0);

      return acc;
    }, {})
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="revenue"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {chartData.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => [formatPeso(value), "Revenue"]}
        />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}