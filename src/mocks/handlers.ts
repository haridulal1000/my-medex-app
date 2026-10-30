import { delay, http, HttpResponse } from 'msw';
import { categories, providers, services } from './data';
import { parseUrl } from '@state/urlState';
import { executeSearch } from '@domain/search';
import type { SearchRequest } from '@domain/search';

const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 650;
const SEARCH_MIN_LATENCY_MS = 40;
const SEARCH_MAX_LATENCY_MS = 80;

async function slowLatency(): Promise<void> {
  await delay(
    MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS),
  );
}

async function fastLatency(): Promise<void> {
  await delay(
    SEARCH_MIN_LATENCY_MS +
      Math.random() * (SEARCH_MAX_LATENCY_MS - SEARCH_MIN_LATENCY_MS),
  );
}

function shouldFail(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('fail') === 'api';
}

const failResponse = () =>
  HttpResponse.json({ message: 'Simulated API failure' }, { status: 500 });

export const handlers = [
  http.get('/api/category/active', async () => {
    await slowLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(categories);
  }),

  http.get('/api/provider', async () => {
    await slowLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(providers);
  }),

  // Kept for compat — the frontend no longer calls this, but leaving the
  // endpoint available makes it trivial to debug against raw service data
  // from the browser console.
  http.get('/api/service', async () => {
    await slowLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(services);
  }),

  http.get('/api/services/search', async ({ request }) => {
    await fastLatency();
    if (shouldFail()) return failResponse();

    const url = new URL(request.url);
    const baseState = parseUrl(url.searchParams);

    const response = executeSearch(
      {
        filters: baseState.filters,
        sort: baseState.sort,
        page: baseState.page,
        pageSize: baseState.pageSize,
      },
      services,
      providers,
      categories,
    );

    return HttpResponse.json(response);
  }),
];