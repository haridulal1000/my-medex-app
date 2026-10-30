import { useEffect } from 'react';
import { AppShell } from '@components/layout/AppShell';
import { FilterSidebar } from '@components/filters/FilterSidebar';
import { SidebarSkeleton } from '@components/filters/SidebarSkeleton';
import { SkeletonResults } from '@components/results/SkeletonResults';
import { ResultsPanel } from '@components/results/ResultsPanel';
import { EmptyState } from '@components/states/EmptyState';
import { ErrorState } from '@components/states/ErrorState';
import { SortDropdown } from '@components/results/SortDropdown';
import { useCategories, useProviders } from '@hooks/useCatalog';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import { EMPTY_FILTERS } from '@domain/filter';

export default function ServiceExplorerPage() {
  const { state, update, reset } = useUrlState();
  const categoriesQ = useCategories();
  const providersQ = useProviders();
  const search = useServiceSearch(state);

  const topCategories = categoriesQ.data ?? [];
  const providers = providersQ.data ?? [];

  // When backend clamps page (e.g. filters reduce pages while on page 5),
  // reconcile the URL so back/forward and share stay consistent.
  useEffect(() => {
    if (search.data && search.data.pagination.page !== state.page) {
      update(
        (prev) => ({ ...prev, page: search.data!.pagination.page }),
        { replace: true },
      );
    }
  }, [search.data, state.page, update]);

  const resultCount = search.data?.pagination.totalServices ?? 0;
  const showEmpty =
    !!search.data && search.data.pagination.totalServices === 0;
  const showResults =
    !!search.data && search.data.pagination.totalServices > 0;

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

        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div
              aria-live="polite"
              className="text-sm text-slate-600"
            >
              {search.data
                ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
                : ''}
            </div>
            <SortDropdown
              value={state.sort}
              onChange={(sort) =>
                update((prev) => ({ ...prev, page: 1, sort }), {
                  replace: true,
                })
              }
            />
          </div>

          {search.isLoading && !search.data ? (
            <SkeletonResults />
          ) : search.isError ? (
            <ErrorState onRetry={() => void search.refetch()} />
          ) : showEmpty ? (
            <EmptyState
              onClear={() =>
                update(() => ({
                  filters: EMPTY_FILTERS,
                  sort: 'relevance',
                  page: 1,
                }))
              }
            />
          ) : showResults ? (
            <ResultsPanel
              search={search.data!}
              onPageChange={(page) =>
                update((prev) => ({ ...prev, page }), { replace: false })
              }
            />
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}