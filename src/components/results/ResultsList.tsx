import { useMemo } from 'react';
import type { Category, Provider, Service } from '@api/schemas';
import type { FilterContext, FilterState } from '@domain/filter';
import { serviceMatchesFilters } from '@domain/filter';
import type { SortKey } from '@domain/sort';
import { sortServices } from '@domain/sort';
import { buildVisibilityMaps, isServiceVisible } from '@domain/visibility';
import { ProviderCard } from './ProviderCard';

export function ResultsList({
  services,
  providers,
  categories,
  filters,
  sort,
}: {
  services: Service[];
  providers: Provider[];
  categories: Category[];
  filters: FilterState;
  sort: SortKey;
}) {
  const result = useMemo(() => {
    const maps = buildVisibilityMaps(providers, categories);
    const ctx: FilterContext = {
      providerById: maps.providerById,
      categoryById: maps.categoryById,
    };

    const filtered = services
      .filter((s) => isServiceVisible(s, maps))
      .filter((s) => serviceMatchesFilters(s, filters, ctx));

    const sorted = sortServices(filtered, sort, maps.providerById, filters.q);

    // Group by provider, preserving sort order through insertion order
    const byProvider = new Map<number, Service[]>();
    for (const s of sorted) {
      const arr = byProvider.get(s.userId) ?? [];
      arr.push(s);
      byProvider.set(s.userId, arr);
    }

    return { byProvider, maps, total: filtered.length };
  }, [services, providers, categories, filters, sort]);

  if (result.total === 0) return null;

  return (
    <div className="space-y-4">
      {[...result.byProvider.entries()].map(([providerId, svcs]) => {
        const provider = result.maps.providerById.get(providerId);
        if (!provider) return null;
        return (
          <ProviderCard key={providerId} provider={provider} services={svcs} />
        );
      })}
    </div>
  );
}