import type { StructuredQuery } from "./types";

const RULES: { patterns: RegExp[]; query: StructuredQuery }[] = [
  {
    patterns: [/revenue.*(over time|trend|daily|by day|time series)/i, /daily revenue/i],
    query: { metric: "revenue", groupBy: "date", chartType: "line" },
  },
  {
    patterns: [/revenue.*(month|monthly)/i],
    query: { metric: "revenue", groupBy: "month", chartType: "line" },
  },
  {
    patterns: [/revenue.*region/i, /region.*revenue/i, /sales by region/i],
    query: { metric: "revenue", groupBy: "region", chartType: "bar" },
  },
  {
    patterns: [/orders.*region/i, /region.*orders/i],
    query: { metric: "orders", groupBy: "region", chartType: "bar" },
  },
  {
    patterns: [/category|categories|product line/i],
    query: { metric: "revenue", groupBy: "category", chartType: "pie" },
  },
  {
    patterns: [/channel|mobile|web|marketplace/i],
    query: { metric: "revenue", groupBy: "channel", chartType: "pie" },
  },
  {
    patterns: [/plan|subscription|tier|enterprise|pro|free/i],
    query: { metric: "customers", groupBy: "plan", chartType: "pie" },
  },
  {
    patterns: [/top product|product.*revenue|best.?sell/i],
    query: { metric: "revenue", groupBy: "product", chartType: "bar", limit: 6 },
  },
  {
    patterns: [/order count|number of orders|how many orders/i],
    query: { metric: "orders", groupBy: "month", chartType: "bar" },
  },
  {
    patterns: [/customer/i],
    query: { metric: "customers", groupBy: "region", chartType: "bar" },
  },
  {
    patterns: [/quantity|units/i],
    query: { metric: "quantity", groupBy: "category", chartType: "bar" },
  },
];

const DEFAULT_QUERY: StructuredQuery = {
  metric: "revenue",
  groupBy: "month",
  chartType: "area",
};

export function mapQuestionToQuery(question: string): StructuredQuery {
  const normalized = question.trim().toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(normalized))) {
      return { ...rule.query };
    }
  }
  return { ...DEFAULT_QUERY };
}

export function explainMapperChoice(question: string): string {
  const q = mapQuestionToQuery(question);
  return `Matched keywords to a ${q.metric} breakdown by ${q.groupBy} (offline mapper).`;
}
