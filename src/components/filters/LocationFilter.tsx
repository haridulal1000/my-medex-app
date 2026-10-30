import { MenuItem, TextField } from '@mui/material';

export function LocationFilter({
  cities,
  countries,
  city,
  country,
  cityCounts,
  countryCounts,
  onChange,
}: {
  cities: string[];
  countries: string[];
  city: string | null;
  country: string | null;
  cityCounts: Record<string, number>;
  countryCounts: Record<string, number>;
  onChange: (next: { city: string | null; country: string | null }) => void;
}) {
  return (
    <div className="space-y-2">
      <TextField
        select
        size="small"
        fullWidth
        label="Country"
        value={country ?? ''}
        onChange={(e) =>
          onChange({ city: null, country: e.target.value || null })
        }
      >
        <MenuItem value="">All countries</MenuItem>
        {countries.map((c) => {
          const count = countryCounts[c] ?? 0;
          return (
            <MenuItem
              key={c}
              value={c}
              disabled={count === 0 && country !== c}
            >
              {c} ({count})
            </MenuItem>
          );
        })}
      </TextField>

      <TextField
        select
        size="small"
        fullWidth
        label="City"
        value={city ?? ''}
        onChange={(e) =>
          onChange({ city: e.target.value || null, country })
        }
      >
        <MenuItem value="">All cities</MenuItem>
        {cities.map((c) => {
          const count = cityCounts[c] ?? 0;
          return (
            <MenuItem
              key={c}
              value={c}
              disabled={count === 0 && city !== c}
            >
              {c} ({count})
            </MenuItem>
          );
        })}
      </TextField>
    </div>
  );
}