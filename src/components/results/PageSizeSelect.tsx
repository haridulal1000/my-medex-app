import { MenuItem, TextField } from '@mui/material';
import { PAGE_SIZE_OPTIONS } from '@state/urlState';
import type { PageSize } from '@state/urlState';

export function PageSizeSelect({
  value,
  onChange,
}: {
  value: PageSize;
  onChange: (n: PageSize) => void;
}) {
  return (
    <TextField
      select
      size="small"
      label="Per page"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as PageSize)}
      sx={{ minWidth: 120 }}
    >
      {PAGE_SIZE_OPTIONS.map((n) => (
        <MenuItem key={n} value={n}>
          {n} / page
        </MenuItem>
      ))}
    </TextField>
  );
}