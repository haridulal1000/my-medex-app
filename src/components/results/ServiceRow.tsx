import { Chip } from '@mui/material';
import type { Provider, Service } from '@api/schemas';
import { calculatePrice, getWellnessCheapest } from '@domain/pricing';
import { MoneyLabel } from '@components/common/MoneyLabel';

const TYPE_LABELS: Record<Service['type'], string> = {
  package: 'Package',
  lab_test: 'Lab test',
  wellness: 'Wellness',
  service: 'Service',
  insurance: 'Insurance',
};

export function ServiceRow({
  service,
  provider,
}: {
  service: Service;
  provider: Provider;
}) {
  const currency = provider.providerInformation?.currency ?? null;
  const price =
    service.type === 'wellness'
      ? getWellnessCheapest(service)
      : calculatePrice(service);

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {service.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip size="small" label={TYPE_LABELS[service.type]} />
          {service.testAtHome && (
            <Chip size="small" label="Home test" color="success" variant="outlined" />
          )}
        </div>
      </div>

      <div className="text-right whitespace-nowrap shrink-0 min-h-[1.75rem] flex items-center justify-end">
        {currency === null ? (
          <span className="text-xs text-slate-500">Currency not set by provider</span>
        ) : price ? (
          <MoneyLabel
            price={price}
            currency={currency}
            prefix={service.type === 'wellness' ? 'from' : undefined}
          />
        ) : (
          <span className="text-xs text-slate-500">
            {service.type === 'wellness' ? 'Pricing by duration' : 'Price unavailable'}
          </span>
        )}
      </div>
    </div>
  );
}