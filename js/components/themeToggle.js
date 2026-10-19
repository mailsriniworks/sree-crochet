// js/components/themeToggle.js — light/dark theme with localStorage persistence.
import { state, setState } from '../store.js';

const STORAGE_KEY = 'sree-crochet-theme';

/** Apply the current theme to <html> and the toggle button label. */
function applyTheme(button) {
  document.documentElement.dataset.theme = state.theme;
  button.textContent = state.theme === 'dark' ? '☀️' : '🌙';
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
