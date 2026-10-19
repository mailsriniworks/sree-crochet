// js/utils.js — shared helpers (pure functions, no DOM state)

/** Escape a string for safe interpolation into HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Format a number as USD currency. */
export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Trailing-edge debounce. */
export function debounce(fn, wait = 180) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Create an element from an HTML string (single root). */
export function elFromHtml(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

/** Shorthand querySelector scoped to a root element. */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** Shorthand querySelectorAll returning a real array. */
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/* ---- Natural-dye gradient art, deterministic per seed ---- */
const ART_PALETTES = [
  ['#e8d9c3', '#c98d6b', '#f3e9db'], // oat → clay
  ['#cfd8c2', '#8fa08a', '#eef0e4'], // sage → moss
  ['#e3b7ae', '#a85f57', '#f6e7e2'], // madder rose
  ['#b9c3d6', '#6f7f9e', '#e8ecf4'], // indigo dye
  ['#ecd3a0', '#c99a3f', '#f8eed7'], // marigold
  ['#d3bcd4', '#8a6a92', '#f0e6f1'], // logwood plum
];

const CATEGORY_ART = { clothing: 0, home: 1, accessories: 2 };

function hash(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Inline-style string painting a soft natural-dye artwork for a seed. */
export function artStyle(seed) {
  const h = hash(seed);
  const p = ART_PALETTES[h % ART_PALETTES.length];
  const angle = 115 + ((h >> 3) % 90);
  return [
    'background:',
    `radial-gradient(90% 70% at 18% 12%, rgba(255,255,255,0.7), rgba(255,255,255,0) 62%),`,
    `radial-gradient(85% 90% at 85% 92%, ${p[2]}, rgba(255,255,255,0) 72%),`,
    `linear-gradient(${angle}deg, ${p[0]}, ${p[1]})`,
  ].join('');
}

/** Stable artwork per category. */
export function artForCategory(category) {
  const p = ART_PALETTES[CATEGORY_ART[category] ?? (hash(category) % ART_PALETTES.length)];
  return [
    'background:',
    `radial-gradient(90% 70% at 20% 10%, rgba(255,255,255,0.65), rgba(255,255,255,0) 60%),`,
    `linear-gradient(135deg, ${p[0]}, ${p[1]})`,
  ].join('');
}
