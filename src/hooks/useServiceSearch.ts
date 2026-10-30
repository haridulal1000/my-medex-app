import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildSearchQueryString, searchServices } from '@api/search';
import type { UrlState } from '@state/urlState';

export function useServiceSearch(state: UrlState) {
  const queryString = buildSearchQueryString(state);
  return useQuery({
    queryKey: ['services/search', queryString],
    queryFn: () => searchServices(queryString),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}