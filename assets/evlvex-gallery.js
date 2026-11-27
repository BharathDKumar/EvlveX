/*
  EvlveX — small gallery helpers (loaded on every page from layout/theme.liquid).
  1. Product cards ([data-sd-gallery]): "The drop" cards (sections/evlvex-drop-grid.liquid) and Dawn product cards on
     the collection, search and related-products grids (snippets/card-product.liquid). On hover the card runs
     through its images (one per second); on touch screens a swipe changes the image. Dots show the current image.
  2. Product page gallery (Dawn media-gallery with thumbnails): adds previous / next arrows and an "1 / 3" counter on
     the main image on desktop, driving Dawn's own thumbnails so everything stays in sync. The images also change on
     their own every 4 seconds while the main image is fully on screen; this pauses on hover, keyboard focus, while
     the zoom is open or the tab is hidden, and restarts its count after any arrow, thumbnail or swipe.
  Nothing moves on its own for visitors who prefer reduced motion (arrows and swipe still work).
*/
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 750px)');
  const AUTOPLAY_MS = 4000;

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
    const card = media.closest('.sd-item, .card-wrapper') || media;
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);

    // Swipe on the whole card: on Dawn cards the product link's overlay sits above the image
    // Vertical scrolling stays with the browser; horizontal moves come to us instead of a pointercancel
    card.style.touchAction = 'pan-y';
    let startX = null;
    let startY = null;
    const isSwipe = (e) => Math.abs(e.clientX - startX) > 30 && Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY);
    card.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { startX = e.clientX; startY = e.clientY; } }, { passive: true });
    card.addEventListener('pointermove', (e) => { if (startX !== null && isSwipe(e)) media.dataset.sdSwiped = '1'; }, { passive: true });
    card.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const swipe = isSwipe(e);
      startX = null;
      if (swipe) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    card.addEventListener('pointercancel', () => { startX = null; }, { passive: true });
    // A swipe should not open the product
    card.addEventListener('click', (e) => { if (media.dataset.sdSwiped) { e.preventDefault(); delete media.dataset.sdSwiped; } }, true);
  };

  // ---------- 2. Product page: arrows on the main image, and autoplay ----------
  const initProductGallery = (gallery) => {
    if (gallery.dataset.sdArrows) return;
    const thumbs = Array.from(gallery.querySelectorAll('.thumbnail-list__item .thumbnail'));
    const wrapper = gallery.querySelector('slider-component[id^="GalleryViewer"]') || gallery.querySelector('.product__media-list')?.parentElement;
    if (thumbs.length < 2 || !wrapper) return;
    gallery.dataset.sdArrows = '1';
    // Desktop shows one image at a time and Dawn marks its thumbnail; on phones the visible slide is the slider's page
    const current = () => {
      if (!desktop.matches && wrapper.currentPage) return Math.min(thumbs.length - 1, Math.max(0, wrapper.currentPage - 1));
      return Math.max(0, thumbs.findIndex((t) => t.getAttribute('aria-current') === 'true'));
    };
    const bar = document.createElement('div');
    bar.className = 'sd-gallery-nav';
    bar.innerHTML =
      '<button type="button" class="sd-gallery-nav__btn" data-dir="-1" aria-label="Previous image">←</button>' +
      '<span class="sd-gallery-nav__count" aria-hidden="true"></span>' +
      '<button type="button" class="sd-gallery-nav__btn" data-dir="1" aria-label="Next image">→</button>';
    wrapper.appendChild(bar);
    const count = bar.querySelector('.sd-gallery-nav__count');
    const update = () => { count.textContent = `${current() + 1} / ${thumbs.length}`; };
    const step = (dir) => {
      const next = (current() + dir + thumbs.length) % thumbs.length;
      thumbs[next].click();
      window.setTimeout(update, 50);
    };

    // Autoplay
    let timer = null;
    let hovered = false;
    let focused = false;
    const fullyInView = () => {
      const active = wrapper.querySelector('.product__media-item.is-active') || wrapper;
      const r = active.getBoundingClientRect();
      // Dawn scrolls the window back to the image if it is above the screen, so only move when it is all in view
      return r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 1;
    };
    const tick = () => {
      if (hovered || focused || document.hidden || document.querySelector('product-modal[open]') || !fullyInView()) return;
      step(1);
    };
    const restart = () => {
      if (reduced) return;
      window.clearInterval(timer);
      timer = window.setInterval(tick, AUTOPLAY_MS);
    };

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dir]');
      if (!btn) return;
      step(Number(btn.dataset.dir));
      restart();
    });
    thumbs.forEach((t) => t.addEventListener('click', (e) => {
      window.setTimeout(update, 50);
      if (e.isTrusted) restart();
    }));
    gallery.addEventListener('mouseenter', () => { hovered = true; });
    gallery.addEventListener('mouseleave', () => { hovered = false; });
    // Keyboard focus only: a mouse click on a thumbnail also focuses it, and that should not stop the autoplay
    gallery.addEventListener('focusin', (e) => { focused = e.target.matches(':focus-visible'); });
    gallery.addEventListener('focusout', (e) => { if (!gallery.contains(e.relatedTarget)) focused = false; });
    // A swipe on phones
    wrapper.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') restart(); }, { passive: true });
    update();
    restart();
  };

  const init = (root = document) => {
    root.querySelectorAll('[data-sd-gallery]').forEach(initCard);
    root.querySelectorAll('media-gallery').forEach(initProductGallery);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
