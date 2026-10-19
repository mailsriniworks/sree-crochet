// js/components/sections.js — fills hero stats, category counts, maker stats.
import { state } from '../store.js';
import { qsa } from '../utils.js';

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
}
