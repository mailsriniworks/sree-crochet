# ❋ Sree Crochet — Handmade Studio

A lightweight, dependency-free static showcase for handmade crochet products, spanning **clothing, home goods, and accessories** — presented as a calm, pastel "studio dashboard": frosted app-frame over a dawn-gradient wash, sidebar navigation, gradient-art bento tiles, and a conversational right rail.

Every piece in the collection tells the same story: natural fibers, counted loops, hours of human hands. The app is a single-page ES-module build with no framework, no bundler, and no build step — serve it over HTTP and it works.

## Features

- **App-frame layout** — rounded frosted-glass frame on a pastel gradient wash; left nav rail (Browse / Studio), main column, and a sticky greeting rail
- **Gradient-art system** — every product and category gets a deterministic dreamy pastel artwork (`artStyle()` / `artForCategory()` in `utils.js`), framed in white like gallery prints
- **Bento showcase** — wide featured tile with ← → carousel (auto-rotates, pauses on interaction/drawer/hidden tab) plus three category tiles with live piece counts
- **Greeting rail** — time-aware "Good morning/afternoon/evening", studio chat vignette, a "player pill" previewing the next featured piece, and an "Ask for anything…" pill that drafts a custom-order email
- **Curated catalogue** — 18 sample products across three categories, loaded from `data/products.json`
- **Search** — debounced pill search in the header, matches titles, materials, descriptions, and tags
- **Category controls** — sidebar nav + Recommended chips + bento tiles all stay in sync; page title morphs with the active category
- **Sorting** — featured first, price (both directions), name A–Z (sidebar select)
- **Saved pieces** — heart any piece; persisted in `localStorage`; sidebar "Saved Pieces" filters to them with a live count badge
- **Detail drawer** — slide-in panel with gradient-art hero, rating, materials, handmade-hours, care, tags, a "you may also like" related row, and a "request this piece" mailto action
- **Scroll choreography** — IntersectionObserver reveal-on-scroll, back-to-top pill, rAF-throttled scroll handling
- **Fluid feedback** — toast notifications (save/unsave/reset/ask), quick-view ↗ on card hover, tile lift/zoom micro-interactions
- **Dual theme** — dawn pastels / dusk pastels with `localStorage` persistence and system-preference detection
- **Accessibility** — skip link, focusable tiles/cards (Enter/Space), Escape/backdrop drawer close, ARIA dialog semantics, focus restore, reduced-motion support
- **Responsive** — frame collapses 3 → 2 → 1 columns; sidebar becomes a wrap-row on mobile

## Project structure

```
index.html              # App frame: sidebar rail, main column, greeting rail, drawer
styles.css              # Design system: pastel tokens, frame, bento, rail, themes
js/
  main.js               # Bootstrap: DOM refs, greeting, theme init, catalogue load
  ui.js                 # Event wiring: nav, chips, search, sort, saved, carousel, drawer, ask pill
  scrollFx.js           # Scroll polish: reveal-on-scroll, back-to-top
  store.js              # Observable state container + derived selectors
  data.js               # Catalogue fetch layer
  utils.js              # Pure helpers: escapeHtml, formatPrice, debounce, artStyle/artForCategory
  components/
    productCard.js      # White-framed gradient-art card + shared labels/icons/heart SVG
    gallery.js          # Grid rendering (incl. loading / empty / error states)
    showcase.js         # Bento: wide featured tile w/ carousel + category tiles + rail player pill
    detailPanel.js      # Slide-in drawer rendering + related row + focus management
    toast.js            # Toast notifications (aria-live root)
    themeToggle.js      # Dawn/dusk toggle with persistence
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

- Replace gradient art with real product photography (swap `artStyle()` output for `background-image: url(...)`)
- Pagination or "load more" as the catalogue grows
- CMS-backed content (Decap, Sanity) for non-technical updates
- Unit tests for `store.js` selectors + CI deploy pipeline
