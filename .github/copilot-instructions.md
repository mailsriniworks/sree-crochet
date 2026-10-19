# Sree Crochet — AI Coding Instructions

## Project Overview
A dependency-free, vanilla JavaScript single-page application showcasing handmade crochet products: **clothing, home goods, and accessories**. Visual language: pastel gradient wash ("dawn"), one frosted rounded **app frame** with three columns (sidebar nav / main / greeting rail), white-framed gradient-art tiles, glass cards. Pure client-side ES modules, no framework, no build step; deployed as static assets on Cloudflare Workers.

## Architecture

### State Management
- **Single observable store** (`js/store.js`): one exported `state` object plus `setState(patch)` / `subscribe(fn)`.
- State fields: `products`, `search`, `category`, `sort`, `selectedId`, `favorites` (ids, localStorage-persisted), `favOnly`, `theme`, `loading`, `error`.
- Favorites toggle via `toggleFavorite(id)`; sidebar "Saved Pieces" flips `favOnly`.
- UI events call `setState`; a single subscriber in `js/ui.js` re-renders gallery + drawer + bento + rail + sync helpers. **Never mutate the DOM from event handlers directly — change state instead.**
- Derived data lives in selectors (`getVisibleProducts()`) — filtering and sorting are pure functions of state.

### File Structure
```
index.html                  # App frame: sidebar rail, main column (head/bento/reco), greeting rail, drawer, toasts
styles.css                  # Design system: pastel tokens, frame, bento, cards, rail, drawer, dawn/dusk themes
js/
  main.js                   # Bootstrap: dom refs, greet(), initTheme(), setupUI(), initScrollFx(), loadCatalogue()
  ui.js                     # All event wiring + sync helpers (chips, fav, title, count)
  scrollFx.js               # initScrollFx(dom) — IO reveals + back-to-top (rAF-throttled)
  store.js                  # Observable state + getVisibleProducts() + toggleFavorite()
  data.js                   # loadProducts() — fetch ./data/products.json
  utils.js                  # escapeHtml, formatPrice, debounce, qs/qsa, artStyle(seed), artForCategory(cat)
  components/
    productCard.js          # productCardHtml() + CATEGORY_LABELS/ICONS, HEART_SVG, iconFor()
    gallery.js              # renderGallery(root) — grid, loading spinner, empty, error states
    showcase.js             # renderShowcase(dom) + stepShowcase(dir) — bento tiles + rail player pill
    detailPanel.js          # renderDetailPanel(panel, content) — drawer + related row + focus mgmt
    toast.js                # initToast(el) + toast(msg, icon)
    themeToggle.js          # initTheme(button) — dawn/dusk, localStorage, system preference
data/
  products.json             # Product catalogue (18 sample products)
wrangler.jsonc              # Cloudflare Workers config (name: sree-crochet, assets: ./)
```

### Visual System
- **Gradient art**: `artStyle(seed)` hashes the product id into one of six pastel palettes and returns an inline `background:` string (two radial highlights + linear gradient). `artForCategory(cat)` maps categories to fixed palettes. Used by cards, bento tiles, drawer hero, related items, rail player orb.
- **App frame**: `.app-frame` = translucent white + backdrop-blur on `body { background: var(--wash) fixed }`. Columns: `232px | 1fr | 320px`, collapsing 3 → 2 → 1 at 1180px / 820px.
- **Active states**: sidebar `.nav-item[aria-pressed='true']` and `.chip[aria-pressed='true']` get solid white + shadow. All category controls (sidebar, chips, bento tiles) share `data-category-chip` and are synced by `syncChips()`.
- Themes: `data-theme` on `<html>`; `dawn` pastels (default) vs `dusk` pastels; key `sree-crochet-theme`.

