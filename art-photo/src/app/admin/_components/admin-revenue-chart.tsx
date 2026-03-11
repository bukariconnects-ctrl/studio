"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type RevenueRow = {
  date: string;
  booking_revenue: number;
  order_revenue: number;
  total_revenue: number;
};

export function AdminRevenueChart({ data }: { data: RevenueRow[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("ar-YE", { month: "short", day: "numeric" }),
    booking_revenue: Number(d.booking_revenue),
    order_revenue: Number(d.order_revenue),
  }));

  if (formatted.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات إيرادات بعد
      </div>
    );
  }

  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "2px solid var(--color-foreground)",
              borderRadius: "12px",
              boxShadow: "4px 4px 0px 0px var(--color-foreground)",
              fontSize: 12,
              fontWeight: 600,
            }}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value).toLocaleString()} ر.ي`,
              String(name) === "booking_revenue" ? "حجوزات" : "طلبات",
            ]}
            labelFormatter={(label: unknown) => String(label)}
          />
          <Bar
            dataKey="booking_revenue"
            fill="var(--color-primary)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="order_revenue"
            fill="var(--color-secondary)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
