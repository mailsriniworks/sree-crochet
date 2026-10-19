// js/components/gallery.js — grid rendering driven by the store.
import { getVisibleProducts, state } from '../store.js';
import { productCardHtml } from './productCard.js';
import { escapeHtml } from '../utils.js';

/** Re-render the gallery to match current state. */
export function renderGallery(root) {
  if (state.loading) {
    root.innerHTML = `
      <div class="gallery-status" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <p>Loading the collection…</p>
      </div>`;
    return;
  }

  if (state.error) {
    root.innerHTML = `
      <div class="gallery-status gallery-status--error" role="alert">
        <p>${escapeHtml(state.error)}</p>
        <button class="btn btn-primary" id="retryBtn">Try again</button>
      </div>`;
    return;
  }

  const products = getVisibleProducts();
  if (products.length === 0) {
    root.innerHTML = `
      <div class="gallery-status">
        <p class="empty-emoji" aria-hidden="true">🧵</p>
        <p>No pieces match your search.</p>
        <p class="muted">Try a different keyword or category.</p>
      </div>`;
    return;
  }

  root.innerHTML = products
    .map((p, i) => productCardHtml(p, i))
    .join('');
}
