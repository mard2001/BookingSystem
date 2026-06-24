// components/charts/BookingsRevenueChart.jsx

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from "recharts";
import { formatCurrency, formatShortenCurrency } from "../../utils/ValueFormat";

export default function BookingsRevenueChart({data = [], chartHeight}) {
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ComposedChart
        data={data}
        margin={{ top: 18, right: 24, left: 8, bottom: 32 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
        />

        <XAxis
          dataKey="month_label"
          tick={{ fontSize: 12, angle: -35, textAnchor: "end", dy:10 }}
          tickLine={true}
          axisLine={true}
          interval={0} 
        />

        <YAxis
          yAxisId="bookings"
          orientation="left"
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickLine={true}
          axisLine={true}
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
          tickFormatter={formatShortenCurrency}
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
              return [formatCurrency(value), "Revenue"];
            }

            return [value, "Bookings"];
          }}
        />

        <Legend  wrapperStyle={{ paddingTop: 55 }}/>

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