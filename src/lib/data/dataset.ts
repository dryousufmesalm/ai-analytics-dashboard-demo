import type { Dataset } from "./types";
import { generateDataset } from "./generate";

let cached: Dataset | null = null;

export function getDataset(): Dataset {
  if (!cached) {
    cached = generateDataset(42);
  }
  return cached;
}
