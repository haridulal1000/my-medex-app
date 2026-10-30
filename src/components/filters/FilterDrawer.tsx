import { useEffect, useState } from 'react';
import { Button, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { CategoryWithChildren, Provider } from '@api/schemas';
import { EMPTY_FACETS } from '@domain/facets';
import { EMPTY_FILTERS } from '@domain/filter';
import type { FilterState } from '@domain/filter';
import { useServiceSearch } from '@hooks/useServiceSearch';
import { useUrlState } from '@state/useUrlState';
import type { UrlState } from '@state/urlState';
import { FilterSidebar } from './FilterSidebar';

export function FilterDrawer({
  open,
  onClose,
  topCategories,
  providers,
}: {
  open: boolean;
  onClose: () => void;
  topCategories: CategoryWithChildren[];
  providers: Provider[];
}) {
  const { state, update } = useUrlState();

  // Staged filter state. The user toggles checkboxes here; nothing touches
  // the URL until they tap "Show N results".
  const [pending, setPending] = useState<FilterState>(state.filters);

  // Re-sync pending from the URL whenever the drawer opens. We intentionally
  // depend only on `open` (not on `state.filters`) so that in-progress edits
  // aren't clobbered by unrelated URL updates while the drawer is closed.
  useEffect(() => {
    if (open) setPending(state.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Preview query against the pending selection. keepPreviousData inside
  // useServiceSearch keeps the previous count visible while the new one
  // loads, so the button text never flashes "Show results".
  const previewState: UrlState = {
    filters: pending,
    sort: state.sort,
    page: 1,
    pageSize: state.pageSize,
  };
  const preview = useServiceSearch(previewState);
  const facets = preview.data?.facets ?? EMPTY_FACETS;
  const count = preview.data?.pagination.totalServices;

  const countLabel =
    count !== undefined
      ? `Show ${count} result${count === 1 ? '' : 's'}`
      : 'Show results';

  const apply = () => {
    update(
      (prev) => ({ ...prev, filters: pending, page: 1 }),
      { replace: false },
    );
    onClose();
  };

  const clear = () => setPending(EMPTY_FILTERS);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="font-semibold">Filters</div>
        <IconButton onClick={onClose} aria-label="Close filters">
          <CloseIcon />
        </IconButton>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <FilterSidebar
          facets={facets}
          topCategories={topCategories}
          providers={providers}
          filters={pending}
          onFiltersChange={setPending}
        />
      </div>

      <div className="border-t border-slate-200 p-4 flex gap-2 bg-white">
        <Button
          onClick={clear}
          variant="outlined"
          color="inherit"
          size="large"
        >
          Clear
        </Button>
        <Button
          onClick={apply}
          variant="contained"
          size="large"
          fullWidth
          aria-live="polite"
        >
          {countLabel}
        </Button>
      </div>
    </Drawer>
  );
}