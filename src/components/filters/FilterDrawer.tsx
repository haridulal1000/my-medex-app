import { useEffect, useState } from 'react';
import { Button, Drawer, IconButton, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EMPTY_FILTERS } from '@domain/filter';
import type { FilterState } from '@domain/filter';
import { useCategories, useProviders } from '@hooks/useCatalog';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import { QueryBoundary } from '@components/errors/QueryBoundary';
import { ErrorState } from '@components/states/ErrorState';
import { FilterSidebar } from './FilterSidebar';

export function FilterDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, update } = useUrlState();
  const [pending, setPending] = useState<FilterState>(state.filters);

  useEffect(() => {
    if (open) setPending(state.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () => {
    update(
      (prev) => ({ ...prev, filters: pending, page: 1 }),
      { replace: false },
    );
    onClose();
  };

  return (
   <Drawer
  anchor="left"
  open={open}
  onClose={onClose}
  slotProps={{
    paper: {
      sx: {
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
      },
    },
  }}
>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="font-semibold">Filters</div>
        <IconButton onClick={onClose} aria-label="Close filters">
          <CloseIcon />
        </IconButton>
      </div>

      {open && (
        <QueryBoundary
          suspenseFallback={<DrawerBodySkeleton />}
          errorFallback={(err, reset) => (
            <div className="p-4">
              <ErrorState error={err} onRetry={reset} compact />
            </div>
          )}
        >
          <DrawerBody
            pending={pending}
            setPending={setPending}
            onClear={() => setPending(EMPTY_FILTERS)}
            onApply={apply}
          />
        </QueryBoundary>
      )}
    </Drawer>
  );
}

function DrawerBody({
  pending,
  setPending,
  onClear,
  onApply,
}: {
  pending: FilterState;
  setPending: (next: FilterState) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const { state } = useUrlState();
  const categoriesQ = useCategories();
  const providersQ = useProviders();
  const preview = useServiceSearch({
    filters: pending,
    sort: state.sort,
    page: 1,
    pageSize: state.pageSize,
  });

  const count = preview.data!.pagination.totalServices;

  return (
    <>
      <div className="flex-1 overflow-auto p-4">
        <FilterSidebar
          facets={preview.data!.facets}
          topCategories={categoriesQ.data ?? []}
          providers={providersQ.data ?? []}
          filters={pending}
          onFiltersChange={setPending}
        />
      </div>
      <div className="border-t border-slate-200 p-4 flex gap-2 bg-white">
        <Button onClick={onClear} variant="outlined" color="inherit" size="large">
          Clear
        </Button>
        <Button
          onClick={onApply}
          variant="contained"
          size="large"
          fullWidth
          aria-live="polite"
        >
          Show {count} result{count === 1 ? '' : 's'}
        </Button>
      </div>
    </>
  );
}

function DrawerBodySkeleton() {
  return (
    <div className="flex-1 overflow-hidden p-4 space-y-4" aria-busy="true">
      <Skeleton height={40} />
      <Skeleton height={120} />
      <Skeleton height={180} />
      <Skeleton height={100} />
    </div>
  );
}