import { useEffect } from 'react';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import { EMPTY_FILTERS } from '@domain/filter';
import { ResultsPanel } from './ResultsPanel';
import { EmptyState } from '@components/states/EmptyState';

export function ResultsSection() {
  const { state, update } = useUrlState();
  const search = useServiceSearch(state);

  useEffect(() => {
    if (search.isPlaceholderData) return;
    if (!search.data) return;
    const clamped = search.data.pagination.page;
    if (clamped === state.page) return;
    update((prev) => ({ ...prev, page: clamped }), { replace: true });
  }, [search.data, search.isPlaceholderData, state.page, update]);

  const count = search.data!.pagination.totalServices;

  const clearAll = () => {
    update(
      (prev) => ({ ...prev, filters: EMPTY_FILTERS, page: 1 }),
      { replace: false },
    );
  };

  if (count === 0) {
    return <EmptyState onClear={clearAll} />;
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div aria-live="polite" className="text-sm text-slate-600">
          {count} result{count === 1 ? '' : 's'}
        </div>
        {search.isFetching && (
          <span className="text-xs text-slate-400">Updating…</span>
        )}
      </div>
      <ResultsPanel
        search={search.data!}
        onPageChange={(page) =>
          update((prev) => ({ ...prev, page }), { replace: false })
        }
        onPageSizeChange={(pageSize) =>
          update((prev) => ({ ...prev, page: 1, pageSize }), { replace: true })
        }
      />
    </>
  );
}