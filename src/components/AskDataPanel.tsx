"use client";

import { useState } from "react";
import { QueryResultChart } from "./charts/QueryResultChart";
import type { DashboardFilters } from "./FiltersBar";
import type { ChartType, QueryPoint, StructuredQuery } from "@/lib/query/types";

interface AskResponse {
  answer: string;
  source: string;
  chartType: ChartType;
  points: QueryPoint[];
  query: StructuredQuery;
}

const SUGGESTIONS = [
  "Show revenue trend over time",
  "Revenue by region",
  "Orders by channel",
  "Top products by revenue",
  "Customers by plan tier",
];

interface Props {
  filters: DashboardFilters;
}

export function AskDataPanel({ filters }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          filters: {
            regions: filters.regions,
            categories: filters.categories,
            channels: filters.channels,
            plans: filters.plans,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          },
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }
      const data = (await res.json()) as AskResponse;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm"
      aria-label="Ask your data"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Ask your data</h2>
        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-xs text-slate-600">
          LLM or keyword fallback
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Natural language → structured query → answer + chart. Works without an API key.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
      >
        <input
          data-testid="ask-input"
          type="text"
          placeholder="e.g. How does revenue break down by region?"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-inner"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          data-testid="ask-submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-indigo-300"
            onClick={() => {
              setQuestion(s);
              submit(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4" data-testid="ask-result">
          <p className="text-sm text-slate-800">{result.answer}</p>
          <p className="mt-1 text-xs text-slate-500">
            Source: {result.source} · {result.query.metric} by {result.query.groupBy}
          </p>
          <div className="mt-4">
            <QueryResultChart
              chartType={result.chartType}
              points={result.points}
              metric={result.query.metric}
            />
          </div>
        </div>
      )}
    </section>
  );
}
