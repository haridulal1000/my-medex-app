import { MenuItem, TextField } from '@mui/material';
import type { PriceRangeFilter } from '@domain/filter';

type Currency = NonNullable<PriceRangeFilter['currency']>;

export function PriceFilter({
  value,
  onChange,
}: {
  value: PriceRangeFilter;
  onChange: (next: PriceRangeFilter) => void;
}) {
  const { currency, min, max } = value;

  return (
    <div className="space-y-2">
      <TextField
        select
        size="small"
        fullWidth
        label="Currency"
        value={currency ?? ''}
        onChange={(e) => {
          const next = (e.target.value || null) as Currency | null;
          // Reset range when the currency changes — a THB range means
          // nothing once you switch to INR.
          onChange({ currency: next, min: null, max: null });
        }}
        helperText="Prices never cross currencies"
      >
        <MenuItem value="">Any currency</MenuItem>
        <MenuItem value="THB">THB</MenuItem>
        <MenuItem value="NPR">NPR</MenuItem>
        <MenuItem value="INR">INR</MenuItem>
      </TextField>

      <div className="flex gap-2">
        <TextField
          size="small"
          fullWidth
          label={currency ? `Min (${currency})` : 'Min'}
          type="number"
          value={min ?? ''}
          disabled={!currency}
          onChange={(e) =>
            onChange({
              currency,
              min: e.target.value === '' ? null : Number(e.target.value),
              max,
            })
          }
        />
        <TextField
          size="small"
          fullWidth
          label={currency ? `Max (${currency})` : 'Max'}
          type="number"
          value={max ?? ''}
          disabled={!currency}
          onChange={(e) =>
            onChange({
              currency,
              min,
              max: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </div>

      {!currency && (
        <div className="text-xs text-slate-500">
          Pick a currency to enable price filtering.
        </div>
      )}
    </div>
  );
}