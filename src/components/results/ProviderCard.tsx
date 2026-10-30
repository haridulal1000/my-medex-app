import { useState } from 'react';
import { Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import type { Provider, Service } from '@api/schemas';
import { ServiceRow } from './ServiceRow';

export function ProviderCard({
  provider,
  services,
}: {
  provider: Provider;
  services: Service[];
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = expanded ? services : services.slice(0, 3);
  const hiddenCount = Math.max(0, services.length - 3);

  const info = provider.providerInformation;
  const currency = info?.currency ?? '—';
  const rating = info?.rating ?? null;
  const reviews = info?.reviewCount ?? null;
  const city = info?.city?.name;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-slate-200">
      <header className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {provider.name}
          </h3>
          <div className="text-xs text-slate-500 mt-0.5">
            {city ?? 'Location not set'} · {currency}
          </div>
        </div>
        <div className="text-right shrink-0 min-h-[1.5rem] flex items-center">
          {rating !== null ? (
            <div className="flex items-center gap-1 text-sm">
              <StarIcon fontSize="small" className="text-amber-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviews ? (
                <span className="text-slate-500">({reviews})</span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-slate-400">No rating yet</span>
          )}
        </div>
      </header>

      <div className="px-4">
        {preview.map((s) => (
          <ServiceRow key={s.id} service={s} provider={provider} />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="p-3 border-t border-slate-100">
          <Button
            size="small"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded
              ? 'Show fewer'
              : `View all ${services.length} services`}
          </Button>
        </div>
      )}
    </section>
  );
}