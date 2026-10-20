// js/main.js — application bootstrap.
import { loadProducts } from './data.js';
import { setState, subscribe } from './store.js';
import { setupUI } from './ui.js';
import { initScrollFx } from './scrollFx.js';
import { initTheme } from './components/themeToggle.js';

const dom = {
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  savedChip: document.getElementById('savedChip'),
  gallery: document.getElementById('galleryGrid'),
  resultCount: document.getElementById('resultCount'),
  collectionTitle: document.getElementById('collectionTitle'),
  heroFig: document.getElementById('heroFig'),
  heroFigImg: document.getElementById('heroFigImg'),
  heroPrice: document.getElementById('heroPrice'),
  heroTitle: document.getElementById('heroTitle'),
  heroDesc: document.getElementById('heroDesc'),
  heroNext: document.getElementById('heroNext'),
  heroInsetBtn: document.getElementById('heroInsetBtn'),
  statPieces: document.getElementById('statPieces'),
  statHours: document.getElementById('statHours'),
  cartBtn: document.getElementById('cartBtn'),
  cartCount: document.getElementById('cartCount'),
  cartPanel: document.getElementById('cartPanel'),
  cartContent: document.getElementById('cartContent'),
  cartCountLabel: document.getElementById('cartCountLabel'),
  closeCart: document.getElementById('closeCart'),
  panel: document.getElementById('detailPanel'),
  panelContent: document.getElementById('panelContent'),
  closePanel: document.getElementById('closePanel'),
  backdrop: document.getElementById('drawerBackdrop'),
  themeToggle: document.getElementById('themeToggle'),
  newsletter: document.getElementById('newsletter'),
  toTop: document.getElementById('toTop'),
  toastRoot: document.getElementById('toastRoot'),
  detailQtyOut: () => document.getElementById('detailQtyOut'),
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
