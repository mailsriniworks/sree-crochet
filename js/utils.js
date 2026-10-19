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
