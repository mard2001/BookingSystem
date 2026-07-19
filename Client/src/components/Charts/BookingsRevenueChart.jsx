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
import { formatCurrency, formatShortenCurrency } from "../../utils/ValueFormat";

const COLORS = {
  bookings: "#4C8EF7",
  bookingsSoft: "#4C8EF7",
  revenue: "#12B886",
  grid: "#EEF1F6",
  axisText: "#6B7280",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4 text-sm py-0.5"
        >
          <span className="flex items-center gap-1.5 text-gray-600">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-gray-800">
            {entry.name === "Revenue"
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-6 pt-4">
      {payload.map((entry) => (
        <span
          key={entry.value}
          className="flex items-center gap-2 text-xs font-medium text-gray-600"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

export default function BookingsRevenueChart({ data = [], chartHeight }) {
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ComposedChart
        data={data}
        margin={{ top: 18, right: 24, left: 8, bottom: 20 }}
        barSize={28}
      >
        <defs>
          <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.bookings} stopOpacity={0.85} />
            <stop offset="100%" stopColor={COLORS.bookings} stopOpacity={0.15} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 8" vertical={false} stroke={COLORS.grid} />

        <XAxis
          dataKey="month_label"
          tick={{ fontSize: 12, angle: -35, textAnchor: "end", dy: 10, fill: COLORS.axisText }}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          interval={0}
        />

        <YAxis
          yAxisId="bookings"
          orientation="left"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: COLORS.axisText }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Bookings",
            angle: -90,
            position: "insideLeft",
            fontSize: 11,
            fill: COLORS.bookings,
            fontWeight: 600,
          }}
        />

        <YAxis
          yAxisId="revenue"
          orientation="right"
          tickFormatter={formatShortenCurrency}
          tick={{ fontSize: 12, fill: COLORS.axisText }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Revenue",
            angle: 90,
            position: "insideRight",
            fontSize: 11,
            fill: COLORS.revenue,
            fontWeight: 600,
          }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(76,142,247,0.06)" }} />

        <Legend content={<CustomLegend />} />

        <Bar
          yAxisId="bookings"
          dataKey="total_bookings"
          name="Bookings"
          fill="url(#bookingsGradient)"
          stroke={COLORS.bookings}
          strokeWidth={1.5}
          radius={[6, 6, 0, 0]}
        />

        <Line
          yAxisId="revenue"
          dataKey="total_revenue"
          name="Revenue"
          type="monotone"
          stroke={COLORS.revenue}
          strokeWidth={2.5}
          dot={{ r: 4, fill: COLORS.revenue, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}