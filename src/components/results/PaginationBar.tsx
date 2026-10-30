import { Pagination, useMediaQuery, useTheme } from '@mui/material';
import { PageSizeSelect } from './PageSizeSelect';
import type { PageSize } from '@state/urlState';

export function PaginationBar({
  page,
  pageSize,
  totalPages,
  totalProviders,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;
  totalPages: number;
  totalProviders: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: PageSize) => void;
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

  const start = totalProviders === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalProviders);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onPageChange(p)}
          color="primary"
          size={isCompact ? 'small' : 'medium'}
          siblingCount={isCompact ? 0 : 1}
          boundaryCount={1}
          showFirstButton={!isCompact}
          showLastButton={!isCompact}
          sx={{ '& ul': { flexWrap: 'nowrap', justifyContent: 'center' } }}
        />
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-slate-500">
          {totalProviders === 0
            ? 'No providers'
            : `Showing ${start}–${end} of ${totalProviders} provider${
                totalProviders === 1 ? '' : 's'
              }`}
        </span>
        <PageSizeSelect value={pageSize} onChange={onPageSizeChange} />
      </div>
    </div>
  );
}