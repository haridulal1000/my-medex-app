import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import type { ServiceType } from '@api/schemas';

const OPTIONS: { type: ServiceType; label: string }[] = [
  { type: 'package', label: 'Package' },
  { type: 'lab_test', label: 'Lab test' },
  { type: 'wellness', label: 'Wellness' },
  { type: 'service', label: 'Service' },
  { type: 'insurance', label: 'Insurance' },
];

export function ServiceTypeFilter({
  selected,
  counts,
  onToggle,
}: {
  selected: ServiceType[];
  counts: Record<ServiceType, number>;
  onToggle: (t: ServiceType) => void;
}) {
  return (
    <FormGroup>
      {OPTIONS.map(({ type, label }) => {
        const count = counts[type] ?? 0;
        const isSelected = selected.includes(type);
        const disabled = count === 0 && !isSelected;
        return (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={() => onToggle(type)}
                disabled={disabled}
              />
            }
            label={
              <span className={disabled ? 'text-slate-400' : 'text-sm'}>
                {label}{' '}
                <span className="text-xs text-slate-400">({count})</span>
              </span>
            }
          />
        );
      })}
    </FormGroup>
  );
}