// js/scrollFx.js — scroll-linked polish: reveal-on-scroll + back-to-top.
// All motion stands down when the user prefers reduced motion.

const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function initScrollFx(dom) {
  // ---- Reveal sections as they enter the viewport ----
  const targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !REDUCED) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add('is-visible'));
  }

  // ---- Back-to-top (rAF-throttled scroll listener) ----
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      dom.toTop.classList.toggle('show', window.scrollY > 600);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  dom.toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  });
}
