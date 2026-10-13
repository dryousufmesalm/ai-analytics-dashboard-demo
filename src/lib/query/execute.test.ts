import { describe, expect, it } from "vitest";
import { generateDataset } from "../data/generate";
import { executeQuery } from "./execute";

describe("executeQuery", () => {
  const dataset = generateDataset(99);

  it("aggregates revenue by region", () => {
    const result = executeQuery(
      { metric: "revenue", groupBy: "region", chartType: "bar" },
      dataset,
    );
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.points.reduce((s, p) => s + p.value, 0)).toBe(result.total);
  });

  it("respects date filters", () => {
    const all = executeQuery(
      { metric: "orders", groupBy: "date" },
      dataset,
    ).total;
    const filtered = executeQuery(
      {
        metric: "orders",
        groupBy: "date",
        filters: { dateFrom: "2026-09-01", dateTo: "2026-10-01" },
      },
      dataset,
    ).total;
    expect(filtered).toBeLessThan(all);
  });
});
