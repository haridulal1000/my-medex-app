import type { CategoryWithChildren, Provider, Service } from '@api/schemas';
import type { FacetResult } from './facets';
import { computeFacets } from './facets';
import type { FilterContext, FilterState } from './filter';
import { serviceMatchesFilters } from './filter';
import type { SortKey } from './sort';
import { sortServices } from './sort';
import { buildVisibilityMaps, isServiceVisible } from './visibility';

export interface SearchRequest {
  filters: FilterState;
  sort: SortKey;
  page: number;
  pageSize: number;
}

export interface ProviderGroup {
  provider: Provider;
  /** All matching services for this provider under the current filters. */
  services: Service[];
}

export interface SearchPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalProviders: number;
  totalServices: number;
}

export interface SearchResponse {
  groups: ProviderGroup[];
  facets: FacetResult;
  pagination: SearchPagination;
}

/**
 * The full server-side search pipeline. Pure function, no I/O, so it's
 * straightforward to test and to swap for a real HTTP backend later.
 */
export function executeSearch(
  req: SearchRequest,
  allServices: Service[],
  allProviders: Provider[],
  allCategories: CategoryWithChildren[],
): SearchResponse {
  const flatCategories = allCategories.flatMap((c) => [c as never, ...c.children]);
  const maps = buildVisibilityMaps(allProviders, flatCategories);
  const ctx: FilterContext = {
    providerById: maps.providerById,
    categoryById: maps.categoryById,
  };

  // Step 1: visibility — drop hidden services before anything else
  const candidates = allServices.filter((s) => isServiceVisible(s, maps));

  // Step 2: apply filters
  const filtered = candidates.filter((s) =>
    serviceMatchesFilters(s, req.filters, ctx),
  );

  // Step 3: sort
  const sorted = sortServices(filtered, req.sort, maps.providerById, req.filters.q);

  // Step 4: group by provider, preserving sort order
  const groupsMap = new Map<number, Service[]>();
  for (const s of sorted) {
    const arr = groupsMap.get(s.userId) ?? [];
    arr.push(s);
    groupsMap.set(s.userId, arr);
  }
  const allGroups: ProviderGroup[] = [];
  for (const [providerId, services] of groupsMap) {
    const provider = maps.providerById.get(providerId);
    if (provider) allGroups.push({ provider, services });
  }

  // Step 5: paginate
  const totalProviders = allGroups.length;
  const totalServices = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalProviders / req.pageSize));
  const safePage = Math.min(Math.max(1, req.page), totalPages);
  const start = (safePage - 1) * req.pageSize;
  const paginatedGroups = allGroups.slice(start, start + req.pageSize);

  // Step 6: facets — disjunctive, over candidates (not filtered)
  const facets = computeFacets(candidates, req.filters, ctx);

  return {
    groups: paginatedGroups,
    facets,
    pagination: {
      page: safePage,
      pageSize: req.pageSize,
      totalPages,
      totalProviders,
      totalServices,
    },
  };
}