import type { Service, ServiceType } from '../api/schemas';
import type { FilterContext, FilterState } from './filter';
import { serviceMatchesFilters } from './filter';

export interface FacetResult {
  types: Record<ServiceType, number>;
  /** categoryId → count. Covers both top-level and sub-category ids. */
  categoryCounts: Record<string, number>;
  /** providerId → count. */
  providerCounts: Record<number, number>;
  /** city name → count. */
  cityCounts: Record<string, number>;
  /** country name → count. */
  countryCounts: Record<string, number>;
  /** Count of services that are available as home tests under other filters. */
  homeTestCount: number;
}

function zeroFacets(): FacetResult {
  return {
    types: { package: 0, lab_test: 0, wellness: 0, service: 0, insurance: 0 },
    categoryCounts: {},
    providerCounts: {},
    cityCounts: {},
    countryCounts: {},
    homeTestCount: 0,
  };
}

/**
 * Compute live facet counts using DISJUNCTIVE FACETING.
 *
 * For each dimension D, the count shown next to an option O answers:
 *   "How many results would I see if I selected ONLY O in dimension D,
 *    keeping every OTHER active filter as-is?"
 *
 * Implementation: for each service, we evaluate whether it matches the
 * current filters with dimension D *released* (i.e. D's contribution to
 * filtering is removed). If it does, then it counts toward whatever option
 * of D it currently "is" (e.g. its type, its categoryId, etc.).
 *
 * We pre-compute one stripped filter-state per dimension ONCE per call,
 * rather than per service. This keeps the whole pass O(services × dims)
 * rather than O(services × dims × options).
 */
export function computeFacets(
  candidates: Service[],
  filters: FilterState,
  ctx: FilterContext,
): FacetResult {
  const facets = zeroFacets();

  // Pre-compute the "all filters except dimension D" states.
  const withoutTypes: FilterState = { ...filters, types: [] };
  const withoutCategories: FilterState = { ...filters, categoryIds: [] };
  const withoutProviders: FilterState = { ...filters, providerIds: [] };
  const withoutCity: FilterState = { ...filters, city: null };
  const withoutCountry: FilterState = { ...filters, country: null };
  const withoutHomeTest: FilterState = { ...filters, homeTestOnly: false };

  for (const svc of candidates) {
    const provider = ctx.providerById.get(svc.userId);
    if (!provider) continue;

    // --- Type facet ---
    if (serviceMatchesFilters(svc, withoutTypes, ctx)) {
      facets.types[svc.type] += 1;
    }

    // --- Category facet (parent and sub both get counted) ---
    if (serviceMatchesFilters(svc, withoutCategories, ctx)) {
      if (svc.categoryId) {
        facets.categoryCounts[svc.categoryId] =
          (facets.categoryCounts[svc.categoryId] ?? 0) + 1;
      }
      if (svc.subCategoryId) {
        facets.categoryCounts[svc.subCategoryId] =
          (facets.categoryCounts[svc.subCategoryId] ?? 0) + 1;
      }
    }

    // --- Provider facet ---
    if (serviceMatchesFilters(svc, withoutProviders, ctx)) {
      facets.providerCounts[svc.userId] =
        (facets.providerCounts[svc.userId] ?? 0) + 1;
    }

    // --- City facet ---
    if (serviceMatchesFilters(svc, withoutCity, ctx)) {
      const city = provider.providerInformation?.city?.name;
      if (city) facets.cityCounts[city] = (facets.cityCounts[city] ?? 0) + 1;
    }

    // --- Country facet ---
    if (serviceMatchesFilters(svc, withoutCountry, ctx)) {
      const country = provider.providerInformation?.country?.name;
      if (country) {
        facets.countryCounts[country] =
          (facets.countryCounts[country] ?? 0) + 1;
      }
    }

    // --- Home test facet ---
    if (svc.testAtHome && serviceMatchesFilters(svc, withoutHomeTest, ctx)) {
      facets.homeTestCount += 1;
    }
  }

  return facets;
}

/**
 * Count the results that a set of filters would produce, WITHOUT exclusions.
 * Used by the mobile drawer's "Show N results" button — it must reflect the
 * pending selection exactly, not a facet-style approximation.
 */
export function countForFilters(
  candidates: Service[],
  filters: FilterState,
  ctx: FilterContext,
): number {
  let n = 0;
  for (const svc of candidates) {
    if (serviceMatchesFilters(svc, filters, ctx)) n += 1;
  }
  return n;
}