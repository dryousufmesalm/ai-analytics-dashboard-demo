"use client";

import type { Channel, Plan, ProductCategory, Region } from "@/lib/data/types";
import type { QueryFilters } from "@/lib/query/types";

const REGIONS: Region[] = ["North America", "Europe", "APAC", "LATAM"];
const CATEGORIES: ProductCategory[] = [
  "Analytics",
  "Automation",
  "Commerce",
  "Support",
];
const CHANNELS: Channel[] = ["web", "mobile", "marketplace"];
const PLANS: Plan[] = ["free", "pro", "enterprise"];

export interface DashboardFilters extends QueryFilters {
  dateFrom: string;
  dateTo: string;
}

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

function toggle<T extends string>(list: T[] | undefined, value: T): T[] {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set];
}

export function FiltersBar({ filters, onChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor="date-from">
            From
          </label>
          <input
            id="date-from"
            type="date"
            className="mt-1 block rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor="date-to">
            To
          </label>
          <input
            id="date-to"
            type="date"
            className="mt-1 block rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <FilterGroup
          title="Region"
          options={REGIONS}
          selected={filters.regions}
          onToggle={(v) =>
            onChange({ ...filters, regions: toggle(filters.regions, v as Region) })
          }
        />
        <FilterGroup
          title="Category"
          options={CATEGORIES}
          selected={filters.categories}
          onToggle={(v) =>
            onChange({
              ...filters,
              categories: toggle(filters.categories, v as ProductCategory),
            })
          }
        />
        <FilterGroup
          title="Channel"
          options={CHANNELS}
          selected={filters.channels}
          onToggle={(v) =>
            onChange({ ...filters, channels: toggle(filters.channels, v as Channel) })
          }
        />
        <FilterGroup
          title="Plan"
          options={PLANS}
          selected={filters.plans}
          onToggle={(v) =>
            onChange({ ...filters, plans: toggle(filters.plans, v as Plan) })
          }
        />
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected?: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected?.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
