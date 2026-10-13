import { format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type { Dataset } from "../data/types";
import { getDataset } from "../data/dataset";
import { filterOrders } from "./filters";
import type {
  ChartType,
  GroupBy,
  Metric,
  QueryPoint,
  QueryResult,
  StructuredQuery,
} from "./types";

function bucketKey(orderDate: string, groupBy: GroupBy): string {
  const d = parseISO(orderDate);
  switch (groupBy) {
    case "date":
      return orderDate;
    case "week":
      return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
    case "month":
      return format(startOfMonth(d), "yyyy-MM");
    default:
      return orderDate;
  }
}

function labelForKey(key: string, groupBy: GroupBy): string {
  if (groupBy === "month") {
    const [y, m] = key.split("-");
    return `${y}-${m}`;
  }
  return key;
}

function defaultChartType(groupBy: GroupBy, metric: Metric): ChartType {
  if (groupBy === "date" || groupBy === "week" || groupBy === "month") {
    return metric === "orders" ? "bar" : "line";
  }
  if (groupBy === "category" || groupBy === "plan" || groupBy === "channel") {
    return "pie";
  }
  return "bar";
}

function metricValue(
  metric: Metric,
  orders: typeof getDataset extends () => Dataset ? Dataset["orders"] : never,
  customerIds?: Set<string>,
): number {
  switch (metric) {
    case "revenue":
      return orders.reduce((s, o) => s + o.revenue, 0);
    case "orders":
      return orders.length;
    case "quantity":
      return orders.reduce((s, o) => s + o.quantity, 0);
    case "customers":
      return customerIds
        ? customerIds.size
        : new Set(orders.map((o) => o.customerId)).size;
    default: {
      const _exhaustive: never = metric;
      return _exhaustive;
    }
  }
}

export function executeQuery(
  query: StructuredQuery,
  dataset?: Dataset,
): QueryResult {
  const data = dataset ?? getDataset();
  const filtered = filterOrders(
    data.orders,
    data.customers,
    query.filters,
  );

  const productMap = new Map(data.products.map((p) => [p.id, p]));
  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  const buckets = new Map<string, { orders: typeof filtered; customers: Set<string> }>();

  for (const order of filtered) {
    let key: string;
    switch (query.groupBy) {
      case "region":
        key = order.region;
        break;
      case "category":
        key = order.category;
        break;
      case "channel":
        key = order.channel;
        break;
      case "plan": {
        const plan = customerMap.get(order.customerId)?.plan ?? "free";
        key = plan;
        break;
      }
      case "product": {
        const name = productMap.get(order.productId)?.name ?? order.productId;
        key = name;
        break;
      }
      case "date":
      case "week":
      case "month":
        key = bucketKey(order.orderDate, query.groupBy);
        break;
      default: {
        const _exhaustive: never = query.groupBy;
        key = String(_exhaustive);
      }
    }

    const entry = buckets.get(key) ?? { orders: [], customers: new Set<string>() };
    entry.orders.push(order);
    entry.customers.add(order.customerId);
    buckets.set(key, entry);
  }

  const points: QueryPoint[] = [];
  for (const [key, { orders, customers }] of buckets) {
    points.push({
      key,
      label: labelForKey(key, query.groupBy),
      value: metricValue(query.metric, orders, customers),
    });
  }

  const timeGroup =
    query.groupBy === "date" ||
    query.groupBy === "week" ||
    query.groupBy === "month";

  points.sort((a, b) => {
    if (timeGroup) return a.key.localeCompare(b.key);
    return b.value - a.value;
  });

  const limit = query.limit ?? (timeGroup ? undefined : 8);
  const limited = limit ? points.slice(0, limit) : points;

  const total = metricValue(query.metric, filtered);
  const chartType = query.chartType ?? defaultChartType(query.groupBy, query.metric);
  const summary = buildSummary(query, total, limited);

  return {
    query,
    points: limited,
    total,
    summary,
    chartType,
  };
}

function buildSummary(
  query: StructuredQuery,
  total: number,
  points: QueryPoint[],
): string {
  const metricLabel: Record<Metric, string> = {
    revenue: "revenue",
    orders: "orders",
    quantity: "units sold",
    customers: "unique customers",
  };
  const top = points[0];
  const formattedTotal =
    query.metric === "revenue"
      ? `$${total.toLocaleString()}`
      : total.toLocaleString();

  if (!top) {
    return `No data matched your filters for ${metricLabel[query.metric]}.`;
  }

  const topValue =
    query.metric === "revenue"
      ? `$${top.value.toLocaleString()}`
      : top.value.toLocaleString();

  return `Total ${metricLabel[query.metric]}: ${formattedTotal}. Top segment "${top.label}" accounts for ${topValue}.`;
}
