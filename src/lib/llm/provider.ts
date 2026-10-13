import { mapQuestionToQuery } from "../query/keyword-mapper";
import type { StructuredQuery } from "../query/types";

export type LlmSource = "openai" | "keyword";

export interface ParseQuestionResult {
  query: StructuredQuery;
  source: LlmSource;
  explanation: string;
}

const SYSTEM_PROMPT = `You translate natural language analytics questions into JSON for a SaaS/e-commerce dataset.
Respond with ONLY valid JSON matching this schema:
{
  "metric": "revenue" | "orders" | "quantity" | "customers",
  "groupBy": "date" | "week" | "month" | "region" | "category" | "channel" | "plan" | "product",
  "chartType": "line" | "bar" | "area" | "pie" (optional),
  "limit": number (optional, for top-N product queries)
}
No markdown, no commentary.`;

function hasOpenAiKey(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key.length > 10);
}

function parseJsonQuery(raw: string): StructuredQuery | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as StructuredQuery;
    if (
      parsed.metric &&
      parsed.groupBy &&
      ["revenue", "orders", "quantity", "customers"].includes(parsed.metric)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function parseWithOpenAi(question: string): Promise<StructuredQuery | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return parseJsonQuery(content);
}

export async function parseQuestionToQuery(
  question: string,
): Promise<ParseQuestionResult> {
  if (hasOpenAiKey()) {
    const llmQuery = await parseWithOpenAi(question);
    if (llmQuery) {
      return {
        query: llmQuery,
        source: "openai",
        explanation: "Structured query generated via OpenAI-compatible API.",
      };
    }
  }

  const query = mapQuestionToQuery(question);
  return {
    query,
    source: "keyword",
    explanation:
      "No API key (or LLM parse failed); used deterministic keyword mapper.",
  };
}
