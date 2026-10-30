import { useState } from 'react';
import { Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AppShell } from '@components/layout/AppShell';
import { SidebarSection } from '@components/filters/SidebarSection';
import { FilterDrawer } from '@components/filters/FilterDrawer';
import { SidebarSkeleton } from '@components/filters/SidebarSkeleton';
import { ResultsSection } from '@components/results/ResultsSection';
import { SkeletonResults } from '@components/results/SkeletonResults';
import { ErrorState } from '@components/states/ErrorState';
import { SortDropdown } from '@components/results/SortDropdown';
import { CopyLinkButton } from '@components/common/CopyLinkButton';
import { QueryBoundary } from '@components/errors/QueryBoundary';
import { useUrlState } from '@state/useUrlState';
import { EMPTY_FILTERS, hasActiveFilters } from '@domain/filter';

export default function ServiceExplorerPage() {
  const { state, update } = useUrlState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtersActive = hasActiveFilters(state.filters);

  const clearAll = () => {
    update(
      (prev) => ({ ...prev, filters: EMPTY_FILTERS, page: 1 }),
      { replace: false },
    );
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="hidden lg:block">
          <QueryBoundary
            suspenseFallback={<SidebarSkeleton />}
            errorFallback={(err, reset) => (
              <ErrorState error={err} onRetry={reset} compact />
            )}
          >
            <SidebarSection />
          </QueryBoundary>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <Button
                className="lg:!hidden"
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open filters"
              >
                Filters
              </Button>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-[#0b69ff] hover:underline whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
              <CopyLinkButton />
            </div>
            <div className="shrink-0">
              <SortDropdown
                value={state.sort}
                onChange={(sort) =>
                  update((prev) => ({ ...prev, page: 1, sort }), {
                    replace: true,
                  })
                }
              />
            </div>
          </div>

          <QueryBoundary
            suspenseFallback={<SkeletonResults />}
            errorFallback={(err, reset) => (
              <ErrorState error={err} onRetry={reset} />
            )}
          >
            <ResultsSection />
          </QueryBoundary>
        </section>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </AppShell>
  );
}