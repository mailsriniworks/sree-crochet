// js/ui.js — wires DOM events to the store: sidebar nav, chips, search, sort,
// favorites, showcase carousel, drawer, ask-pill, toasts.
import { state, setState, toggleFavorite } from './store.js';
import { renderGallery } from './components/gallery.js';
import { renderDetailPanel } from './components/detailPanel.js';
import { renderShowcase, stepShowcase } from './components/showcase.js';
import { initToast, toast } from './components/toast.js';
import { debounce, qsa } from './utils.js';

const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const PAGE_TITLES = {
  all: 'Collection',
  clothing: 'Clothing',
  home: 'Home Goods',
  accessories: 'Accessories',
};

export function setupUI(dom) {
  initToast(dom.toastRoot);

  // ---- Single subscriber: re-render everything from state ----
  let prevSelected = null;
  const rerender = () => {
    renderGallery(dom.gallery);
    renderDetailPanel(dom.panel, dom.panelContent);
    renderShowcase(dom);
    syncChips();
    syncFav();
    syncTitle();
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

  // ---- Category controls: sidebar nav, chips, bento category tiles ----
  qsa('[data-category-chip]').forEach((el) => {
    el.addEventListener('click', () => setState({ category: el.dataset.categoryChip }));
  });

  // ---- Sort ----
  dom.sort.addEventListener('change', (e) => setState({ sort: e.target.value }));

  // ---- Reset filters ----
  dom.filterBtn.addEventListener('click', () => {
    dom.search.value = '';
    dom.sort.value = 'featured';
    setState({ search: '', category: 'all', sort: 'featured', favOnly: false });
    toast('Filters reset', '↺');
  });

  // ---- Saved-pieces view (sidebar) ----
  dom.favPill.addEventListener('click', () => {
    const next = !state.favOnly;
    setState({ favOnly: next });
    if (next) toast(`Showing ${state.favorites.length} saved ${state.favorites.length === 1 ? 'piece' : 'pieces'}`, '♥');
  });

  // ---- Showcase carousel (buttons inside the wide tile) ----
  let lastManual = Date.now();
  document.addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    if (step) {
      e.stopPropagation();
      lastManual = Date.now();
      stepShowcase(Number(step.dataset.step));
      renderShowcase(dom);
    }
  });

  setInterval(() => {
    if (REDUCED || document.hidden) return;
    if (document.body.classList.contains('panel-open')) return;
    if (Date.now() - lastManual < 12000) return;
    stepShowcase(1);
    renderShowcase(dom);
  }, 6000);

  // ---- Delegated clicks: hearts, quick-open, tiles, cards, related ----
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
    const card = e.target.closest('[data-product-id]');
    if (card) {
      dom.lastFocus = card;
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Keyboard: Enter/Space on cards and bento tiles ----
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest('.tile[role="button"], .p-card[role="button"]');
    if (tile && e.target === tile) {
      e.preventDefault();
      dom.lastFocus = tile;
      setState({
        selectedId: tile.dataset.openId ?? tile.dataset.productId ?? state.selectedId,
        category: tile.dataset.categoryChip ?? state.category,
      });
    }
  });

  // ---- Drawer close: button, backdrop, Escape ----
  const closePanel = () => setState({ selectedId: null });
  dom.closePanel.addEventListener('click', closePanel);
  dom.panelBackdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selectedId) closePanel();
  });

  // ---- Ask pill: draft a custom-order email ----
  dom.askForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const wish = dom.askInput.value.trim();
    if (!wish) return;
    window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(
      'Custom request'
    )}&body=${encodeURIComponent(`Hi Sree Crochet! ${wish}`)}`;
    dom.askInput.value = '';
    toast('Opening your mail app with the request…', '✉️');
  });

  // ---- Sync helpers ----
  function syncChips() {
    qsa('[data-category-chip]').forEach((el) => {
      el.setAttribute('aria-pressed', String(el.dataset.categoryChip === state.category));
    });
  }

  function syncFav() {
    dom.favCount.textContent = String(state.favorites.length);
    dom.favPill.setAttribute('aria-pressed', String(state.favOnly));
  }

  function syncTitle() {
    if (!dom.pageTitle) return;
    dom.pageTitle.textContent = state.favOnly ? 'Saved Pieces' : PAGE_TITLES[state.category] ?? 'Collection';
  }

  function syncResultCount() {
    if (!dom.resultCount) return;
    const n = qsa('.p-card', dom.gallery).length;
    dom.resultCount.textContent = state.loading ? '' : `· ${n} ${n === 1 ? 'piece' : 'pieces'}`;
  }

  rerender();
}
