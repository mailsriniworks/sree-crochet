// js/components/toast.js — lightweight toast notifications (aria-live root).
let root = null;

/** Bind the toast container element (call once at bootstrap). */
export function initToast(el) {
  root = el;
}

/** Show a brief toast. Auto-dismisses after ~2.4s. */
export function toast(message, icon = '✓') {
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span aria-hidden="true">${icon}</span><span class="toast-msg"></span>`;
  el.querySelector('.toast-msg').textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2400);
}
