import { useCallback, useMemo } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import type {
  CategoryWithChildren,
  Provider,
  ServiceType,
} from '@api/schemas';
import type { FacetResult } from '@domain/facets';
import type { FilterState } from '@domain/filter';
import { useUrlState } from '@state/useUrlState';
import { SearchInput } from './SearchInput';
import { ServiceTypeFilter } from './ServiceTypeFilter';
import { CategoryTreeFilter } from './CategoryTreeFilter';
import { ProviderFilter } from './ProviderFilter';
import { LocationFilter } from './LocationFilter';
import { PriceFilter } from './PriceFilter';

export function FilterSidebar({
  facets,
  topCategories,
  providers,
}: {
  facets: FacetResult;
  topCategories: CategoryWithChildren[];
  providers: Provider[];
}) {
  const { state, update } = useUrlState();
  const { filters } = state;

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const p of providers) {
      const c = p.providerInformation?.city?.name;
      if (c) set.add(c);
    }
    return [...set].sort();
  }, [providers]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const p of providers) {
      const c = p.providerInformation?.country?.name;
      if (c) set.add(c);
    }
    return [...set].sort();
  }, [providers]);

  const setFilters = useCallback(
    (patch: Partial<FilterState>) => {
      update(
        (prev) => ({
          ...prev,
          page: 1,
          filters: { ...prev.filters, ...patch },
        }),
        { replace: true },
      );
    },
    [update],
  );

  const toggleIn = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-5">
      <SearchInput value={filters.q} onChange={(q) => setFilters({ q })} />

      <section>
        <h3 className="font-semibold text-sm mb-1">Service type</h3>
        <ServiceTypeFilter
          selected={filters.types}
          counts={facets.types}
          onToggle={(t: ServiceType) =>
            setFilters({ types: toggleIn(filters.types, t) })
          }
        />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-1">Category</h3>
        <CategoryTreeFilter
          tree={topCategories}
          selected={filters.categoryIds}
          counts={facets.categoryCounts}
          onToggle={(id) =>
            setFilters({ categoryIds: toggleIn(filters.categoryIds, id) })
          }
        />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-1">Provider</h3>
        <ProviderFilter
          providers={providers}
          selected={filters.providerIds}
          counts={facets.providerCounts}
          onToggle={(id) =>
            setFilters({ providerIds: toggleIn(filters.providerIds, id) })
          }
        />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-1">Location</h3>
        <LocationFilter
          cities={cities}
          countries={countries}
          city={filters.city}
          country={filters.country}
          cityCounts={facets.cityCounts}
          countryCounts={facets.countryCounts}
          onChange={(loc) => setFilters(loc)}
        />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-1">Price</h3>
        <PriceFilter
          value={filters.price}
          onChange={(price) => setFilters({ price })}
        />
      </section>

      <section>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={filters.homeTestOnly}
              onChange={(e) => setFilters({ homeTestOnly: e.target.checked })}
              disabled={facets.homeTestCount === 0 && !filters.homeTestOnly}
            />
          }
          label={
            <span className="text-sm">
              Available as a home test{' '}
              <span className="text-xs text-slate-400">
                ({facets.homeTestCount})
              </span>
            </span>
          }
        />
      </section>
    </div>
  );
}