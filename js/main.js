// js/main.js — application bootstrap.
import { loadProducts } from './data.js';
import { setState, subscribe } from './store.js';
import { setupUI } from './ui.js';
import { initTheme } from './components/themeToggle.js';

const dom = {
  search: document.getElementById('search'),
  categoryFilter: document.getElementById('categoryFilter'),
  sort: document.getElementById('sort'),
  gallery: document.getElementById('galleryGrid'),
  resultCount: document.getElementById('resultCount'),
  panel: document.getElementById('detailPanel'),
  panelContent: document.getElementById('panelContent'),
  panelBackdrop: document.getElementById('panelBackdrop'),
  closePanel: document.getElementById('closePanel'),
  themeToggle: document.getElementById('themeToggle'),
  viewAllBtn: document.getElementById('viewAllBtn'),
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
  dom.retry = loadCatalogue;
  await loadCatalogue();
}

init();
