// components/charts/RevenueBySportDonutChart.jsx

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { formatCurrency, formatShortenCurrency } from "../../utils/ValueFormat";

const COLORS = [
  "#4C8EF7", // blue
  "#12B886", // teal-green
  "#F59E0B", // amber
  "#F0537C", // pink-red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm shadow-lg px-4 py-3 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span className="text-xs font-semibold text-gray-500">{entry.name}</span>
      </div>
      <p className="text-sm font-bold text-gray-800">
        {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

function CustomLegend({ data, total, activeIndex, setActiveIndex }) {
  return (
    <div className="flex flex-col gap-2 justify-center">
      {data.map((entry, index) => {
        const percent = total > 0 ? ((entry.revenue / total) * 100).toFixed(0) : 0;
        const isActive = activeIndex === index;

        return (
          <button
            key={entry.name}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
              isActive ? "bg-gray-50" : "bg-transparent"
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {entry.name}
            </span>
            <span className="text-xs font-semibold text-gray-800">{percent}%</span>
          </button>
        );
      })}
    </div>
  );
}

// Slightly "pops out" the active slice on hover
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={6}
    />
  );
}

export default function RevenueBySportDonutChart({ data = [], chartHeight }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(
    () =>
      Object.values(
        data.reduce((acc, item) => {
          const sport = item.courtSport;
          if (!acc[sport]) acc[sport] = { name: sport, revenue: 0 };
          acc[sport].revenue += Number(item.total_sport_revenue || 0);
          return acc;
        }, {})
      ),
    [data]
  );

  const total = chartData.reduce((sum, d) => sum + d.revenue, 0);

  if (chartData.length === 0) {
    return (
      <div
        style={{ height: chartHeight }}
        className="flex items-center justify-center text-sm text-gray-400"
      >
        No revenue data available.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0" style={{ width: "60%" }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={4}
              cornerRadius={6}
              stroke="none"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-gray-400">Total Revenue</span>
          <span className="text-lg font-bold text-gray-800">
            {formatShortenCurrency(total)}
          </span>
        </div>
      </div>

      <CustomLegend
        data={chartData}
        total={total}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>
  );
}