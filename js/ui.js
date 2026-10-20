// js/ui.js — all event wiring for the shop: search, filters, sort, wishlist,
// cart (add/qty/remove/checkout), drawers, newsletter, toasts, focus return.
import {
  state, setState, toggleFavorite,
  addToCart, setCartQty, clearCart, cartCount, cartSubtotal,
} from './store.js';
import { renderGallery } from './components/gallery.js';
import { renderDetailPanel } from './components/detailPanel.js';
import { renderCart, FREE_SHIPPING_AT } from './components/cartDrawer.js';
import { renderSections } from './components/sections.js';
import { initToast, toast } from './components/toast.js';
import { debounce, qsa, formatPrice } from './utils.js';

const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TITLES = {
  all: 'The <em>Collection</em>',
  clothing: 'The <em>Clothing</em> edit',
  home: 'The <em>Home</em> edit',
  accessories: 'The <em>Accessories</em> edit',
};

export function setupUI(dom) {
  initToast(dom.toastRoot);

  // ---- Single subscriber: re-render the shop from state ----
  let prevSelected = null;
  const rerender = () => {
    renderGallery(dom.gallery);
    renderDetailPanel(dom.panel, dom.panelContent);
    renderCart(dom.cartPanel, dom.cartContent);
    renderSections(dom);
    syncChips();
    syncCartBadge();
    syncTitle();
    syncResultCount();

    // One shared backdrop for both drawers.
    document.body.classList.toggle('drawer-open', state.cartOpen || !!state.selectedId);

    // Return focus to the opener when the product drawer closes (a11y).
    if (prevSelected && !state.selectedId && dom.lastFocus?.isConnected) {
      dom.lastFocus.focus({ preventScroll: true });
    }
    prevSelected = state.selectedId;
  };
  dom.subscribe(rerender);

  // ---- Search ----
  const onSearch = debounce((value) => setState({ search: value }), 180);
  dom.search.addEventListener('input', (e) => onSearch(e.target.value));

  // ---- Category controls (chips + big category cards) ----
  qsa('[data-category-chip]').forEach((el) => {
    el.addEventListener('click', () => {
      setState({ category: el.dataset.categoryChip, favOnly: false });
      if (el.classList.contains('cat-card')) {
        dom.gallery.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // ---- Saved view ----
  dom.savedChip.addEventListener('click', () => {
    const next = !state.favOnly;
    setState({ favOnly: next });
    if (next && !state.favorites.length) toast('Nothing saved yet — tap the ♥ on a piece', '🤍');
  });

  // ---- Sort ----
  dom.sort.addEventListener('change', (e) => setState({ sort: e.target.value }));

  // ---- Cart open/close ----
  dom.cartBtn.addEventListener('click', () => setState({ cartOpen: true, selectedId: null }));
  dom.closeCart.addEventListener('click', () => setState({ cartOpen: false }));

  const closeAll = () => setState({ cartOpen: false, selectedId: null });
  dom.backdrop.addEventListener('click', closeAll);
  dom.closePanel.addEventListener('click', () => setState({ selectedId: null }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (state.cartOpen || state.selectedId)) closeAll();
  });

  // ---- Delegated commerce clicks ----
  document.addEventListener('click', (e) => {
    // wishlist heart
    const fav = e.target.closest('[data-fav-id]');
    if (fav && fav.dataset.favId) {
      const wasFav = state.favorites.includes(fav.dataset.favId);
      toggleFavorite(fav.dataset.favId);
      const p = state.products.find((x) => x.id === fav.dataset.favId);
      toast(wasFav ? 'Removed from saved' : `Saved “${p?.title ?? 'piece'}”`, wasFav ? '🤍' : '♥');
      return;
    }

    // quick add from a card
    const add = e.target.closest('[data-add-id]');
    if (add) {
      addToCart(add.dataset.addId, 1);
      const p = state.products.find((x) => x.id === add.dataset.addId);
      toast(`Added “${p?.title ?? 'piece'}” to your basket`, '🧺');
      return;
    }

    // cart qty stepper
    const qty = e.target.closest('[data-qty-id]');
    if (qty) {
      const id = qty.dataset.qtyId;
      const line = state.cart.find((l) => l.id === id);
      if (line) setCartQty(id, line.qty + Number(qty.dataset.delta));
      return;
    }

    // remove line
    const rm = e.target.closest('[data-remove-id]');
    if (rm) {
      setCartQty(rm.dataset.removeId, 0);
      toast('Removed from basket', '🗑');
      return;
    }

    // product-drawer local qty stepper (DOM-only until add)
    const dq = e.target.closest('[data-qty-delta]');
    if (dq) {
      const out = dq.closest('.qty-stepper')?.querySelector('output');
      if (out) out.textContent = String(Math.min(9, Math.max(1, Number(out.textContent) + Number(dq.dataset.qtyDelta))));
      return;
    }

    // add to basket from drawer
    if (e.target.closest('#addToCartBtn')) {
      const qtyNow = Number(dom.detailQtyOut()?.textContent ?? 1);
      addToCart(state.selectedId, qtyNow);
      const p = state.products.find((x) => x.id === state.selectedId);
      toast(`Added ${qtyNow} × “${p?.title ?? 'piece'}”`, '🧺');
      return;
    }

    // buy now: add, then straight to the basket
    if (e.target.closest('#buyNowBtn')) {
      const qtyNow = Number(dom.detailQtyOut()?.textContent ?? 1);
      addToCart(state.selectedId, qtyNow);
      setState({ selectedId: null, cartOpen: true });
      return;
    }

    // checkout: draft the order by email (demo checkout)
    if (e.target.closest('#checkoutBtn')) {
      const lines = state.cart
        .map((l) => {
          const p = state.products.find((x) => x.id === l.id);
          return p ? `${l.qty} × ${p.title} — ${formatPrice(p.price * l.qty)}` : null;
        })
        .filter(Boolean)
        .join('\n');
      const subtotal = cartSubtotal();
      const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : 6;
      window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(
        'New order — Sree Crochet'
      )}&body=${encodeURIComponent(
        `Hi Sree! I'd like to order:\n\n${lines}\n\nSubtotal: ${formatPrice(subtotal)}\nShipping: ${shipping ? formatPrice(shipping) : 'Free'}\nTotal: ${formatPrice(subtotal + shipping)}\n\n(Custom colors or notes: )`
      )}`;
      toast('Order summary opened in your mail app', '✉️');
      return;
    }

    if (e.target.closest('#clearCartBtn')) {
      clearCart();
      toast('Basket cleared', '🧺');
      return;
    }

    // retry after a failed catalogue load
    if (e.target.closest('#retryBtn')) {
      dom.retry?.();
      return;
    }

    // open product drawer (cards, related items)
    const card = e.target.closest('[data-product-id]');
    if (card) {
      dom.lastFocus = card;
      setState({ selectedId: card.dataset.productId, cartOpen: false });
    }
  });

  // ---- Keyboard: Enter/Space opens a focused card or the hero figure ----
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const fig = e.target.closest('#heroFig');
    if (fig && e.target === fig && fig.dataset.productId) {
      e.preventDefault();
      dom.lastFocus = fig;
      setState({ selectedId: fig.dataset.productId });
      return;
    }
    const card = e.target.closest('[data-product-id]');
    if (card && dom.gallery.contains(card) && e.target === card) {
      e.preventDefault();
      dom.lastFocus = card;
      setState({ selectedId: card.dataset.productId });
    }
  });

  // ---- Hero cycle controls (breakout figure arrows) ----
  const stepHero = (dir) => setState({ heroIndex: state.heroIndex + dir });
  dom.heroNext?.addEventListener('click', (e) => { e.stopPropagation(); stepHero(1); });
  dom.heroInsetBtn?.addEventListener('click', () => stepHero(1));

  // ---- Newsletter ----
  dom.newsletter.addEventListener('submit', (e) => {
    e.preventDefault();
    dom.newsletter.reset();
    toast('Welcome to the studio list 🧶', '✉️');
  });

  // ---- Sync helpers ----
  function syncChips() {
    qsa('[data-category-chip]').forEach((el) => {
      el.setAttribute('aria-pressed', String(!state.favOnly && el.dataset.categoryChip === state.category));
    });
    dom.savedChip.setAttribute('aria-pressed', String(state.favOnly));
  }

  function syncCartBadge() {
    const n = cartCount();
    dom.cartCount.hidden = n === 0;
    dom.cartCount.textContent = String(n);
    dom.cartCountLabel.textContent = n ? `· ${n} ${n === 1 ? 'item' : 'items'}` : '';
  }

  function syncTitle() {
    dom.collectionTitle.innerHTML = state.favOnly ? 'Your <em>saved pieces</em>' : (TITLES[state.category] ?? TITLES.all);
  }

  function syncResultCount() {
    const n = qsa('.p-card', dom.gallery).length;
    dom.resultCount.textContent = state.loading
      ? 'Loading the collection…'
      : state.error
        ? ''
        : `Showing ${n} ${n === 1 ? 'piece' : 'pieces'}${state.favOnly ? ' from your saved list' : ''} · made to order, ships in ~2 weeks`;
  }

  rerender();
}
