// js/ui.js — wires DOM events to the store (search, filters, sort, favorites,
// showcase carousel, detail drawer, newsletter).
import { state, setState, toggleFavorite } from './store.js';
import { renderGallery } from './components/gallery.js';
import { renderDetailPanel } from './components/detailPanel.js';
import { renderShowcase, stepShowcase } from './components/showcase.js';
import { debounce, qsa } from './utils.js';

export function setupUI(dom) {
  // ---- Single subscriber: re-render everything from state ----
  const rerender = () => {
    renderGallery(dom.gallery);
    renderDetailPanel(dom.panel, dom.panelContent);
    renderShowcase(dom);
    syncChips();
    syncFav();
    syncCount();
  };
  dom.subscribe(rerender);

  // ---- Search (debounced input + immediate button) ----
  const onSearch = debounce((value) => setState({ search: value }), 180);
  dom.search.addEventListener('input', (e) => onSearch(e.target.value));
  dom.searchBtn.addEventListener('click', () => {
    setState({ search: dom.search.value });
    dom.gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Category pills ----
  qsa('[data-category-chip]').forEach((chip) => {
    chip.addEventListener('click', () => setState({ category: chip.dataset.categoryChip }));
  });

  // ---- Sort ----
  dom.sort.addEventListener('change', (e) => setState({ sort: e.target.value }));

  // ---- Filter icon = reset all filters ----
  dom.filterBtn.addEventListener('click', () => {
    dom.search.value = '';
    dom.sort.value = 'featured';
    setState({ search: '', category: 'all', sort: 'featured', favOnly: false });
  });

  // ---- Favorites-only toggle (header heart pill) ----
  dom.favPill.addEventListener('click', () => setState({ favOnly: !state.favOnly }));

  // ---- Showcase carousel ----
  dom.prevDeal.addEventListener('click', () => { stepShowcase(-1); renderShowcase(dom); });
  dom.nextDeal.addEventListener('click', () => { stepShowcase(1); renderShowcase(dom); });

  // ---- Delegated clicks: hearts, open buttons, cards ----
  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav-id]');
    if (fav && fav.dataset.favId) {
      toggleFavorite(fav.dataset.favId);
      return;
    }
    const open = e.target.closest('[data-open-id]');
    if (open) {
      setState({ selectedId: open.dataset.openId });
      return;
    }
    const exclusive = e.target.closest('#openExclusive, #openExclusiveArrow');
    if (exclusive && exclusive.dataset.productId) {
      setState({ selectedId: exclusive.dataset.productId });
      return;
    }
    const card = e.target.closest('[data-product-id]');
    if (card && dom.gallery.contains(card)) {
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Keyboard: Enter/Space opens a focused card ----
  dom.gallery.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-product-id]');
    if (card && e.target === card) {
      e.preventDefault();
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Drawer close: button, backdrop, Escape ----
  const closePanel = () => setState({ selectedId: null });
  dom.closePanel.addEventListener('click', closePanel);
  dom.panelBackdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selectedId) closePanel();
  });

  // ---- Newsletter (demo submit) ----
  dom.newsletter.addEventListener('submit', (e) => {
    e.preventDefault();
    dom.newsMsg.hidden = false;
    dom.newsletter.reset();
  });

  // ---- Sync helpers ----
  function syncChips() {
    qsa('[data-category-chip]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.categoryChip === state.category));
    });
  }

  function syncFav() {
    dom.favCount.textContent = String(state.favorites.length);
    dom.favPill.setAttribute('aria-pressed', String(state.favOnly));
  }

  function syncCount() {
    if (!dom.resultCount) return;
    const n = qsa('.p-card', dom.gallery).length;
    dom.resultCount.textContent = state.loading ? '' : `· ${n} ${n === 1 ? 'piece' : 'pieces'}`;
  }

  rerender();
}
