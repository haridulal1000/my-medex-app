# MedEx — Service Explorer

Browse health services grouped by provider, with live filters, search, sorting
and pagination. Every filter, the sort order, the page and the page size live
in the URL — reload, share, back and forward all restore the same view.

## Run it

```bash
yarn
yarn dev
```

Open http://localhost:5173/

Put the dataset at `data/task1-service-explorer.json` before first run. The
mock API (MSW) serves it in-browser — no server needed.

**Simulate an API failure:** open `/?fail=api`. The UI shows the error state
with a Retry button.

**Tests:** `yarn test`

**Build:** `yarn build && yarn preview`

## Stack

React 19 + TypeScript + Vite. MUI for components, Tailwind + SASS for styling,
TanStack Query for data, Zod for validation, MSW for the mock API. Chosen for
accessibility defaults (MUI), fast feedback (Vite), and a clean separation
between fetching (Query) and reasoning (pure functions in `src/domain/`).

## How it's built

Filters and search are **network calls**, not in-browser computations. The
frontend sends `GET /api/services/search?<query>` and gets back
`{ groups, facets, pagination }`. The mock handler runs the same domain
functions a real backend would — so when the real API lands, only
`src/mocks/handlers.ts` goes away.

```
URL ← source of truth
 │
 ▼
React Query ── GET /api/services/search
 │
 ▼
MSW handler ── runs src/domain/* (visibility → filter → sort → group → paginate → facet)
 │
 ▼
Provider cards rendered on screen
```

## Decisions worth explaining

**Facet counts are disjunctive.** For each dimension, the count next to an
option answers "how many results would I get if I selected *only* this option,
keeping every other filter as-is?" That's why, with Bangkok selected, "Lab
test" still shows a real number instead of 0. Each dimension is released
before counting — `src/domain/facets.ts`.

**Zero-count options.** Disabled, not hidden, for small structural lists
(types, categories, currencies). Hidden with a *"N providers hidden"* hint for
the 67-provider list. Hiding small lists makes the filter panel invisible;
showing 60 greyed-out providers is noise.

**Currencies never mix.** The price filter is currency-first: pick THB / NPR /
INR, then set a range. Min/Max are disabled until a currency is chosen.
Selecting a currency also restricts results to providers pricing in it —
otherwise a "฿1,000–5,000" range across INR services would be nonsense.

**Wellness has no single price.** `price` is `null`; options live in
`wellnessPricing`. We show the cheapest as **`from ฿X`** and use it for the
price filter and price-sort. Not "average" (misleading), not "hidden"
(breaks sort).

**Category slugs aren't unique.** The two `ultrasound` categories share a
slug but have different `id` and `type`. Every map, every React key, every URL
param uses `id` — never slug.

**URL is the only state.** `useSearchParams` for everything. Invalid values
in the URL (e.g. `?type=banana`) are silently discarded. The search input
debounces URL writes by 200 ms so typing never blocks. First paint shows
skeletons, never an unfiltered flash.

**Mobile drawer stages filters.** Inside the drawer, filters update local
state. A preview query fires with the staged state and its
`pagination.totalServices` becomes the number on the **"Show N results"**
button. Tapping it commits to the URL with `replace: false` so **Back**
returns to the pre-drawer view.

**Pagination is over providers**, not individual services — users browse
providers. Page size (10/20/50) is itself in the URL.

**Copy-link button.** The URL is the source of truth, so one-click sharing is
the natural affordance. The clipboard action shows a "Copied" confirmation.

## Robustness — every error state has a real UI

The brief called out "partial, slow and offline" explicitly. Each is handled
with its own design:

| Situation | What the customer sees |
| --- | --- |
| Initial load | Skeleton cards matching the final layout shape |
| Filter/page change | Previous results stay visible + a small "Updating…" hint (`keepPreviousData`) |
| Empty results | Card with "No services match your filters" + **Clear filters** button |
| Server 5xx | "Something went wrong on our side" + **Retry** |
| Network failure | "Could not reach the server" + **Retry** |
| Offline (device) | Persistent amber banner + retry disabled + "Waiting for connection…" |
| Categories or providers fail but search works | Amber **"Some filter options couldn't load"** banner with Retry; results still render |
| A component throws | **ErrorBoundary** renders a fallback (dev shows the stack; prod shows a friendly card) with Try again / Reload |
| MSW worker fails to boot | App still renders, so the user sees the API error state instead of a blank page |
| Unknown URL | **404 page** with a link home |

