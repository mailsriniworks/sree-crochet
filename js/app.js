// js/app.js — application bootstrap
import { loadProducts } from './data.js';
import { Store } from './store.js';
import { renderGallery } from './render.js';
import { setupUI } from './ui.js';

async function init(){
  const products = await loadProducts();
  Store.setProducts(products);

  // initial render
  const gallery = document.getElementById('gallery');
  renderGallery(gallery);

  setupUI();
}

init();
