// js/components/detailPanel.js — slide-in drawer showing a single product.
import { state } from '../store.js';
import { escapeHtml, formatPrice } from '../utils.js';
import { CATEGORY_LABELS, iconFor } from './productCard.js';

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
      <span class="panel-glyph">${iconFor(product.category)}</span>
    </div>
    <div class="panel-body">
      <span class="panel-cat">${escapeHtml(label)}</span>
      <h2 class="panel-title">${escapeHtml(product.title)}</h2>
      <div class="panel-price-row">
        <span class="panel-price">${formatPrice(product.price)}</span>
        <span class="panel-rating"><span class="star">★</span> ${product.rating ?? '4.8'}</span>
      </div>
      <p class="panel-desc">${escapeHtml(product.description)}</p>

      <dl class="panel-specs">
        <div><dt>Material</dt><dd>${escapeHtml(product.material)}</dd></div>
        <div><dt>Handmade in</dt><dd>${product.timeHours} hours</dd></div>
        <div><dt>Care</dt><dd>${escapeHtml(product.care ?? 'See label')}</dd></div>
      </dl>

      <div class="panel-tags" aria-label="Tags">
        ${(product.tags ?? [])
          .map((t) => `<span class="label-pill">#${escapeHtml(t)}</span>`)
          .join('')}
      </div>

      <div class="panel-actions">
        <a class="btn-primary" href="mailto:?subject=${encodeURIComponent(
          `Custom order: ${product.title}`
        )}&body=${encodeURIComponent(
          `Hi! I'd love to order "${product.title}" from the Sree Crochet collection.`
        )}">Request this piece ↗</a>
        <span class="muted panel-note">Custom orders welcome — colors and sizes made to your taste.</span>
      </div>
    </div>
  `;

  panel.classList.add('panel--open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');

  const closeBtn = panel.querySelector('.panel-close');
  closeBtn?.focus({ preventScroll: true });
}
