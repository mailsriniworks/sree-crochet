// js/components/detailPanel.js — slide-in drawer showing a single product.
import { state } from '../store.js';
import { escapeHtml, formatPrice } from '../utils.js';

const CATEGORY_LABELS = {
  clothing: 'Clothing',
  home: 'Home Goods',
  accessories: 'Accessories',
};

/** Render (or close) the detail drawer based on state.selectedId. */
export function renderDetailPanel(panel, content) {
  const product = state.products.find((p) => p.id === state.selectedId);

  if (!product) {
    panel.classList.remove('panel--open');
    panel.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
    document.body.classList.remove('panel-open');
    return;
  }

  const label = CATEGORY_LABELS[product.category] ?? product.category;

  content.innerHTML = `
    <div class="panel-hero" aria-hidden="true">
      <span class="panel-glyph">❋</span>
    </div>
    <div class="panel-body">
      <span class="card-category">${escapeHtml(label)}</span>
      <h2 class="panel-title">${escapeHtml(product.title)}</h2>
      <p class="panel-price">${formatPrice(product.price)}</p>
      <p class="panel-desc">${escapeHtml(product.description)}</p>

      <dl class="panel-specs">
        <div><dt>Material</dt><dd>${escapeHtml(product.material)}</dd></div>
        <div><dt>Handmade in</dt><dd>${product.timeHours} hours</dd></div>
        <div><dt>Care</dt><dd>${escapeHtml(product.care ?? 'See label')}</dd></div>
      </dl>

      <div class="panel-tags" aria-label="Tags">
        ${(product.tags ?? [])
          .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
          .join('')}
      </div>

      <div class="panel-actions">
        <a class="btn btn-primary" href="mailto:?subject=${encodeURIComponent(
          `Custom order: ${product.title}`
        )}&body=${encodeURIComponent(
          `Hi! I'd love to order "${product.title}" from the Handmade Crochet collection.`
        )}">Request this piece</a>
        <span class="muted panel-note">Custom orders welcome — colors and sizes made to your taste.</span>
      </div>
    </div>
  `;

  panel.classList.add('panel--open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');

  // Move focus into the panel for keyboard users.
  const closeBtn = panel.querySelector('.panel-close');
  closeBtn?.focus({ preventScroll: true });
}
