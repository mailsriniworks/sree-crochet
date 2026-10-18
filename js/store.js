// js/store.js — simple state management
export const Store = {
  products: [],
  query: '',
  category: 'all',
  theme: localStorage.getItem('hc_theme') || 'dark',
  selected: null,

  setProducts(p) { this.products = p },
  setQuery(q) { this.query = q },
  setCategory(c) { this.category = c },
  setSelected(s) { this.selected = s },
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hc_theme', this.theme);
  }
};
