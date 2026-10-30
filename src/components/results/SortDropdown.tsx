import { MenuItem, TextField } from '@mui/material';
import type { SortKey } from '@domain/sort';
import { SORT_LABELS } from '@domain/sort';

const OPTIONS: SortKey[] = ['relevance', 'price_asc', 'price_desc', 'rating'];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <TextField
      select
      size="small"
      label="Sort"
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      sx={{ minWidth: 200 }}
    >
      {OPTIONS.map((key) => (
        <MenuItem key={key} value={key}>
          {SORT_LABELS[key]}
        </MenuItem>
      ))}
    </TextField>
  );
}