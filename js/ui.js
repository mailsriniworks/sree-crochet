// js/ui.js — UI glue: events and interactions
import { Store } from './store.js';
import { renderGallery, renderDetail, closeDetail } from './render.js';

export function setupUI() {
  const search = document.getElementById('search');
  const category = document.getElementById('categoryFilter');
  const gallery = document.getElementById('gallery');
  const panel = document.getElementById('detailPanel');
  const closePanel = document.getElementById('closePanel');
  const themeToggle = document.getElementById('themeToggle');
  const viewAllBtn = document.getElementById('viewAllBtn');

  function refresh() {
    renderGallery(gallery);
  }

  search.addEventListener('input', (e)=>{
    Store.setQuery(e.target.value);
    refresh();
  });

  category.addEventListener('change', (e)=>{
    Store.setCategory(e.target.value);
    refresh();
  });

  gallery.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const product = Store.products.find(p => p.id === id);
    if (btn.dataset.action === 'view'){
      Store.setSelected(product);
      renderDetail(panel, product);
      panel.setAttribute('aria-hidden','false');
      panel.querySelector('.panel-close')?.focus();
    }
    if (btn.dataset.action === 'fav'){
      // simple feedback
      btn.textContent = '✓';
      setTimeout(()=>btn.textContent = '❤', 900);
    }
  });

  closePanel.addEventListener('click', ()=>{
    Store.setSelected(null);
    closeDetail(panel);
  });

  themeToggle.addEventListener('click', ()=>{
    Store.toggleTheme();
    applyTheme(Store.theme);
  });

  viewAllBtn.addEventListener('click', ()=>{
    document.getElementById('search').focus();
  });

  // keyboard accessibility: close detail with Escape
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false'){
      Store.setSelected(null);
      closeDetail(panel);
    }
  });

  // apply initial
  applyTheme(Store.theme);
}

function applyTheme(theme){
  if (theme === 'light') document.documentElement.classList.add('light-theme');
  else document.documentElement.classList.remove('light-theme');
}
