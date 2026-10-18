// js/render.js — render functions
import { Store } from './store.js';

function createCard(product) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-visual" role="img" aria-label="${escapeHtml(product.title)} image">
      <img src="${product.image}" alt="${escapeHtml(product.title)}" style="max-height:100%;max-width:100%;object-fit:cover">
    </div>
    <div class="card-body">
      <div class="card-title">${escapeHtml(product.title)}</div>
      <div class="card-meta">${escapeHtml(product.price)}</div>
      <div class="card-tags">${product.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="card-actions">
        <button class="btn-ghost" data-id="${product.id}" data-action="view">View</button>
        <button class="btn-ghost" data-id="${product.id}" data-action="fav">❤</button>
      </div>
    </div>
  `;
  return el;
}

export function renderGallery(target) {
  target.innerHTML = '';
  const filtered = Store.products.filter(p => {
    const inCategory = Store.category === 'all' || p.category === Store.category;
    const q = Store.query.trim().toLowerCase();
    const matchesQuery = q === '' || p.title.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
    return inCategory && matchesQuery;
  });

  if (filtered.length === 0) {
    target.innerHTML = `<div class="no-results"><p>No items found. Try a different search or category.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(p => fragment.appendChild(createCard(p)));
  target.appendChild(fragment);
}

export function renderDetail(panel, product) {
  if (!product) return;
  panel.setAttribute('aria-hidden', 'false');
  panel.querySelector('#panelContent').innerHTML = `
    <h3>${escapeHtml(product.title)}</h3>
    <p class="card-meta">${escapeHtml(product.price)} • ${escapeHtml(product.material)}</p>
    <div style="margin:12px 0"><img src="${product.image}" alt="${escapeHtml(product.title)}" style="width:100%;border-radius:10px"></div>
    <p>${escapeHtml(product.description)}</p>
    <p class="card-tags">${product.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>
    <div style="margin-top:12px"><button class="btn-primary">Request custom order</button></div>
  `;
}

export function closeDetail(panel) {
  panel.setAttribute('aria-hidden','true');
  panel.querySelector('#panelContent').innerHTML = '';
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
