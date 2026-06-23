// components/charts/BookingsRevenueChart.jsx

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatPeso = (value) =>
  `₱${Number(value || 0).toLocaleString()}`;

const formatK = (value) => {
  const num = Number(value || 0);

  if (num >= 1000) {
    return `₱${(num / 1000).toFixed(0)}k`;
  }

  return `₱${num}`;
};

export default function BookingsRevenueChart({
  data = [],
  height = 320,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
        />

        <XAxis
          dataKey="month_label"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          yAxisId="bookings"
          orientation="left"
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Bookings",
            angle: -90,
            position: "insideLeft",
            fontSize: 11,
            fill: "#378ADD",
          }}
        />

        <YAxis
          yAxisId="revenue"
          orientation="right"
          tickFormatter={formatK}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Revenue",
            angle: 90,
            position: "insideRight",
            fontSize: 11,
            fill: "#1D9E75",
          }}
        />

        <Tooltip
          labelFormatter={(label) => `Month: ${label}`}
          formatter={(value, name) => {
            if (name === "Revenue") {
              return [formatPeso(value), "Revenue"];
            }

            return [value, "Bookings"];
          }}
        />

        <Legend />

        <Bar
          yAxisId="bookings"
          dataKey="total_bookings"
          name="Bookings"
          fill="#378ADD"
          fillOpacity={0.2}
          stroke="#378ADD"
          strokeWidth={1.5}
          radius={[4, 4, 0, 0]}
        />

        <Line
          yAxisId="revenue"
          dataKey="total_revenue"
          name="Revenue"
          type="monotone"
          stroke="#1D9E75"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}