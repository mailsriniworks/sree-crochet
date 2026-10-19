// js/store.js — tiny observable state container.
// Single source of truth; UI subscribes and re-renders on change.

const FAV_KEY = 'sree-c…ites';
const listeners = new Set();

function readFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const state = {
  products: [],        // loaded catalogue
  search: '',          // current search query
  category: 'all',     // 'all' | 'clothing' | 'home' | 'accessories'
  sort: 'featured',    // 'featured' | 'price-asc' | 'price-desc' | 'name'
  selectedId: null,    // product id shown in the detail drawer
  favorites: readFavorites(), // saved product ids
  favOnly: false,      // show saved pieces only
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

/** Toggle a product in/out of favorites (persisted). */
export function toggleFavorite(id) {
  const favs = new Set(state.favorites);
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  const favorites = [...favs];
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  } catch { /* private mode: keep in-memory only */ }
  setState({ favorites });
}

/** Derived, filtered + sorted product list for the gallery. */
export function getVisibleProducts() {
  const { products, search, category, sort, favorites, favOnly } = state;
  const q = search.trim().toLowerCase();
  const favSet = new Set(favorites);

  const list = products.filter((p) => {
    if (favOnly && !favSet.has(p.id)) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (!q) return true;
    const haystack = [p.title, p.material, p.description, ...(p.tags ?? [])]
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
