// js/components/cartDrawer.js — the basket drawer: lines, qty steppers,
// free-shipping progress, totals, checkout.
import { state, cartCount, cartSubtotal } from '../store.js';
import { escapeHtml, formatPrice, artStyle } from '../utils.js';

export const FREE_SHIPPING_AT = 75;
const SHIP_COST = 6;

/** Render (or hide) the cart drawer based on state.cartOpen. */
export function renderCart(panel, content) {
  const open = state.cartOpen;
  panel.classList.toggle('drawer--open', open);
  panel.setAttribute('aria-hidden', String(!open));
  if (!open) return;

  if (!state.cart.length) {
    content.innerHTML = `
      <div class="cart-empty">
        <p class="big" aria-hidden="true">🧺</p>
        <p>Your basket is empty.</p>
        <p class="muted">Every piece is made to order — it starts the moment you add it.</p>
      </div>`;
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIP_COST;
  const grand = subtotal + shipping;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_AT) * 100));
  const shipLabel = shipping === 0
    ? ' You’ve unlocked free shipping.'
    : `${formatPrice(FREE_SHIPPING_AT - subtotal)} away from free shipping.`;

  content.innerHTML = `
    <div>
      <p class="ship-bar-label">${shipLabel}</p>
      <div class="ship-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
    </div>

    <div class="cart-lines">
      ${state.cart
        .map((line) => {
          const p = state.products.find((x) => x.id === line.id);
          if (!p) return '';
          return `
        <div class="cart-item">
          <span class="cart-thumb" style="${artStyle(p.id)}" aria-hidden="true">${p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy" onerror="this.remove()" />` : ''}</span>
          <div>
            <p class="cart-name">${escapeHtml(p.title)}</p>
            <p class="cart-stitch">${escapeHtml(p.stitch ?? p.material)}</p>
            <div class="cart-qty" role="group" aria-label="Quantity for ${escapeHtml(p.title)}">
              <button data-qty-id="${escapeHtml(p.id)}" data-delta="-1" aria-label="Decrease quantity">−</button>
              <output>${line.qty}</output>
              <button data-qty-id="${escapeHtml(p.id)}" data-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-line-right">
            <span class="cart-line-price">${formatPrice(p.price * line.qty)}</span>
            <button class="cart-remove" data-remove-id="${escapeHtml(p.id)}">remove</button>
          </div>
        </div>`;
        })
        .join('')}
    </div>

    <div class="cart-totals">
      <div><span>Subtotal · ${cartCount()} items</span><span>${formatPrice(subtotal)}</span></div>
      <div><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
      <div class="grand"><span>Total</span><span>${formatPrice(grand)}</span></div>
    </div>

    <div class="cart-actions">
      <button class="btn btn-solid btn-block" id="checkoutBtn">Checkout · ${formatPrice(grand)}</button>
      <button class="cart-remove" id="clearCartBtn" style="justify-self:center">Clear basket</button>
    </div>
  `;
}
