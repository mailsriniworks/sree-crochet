// js/components/productCard.js — collection card markup + shared constants.
import { escapeHtml, formatPrice, artStyle } from '../utils.js';
import { state } from '../store.js';

export const CATEGORY_LABELS = {
  clothing: 'Clothing',
  home: 'Home Goods',
  accessories: 'Accessories',
};

export const CATEGORY_ICONS = {
  clothing: '🧥',
  home: '🛋️',
  accessories: '👜',
};

export const HEART_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

export function iconFor(category) {
  return CATEGORY_ICONS[category] ?? '🧶';
}

/** White-framed gradient-art card, like the reference design's thumbnails. */
export function productCardHtml(product, index = 0) {
  const delay = Math.min(index, 12) * 40;
  const fav = state.favorites.includes(product.id);

  return `
    <article class="p-card" data-product-id="${escapeHtml(product.id)}"
             style="animation-delay:${delay}ms"
             role="button" tabindex="0"
             aria-label="View details for ${escapeHtml(product.title)}">
      <div class="p-frame">
        <div class="p-art" style="${artStyle(product.id)}">
          <button class="heart-btn ${fav ? 'is-fav' : ''}" data-fav-id="${escapeHtml(product.id)}"
                  aria-pressed="${fav}"
                  aria-label="Save ${escapeHtml(product.title)} to favorites">${HEART_SVG}</button>
          <div class="p-quick">
            <button data-open-id="${escapeHtml(product.id)}"
                    aria-label="Quick view ${escapeHtml(product.title)}">↗</button>
          </div>
        </div>
      </div>
      <h3 class="p-title">${escapeHtml(product.title)}</h3>
      <p class="p-sub">${escapeHtml(product.material)} · ${formatPrice(product.price)} · <span class="star">★</span> ${product.rating ?? '4.8'}</p>
    </article>
  `;
}
