// js/ui.js — wires DOM events to the store (search, pills, sort, favorites,
// showcase carousel + swipe + auto-advance, drawer, toasts, newsletter).
import { state, setState, toggleFavorite } from './store.js';
import { renderGallery } from './components/gallery.js';
import { renderDetailPanel } from './components/detailPanel.js';
import { renderShowcase, stepShowcase } from './components/showcase.js';
import { initToast, toast } from './components/toast.js';
import { debounce, qsa } from './utils.js';

const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function setupUI(dom) {
  initToast(dom.toastRoot);

  // ---- Single subscriber: re-render everything from state ----
  let prevSelected = null;
  const rerender = () => {
    renderGallery(dom.gallery);
    renderDetailPanel(dom.panel, dom.panelContent);
    renderShowcase(dom);
    syncChips();
    syncCounts();
    syncFav();
    syncResultCount();

    // Restore focus to the opener when the drawer closes (a11y).
    if (prevSelected && !state.selectedId && dom.lastFocus?.isConnected) {
      dom.lastFocus.focus({ preventScroll: true });
    }
    prevSelected = state.selectedId;
  };
  dom.subscribe(rerender);

  // ---- Search (debounced input + immediate button) ----
  const onSearch = debounce((value) => setState({ search: value }), 180);
  dom.search.addEventListener('input', (e) => onSearch(e.target.value));
  dom.searchBtn.addEventListener('click', () => {
    setState({ search: dom.search.value });
    dom.gallery.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
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
    toast('Filters reset', '↺');
  });

  // ---- Favorites-only toggle (header heart pill) ----
  dom.favPill.addEventListener('click', () => {
    const next = !state.favOnly;
    setState({ favOnly: next });
    if (next) toast(`Showing ${state.favorites.length} saved ${state.favorites.length === 1 ? 'piece' : 'pieces'}`, '♥');
  });

  // ---- Showcase carousel: buttons, swipe, gentle auto-advance ----
  let lastManual = Date.now();
  const manualStep = (dir) => {
    lastManual = Date.now();
    stepShowcase(dir);
    renderShowcase(dom);
  };
  dom.prevDeal.addEventListener('click', () => manualStep(-1));
  dom.nextDeal.addEventListener('click', () => manualStep(1));

  let swipeX = null;
  let swipeY = null;
  const dealsEl = document.querySelector('.bento-deals');
  dealsEl?.addEventListener('pointerdown', (e) => { swipeX = e.clientX; swipeY = e.clientY; });
  dealsEl?.addEventListener('pointerup', (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    const dy = e.clientY - swipeY;
    swipeX = swipeY = null;
    if (Math.abs(dx) > 40 && Math.abs(dy) < 60) manualStep(dx < 0 ? 1 : -1);
  });

  setInterval(() => {
    if (REDUCED || document.hidden) return;
    if (document.body.classList.contains('panel-open')) return;
    if (Date.now() - lastManual < 12000) return;
    stepShowcase(1);
    renderShowcase(dom);
  }, 6000);

  // ---- Delegated clicks: hearts, quick-open, exclusive, cards, related ----
  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav-id]');
    if (fav && fav.dataset.favId) {
      const wasFav = state.favorites.includes(fav.dataset.favId);
      toggleFavorite(fav.dataset.favId);
      const p = state.products.find((x) => x.id === fav.dataset.favId);
      toast(wasFav ? 'Removed from saved' : `Saved “${p?.title ?? 'piece'}”`, wasFav ? '🤍' : '♥');
      return;
    }
    const open = e.target.closest('[data-open-id]');
    if (open) {
      dom.lastFocus = open;
      setState({ selectedId: open.dataset.openId });
      return;
    }
    const exclusive = e.target.closest('#openExclusive, #openExclusiveArrow');
    if (exclusive && exclusive.dataset.productId) {
      dom.lastFocus = exclusive;
      setState({ selectedId: exclusive.dataset.productId });
      return;
    }
    const card = e.target.closest('[data-product-id]');
    if (card) {
      dom.lastFocus = card;
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Keyboard: Enter/Space opens a focused card ----
  dom.gallery.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-product-id]');
    if (card && e.target === card) {
      e.preventDefault();
      dom.lastFocus = card;
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
    toast("You're on the list — welcome!", '🧶');
  });

  // ---- Sync helpers ----
  function syncChips() {
    qsa('[data-category-chip]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.categoryChip === state.category));
    });
  }

  function syncCounts() {
    const counts = { all: state.products.length, clothing: 0, home: 0, accessories: 0 };
    state.products.forEach((p) => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
    qsa('[data-count]').forEach((el) => {
      el.textContent = counts[el.dataset.count] != null ? String(counts[el.dataset.count]) : '';
    });
  }

  function syncFav() {
    dom.favCount.textContent = String(state.favorites.length);
    dom.favPill.setAttribute('aria-pressed', String(state.favOnly));
  }

  function syncResultCount() {
    if (!dom.resultCount) return;
    const n = qsa('.p-card', dom.gallery).length;
    dom.resultCount.textContent = state.loading ? '' : `· ${n} ${n === 1 ? 'piece' : 'pieces'}`;
  }

  rerender();
}
