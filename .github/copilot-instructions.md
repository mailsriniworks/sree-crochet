# Sree Crochet — AI Coding Instructions

## Project Overview
An original, dependency-free static **shop** for handmade crochet (clothing, home goods, accessories). Design identity: sage-meadow canvas, deep forest ink, chartreuse/lime accent, cream surfaces, coral hearts, Instrument Serif display + Inter body, four-petal knot motif (SVG data-URI pattern bands). Tall editorial product cards with round open button + price pill under each. Two jobs: showcase the craft (stitch/hook/hours per piece, maker process) and help visitors buy (quick-add, basket drawer, checkout, wishlist). Pure client-side ES modules; Cloudflare Workers static deploy. **Reference screenshots are mood/quality benchmarks only — never clone them.**

## Architecture

### State (`js/store.js`)
Single observable store: `state` + `setState(patch)` + `subscribe(fn)`.
Fields: `products`, `search`, `category`, `sort`, `selectedId`, `cart` (`[{id, qty}]`, localStorage `sree-crochet-cart`), `cartOpen`, `favorites` (ids, `sree-crochet-favs`), `favOnly`, `theme` (`sree-crochet-theme`), `loading`, `error`.
API: `addToCart(id, qty)`, `setCartQty(id, qty)` (0 removes), `clearCart()`, `cartCount()`, `cartSubtotal()`, `toggleFavorite(id)`, `getVisibleProducts()`.
UI events call `setState`; one subscriber in `ui.js` re-renders everything. **Never mutate DOM from handlers — change state.** Local, non-persistent UI values (product-drawer qty) may live in the DOM via `output#detailQtyOut`.

### File Structure
```
index.html                  # Header, hero, categories, collection, maker, craft, voices, join, two drawers, toasts
styles.css                  # Design system tokens, scallops, cards, drawers, day/evening themes
js/
  main.js                   # dom refs, initTheme, setupUI, initScrollFx, loadCatalogue
  ui.js                     # All wiring: search, chips, sort, wishlist, cart, checkout, drawers, toasts
  scrollFx.js               # initScrollFx(dom): IO reveals + back-to-top
  store.js                  # Observable state + cart/wishlist API + selectors
  data.js                   # loadProducts() → ./data/products.json
  utils.js                  # escapeHtml, formatPrice, debounce, qsa, artStyle(seed), artForCategory(cat)
  components/
    productCard.js          # productCardHtml() + CATEGORY_LABELS/ICONS, HEART_SVG, iconFor()
    gallery.js              # renderGallery(root): grid + loading/empty/error (retry → dom.retry)
    sections.js             # renderSections(dom): hero stats, [data-count], maker stats
    cartDrawer.js           # renderCart(panel, content): lines, steppers, ship progress, totals, checkout
    detailPanel.js          # renderDetailPanel(panel, content): specs, qty stepper, add/buy-now, related
    toast.js                # initToast(el), toast(msg, icon)
    themeToggle.js          # initTheme(button): day/evening + persistence
data/products.json          # Catalogue incl. stitch + hook fields
wrangler.jsonc              # name: sree-crochet, assets: ./
```

### Rendering Flow
1. `main.js`: `initTheme` → `setupUI(dom)` → `initScrollFx(dom)` → `loadCatalogue()`.
2. Single subscriber renders: gallery, product drawer, cart drawer, sections; then `syncChips/syncCartBadge/syncTitle/syncResultCount`; toggles `body.drawer-open` when either drawer is open; restores focus to `dom.lastFocus` when the product drawer closes.
3. One delegated `document` click handler routes, in order: `[data-fav-id]` → wishlist+toast; `[data-add-id]` → addToCart+toast; `[data-qty-id]` → setCartQty(line.qty+delta); `[data-remove-id]` → setCartQty 0; `[data-qty-delta]` → DOM-only stepper (`output` in same `.qty-stepper`, clamp 1–9); `#addToCartBtn` → addToCart(selectedId, qty from `#detailQtyOut`); `#buyNowBtn` → add then `{selectedId:null, cartOpen:true}`; `#checkoutBtn` → mailto itemized order + toast; `#clearCartBtn` → clearCart; `#retryBtn` → `dom.retry()`; `[data-product-id]` → open product drawer.
4. Drawers: `#cartBtn` opens cart (closes product); `#closeCart`/`#closePanel`/backdrop/Escape close both.
5. Category controls share `data-category-chip` (chips + `.cat-card`); `.cat-card` click also scrolls to the grid. `#savedChip` toggles `favOnly`.

