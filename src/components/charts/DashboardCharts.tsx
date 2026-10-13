"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/analytics/dashboard-metrics";
import { formatCurrency, formatNumber } from "@/lib/format";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

interface Props {
  analytics: DashboardAnalytics;
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

export function DashboardCharts({ analytics }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Revenue over time">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={analytics.revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#bfdbfe" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue by region">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.revenueByRegion}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Orders by product category">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={analytics.ordersByCategory}
              dataKey="value"
              nameKey="label"
              innerRadius={45}
              outerRadius={85}
            >
              {analytics.ordersByCategory.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatNumber(Number(v ?? 0))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Channel revenue mix">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.channelMix} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
            <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Orders by customer plan">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.planMix}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatNumber(v)} />
            <Tooltip formatter={(v) => formatNumber(Number(v ?? 0))} />
            <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
