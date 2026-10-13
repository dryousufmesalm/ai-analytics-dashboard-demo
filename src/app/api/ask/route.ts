import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/query/execute";
import { parseQuestionToQuery } from "@/lib/llm/provider";
import type { QueryFilters } from "@/lib/query/types";

interface AskBody {
  question?: string;
  filters?: QueryFilters;
}

export async function POST(request: Request) {
  let body: AskBody;
  try {
    body = (await request.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const parsed = await parseQuestionToQuery(question);
  const query = {
    ...parsed.query,
    filters: {
      ...parsed.query.filters,
      ...body.filters,
    },
  };

  const result = executeQuery(query);

  return NextResponse.json({
    answer: `${result.summary} ${parsed.explanation}`,
    source: parsed.source,
    chartType: result.chartType,
    points: result.points,
    query: result.query,
    total: result.total,
  });
}
