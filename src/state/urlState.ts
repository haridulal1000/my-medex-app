import type { ServiceType } from '@api/schemas';
import type { FilterState } from '@domain/filter';
import type { SortKey } from '@domain/sort';

export interface UrlState {
  filters: FilterState;
  sort: SortKey;
  page: number;
}

const VALID_TYPES = new Set<ServiceType>([
  'package', 'lab_test', 'wellness', 'service', 'insurance',
]);
const VALID_SORTS = new Set<SortKey>([
  'relevance', 'price_asc', 'price_desc', 'rating',
]);
const VALID_CURRENCIES = new Set(['THB', 'NPR', 'INR']);

function finiteOrNull(v: string | null): number | null {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseUrl(sp: URLSearchParams): UrlState {
  const types = (sp.get('type') ?? '')
    .split(',')
    .filter((t) => VALID_TYPES.has(t as ServiceType)) as ServiceType[];

  const providerIds = (sp.get('provider') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

  const currencyRaw = sp.get('price_currency');
  const currency = currencyRaw && VALID_CURRENCIES.has(currencyRaw)
    ? (currencyRaw as 'THB' | 'NPR' | 'INR')
    : null;

  const sortRaw = (sp.get('sort') ?? 'relevance') as SortKey;
  const sort = VALID_SORTS.has(sortRaw) ? sortRaw : 'relevance';

  const pageRaw = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return {
    filters: {
      q: sp.get('q') ?? '',
      types,
      categoryIds: (sp.get('category') ?? '').split(',').filter(Boolean),
      providerIds,
      city: sp.get('city') || null,
      country: sp.get('country') || null,
      homeTestOnly: sp.get('home_test') === '1',
      price: {
        currency,
        min: finiteOrNull(sp.get('price_min')),
        max: finiteOrNull(sp.get('price_max')),
      },
    },
    sort,
    page,
  };
}

export function serializeUrl(state: UrlState): URLSearchParams {
  const sp = new URLSearchParams();
  const f = state.filters;

  if (f.q) sp.set('q', f.q);
  if (f.types.length) sp.set('type', f.types.join(','));
  if (f.categoryIds.length) sp.set('category', f.categoryIds.join(','));
  if (f.providerIds.length) sp.set('provider', f.providerIds.join(','));
  if (f.city) sp.set('city', f.city);
  if (f.country) sp.set('country', f.country);
  if (f.homeTestOnly) sp.set('home_test', '1');
  if (f.price.currency) sp.set('price_currency', f.price.currency);
  if (f.price.min !== null) sp.set('price_min', String(f.price.min));
  if (f.price.max !== null) sp.set('price_max', String(f.price.max));

  if (state.sort !== 'relevance') sp.set('sort', state.sort);
  if (state.page > 1) sp.set('page', String(state.page));

  return sp;
}