import { useMemo, useState } from "react";
import { Checkbox, TextField } from "@mui/material";
import type { Provider } from "@api/schemas";

export function ProviderFilter({
  providers,
  selected,
  counts,
  onToggle,
}: {
  providers: Provider[];
  selected: number[];
  counts: Record<number, number>;
  onToggle: (id: number) => void;
}) {
  const [query, setQuery] = useState("");

  const { shown, hiddenCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allMatchingByFilter = providers.filter(
      (p) => (counts[p.id] ?? 0) > 0 || selected.includes(p.id),
    );
    const filtered = q
      ? allMatchingByFilter.filter((p) => p.name.toLowerCase().includes(q))
      : allMatchingByFilter;
    return {
      shown: filtered,
      hiddenCount: providers.length - allMatchingByFilter.length,
    };
  }, [providers, query, counts, selected]);

  return (
    <div>
      <TextField
        fullWidth
        size="small"
        placeholder="Search providers"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{ htmlInput: { "aria-label": "Search providers" } }}
      />
      <div className="mt-2 max-h-64 overflow-y-auto">
        {shown.length === 0 && (
          <div className="text-xs text-slate-500 px-1 py-2">
            No providers match.
          </div>
        )}
        {shown.map((p) => {
          const c = counts[p.id] ?? 0;
          const isSelected = selected.includes(p.id);
          const disabled = c === 0 && !isSelected;
          return (
            <label
              key={p.id}
              className="flex items-start gap-1 py-0.5 cursor-pointer"
            >
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={() => onToggle(p.id)}
                disabled={disabled}
              />
              <span
                className={
                  disabled ? "text-slate-400 text-sm pt-1.5" : "text-sm pt-1.5"
                }
              >
                {p.name} <span className="text-xs text-slate-400">({c})</span>
              </span>
            </label>
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <div className="mt-1 text-xs text-slate-500">
          {hiddenCount} provider{hiddenCount === 1 ? "" : "s"} hidden — no
          matches with current filters.
        </div>
      )}
    </div>
  );
}
