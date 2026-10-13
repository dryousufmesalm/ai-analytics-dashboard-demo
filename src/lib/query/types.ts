import type { Channel, Plan, ProductCategory, Region } from "../data/types";

export type Metric = "revenue" | "orders" | "quantity" | "customers";
export type GroupBy =
  | "date"
  | "week"
  | "month"
  | "region"
  | "category"
  | "channel"
  | "plan"
  | "product";
export type ChartType = "line" | "bar" | "area" | "pie";

export interface QueryFilters {
  regions?: Region[];
  categories?: ProductCategory[];
  channels?: Channel[];
  plans?: Plan[];
  dateFrom?: string;
  dateTo?: string;
}

export interface StructuredQuery {
  metric: Metric;
  groupBy: GroupBy;
  filters?: QueryFilters;
  chartType?: ChartType;
  limit?: number;
}

export interface QueryPoint {
  key: string;
  label: string;
  value: number;
}

export interface QueryResult {
  query: StructuredQuery;
  points: QueryPoint[];
  total: number;
  summary: string;
  chartType: ChartType;
}
