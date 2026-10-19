// js/components/themeToggle.js — light/dark theme with localStorage persistence.
import { state, setState } from './store.js';

const STORAGE_KEY = '***';

/** Apply the current theme to <html>, the nav icon, and its label. */
function applyTheme(button) {
  document.documentElement.dataset.theme = state.theme;
  const icon = button.querySelector('.nav-ico');
  const label = document.getElementById('themeLabel');
  if (icon) icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  if (label) label.textContent = state.theme === 'dark' ? 'Day mode' : 'Night mode';
  button.setAttribute(
    'aria-label',
    state.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  );
}

/** Initialize the theme: stored preference → system preference → light. */
export function initTheme(button) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  setState({ theme: stored ?? (prefersDark ? 'dark' : 'light') });
  applyTheme(button);

  button.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    setState({ theme: next });
    applyTheme(button);
  });
}
