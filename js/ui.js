// js/ui.js — wires DOM events to the store (search, filters, sort, drawer).
import { state, setState } from './store.js';
import { renderGallery } from './components/gallery.js';
import { renderDetailPanel } from './components/detailPanel.js';
import { debounce, qsa } from './utils.js';

export function setupUI(dom) {
  // ---- Gallery + panel re-render on any state change ----
  const rerender = () => {
    renderGallery(dom.gallery);
    renderDetailPanel(dom.panel, dom.panelContent);
    syncCategoryChips();
    syncResultCount();
  };
  dom.subscribe(rerender);

  // ---- Search (debounced) ----
  const onSearch = debounce((value) => setState({ search: value }), 180);
  dom.search.addEventListener('input', (e) => onSearch(e.target.value));

  // ---- Category filter (select + chips) ----
  dom.categoryFilter.addEventListener('change', (e) => {
    setState({ category: e.target.value });
  });

  qsa('[data-category-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      setState({ category: chip.dataset.categoryChip });
      dom.gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function syncCategoryChips() {
    qsa('[data-category-chip]').forEach((chip) => {
      const active = chip.dataset.categoryChip === state.category;
      chip.classList.toggle('chip--active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  // ---- Sort ----
  dom.sort.addEventListener('change', (e) => setState({ sort: e.target.value }));

  // ---- Result count ----
  function syncResultCount() {
    if (!dom.resultCount) return;
    const visible = qsa('.card', dom.gallery).length;
    dom.resultCount.textContent = state.loading
      ? 'Loading…'
      : `${visible} ${visible === 1 ? 'piece' : 'pieces'}`;
  }

  // ---- Product selection (click / keyboard on cards) ----
  dom.gallery.addEventListener('click', (e) => {
    const card = e.target.closest('[data-product-id]');
    if (card) setState({ selectedId: card.dataset.productId });
  });
  dom.gallery.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-product-id]');
    if (card) {
      e.preventDefault();
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Panel close (button, backdrop, Escape) ----
  const closePanel = () => setState({ selectedId: null });
  dom.closePanel.addEventListener('click', closePanel);
  dom.panelBackdrop?.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selectedId) closePanel();
  });

  // ---- Retry after load error ----
  dom.gallery.addEventListener('click', (e) => {
    if (e.target.id === 'retryBtn' && typeof dom.retry === 'function') dom.retry();
  });

  // ---- Hero CTA ----
  dom.viewAllBtn?.addEventListener('click', () => {
    setState({ category: 'all', search: '' });
    dom.search.value = '';
    dom.gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  rerender();
}
