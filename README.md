# MedEx — Service Explorer

A page where customers can browse health services, filter them, and compare
providers. Built with React and TypeScript.

## How to run it

```bash
yarn
yarn dev
```

Then open http://localhost:5173/

You need to put the data file at `data/task1-service-explorer.json` before
running it the first time. The app comes with a fake backend baked in, so
there's nothing else to start.

**To see the error screen:** open `/?fail=api` — every request will fail on
purpose, and you'll see the retry screen.

**To run tests:** `yarn test`

**To build for production:** `yarn build`

## What it does

- Shows services grouped by provider (hospital, clinic, lab)
- Lets you filter by service type, category, provider, city/country, price
  range, and whether a home test is available
- Free-text search across services, providers and categories
- Every filter option shows how many results it would give you right now
- Sort by relevance, price (high or low), or rating
- Filters, sort, page and page size are all in the URL — so you can copy the
  link, reload, or use back/forward and everything stays the same
- On small screens, filters open in a side panel with a "Show N results"
  button that tells you exactly how many results your selection will give
  before you apply it


## What happens when things go wrong

- **Loading:** you see grey placeholder cards, not a spinner
- **Nothing matches your filters:** a card that says "No services match your
  filters" with a button to clear them
- **The server fails:** a friendly error message with a Retry button
- **You're offline:** a yellow banner at the top, plus a "Waiting for
  connection…" message instead of Retry
- **One section fails but the other works:** the working section still shows.
  A small orange banner tells you which part didn't load, with its own Retry
- **An unexpected bug:** a fallback screen with "Something went wrong" and a
  way to reload
- **A URL that doesn't exist:** a 404 page with a link home

## Extra care

- **Fast:** filtering, sorting and searching are quick — the network response
  arrives in about 40–80 milliseconds, and the page updates in under 10 ms
  after that.
- **Typing never lags:** the search box waits 200 ms after you stop typing
  before it does anything, so you never feel a slowdown.
- **No jumping:** the screen doesn't shift around when results change.
- **Accessible:** everything works with the keyboard. Screen readers announce
  when the result count changes.
- **Shareable links:** every filter, sort, page and page size is in the URL.
  There's also a "Copy link" button to make sharing easy.

## Data-quality decisions I made

| Situation in the data | What the app does |
| --- | --- |
| Provider has no currency | Shows "Currency not set by provider". Never guesses THB. |
| Provider has no rating | Shows "No rating yet" in grey. Doesn't break the card layout. |
| Provider is not active | All their services are hidden. |
| Service is disabled | Hidden. |
| Category is disabled | Services in that category are hidden. |
| Service has a category that doesn't exist | Service is still shown, treated as having no category. Hiding a real service because of a broken link seemed worse. |
| Price is malformed (e.g. not a number) | "Price unavailable". Excluded from price filter and price sort. |
| Home test is available but no charge is given | Home-test badge still shows. Charge is not displayed. |

## What I left out, and what I'd do next

Things I chose not to build in the time budget:

- A dedicated page for each provider — right now clicking "View all N services"
  expands them inline instead
- Server-side caching of search results (fine for a demo, real backends do
  this)
- More tests — I only covered the parts most likely to be wrong: the price
  formula, the visibility rules, and the filter counting
- Errors sent to a real monitoring tool — the app currently logs them to the
  browser console

If I had more time, I'd add:

1. A provider detail page (with duration picker for wellness)
2. Tests that fire random filter combinations at the app and check the
   counts always add up
3. Support for providers that have hundreds of services (paginate their
   services too, not just providers)
4. Send caught errors to a real monitoring service

## How it's organised

```
data/           the data file
src/
  api/          talks to the (fake) backend
  domain/       the math and rules — pricing, filtering, counting
  mocks/        the fake backend itself
  hooks/        fetching logic
  state/        the URL as a source of truth
  components/   the visual parts
  pages/        page-level layout
```

All the pure logic (pricing, filtering, counting, sorting) lives in `domain/`
so it's easy to test in isolation, and it's the same code that runs inside
the fake backend — so when the real API lands, only `mocks/` gets deleted.

## AI usage

**AI was used to help build this project.** Specifically:

- **Claude (Anthropic)** was used for scaffolding the project — setting up
  Vite, Tailwind, Material UI, the fake backend (MSW), and boilerplate files
  like configs and the initial file structure.
- **Claude** was also used for drafting parts of this README, and for
  reviewing the code as I went along — for example, spotting a subtle bug
  where pagination would briefly reset before loading.
- **The domain logic** — the pricing formula, the visibility rules, the
  filter counting, the sorting — was written by hand and unit-tested. I
  understand every line and can explain any part of it in a follow-up
  conversation.
- **All the architectural decisions** — which library to use for what, how
  to design the price filter across currencies, what to do with bad data —
  are documented in the "Decisions" section above and are my own choices,
  not generated.