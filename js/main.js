// js/main.js — application bootstrap.
import { loadProducts } from './data.js';
import { setState, subscribe } from './store.js';
import { setupUI } from './ui.js';
import { initScrollFx } from './scrollFx.js';
import { initTheme } from './components/themeToggle.js';

const dom = {
  search: document.getElementById('search'),
  searchBtn: document.getElementById('searchBtn'),
  sort: document.getElementById('sort'),
  gallery: document.getElementById('galleryGrid'),
  resultCount: document.getElementById('resultCount'),
  pageTitle: document.getElementById('pageTitle'),
  bento: document.getElementById('bento'),
  railPlayer: document.getElementById('railPlayer'),
  panel: document.getElementById('detailPanel'),
  panelContent: document.getElementById('panelContent'),
  panelBackdrop: document.getElementById('panelBackdrop'),
  closePanel: document.getElementById('closePanel'),
  themeToggle: document.getElementById('themeToggle'),
  favPill: document.getElementById('favPill'),
  favCount: document.getElementById('favCount'),
  filterBtn: document.getElementById('filterBtn'),
  askForm: document.getElementById('askForm'),
  askInput: document.getElementById('askInput'),
  greetTime: document.getElementById('greetTime'),
  toTop: document.getElementById('toTop'),
  toastRoot: document.getElementById('toastRoot'),
  subscribe,
};

function greet() {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  if (dom.greetTime) dom.greetTime.textContent = part;
}

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
  greet();
  initTheme(dom.themeToggle);
  setupUI(dom);
  initScrollFx(dom);
  dom.retry = loadCatalogue;
  await loadCatalogue();
}

init();
