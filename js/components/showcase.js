// js/components/showcase.js — bento showcase: one wide featured tile with a
// mini carousel, three category tiles, and the right-rail "player" pill.
import { state } from '../store.js';
import { escapeHtml, formatPrice, artStyle, artForCategory } from '../utils.js';
import { CATEGORY_LABELS } from './productCard.js';

let index = 0;

/** Advance the featured carousel by `dir` (-1 | +1). */
export function stepShowcase(dir) {
  index += dir;
}

/** Render bento tiles + rail player pill from featured products. */
export function renderShowcase(dom) {
  const featured = state.products.filter((p) => p.featured);
  if (!dom.bento) return;

  if (!featured.length) {
    dom.bento.innerHTML = '';
    if (dom.railPlayer) dom.railPlayer.innerHTML = '';
    return;
  }

  const len = featured.length;
  const i = ((index % len) + len) % len;
  const current = featured[i];
  const next = featured[(i + 1) % len];

  const counts = { clothing: 0, home: 0, accessories: 0 };
  state.products.forEach((p) => { counts[p.category] = (counts[p.category] ?? 0) + 1; });

  dom.bento.innerHTML = `
    <article class="tile tile--wide" role="button" tabindex="0"
             data-open-id="${escapeHtml(current.id)}"
             aria-label="Open details for ${escapeHtml(current.title)}">
      <div class="tile-art" style="${artStyle(current.id)}"></div>
      <span class="tile-nav">
        <button data-step="-1" aria-label="Previous featured piece">←</button>
        <button data-step="1" aria-label="Next featured piece">→</button>
      </span>
      <span class="tile-sub">Featured · ${formatPrice(current.price)}</span>
      <span class="tile-label">${escapeHtml(current.title)}</span>
      <span class="tile-go" aria-hidden="true">↗</span>
    </article>
    ${['clothing', 'home', 'accessories']
      .map(
        (cat) => `
    <article class="tile" role="button" tabindex="0"
             data-category-chip="${cat}" aria-pressed="false"
             aria-label="Browse ${escapeHtml(CATEGORY_LABELS[cat])}">
      <div class="tile-art" style="${artForCategory(cat)}"></div>
      <span class="tile-sub">${counts[cat] ?? 0} pieces</span>
      <span class="tile-label">${escapeHtml(CATEGORY_LABELS[cat])}</span>
    </article>`
      )
      .join('')}
  `;

  if (dom.railPlayer) {
    dom.railPlayer.innerHTML = `
      <button class="player-pill" data-open-id="${escapeHtml(next.id)}"
              aria-label="Open details for ${escapeHtml(next.title)}">
        <span class="player-orb" style="${artStyle(next.id)}" aria-hidden="true"></span>
        <span class="player-meta">
          <span class="player-title">${escapeHtml(next.title)}</span>
          <span class="player-sub">${escapeHtml(CATEGORY_LABELS[next.category])} · ${formatPrice(next.price)}</span>
        </span>
        <span class="player-go" aria-hidden="true">↗</span>
      </button>`;
  }
}
