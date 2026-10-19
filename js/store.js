// js/store.js — tiny observable state container.
// Single source of truth; UI subscribes and re-renders on change.

const listeners = new Set();

export const state = {
  products: [],        // loaded catalogue
  search: '',          // current search query
  category: 'all',     // 'all' | 'clothing' | 'home' | 'accessories'
  sort: 'featured',    // 'featured' | 'price-asc' | 'price-desc' | 'name'
  selectedId: null,    // product id shown in the detail drawer
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

/** Derived, filtered + sorted product list for the gallery. */
export function getVisibleProducts() {
  const { products, search, category, sort } = state;
  const q = search.trim().toLowerCase();

  let list = products.filter((p) => {
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
