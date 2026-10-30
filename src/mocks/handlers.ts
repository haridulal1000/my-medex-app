import { delay, http, HttpResponse } from 'msw';
import { categories, providers, services } from './data';


const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 650;

async function simulateLatency(): Promise<void> {
  const ms = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
  await delay(ms);
}

function shouldFail(): boolean {
  if (typeof window === 'undefined') return false;
  const search = new URLSearchParams(window.location.search);
  return search.get('fail') === 'api';
}

const failResponse = () =>
  HttpResponse.json({ message: 'Simulated API failure' }, { status: 500 });

export const handlers = [
  http.get('/api/category/active', async () => {
    await simulateLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(categories);
  }),

  http.get('/api/provider', async () => {
    await simulateLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(providers);
  }),

  http.get('/api/service', async () => {
    await simulateLatency();
    if (shouldFail()) return failResponse();
    return HttpResponse.json(services);
  }),
];