Skeletons, not spinners. Retries are always offered where they make sense.
The "N results" count and the drawer's "Show N results" button are
`aria-live="polite"` so screen readers announce state changes.

## Messy data — what I decided

- Missing `providerInformation.currency` → show `—` and no price. Never guess.
- `rating: null` → "No rating yet" in grey. Card height stays constant, no
  layout shift.
- Provider not `active` / service `status: false` / category `status: false`
  → hidden. Same rule everywhere, defence-in-depth in `isServiceVisible`.
- `categoryId` points to a missing category → service still visible (treat
  as "no category"). Hiding a real service because of a broken join is worse
  for the customer than a missing filter chip.
- Malformed price string → "Price unavailable", excluded from filter/sort.
  Zod rejects malformed prices at boot, so this is mostly defensive.
- Per-record safe parsing in `src/mocks/data.ts` logs how many records were
  dropped — useful when the data gets messier.

## Performance

- **Filter change → results within ~100 ms.** The endpoint simulates 40–80 ms
  of latency; render is well under 10 ms because the response identity is
  the only memo dependency.
- **Typing never blocks.** 200 ms debounce on the search input; each keystroke
  is one render, one paint.
- **No layout shift.** Skeleton matches card shape; rating slot has `min-h`;
  disabled options keep their width. CLS = 0.

Measured with Chrome DevTools Performance + Rendering panels. `keepPreviousData`
keeps the previous page visible during fetch, so page changes feel instant.

## Accessibility

Keyboard navigation across the whole page, focus trap in the drawer, Escape
closes it. The "N results" counter, the "Show N results" button, the
"Copied" toast and the offline banner are all `aria-live`-appropriate.
Category and provider checkboxes have `aria-label`. Colour isn't the only
signal — disabled options are greyed **and** labelled `(0)`.

## AI tools used

Scaffolding boilerplate (Tailwind config, MSW worker setup) and drafting this
README. Every domain function — pricing, visibility, filtering, facets,
sorting — was written by hand and unit-tested. I can walk through any line in
the follow-up.

## What's not here

- Dedicated provider detail page. "View all N services" expands inline.
- Server-side caching of search results. Query caches by URL params; a real
  backend would add `Cache-Control`.
- Toast notifications for background refetch failures. Only full-search
  errors surface as UI.
- Full test coverage. 18 focused tests on the pricing formula, visibility
  rules and disjunctive facet logic — the parts most likely to be wrong.

## With more time

1. Provider detail page with a duration selector for wellness services.
2. Property-based tests on URL round-trip: random `UrlState` → serialize →
   parse → assert equal.
3. Facet fuzz tests: for random filter combinations, assert each facet count
   equals `countForFilters(filters with that dimension released)`.
4. Pagination of individual services within very large providers.
5. `Suspense` boundaries around the results panel for a cleaner loading UX.
6. Forward caught errors to Sentry (or equivalent) — the `ErrorBoundary` logs
   to console today.

## Repo layout

```
data/           the brief's JSON dataset
src/
  api/          Axios + Zod schemas + fetchers
  domain/       pure logic — pricing, visibility, filtering, facets, sorting
  mocks/        MSW handlers + per-record safe parsing
  hooks/        React Query hooks
  state/        URL parsing / serialization (source of truth)
  components/
    common/     MoneyLabel, CopyLinkButton
    errors/     ErrorBoundary
    filters/    one component per filter + sidebar + drawer
    layout/     AppShell, OfflineBanner
    results/    cards, panel, pagination, sort
    states/     Empty, Error, Skeletons
  pages/        ServiceExplorerPage, NotFoundPage
  styles/       global.scss
```