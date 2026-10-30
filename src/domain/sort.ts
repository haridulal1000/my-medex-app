import type { Provider, Service } from '../api/schemas';
import { getDisplayPrice } from './pricing';

export type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  rating: 'Rating',
};

/**
 * Relevance:
 *   - title matches query  → +3
 *   - provider name matches → +2
 *   - (categories are already handled by the filter step)
 *   When the query is empty, all scores are 0, so we preserve the natural
 *   array order (stable sort). This is honest, explainable, and stable
 *   across reloads.
 */
export function sortServices(
  list: Service[],
  sort: SortKey,
  providerById: Map<number, Provider>,
  searchTerm: string,
): Service[] {
  if (sort === 'relevance') {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    const score = (s: Service): number => {
      let n = 0;
      if (s.title.toLowerCase().includes(q)) n += 3;
      const p = providerById.get(s.userId);
      if (p && p.name.toLowerCase().includes(q)) n += 2;
      return n;
    };
    return [...list].sort((a, b) => score(b) - score(a));
  }

  if (sort === 'rating') {
    const ratingOf = (s: Service): number =>
      providerById.get(s.userId)?.providerInformation?.rating ?? -1;
    return [...list].sort((a, b) => ratingOf(b) - ratingOf(a));
  }

  // price_asc / price_desc
  const asc = sort === 'price_asc';
  return [...list].sort((a, b) => {
    const pa = getDisplayPrice(a);
    const pb = getDisplayPrice(b);
    // Unknown prices always go to the end, regardless of direction.
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return asc ? pa - pb : pb - pa;
  });
}