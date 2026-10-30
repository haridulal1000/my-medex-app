import type { Category, Provider, Service, ServiceType } from '../api/schemas';
import { getDisplayPrice } from './pricing';

export interface PriceRangeFilter {
  currency: 'THB' | 'NPR' | 'INR' | null;
  min: number | null;
  max: number | null;
}

export interface FilterState {
  q: string;
  types: ServiceType[];
  categoryIds: string[];
  providerIds: number[];
  city: string | null;
  country: string | null;
  homeTestOnly: boolean;
  price: PriceRangeFilter;
}

export const EMPTY_FILTERS: FilterState = {
  q: '',
  types: [],
  categoryIds: [],
  providerIds: [],
  city: null,
  country: null,
  homeTestOnly: false,
  price: { currency: null, min: null, max: null },
};

export interface FilterContext {
  providerById: Map<number, Provider>;
  categoryById: Map<string, Category>;
}

function matchesSearch(
  svc: Service,
  q: string,
  ctx: FilterContext,
): boolean {
  if (!q) return true;
  if (svc.title.toLowerCase().includes(q)) return true;
  const provider = ctx.providerById.get(svc.userId);
  if (provider && provider.name.toLowerCase().includes(q)) return true;
  if (svc.categoryId) {
    const cat = ctx.categoryById.get(svc.categoryId);
    if (cat && cat.title.toLowerCase().includes(q)) return true;
  }
  if (svc.subCategoryId) {
    const sub = ctx.categoryById.get(svc.subCategoryId);
    if (sub && sub.title.toLowerCase().includes(q)) return true;
  }
  return false;
}

export function serviceMatchesFilters(
  svc: Service,
  filters: FilterState,
  ctx: FilterContext,
): boolean {
  // 1. Service type
  if (filters.types.length > 0 && !filters.types.includes(svc.type)) {
    return false;
  }

  const provider = ctx.providerById.get(svc.userId);
  if (!provider) return false;

  // 2. Provider
  if (
    filters.providerIds.length > 0 &&
    !filters.providerIds.includes(svc.userId)
  ) {
    return false;
  }

  // 3. City / country (from provider)
  const providerCity = provider.providerInformation?.city?.name ?? null;
  const providerCountry =
    provider.providerInformation?.country?.name ?? null;
  if (filters.city !== null && providerCity !== filters.city) return false;
  if (filters.country !== null && providerCountry !== filters.country) {
    return false;
  }

  // 4. Home test
  if (filters.homeTestOnly && svc.testAtHome !== true) return false;

  // 5. Category tree
  // A service matches if EITHER its categoryId OR its subCategoryId is in the
  // selected set. Selecting a parent shows all services under it (they carry
  // the parent's categoryId), and selecting a subcategory shows only services
  // explicitly tagged with it. Union is the intuitive behaviour.
  if (filters.categoryIds.length > 0) {
    const selected = new Set(filters.categoryIds);
    const catMatch = svc.categoryId ? selected.has(svc.categoryId) : false;
    const subMatch = svc.subCategoryId ? selected.has(svc.subCategoryId) : false;
    if (!catMatch && !subMatch) return false;
  }

  // 6. Price — only applies when a currency is chosen. We never mix currencies
  // and never convert. The UI enforces currency selection before min/max.
  if (filters.price.currency !== null) {
    const currency = provider.providerInformation?.currency;
    if (currency !== filters.price.currency) return false;
    const price = getDisplayPrice(svc);
    if (price === null) return false;
    if (filters.price.min !== null && price < filters.price.min) return false;
    if (filters.price.max !== null && price > filters.price.max) return false;
  }

  // 7. Free-text search
  if (!matchesSearch(svc, filters.q.trim().toLowerCase(), ctx)) return false;

  return true;
}
/**
 * True when any filter field is non-default. `hasActiveFilters(EMPTY_FILTERS)`
 * returns false; any user-driven change returns true. Sort and page size are
 * *not* filters — they are view preferences and do not affect this.
 */
export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.q.trim() !== '' ||
    f.types.length > 0 ||
    f.categoryIds.length > 0 ||
    f.providerIds.length > 0 ||
    f.city !== null ||
    f.country !== null ||
    f.homeTestOnly ||
    f.price.currency !== null
  );
}