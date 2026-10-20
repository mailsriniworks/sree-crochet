# ❋ Sree Crochet — Handmade, Stitch by Stitch

An original, dependency-free static **shop** for handmade crochet: clothing, home goods, and accessories — designed as an artisan brand with its own identity: a sage-meadow canvas, deep forest ink, a chartreuse pop, cream surfaces, Instrument Serif display type, and a four-petal knot motif woven through bands and tiles. Natural-dye gradient artwork stands in for photography.

The site does two jobs and does them well: **showcase the craft** (stitch patterns, hook sizes, hours by hand, the maker's process) and **help visitors buy** (one-tap add-to-basket, quantity steppers, a basket drawer with free-shipping progress and checkout, wishlist, search/filter/sort).

No framework, no bundler, no build step — ES modules served as static assets.

## Features

### Commerce
- **One-tap add-to-basket** on every card (`+`), plus full **Add to basket / Buy it now** in the product drawer with a quantity stepper
- **Basket drawer** — line items with art thumbnails, qty steppers, remove, free-shipping progress bar (free over $75), subtotal/shipping/total, checkout (drafts an itemized order email), clear basket; persisted in `localStorage`
- **Product drawer** — stitch pattern, hook size, fiber, care, tags, rating, hours by hand, related pieces ("You may also like")
- **Wishlist** — heart any piece, persisted; "♥ Saved" filter chip
- **Search** (debounced, matches title/material/stitch/description/tags), **category chips + category cards**, **sort** (featured / price / name)
- Live basket badge, toasts for every cart/wishlist action, result line with made-to-order shipping note

### Craft showcase
- **Featured rail** — "On the hook this week" horizontal snap-scroll rail of featured pieces with ← → controls and a live 1/N counter
- **Hero** with studio stats computed from the catalogue (designs, total hours by hand, fiber promise) and a layered lookbook collage
- **The Maker** — forest-green band: founder quote + facts beside a four-step process timeline (design & swatch → choose the yarn → stitch by stitch → block, finish, send)
- **Verified-buyer testimonial band** and a studio newsletter card
- Every product carries its real **stitch pattern and hook size** in `data/products.json`

### Experience
- Scroll reveals (IntersectionObserver), back-to-top, sticky blurred header, hover lifts, staggered card entrances
- Day / **evening-workshop** dark theme with `localStorage` + system preference
- Accessibility: skip link, focusable cards (Enter/Space), Escape/backdrop closes drawers, focus returns to the opener, ARIA dialogs, `prefers-reduced-motion` honored
- Responsive from phone to desktop

## Project structure

```
index.html              # Editorial layout: header, hero, categories, collection, maker, craft, voices, join, drawers
styles.css              # Design system: meadow/forest/lime/cream tokens, motif bands, cards, drawers, themes
js/
  main.js               # Bootstrap: dom refs, theme, UI wiring, scroll fx, catalogue load
  ui.js                 # All event wiring: search, filters, cart, drawers, checkout, toasts
  scrollFx.js           # Reveal-on-scroll + back-to-top (rAF-throttled)
  store.js              # Observable state: catalogue, filters, wishlist, CART (persisted), drawers
  data.js               # Catalogue fetch layer
  utils.js              # escapeHtml, formatPrice, debounce, qsa, artStyle/artForCategory (natural-dye art)
  components/
    productCard.js      # Editorial card: art block, stitch label, heart, quick-add, name/price
    gallery.js          # Grid rendering (loading / empty / error states)
    sections.js         # Hero stats, category counts, maker stats from live data
    cartDrawer.js       # Basket drawer: lines, steppers, shipping progress, totals, checkout
    detailPanel.js      # Product drawer: specs, qty, add/buy-now, related row
    toast.js            # Toast notifications (aria-live root)
    themeToggle.js      # Day/evening toggle with persistence
data/
  products.json         # Catalogue incl. stitch + hook fields (edit this to change the shop)
wrangler.jsonc          # Cloudflare Workers static-assets config
```

## Architecture

Tiny observable store: `store.js` holds one `state` (products, search, category, sort, selectedId, cart, cartOpen, favorites, favOnly, theme, loading/error). Events call `setState`; one subscriber in `ui.js` re-renders gallery + drawers + sections + badges. Components return HTML strings; cart and wishlist persist to `localStorage`.

Cart model: `[{ id, qty }]` with `addToCart / setCartQty / clearCart / cartCount / cartSubtotal`.

## Data format

```json
{
  "id": "crochet-beanie-12",
  "title": "Alpine Slouch Beanie",
  "category": "accessories",
  "price": 45,
  "rating": 4.9,
  "stitch": "Folded 1×1 rib brim",
  "hook": "5.0 mm",
  "material": "Alpaca blend",
  "timeHours": 8,
  "featured": true,
  "description": "…",
  "care": "…",
  "tags": ["beanie", "hat"]
}
```

`stitch` and `hook` surface on cards and the product drawer — the craft credit that makes this shop feel handmade. `featured` drives default sort priority.

## Run & deploy

```bash
python3 -m http.server 8080   # fetch() needs HTTP, not file://
npx wrangler dev              # local preview
npx wrangler deploy           # production (required for live-site changes!)
```

## Roadmap

- Swap natural-dye gradient art for real product photography (`artStyle()` → `background-image`)
- Real checkout (Stripe payment links per product would slot into `checkoutBtn`)
- Size/color option selectors per product
- CMS-backed catalogue for non-technical updates
- Unit tests for `store.js` selectors + CI deploy
