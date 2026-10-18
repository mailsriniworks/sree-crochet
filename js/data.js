// js/data.js
export async function loadProducts() {
  try {
    const res = await fetch('./data/products.json');
    if (!res.ok) throw new Error('Failed to load products');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}
