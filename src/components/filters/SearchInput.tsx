import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);

  // Sync from URL when it changes externally (back/forward, reset, etc.)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce URL writes so typing never blocks
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), 200);
    return () => clearTimeout(t);
  }, [local, value, onChange]);

  return (
    <TextField
      fullWidth
      size="small"
      label="Search"
      placeholder="Services, providers, categories"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
    />
  );
}