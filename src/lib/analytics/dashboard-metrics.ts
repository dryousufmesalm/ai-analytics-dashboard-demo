import { parseISO } from "date-fns";
import type { Customer, Order } from "../data/types";
import type { QueryFilters } from "../query/types";
import { filterOrders } from "../query/filters";

export interface DashboardKpis {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  activeCustomers: number;
  revenueChangePct: number;
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardSlice {
  label: string;
  value: number;
}

export interface DashboardAnalytics {
  kpis: DashboardKpis;
  revenueOverTime: TimeSeriesPoint[];
  revenueByRegion: DashboardSlice[];
  ordersByCategory: DashboardSlice[];
  channelMix: DashboardSlice[];
  planMix: DashboardSlice[];
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function computeDashboardAnalytics(
  orders: Order[],
  customers: Customer[],
  filters: QueryFilters,
): DashboardAnalytics {
  const filtered = filterOrders(orders, customers, filters);

  const from = filters.dateFrom ? parseISO(filters.dateFrom) : null;
  const to = filters.dateTo ? parseISO(filters.dateTo) : null;

  let priorOrders = orders;
  if (from && to) {
    const spanMs = to.getTime() - from.getTime();
    const priorTo = new Date(from.getTime() - 1);
    const priorFrom = new Date(priorTo.getTime() - spanMs);
    priorOrders = filterOrders(orders, customers, {
      ...filters,
      dateFrom: priorFrom.toISOString().slice(0, 10),
      dateTo: priorTo.toISOString().slice(0, 10),
    });
  }

  const revenue = filtered.reduce((s, o) => s + o.revenue, 0);
  const orderCount = filtered.length;
  const priorRevenue = priorOrders.reduce((s, o) => s + o.revenue, 0);
  const activeCustomers = new Set(filtered.map((o) => o.customerId)).size;

  const byDate = new Map<string, { revenue: number; orders: number }>();
  for (const o of filtered) {
    const row = byDate.get(o.orderDate) ?? { revenue: 0, orders: 0 };
    row.revenue += o.revenue;
    row.orders += 1;
    byDate.set(o.orderDate, row);
  }

  const revenueOverTime = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const sumBy = (pick: (o: Order) => string) => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const k = pick(o);
      map.set(k, (map.get(k) ?? 0) + o.revenue);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  const ordersByCategoryMap = new Map<string, number>();
  for (const o of filtered) {
    ordersByCategoryMap.set(
      o.category,
      (ordersByCategoryMap.get(o.category) ?? 0) + 1,
    );
  }

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const planMixMap = new Map<string, number>();
  for (const o of filtered) {
    const plan = customerMap.get(o.customerId)?.plan ?? "free";
    planMixMap.set(plan, (planMixMap.get(plan) ?? 0) + 1);
  }

  const channelMixMap = new Map<string, number>();
  for (const o of filtered) {
    channelMixMap.set(o.channel, (channelMixMap.get(o.channel) ?? 0) + o.revenue);
  }

  return {
    kpis: {
      revenue,
      orders: orderCount,
      averageOrderValue: orderCount ? revenue / orderCount : 0,
      activeCustomers,
      revenueChangePct: pctChange(revenue, priorRevenue),
    },
    revenueOverTime,
    revenueByRegion: sumBy((o) => o.region),
    ordersByCategory: [...ordersByCategoryMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    channelMix: [...channelMixMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    planMix: [...planMixMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
  };
}
