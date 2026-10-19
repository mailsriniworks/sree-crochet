// js/main.js — application bootstrap.
import { loadProducts } from './data.js';
import { setState, subscribe } from './store.js';
import { setupUI } from './ui.js';
import { initScrollFx } from './scrollFx.js';
import { initTheme } from './components/themeToggle.js';

const dom = {
  topbar: document.getElementById('topbar'),
  search: document.getElementById('search'),
  searchBtn: document.getElementById('searchBtn'),
  sort: document.getElementById('sort'),
  gallery: document.getElementById('galleryGrid'),
  resultCount: document.getElementById('resultCount'),
  panel: document.getElementById('detailPanel'),
  panelContent: document.getElementById('panelContent'),
  panelBackdrop: document.getElementById('panelBackdrop'),
  closePanel: document.getElementById('closePanel'),
  themeToggle: document.getElementById('themeToggle'),
  favPill: document.getElementById('favPill'),
  favCount: document.getElementById('favCount'),
  filterBtn: document.getElementById('filterBtn'),
  dealSlot: document.getElementById('dealSlot'),
  prevDeal: document.getElementById('prevDeal'),
  nextDeal: document.getElementById('nextDeal'),
  heroVisual: document.getElementById('heroVisual'),
  heroRating: document.getElementById('heroRating'),
  exclusiveTitle: document.getElementById('exclusiveTitle'),
  exclusiveDesc: document.getElementById('exclusiveDesc'),
  exclusiveVisual: document.getElementById('exclusiveVisual'),
  exclusiveGlyph: document.getElementById('exclusiveGlyph'),
  openExclusive: document.getElementById('openExclusive'),
  openExclusiveArrow: document.getElementById('openExclusiveArrow'),
  newsletter: document.getElementById('newsletter'),
  newsMsg: document.getElementById('newsMsg'),
  toTop: document.getElementById('toTop'),
  toastRoot: document.getElementById('toastRoot'),
  subscribe,
};

async function loadCatalogue() {
  setState({ loading: true, error: null });
  try {
    const products = await loadProducts();
    setState({ products, loading: false });
    console.info(`[sree-crochet] loaded ${products.length} products`);
  } catch (err) {
    console.error('[sree-crochet] catalogue load failed:', err);
    setState({ loading: false, error: err.message });
  }
}

async function init() {
  initTheme(dom.themeToggle);
  setupUI(dom);
  initScrollFx(dom);
  dom.retry = loadCatalogue;
  await loadCatalogue();
}

init();
