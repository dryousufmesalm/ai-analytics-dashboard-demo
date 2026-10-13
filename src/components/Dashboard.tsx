"use client";

import { useMemo, useState } from "react";
import { getDataset } from "@/lib/data/dataset";
import { computeDashboardAnalytics } from "@/lib/analytics/dashboard-metrics";
import { AskDataPanel } from "./AskDataPanel";
import { DashboardCharts } from "./charts/DashboardCharts";
import { FiltersBar, type DashboardFilters } from "./FiltersBar";
import { KpiCards } from "./KpiCards";

const dataset = getDataset();
const defaultFrom = "2025-10-01";
const defaultTo = "2026-10-01";

export function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: defaultFrom,
    dateTo: defaultTo,
  });

  const analytics = useMemo(
    () => computeDashboardAnalytics(dataset.orders, dataset.customers, filters),
    [filters],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Portfolio demo · fake data
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Nimbus Commerce Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            SaaS + e-commerce KPIs with filters, date range, and an AI-assisted
            “ask your data” panel over a generated dataset.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Dataset seed: 42 · {dataset.orders.length.toLocaleString()} orders
        </p>
      </header>

      <FiltersBar filters={filters} onChange={setFilters} />
      <KpiCards kpis={analytics.kpis} />
      <DashboardCharts analytics={analytics} />
      <AskDataPanel filters={filters} />
    </div>
  );
}
