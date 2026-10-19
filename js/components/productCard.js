// js/components/productCard.js — gallery card markup + rendering.
import { escapeHtml, formatPrice } from '../utils.js';

const CATEGORY_LABELS = {
  clothing: 'Clothing',
  home: 'Home Goods',
  accessories: 'Accessories',
};

const CATEGORY_ICONS = {
  clothing: '🧶',
  home: '🏡',
  accessories: '👜',
};

/** Build the HTML for a single product card. */
export function productCardHtml(product, index = 0) {
  const label = CATEGORY_LABELS[product.category] ?? product.category;
  const icon = CATEGORY_ICONS[product.category] ?? '🧶';
  const delay = Math.min(index, 12) * 40;

  return `
    <article class="card" data-product-id="${escapeHtml(product.id)}"
             style="animation-delay:${delay}ms"
             role="button" tabindex="0"
             aria-label="View details for ${escapeHtml(product.title)}">
      ${product.featured ? '<span class="card-badge">Featured</span>' : ''}
      <div class="card-visual" aria-hidden="true">
        <span class="card-icon">${icon}</span>
        <span class="card-glyph" aria-hidden="true">❋</span>
      </div>
      <div class="card-body">
        <span class="card-category">${escapeHtml(label)}</span>
        <h3 class="card-title">${escapeHtml(product.title)}</h3>
        <p class="card-desc">${escapeHtml(product.description)}</p>
        <div class="card-meta">
          <span class="card-price">${formatPrice(product.price)}</span>
          <span class="card-material" title="Material">${escapeHtml(product.material)}</span>
        </div>
      </div>
    </article>
  `;
}
