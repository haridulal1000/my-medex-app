import { z } from 'zod';
import { api } from './client';
import {
  ProviderSchema,
  ServiceSchema,
  ServiceTypeSchema,
} from './schemas';
import type { SearchResponse } from '@domain/search';
import { serializeUrl } from '@state/urlState';
import type { UrlState } from '@state/urlState';

const SearchResponseSchema: z.ZodType<SearchResponse> = z.object({
  groups: z.array(
    z.object({
      provider: ProviderSchema,
      services: z.array(ServiceSchema),
    }),
  ),
  facets: z.object({
    types: z.record(ServiceTypeSchema, z.number()),
    categoryCounts: z.record(z.string(), z.number()),
    providerCounts: z
      .record(z.string(), z.number())
      .transform(
        (obj) =>
          Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [Number(k), v]),
          ) as Record<number, number>,
      ),
    cityCounts: z.record(z.string(), z.number()),
    countryCounts: z.record(z.string(), z.number()),
    homeTestCount: z.number(),
  }),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalProviders: z.number(),
    totalServices: z.number(),
  }),
});

export function buildSearchQueryString(state: UrlState): string {
  return serializeUrl(state).toString();
}

export async function searchServices(queryString: string): Promise<SearchResponse> {
  const { data } = await api.get(`/services/search?${queryString}`);
  return SearchResponseSchema.parse(data);
}

export { parseUrl } from '@state/urlState';