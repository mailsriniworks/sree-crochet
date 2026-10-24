// js/config.js — where to buy, and how to reach the studio.
// Marketplace listings aren't live yet: links default to a brand search on
// each store, which works immediately and converts to real listing URLs by
// adding optional `amazon` / `flipkart` fields to any product in products.json.

export const STORE = {
  brand: 'Sree Crochet',
  email: 'hello@example.com',
  amazon: 'https://www.amazon.in/s?k=',
  flipkart: 'https://www.flipkart.com/search?q=',
};

/** Marketplace links for one product (direct URL wins, search is the bridge). */
export function marketplaceUrls(product) {
  const q = encodeURIComponent(`${STORE.brand} ${product.title}`.toLowerCase());
  return {
    amazon: product.amazon || `${STORE.amazon}${q}`,
    flipkart: product.flipkart || `${STORE.flipkart}${q}`,
  };
}

/** Whole-store search URL for a market ('amazon' | 'flipkart'). */
export function brandStoreUrl(market) {
  return `${STORE[market]}${encodeURIComponent(STORE.brand.toLowerCase())}`;
}