### Commerce Rules
- Free shipping at $75 (`FREE_SHIPPING_AT` in cartDrawer.js), else $6; progress bar width = subtotal/75.
- Checkout is a demo: builds an itemized `mailto:` order (lines, subtotal, shipping, total) — swap for Stripe payment links later without touching the cart model.
- Cart badge `#cartCount` hides at 0; `#cartCountLabel` mirrors count in the drawer head.

### Visual System
- Tokens in `styles.css`: `--canvas/--forest/--forest-2/--moss/--lime/--lime-deep/--cream/--cream-2/--love/--gold/--ink/--muted/--line`; night-garden theme via `[data-theme='dark']`. Motif patterns live in `--motif` / `--motif-soft` (four-petal knot SVG data-URIs) used by `.band`, `.look-c`, `.join-card`.
- Brand edge = the motif band (`.band`) and the floating pill header (`.topbar-row` on cream); the maker + footer sit on `--forest-2` full-bleed bands with rounded top corners.
- Product art: `artStyle(seed)` hashes id into six natural-dye palettes (oat/clay, sage/moss, madder, indigo, marigold, logwood) → inline `background:` string; `artForCategory()` fixed per category. Used by cards, drawer hero, cart thumbs, related tiles.
- Featured rail: `sections.js` renders featured pieces into `#railRow` only when its data signature changes (ids + favorites), so scroll position survives re-renders; `ui.js` wires `#railPrev/#railNext` (scrollBy one card+gap) and updates `#railCounter` on scroll.

### Data Format (`data/products.json`)
`id`, `title`, `category` (`clothing|home|accessories`), `price`, optional `rating` (default 4.8), `stitch`, `hook`, `material`, `timeHours`, optional `featured`, `description`, optional `care`, `tags[]`.
`stitch`/`hook` are craft credit — show them on cards (`.p-stitch`) and drawer specs; keep them factual-sounding.

## Key Conventions
- `escapeHtml()` on every interpolated value.
- Components return HTML strings; only `ui.js`, `main.js`, `scrollFx.js`, `themeToggle.js`, `toast.js` touch the DOM imperatively.
- ES modules, `const` over `let`, arrow callbacks.
- `prefers-reduced-motion` disables animation/reveals/smooth-scroll.

## Adding Features
- **New product**: append to `data/products.json`; art, counts, stats, drawers update automatically.
- **New category**: CATEGORY_LABELS/ICONS + CATEGORY_ART palette index + a `.cat-card`, chip, and nav entry; store filtering is generic.
- **New sort**: `<option>` in `#sort` + comparator in `getVisibleProducts()`.
- **Real checkout**: replace the `#checkoutBtn` mailto block with per-line Stripe payment links; cart model stays.

## Testing & Debugging
```bash
python3 -m http.server 8080   # fetch() requires HTTP
```
Console: `[sree-crochet] loaded N products`.
- Gallery spinner stuck → JSON/fetch failure; error state shows `#retryBtn`.
- Drawers won't open → element needs `data-product-id` / `#cartBtn`; both drawers share `#drawerBackdrop`.
- Cart not persisting → localStorage blocked (private mode); store keeps in-memory copy.
- **Live site unchanged after edits** → must `git push` + `npx wrangler deploy`; Workers serves deployed assets only.

## Deployment
```bash
npx wrangler dev && npx wrangler deploy
```
