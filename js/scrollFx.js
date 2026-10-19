// js/scrollFx.js — scroll-linked polish: reveal-on-scroll, condensing sticky
// header, back-to-top button, and gentle hero parallax. All motion is skipped
// when the user prefers reduced motion.

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

  // ---- Condensing header + back-to-top + parallax (rAF-throttled) ----
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      dom.topbar.classList.toggle('topbar--compact', y > 24);
      dom.toTop.classList.toggle('show', y > 600);
      if (!REDUCED && dom.heroVisual) {
        dom.heroVisual.style.transform = `translateY(${Math.min(y * 0.05, 36)}px)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  dom.toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  });
}
