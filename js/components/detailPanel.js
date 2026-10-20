// js/components/detailPanel.js — product drawer: full craft specs,
// quantity stepper, add-to-basket / buy-now, related pieces.
import { state } from '../store.js';
import { escapeHtml, formatPrice, artStyle } from '../utils.js';
import { CATEGORY_LABELS, iconFor } from './productCard.js';

/** Render (or close) the detail drawer based on state.selectedId. */
export function renderDetailPanel(panel, content) {
  const product = state.products.find((p) => p.id === state.selectedId);

  if (!product) {
    panel.classList.remove('drawer--open');
    panel.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
    return;
  }

  const label = CATEGORY_LABELS[product.category] ?? product.category;

  content.innerHTML = `
    <div class="panel-hero" style="${artStyle(product.id)}" aria-hidden="true">
      ${product.image ? `<img class="panel-img" src="${escapeHtml(product.image)}" alt="" loading="lazy" onerror="this.remove()" />` : ''}
    </div>
    <div class="panel-body">
      <span class="panel-cat">${escapeHtml(label)} · made to order</span>
      <h2 class="panel-title">${escapeHtml(product.title)}</h2>
      <div class="panel-price-row">
        <span class="panel-price">${formatPrice(product.price)}</span>
        <span class="panel-rating"><span class="star">★</span> ${product.rating ?? '4.8'} · ${product.timeHours}h by hand</span>
      </div>
      <p class="panel-desc">${escapeHtml(product.description)}</p>

      <dl class="panel-specs">
        <div><dt>Stitch pattern</dt><dd>${escapeHtml(product.stitch ?? 'Hand crochet')}</dd></div>
        <div><dt>Hook size</dt><dd>${escapeHtml(product.hook ?? '—')}</dd></div>
        <div><dt>Fiber</dt><dd>${escapeHtml(product.material)}</dd></div>
        <div><dt>Care</dt><dd>${escapeHtml(product.care ?? 'See label')}</dd></div>
      </dl>

      <div class="panel-tags" aria-label="Tags">
        ${(product.tags ?? [])
          .map((t) => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
          .join('')}
      </div>

      <div class="buy-row">
        <div class="qty-stepper" role="group" aria-label="Quantity">
          <button data-qty-delta="-1" aria-label="Decrease quantity">−</button>
          <output id="detailQtyOut">1</output>
          <button data-qty-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-solid" id="addToCartBtn">Add to basket</button>
      </div>
      <button class="btn btn-line btn-block" id="buyNowBtn">Buy it now →</button>
      <p class="muted panel-note">Ships in ~2 weeks · free over $75 · repairs for life · custom colors at checkout</p>

      ${relatedHtml(product)}
    </div>
  `;

  panel.classList.add('drawer--open');
  panel.setAttribute('aria-hidden', 'false');

  panel.querySelector('.drawer-close')?.focus({ preventScroll: true });
}

/** "You may also like" — same category first, then featured, max 3. */
function relatedHtml(current) {
  const pool = state.products.filter((p) => p.id !== current.id);
  const sameCat = pool.filter((p) => p.category === current.category);
  const rest = pool.filter((p) => p.category !== current.category && p.featured);
  const related = [...sameCat, ...rest, ...pool].slice(0, 3);
  if (!related.length) return '';

  return `
    <div class="panel-related">
      <h4>You may also like</h4>
      <div class="related-row">
        ${related
          .map(
            (r) => `
          <button class="related-item" data-product-id="${escapeHtml(r.id)}"
                  aria-label="View ${escapeHtml(r.title)}">
            <span class="related-visual" style="${artStyle(r.id)}" aria-hidden="true">${r.image ? `<img src="${escapeHtml(r.image)}" alt="" loading="lazy" onerror="this.remove()" />` : ''}</span>
            <span class="related-name">${escapeHtml(r.title)}</span>
            <span class="related-price">${formatPrice(r.price)}</span>
          </button>`
          )
          .join('')}
      </div>
    </div>
  `;
}
