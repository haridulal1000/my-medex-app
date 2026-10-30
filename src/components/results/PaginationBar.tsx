import { Pagination } from '@mui/material';

export function PaginationBar({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center py-6">
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => onChange(p)}
        color="primary"
        showFirstButton
        showLastButton
      />
    </div>
  );
}