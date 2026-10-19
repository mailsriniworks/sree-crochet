// js/data.js — data loading layer.

const PRODUCTS_URL = './data/products.json';

/** Fetch the product catalogue. Throws on network/parse failure. */
export async function loadProducts() {
  const res = await fetch(PRODUCTS_URL, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Failed to load catalogue (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected catalogue format: expected an array');
  }
  return data;
}
