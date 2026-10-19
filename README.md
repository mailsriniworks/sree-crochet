# ❋ Handmade Crochet — Showcase

A lightweight, dependency-free static showcase for handmade crochet products, spanning **clothing, home goods, and accessories**.

Every piece in the collection tells the same story: natural fibers, counted loops, hours of human hands. The app is a single-page ES-module build with no framework, no bundler, and no build step — open it in a browser and it works.

## Features

- **Bento showcase** — "New Arrivals" deals carousel with slide controls, hero card, and an Exclusive slot that previews the next featured piece
- **Curated catalogue** — 18 sample products across three categories, loaded from `data/products.json`
- **Search** — debounced pill search, matches titles, materials, descriptions, and tags
- **Category pills** — All / Clothing / Home Goods / Accessories, plus a reset-filters button
- **Sorting** — featured first, price (both directions), name A–Z
- **Favorites** — heart any piece (cards, deals, exclusive); saved to `localStorage`; header heart pill filters to saved pieces only with a live count badge
- **Detail drawer** — slide-in panel with rating, materials, handmade-hours, care instructions, tags, and a "request this piece" mailto action
- **Dual theme** — light / dark modes with `localStorage` persistence and system-preference detection
- **Accessibility** — skip link, focusable cards, keyboard open/close (Enter/Space/Escape), ARIA dialog semantics, reduced-motion support
- **Responsive** — bento collapses 3 → 2 → 1 columns; fluid card grid from phone to desktop

## Project structure

```
index.html              # Single HTML entry point (topbar, bento showcase, collection grid)
styles.css              # Full design system: tokens, bento layout, components, themes
js/
  main.js               # Bootstrap: DOM refs, theme init, catalogue load
  ui.js                 # Event wiring: search, pills, sort, favorites, carousel, drawer
  store.js              # Observable state container + derived selectors
  data.js               # Catalogue fetch layer
  utils.js              # Pure helpers: escapeHtml, formatPrice, debounce, qs/qsa
  components/
    productCard.js      # Card markup + shared icons/labels/heart SVG
    gallery.js          # Grid rendering (incl. loading / empty / error states)
    showcase.js         # Bento: deals carousel, hero visual, exclusive slot
    detailPanel.js      # Slide-in drawer rendering + focus management
    themeToggle.js      # Light/dark toggle with persistence
data/
  products.json         # Product catalogue (edit this to change the shop)
wrangler.jsonc          # Cloudflare Workers static-assets config
```

## Architecture

The app uses a **tiny observable store** pattern:

1. `store.js` holds one `state` object (products, search, category, sort, selection, theme, loading/error).
2. UI events call `setState(patch)` — never mutate DOM directly.
3. Subscribers re-render the gallery and drawer from state; rendering is a pure function of state.
4. Components under `js/components/` only produce markup from data — no side effects.

This keeps every module small, testable, and independent. Adding a feature = adding state, an event binding, and markup.

## Data format

Each product in `data/products.json`:

```json
{
  "id": "crochet-beanie-12",
  "title": "Alpine Slouch Beanie",
  "category": "accessories",
  "price": 45,
  "material": "Alpaca blend",
  "timeHours": 8,
  "featured": true,
  "description": "…",
  "care": "Hand wash cold, dry flat; detach pom",
  "tags": ["beanie", "hat", "alpaca", "winter"]
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique, kebab-case |
| `category` | string | `clothing` \| `home` \| `accessories` |
| `price` | number | USD, formatted by `formatPrice()` |
| `timeHours` | number | Shown as "Handmade in N hours" |
| `rating` | number | Optional — ★ badge on cards, deals, drawer (default 4.8) |
| `featured` | boolean | Optional — surfaces badge, default sort priority, and the bento showcase carousel |
| `care` | string | Optional — care instructions |

## Run locally

Because the app fetches JSON, it needs an HTTP server (browsers block `fetch` on `file://`):

```bash
# any static server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (Cloudflare Workers)

```bash
npx wrangler dev      # local preview
npx wrangler deploy   # production
```

`wrangler.jsonc` serves the repo root as static assets — no server-side logic.

## Roadmap ideas

- Replace category glyphs with real product photography
- Pagination or "load more" as the catalogue grows
- Favorites (localStorage) and a request/quote flow
- CMS-backed content (Decap, Sanity) for non-technical updates
- Unit tests for `store.js` selectors + CI deploy pipeline
