# Handmade Crochet Showcase — AI Coding Instructions

## Project Overview
A dependency-free, vanilla JavaScript single-page application showcasing handmade crochet products: **clothing, home goods, and accessories**. Pure client-side ES modules, no framework, no build step, deployed as static assets on Cloudflare Workers.

## Architecture

### State Management
- **Single observable store** (`js/store.js`): one exported `state` object plus `setState(patch)` / `subscribe(fn)`.
- State fields: `products`, `search`, `category`, `sort`, `selectedId`, `favorites` (ids, localStorage-persisted), `favOnly`, `theme`, `loading`, `error`.
- Favorites toggle via `toggleFavorite(id)`; the header heart pill flips `favOnly` to filter the gallery to saved pieces.
- UI events call `setState`; a single subscriber in `js/ui.js` re-renders gallery + detail panel from state. **Never mutate the DOM from event handlers directly — change state instead.**
- Derived data lives in selectors (`getVisibleProducts()`) — filtering and sorting are pure functions of state.

### File Structure
```
index.html                  # Single HTML entry point
styles.css                  # Complete design system (CSS custom properties, light/dark)
js/
  main.js                   # Bootstrap: collect DOM refs into `dom`, init theme, load catalogue
  ui.js                     # All event wiring (search, pills, sort, favorites, carousel, drawer, newsletter)
  store.js                  # Observable state + getVisibleProducts() selector + toggleFavorite()
  data.js                   # loadProducts() — fetch ./data/products.json
  utils.js                  # Pure helpers: escapeHtml, formatPrice, debounce, qs, qsa, elFromHtml
  components/
    productCard.js          # productCardHtml(product, index) + CATEGORY_LABELS/ICONS, HEART_SVG, iconFor()
    gallery.js              # renderGallery(root) — grid, loading spinner, empty, and error states
    showcase.js             # renderShowcase(dom) + stepShowcase(dir) — bento deals carousel/hero/exclusive
    detailPanel.js          # renderDetailPanel(panel, content) — drawer render/close + focus management
    themeToggle.js          # initTheme(button) — localStorage persistence, system-preference fallback
data/
  products.json             # Product catalogue (18 sample products)
wrangler.jsonc              # Cloudflare Workers config (name: sree-crochet, assets: ./)
```

### Rendering Flow
1. `main.js` builds the `dom` object (all element refs), calls `initTheme()`, `setupUI(dom)`, then `loadCatalogue()`.
2. `setupUI` registers one store subscriber that re-renders gallery + panel + showcase + chip/fav/count sync on every state change.
3. One delegated `document` click handler routes: `[data-fav-id]` → toggleFavorite, `[data-open-id]` and `#openExclusive(Arrow)` → selectedId, `[data-product-id]` cards → selectedId.
4. Gallery cards also open on Enter/Space when the card itself is focused.
5. Drawer opens when `selectedId` matches a product; closes via ×, backdrop click, or Escape (sets `selectedId: null`).
6. Bento showcase (`showcase.js`) keeps a module-local carousel index over `featured` products; prev/next buttons call `stepShowcase(±1)` then `renderShowcase(dom)`. The exclusive slot always previews the next featured piece.
7. Load errors set `state.error`; gallery renders a retry button wired through `dom.retry`.

### Data Format (`data/products.json`)
Array of products: `id`, `title`, `category` (`clothing`|`home`|`accessories`), `price` (number, USD), optional `rating` (number, default 4.8), `material`, `timeHours`, optional `featured` (boolean), `description`, optional `care`, `tags[]`.

- `featured` items get a badge, sort first under the default `sort: 'featured'`, and drive the bento showcase carousel.
- Search matches title + material + description + tags (case-insensitive substring).

## Key Conventions

### Security
Always run data through `escapeHtml()` when interpolating into HTML template strings.

### Styling
- All colors/spacing/radii come from CSS custom properties in `styles.css` (`:root` light, `[data-theme='dark']` overrides). Never hardcode colors in components.
- Theme applied via `data-theme` attribute on `<html>`; stored in `localStorage` key `sree-crochet-theme`.
- Card entrance animation uses `animation-delay` staggered by index (capped at 12 cards).
- `prefers-reduced-motion` disables animations globally.

### Accessibility
- Cards are `role="button" tabindex="0"` with aria-labels; drawer is `role="dialog" aria-modal="true"` with `aria-hidden` toggling.
- Focus moves to the close button when the drawer opens; Escape closes it.
- Category chips use `aria-pressed`; keep chips and the header `<select>` in sync via state.
- Skip link targets `#main`.

### Code Style
- ES modules only; `export`/`import`, no globals beyond the store module instance.
- `const` over `let`, never `var`; arrow functions for callbacks.
- Template literals for HTML; components return strings, not DOM nodes.
- Keep modules small and side-effect-free where possible (only `ui.js`, `main.js`, `themeToggle.js`, `detailPanel.js` touch the DOM imperatively).

## Adding Features

### New product
Append an object to `data/products.json` following the schema above. No code changes needed.

### New category
1. Add label + icon in `productCard.js` and `detailPanel.js` maps (`CATEGORY_LABELS`, `CATEGORY_ICONS`).
2. Add `<option>` to `#categoryFilter` in `index.html` and a chip with `data-category-chip="<value>"`.
3. No store changes — category filtering is generic.

### New sort option
1. Add `<option>` to `#sort` in `index.html`.
2. Add a comparator to the `comparators` map in `getVisibleProducts()` (`store.js`).

## Testing & Debugging

### Local development
```bash
python3 -m http.server 8080   # fetch() requires HTTP, not file://
```
Open http://localhost:8080. Console logs `[sree-crochet] loaded N products` on success.

### Common issues
- **Gallery stuck on spinner**: `data/products.json` failed to fetch — check you're on HTTP and JSON is valid; error state renders a Retry button.
- **Drawer won't open**: card must have `data-product-id` matching a product `id`.
- **Chips out of sync with select**: both are driven by `state.category`; ensure handlers call `setState({category})` rather than touching classes directly.

### Deployment
```bash
npx wrangler dev       # local preview
npx wrangler deploy    # production static assets
```