### Rendering Flow
1. `main.js` builds `dom` refs, sets time-aware greeting (`greet()`), calls `initTheme()`, `setupUI(dom)`, `initScrollFx(dom)`, then `loadCatalogue()`.
2. The single store subscriber re-renders: gallery, detail panel, bento+rail (`renderShowcase`), then `syncChips/syncFav/syncTitle/syncResultCount`; restores focus to `dom.lastFocus` when the drawer closes.
3. One delegated `document` click handler routes: `[data-fav-id]` → toggleFavorite + toast; `[data-step]` → carousel step; `[data-open-id]` → selectedId; `[data-product-id]` → selectedId.
4. Enter/Space on `.tile[role=button]` / `.p-card[role=button]` opens the drawer or applies the tile's category.
5. Drawer closes via ×, backdrop, Escape (`selectedId: null`).
6. Bento: wide featured tile (carousel over `featured` products, ← → buttons via `[data-step]`, 6s auto-advance skipped when reduced-motion / hidden tab / drawer open / <12s since manual input) + 3 category tiles with counts. Rail player pill previews the *next* featured piece.
7. Ask pill (`#askForm`) drafts a `mailto:` custom-order email from the input text + toast.
8. Load errors set `state.error`; gallery renders a retry button wired through `dom.retry`.

### Data Format (`data/products.json`)
Array of products: `id`, `title`, `category` (`clothing`|`home`|`accessories`), `price` (number, USD), optional `rating` (default 4.8), `material`, `timeHours`, optional `featured` (boolean), `description`, optional `care`, `tags[]`.
- `featured` items drive the bento carousel, rail pill, and default sort priority.

## Key Conventions

### Security
Always run data through `escapeHtml()` when interpolating into HTML template strings.

### Styling
- Colors/radii/shadows only via CSS custom properties in `styles.css` (`:root` dawn, `[data-theme='dark']` dusk). Never hardcode colors in components.
- Inline styles from components are limited to `artStyle()/artForCategory()` backgrounds and animation delays.
- Easing standard: `cubic-bezier(0.22, 1, 0.36, 1)`.
- `prefers-reduced-motion` disables animations, reveals, and carousel auto-rotation.

### Accessibility
- Tiles/cards: `role="button" tabindex="0"` + aria-labels; drawer `role="dialog" aria-modal="true"` with `aria-hidden` toggling and focus restore.
- Saved-pieces and category controls expose `aria-pressed`.
- Skip link targets `#main`; toasts live in `role="status" aria-live="polite"` root.

### Code Style
- ES modules only; `const` over `let`, never `var`; arrow callbacks.
- Components return HTML strings; only `ui.js`, `main.js`, `scrollFx.js`, `themeToggle.js`, `detailPanel.js`, `toast.js` touch the DOM imperatively.

## Adding Features

### New product
Append to `data/products.json` per schema. Art, cards, counts, drawer all update automatically.

### New category
1. Add label/icon to `CATEGORY_LABELS` / `CATEGORY_ICONS` (`productCard.js`) and a palette index in `CATEGORY_ART` (`utils.js`).
2. Add sidebar `.nav-item`, a `.chip`, and include the key in `showcase.js`'s tile list.
3. No store changes — filtering is generic.

### New sort option
1. Add `<option>` to `#sort` in `index.html`.
2. Add comparator to `comparators` in `getVisibleProducts()` (`store.js`).

## Testing & Debugging

### Local development
```bash
python3 -m http.server 8080   # fetch() requires HTTP, not file://
```
Console logs `[sree-crochet] loaded N products` on success.

### Common issues
- **Gallery stuck on spinner**: `data/products.json` fetch failed (must serve over HTTP; JSON valid). Error state shows a retry button.
- **Drawer won't open**: element must carry `data-open-id` or `data-product-id` matching a product `id`.
- **Controls out of sync**: every category control must use `data-category-chip`; `syncChips()` mirrors state onto all of them.
- **"No changes" on the live site**: changes only appear after `git push` + `npx wrangler deploy` — the Workers site serves deployed assets, not local files.

### Deployment
```bash
npx wrangler dev       # local preview
npx wrangler deploy    # production static assets
```
