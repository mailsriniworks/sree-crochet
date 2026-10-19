// js/components/showcase.js — the bento showcase: deals carousel, hero, exclusive slot.
// Carousel index is module-local; rendering is driven by store state.
import { state } from '../store.js';
import { escapeHtml, formatPrice } from '../utils.js';
import { iconFor, HEART_SVG } from './productCard.js';

let index = 0;

/** Advance the featured carousel by `dir` (-1 | +1). */
export function stepShowcase(dir) {
  index += dir;
}

/** Render deal card, hero visual, and exclusive slot from featured products. */
export function renderShowcase(dom) {
  const featured = state.products.filter((p) => p.featured);
  if (!featured.length || !dom.dealSlot) return;

  const len = featured.length;
  const i = ((index % len) + len) % len;
  const current = featured[i];
  const next = featured[(i + 1) % len];

  // --- left deals card ---
  dom.dealSlot.innerHTML = dealCardHtml(current);

  // --- hero ---
  dom.heroVisual.innerHTML = `<span class="hero-glyph">${iconFor(current.category)}</span>`;
  dom.heroRating.innerHTML = `<span class="star">★</span> ${current.rating ?? '4.9'}`;

  // --- exclusive slot shows the next featured piece ---
  dom.exclusiveTitle.textContent = next.title;
  dom.exclusiveDesc.textContent = next.description;
  dom.exclusiveGlyph.textContent = iconFor(next.category);

  const heart = dom.exclusiveVisual.querySelector('.heart-btn');
  const fav = state.favorites.includes(next.id);
  heart.dataset.favId = next.id;
  heart.classList.toggle('is-fav', fav);
  heart.setAttribute('aria-pressed', String(fav));

  dom.openExclusive.dataset.productId = next.id;
  dom.openExclusiveArrow.dataset.productId = next.id;
}

function dealCardHtml(product) {
  const fav = state.favorites.includes(product.id);
  return `
    <div class="deal-card">
      <div class="deal-top">
        <span class="deal-price">${formatPrice(product.price)}</span>
        <span class="deal-rating"><span class="star">★</span> ${product.rating ?? '4.9'}</span>
      </div>
      <span class="deal-name">${escapeHtml(product.title)}</span>
      <div class="deal-visual" aria-hidden="true">${iconFor(product.category)}</div>
      <div class="deal-actions">
        <button class="heart-btn heart-btn--static ${fav ? 'is-fav' : ''}"
                data-fav-id="${escapeHtml(product.id)}" aria-pressed="${fav}"
                aria-label="Save ${escapeHtml(product.title)} to favorites">${HEART_SVG}</button>
        <button class="round-btn round-dark" data-open-id="${escapeHtml(product.id)}"
                aria-label="Open details for ${escapeHtml(product.title)}">↗</button>
      </div>
    </div>
  `;
}
