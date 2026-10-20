// js/store.js — tiny observable state container with cart + wishlist.
// Single source of truth; UI subscribes and re-renders on change.

const FAV_KEY = '***';
const CART_KEY = '***';
const listeners = new Set();

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* private mode: keep in-memory */ }
}

export const state = {
  products: [],               // loaded catalogue
  search: '',
  category: 'all',            // 'all' | 'clothing' | 'home' | 'accessories'
  sort: 'featured',
  heroIndex: 0,               // featured piece shown in the breakout hero
  selectedId: null,           // product shown in the detail drawer
  cart: readJson(CART_KEY, []), // [{ id, qty }]
  cartOpen: false,
  favorites: readJson(FAV_KEY, []),
  favOnly: false,
  theme: 'light',
  loading: true,
  error: null,
};

/** Subscribe to state changes. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Merge a partial update into state and notify subscribers. */
export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

/* ---------------- wishlist ---------------- */

export function toggleFavorite(id) {
  const favs = new Set(state.favorites);
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  const favorites = [...favs];
  persist(FAV_KEY, favorites);
  setState({ favorites });
}

/* ---------------- cart ---------------- */

export function addToCart(id, qty = 1) {
  const cart = state.cart.map((line) => ({ ...line }));
  const line = cart.find((l) => l.id === id);
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  persist(CART_KEY, cart);
  setState({ cart });
}

export function setCartQty(id, qty) {
  const cart = qty <= 0
    ? state.cart.filter((l) => l.id !== id)
    : state.cart.map((l) => (l.id === id ? { ...l, qty } : l));
  persist(CART_KEY, cart);
  setState({ cart });
}

export function clearCart() {
  persist(CART_KEY, []);
  setState({ cart: [] });
}

/** Total item count in the cart. */
export function cartCount() {
  return state.cart.reduce((n, l) => n + l.qty, 0);
}

/** Subtotal in USD cents-free numbers, resolved against the catalogue. */
export function cartSubtotal() {
  return state.cart.reduce((sum, l) => {
    const p = state.products.find((x) => x.id === l.id);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);
}

/* ---------------- selectors ---------------- */

/** Derived, filtered + sorted product list for the gallery. */
export function getVisibleProducts() {
  const { products, search, category, sort, favorites, favOnly } = state;
  const q = search.trim().toLowerCase();
  const favSet = new Set(favorites);

  const list = products.filter((p) => {
    if (favOnly && !favSet.has(p.id)) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (!q) return true;
    const haystack = [p.title, p.material, p.stitch, p.description, ...(p.tags ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  const comparators = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.title.localeCompare(b.title),
  };

  return [...list].sort(comparators[sort] ?? comparators.featured);
}
