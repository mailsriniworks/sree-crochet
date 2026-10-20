// js/components/sections.js — hero stats, category counts, maker stats,
// and the featured rail (rendered once per data signature, so scrolling
// and state changes don't reset its position).
import { state } from '../store.js';
import { qsa } from '../utils.js';
import { productCardHtml } from './productCard.js';

let lastRailSig = null;

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

  // ---- featured rail ----
  const featured = state.products.filter((p) => p.featured);
  const sig = featured.map((p) => p.id).join(',') + '|' + state.favorites.join(',');
  if (dom.railRow && sig !== lastRailSig) {
    lastRailSig = sig;
    dom.railRow.innerHTML = featured.map((p, i) => productCardHtml(p, i)).join('');
    if (dom.railCounter) dom.railCounter.textContent = `1 / ${featured.length || 0}`;
  }
}
