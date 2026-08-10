import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartPoint } from "@/types/home";
import { formatDate, formatPrice } from "@/utils/format";

/** Default export so it can be dynamically imported and kept out of the initial bundle. */
export default function RateChart({ points }: { points: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatDate(value).replace(/ \d{4}$/, "")}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={["dataMin - 0.2", "dataMax + 0.2"]}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(value: number) => `₹${value.toFixed(2)}`}
        />
        <Tooltip
          formatter={(value: number) => [formatPrice(value), "Avg per egg"]}
          labelFormatter={(label: string) => formatDate(label)}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="perEgg"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#rateFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
