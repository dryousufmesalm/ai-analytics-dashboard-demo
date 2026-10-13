"use client";

import type { DashboardKpis } from "@/lib/analytics/dashboard-metrics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface Props {
  kpis: DashboardKpis;
}

const cards: {
  key: keyof DashboardKpis;
  label: string;
  format: (v: number) => string;
}[] = [
  { key: "revenue", label: "Total revenue", format: formatCurrency },
  { key: "orders", label: "Orders", format: formatNumber },
  { key: "averageOrderValue", label: "Avg. order value", format: formatCurrency },
  { key: "activeCustomers", label: "Active customers", format: formatNumber },
];

export function KpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, format }) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {format(kpis[key] as number)}
          </p>
        </div>
      ))}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white px-4 py-3 shadow-sm sm:col-span-2 xl:col-span-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          Revenue vs prior period
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatPercent(kpis.revenueChangePct)}{" "}
          <span className="text-sm font-normal text-slate-600">
            compared to the previous date range of equal length
          </span>
        </p>
      </div>
    </div>
  );
}
