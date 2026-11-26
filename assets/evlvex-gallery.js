/*
  EvlveX — small gallery helpers (loaded on every page from layout/theme.liquid).
  1. Product cards ([data-sd-gallery], sections/evlvex-drop-grid.liquid): on hover the card runs through its images
     (one per second); on touch screens a swipe changes the image. Dots show the current image.
  2. Product page gallery (Dawn media-gallery with thumbnails): adds previous / next arrows and an "1 / 3" counter on
     the main image on desktop, driving Dawn's own thumbnails so everything stays in sync.
  Nothing moves for visitors who prefer reduced motion (hover cycling is off; arrows and swipe still work).
*/
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. Product card hover gallery ----------
  const initCard = (media) => {
    if (media.dataset.sdReady) return;
    media.dataset.sdReady = '1';
    const slides = Array.from(media.querySelectorAll('.sd-item__slide'));
    const dots = Array.from(media.querySelectorAll('.sd-item__dots i'));
    if (slides.length < 2) return;
    let index = 0;
    let timer = null;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-on', n === index));
      dots.forEach((d, n) => d.classList.toggle('is-on', n === index));
    };
    const start = () => {
      if (reduced || timer) return;
      show(index + 1);
      timer = window.setInterval(() => show(index + 1), 1000);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = null;
      show(0);
    };
    const card = media.closest('.sd-item') || media;
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);

    let startX = null;
    media.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; }, { passive: true });
    media.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 30) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // A swipe should not open the product
    media.addEventListener('click', (e) => { if (media.dataset.sdSwiped) { e.preventDefault(); delete media.dataset.sdSwiped; } });
    media.addEventListener('pointermove', (e) => { if (startX !== null && Math.abs(e.clientX - startX) > 30) media.dataset.sdSwiped = '1'; }, { passive: true });
  };

  // ---------- 2. Product page: arrows on the main image ----------
  const initProductGallery = (gallery) => {
    if (gallery.dataset.sdArrows) return;
    const thumbs = Array.from(gallery.querySelectorAll('.thumbnail-list__item .thumbnail'));
    const wrapper = gallery.querySelector('slider-component[id^="GalleryViewer"]') || gallery.querySelector('.product__media-list')?.parentElement;
    if (thumbs.length < 2 || !wrapper) return;
    gallery.dataset.sdArrows = '1';
    const current = () => Math.max(0, thumbs.findIndex((t) => t.getAttribute('aria-current') === 'true'));
    const bar = document.createElement('div');
    bar.className = 'sd-gallery-nav';
    bar.innerHTML =
      '<button type="button" class="sd-gallery-nav__btn" data-dir="-1" aria-label="Previous image">←</button>' +
      '<span class="sd-gallery-nav__count" aria-hidden="true"></span>' +
      '<button type="button" class="sd-gallery-nav__btn" data-dir="1" aria-label="Next image">→</button>';
    wrapper.appendChild(bar);
    const count = bar.querySelector('.sd-gallery-nav__count');
    const update = () => { count.textContent = `${current() + 1} / ${thumbs.length}`; };
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dir]');
      if (!btn) return;
      const next = (current() + Number(btn.dataset.dir) + thumbs.length) % thumbs.length;
      thumbs[next].click();
      window.setTimeout(update, 50);
    });
    thumbs.forEach((t) => t.addEventListener('click', () => window.setTimeout(update, 50)));
    update();
  };

  const init = (root = document) => {
    root.querySelectorAll('[data-sd-gallery]').forEach(initCard);
    root.querySelectorAll('media-gallery').forEach(initProductGallery);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
