import { describe, expect, it } from "vitest";
import { mapQuestionToQuery } from "./keyword-mapper";

describe("mapQuestionToQuery", () => {
  it("maps revenue by region", () => {
    const q = mapQuestionToQuery("What is our revenue by region?");
    expect(q.metric).toBe("revenue");
    expect(q.groupBy).toBe("region");
  });

  it("maps channel questions", () => {
    const q = mapQuestionToQuery("Show mobile vs web channel performance");
    expect(q.groupBy).toBe("channel");
  });

  it("falls back to monthly revenue", () => {
    const q = mapQuestionToQuery("hello world");
    expect(q.metric).toBe("revenue");
    expect(q.groupBy).toBe("month");
  });
});
