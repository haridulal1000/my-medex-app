import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AppShell } from '@components/layout/AppShell';
import { FilterSidebar } from '@components/filters/FilterSidebar';
import { FilterDrawer } from '@components/filters/FilterDrawer';
import { SidebarSkeleton } from '@components/filters/SidebarSkeleton';
import { SkeletonResults } from '@components/results/SkeletonResults';
import { ResultsPanel } from '@components/results/ResultsPanel';
import { EmptyState } from '@components/states/EmptyState';
import { ErrorState } from '@components/states/ErrorState';
import { SortDropdown } from '@components/results/SortDropdown';
import { useCategories, useProviders } from '@hooks/useCatalog';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import { EMPTY_FILTERS, hasActiveFilters } from '@domain/filter';

export default function ServiceExplorerPage() {
  const { state, update } = useUrlState();
  const categoriesQ = useCategories();
  const providersQ = useProviders();
  const search = useServiceSearch(state);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topCategories = categoriesQ.data ?? [];
  const providers = providersQ.data ?? [];

  // Reconcile page when the backend clamps it (e.g. filters reduce total
  // pages while the user is on page 5). The `isPlaceholderData` guard is
  // critical: while a new page is loading, `search.data` still holds the
  // PREVIOUS page's data — without the guard, the effect would fire and
  // revert the URL back to that previous page, breaking pagination entirely.
  useEffect(() => {
    if (search.isPlaceholderData) return;
    if (!search.data) return;
    const clamped = search.data.pagination.page;
    if (clamped === state.page) return;
    update((prev) => ({ ...prev, page: clamped }), { replace: true });
  }, [search.data, search.isPlaceholderData, state.page, update]);

  const resultCount = search.data?.pagination.totalServices ?? 0;
  const showEmpty =
    !!search.data && search.data.pagination.totalServices === 0;
  const showResults =
    !!search.data && search.data.pagination.totalServices > 0;

  const clearAll = () => {
    update(
      (prev) => ({ ...prev, filters: EMPTY_FILTERS, page: 1 }),
      { replace: false },
    );
  };

  const filtersActive = hasActiveFilters(state.filters);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="hidden lg:block">
          {search.data ? (
            <FilterSidebar
              facets={search.data.facets}
              topCategories={topCategories}
              providers={providers}
            />
          ) : (
            <SidebarSkeleton />
          )}
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
              <div
                aria-live="polite"
                className="text-sm text-slate-600 truncate"
              >
                {search.data
                  ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
                  : ''}
              </div>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-[#0b69ff] hover:underline whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
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

          {search.isLoading && !search.data ? (
            <SkeletonResults />
          ) : search.isError ? (
            <ErrorState onRetry={() => void search.refetch()} />
          ) : showEmpty ? (
            <EmptyState onClear={clearAll} />
          ) : showResults ? (
            <ResultsPanel
              search={search.data!}
              onPageChange={(page) =>
                update((prev) => ({ ...prev, page }), { replace: false })
              }
              onPageSizeChange={(pageSize) =>
                update((prev) => ({ ...prev, page: 1, pageSize }), {
                  replace: true,
                })
              }
            />
          ) : null}
        </section>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        topCategories={topCategories}
        providers={providers}
      />
    </AppShell>
  );
}