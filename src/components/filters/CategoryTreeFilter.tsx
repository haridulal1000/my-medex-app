import { useState } from "react";
import { Checkbox, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { CategoryWithChildren } from "@api/schemas";

export function CategoryTreeFilter({
  tree,
  selected,
  counts,
  onToggle,
}: {
  tree: CategoryWithChildren[];
  selected: string[];
  counts: Record<string, number>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul className="space-y-0.5">
      {tree.map((cat) => {
        const count = counts[cat.id] ?? 0;
        const isSelected = selected.includes(cat.id);
        const disabled = count === 0 && !isSelected;
        const isOpen = open[cat.id] ?? false;
        const hasChildren = cat.children.length > 0;

        return (
          <li key={`${cat.type}-${cat.id}`}>
            <div className="flex items-center gap-1">
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={() => onToggle(cat.id)}
                disabled={disabled}
                slotProps={{ input: { "aria-label": `Category ${cat.title}` } }}
              />
              <button
                type="button"
                className="flex-1 flex items-center justify-between text-left text-sm py-1 disabled:cursor-default"
                onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                disabled={!hasChildren}
                aria-expanded={hasChildren ? isOpen : undefined}
              >
                <span className={disabled ? "text-slate-400" : undefined}>
                  {cat.title}{" "}
                  <span className="text-xs text-slate-400">({count})</span>
                </span>
                {hasChildren ? (
                  isOpen ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )
                ) : null}
              </button>
            </div>

            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <ul className="pl-8">
                  {cat.children.map((sub) => {
                    const c = counts[sub.id] ?? 0;
                    const subSelected = selected.includes(sub.id);
                    const subDisabled = c === 0 && !subSelected;
                    return (
                      <li key={sub.id} className="flex items-center">
                        <Checkbox
                          size="small"
                          checked={subSelected}
                          onChange={() => onToggle(sub.id)}
                          disabled={subDisabled}
                          slotProps={{
                            input: { "aria-label": `Subcategory ${sub.title}` },
                          }}
                        />
                        <span
                          className={
                            subDisabled ? "text-slate-400 text-sm" : "text-sm"
                          }
                        >
                          {sub.title}{" "}
                          <span className="text-xs text-slate-400">({c})</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Collapse>
            )}
          </li>
        );
      })}
    </ul>
  );
}
