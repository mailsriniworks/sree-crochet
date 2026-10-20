// js/components/sections.js — live stats + the breakout hero.
// The hero cycles through `featured` products via state.heroIndex.
import { state } from '../store.js';
import { escapeHtml, formatPrice, qsa } from '../utils.js';

export function renderSections(dom) {
  const counts = { clothing: 0, home: 0, accessories: 0 };
  state.products.forEach((p) => { counts[p.category] = (counts[p.category] ?? 0) + 1; });

  qsa('[data-count]').forEach((el) => {
    el.textContent = `${counts[el.dataset.count] ?? 0} pieces`;
  });

  const hours = state.products.reduce((sum, p) => sum + (p.timeHours ?? 0), 0);

  if (dom.heroStats) {
    dom.heroStats.innerHTML = `
      <div><dt>${state.products.length}</dt><dd>designs in the shop</dd></div>
      <div><dt>${hours}+</dt><dd>hours of handwork</dd></div>
      <div><dt>100%</dt><dd>natural or recycled fiber</dd></div>`;
  }
  if (dom.statPieces) dom.statPieces.textContent = String(state.products.length);
  if (dom.statHours) dom.statHours.textContent = `${hours}+`;

  renderHero(dom);
}

/** Fill the editorial hero (price tag, title, description, breakout photo). */
function renderHero(dom) {
  const featured = state.products.filter((p) => p.featured);
  if (!featured.length || !dom.heroFig) return;

  const len = featured.length;
  const i = ((state.heroIndex % len) + len) % len;
  const p = featured[i];

  dom.heroFig.dataset.productId = p.id;
  dom.heroFig.setAttribute('aria-label', `Open details for ${p.title}`);
  if (dom.heroFigImg) {
    dom.heroFigImg.src = p.image ?? '';
    dom.heroFigImg.alt = `${p.title} — handmade crochet`;
  }
  if (dom.heroPrice) dom.heroPrice.textContent = formatPrice(p.price);
  if (dom.heroTitle) dom.heroTitle.textContent = p.title;
  if (dom.heroDesc) dom.heroDesc.textContent = `${escapeHtml(p.stitch ?? 'Hand crochet')} with ${escapeHtml(p.material.toLowerCase())}. ${escapeHtml(p.description)}`;
}
