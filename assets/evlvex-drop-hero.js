/*
  EvlveX — Street Drop hero carousel (sections/evlvex-drop-hero.liquid).
  Autoplay (data-autoplay, data-speed in seconds), dots, swipe on touch screens, arrow keys when focused.
  Pauses on hover, keyboard focus, when the tab is hidden or the hero is scrolled away; never autoplays for
  visitors who prefer reduced motion. Only the active slide is exposed to assistive tech and the tab order.
*/
if (!customElements.get('evlvex-drop-hero')) {
  customElements.define(
    'evlvex-drop-hero',
    class EvlvexDropHero extends HTMLElement {
      connectedCallback() {
        this.slides = Array.from(this.querySelectorAll('.sd-slide'));
        this.dots = Array.from(this.querySelectorAll('[data-sd-goto]'));
        this.index = 0;
        this.duration = Math.max(4, Number(this.dataset.speed) || 8) * 1000;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.canAutoplay = this.dataset.autoplay === 'true' && this.slides.length > 1 && !this.reducedMotion.matches;
        this.hovered = false;
        this.focused = false;
        this.inView = true;
        this.abort = new AbortController();
        const signal = this.abort.signal;

        this.setTop();
        window.addEventListener('resize', () => this.setTop(), { signal, passive: true });

        this.dots.forEach((dot) =>
          dot.addEventListener('click', () => this.goTo(Number(dot.dataset.sdGoto)), { signal })
        );
        this.addEventListener('mouseenter', () => this.setFlag('hovered', true), { signal });
        this.addEventListener('mouseleave', () => this.setFlag('hovered', false), { signal });
        this.addEventListener('focusin', () => this.setFlag('focused', true), { signal });
        this.addEventListener('focusout', (event) => {
          if (!this.contains(event.relatedTarget)) this.setFlag('focused', false);
        }, { signal });
        this.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowRight') this.goTo(this.index + 1);
          if (event.key === 'ArrowLeft') this.goTo(this.index - 1);
        }, { signal });
        document.addEventListener('visibilitychange', () => this.schedule(), { signal });

        // Swipe (touch and pen)
        let startX = null;
        this.addEventListener('pointerdown', (event) => {
          if (event.pointerType !== 'mouse') startX = event.clientX;
        }, { signal, passive: true });
        this.addEventListener('pointerup', (event) => {
          if (startX === null) return;
          const dx = event.clientX - startX;
          startX = null;
          if (Math.abs(dx) > 40) this.goTo(this.index + (dx < 0 ? 1 : -1));
        }, { signal, passive: true });

        if ('IntersectionObserver' in window) {
          this.observer = new IntersectionObserver((entries) => {
            this.inView = entries[0].isIntersecting;
            this.schedule();
          });
          this.observer.observe(this);
        }

        this.goTo(0);
      }

      disconnectedCallback() {
        this.abort?.abort();
        this.observer?.disconnect();
        window.clearTimeout(this.timer);
      }

      setTop() {
        const top = this.getBoundingClientRect().top + window.scrollY;
        this.style.setProperty('--sd-hero-top', `${Math.max(0, Math.round(top))}px`);
      }

      setFlag(name, value) {
        this[name] = value;
        this.schedule();
      }

      goTo(i) {
        const total = this.slides.length;
        if (!total) return;
        this.index = ((i % total) + total) % total;
        this.slides.forEach((slide, n) => {
          const active = n === this.index;
          slide.classList.toggle('is-active', active);
          if (active) slide.removeAttribute('aria-hidden');
          else slide.setAttribute('aria-hidden', 'true');
          slide.querySelectorAll('.sd-pill').forEach((link) => {
            if (active) link.removeAttribute('tabindex');
            else link.setAttribute('tabindex', '-1');
          });
        });
        this.dots.forEach((dot, n) => {
          if (n === this.index) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        // A manual change restarts the timer so the chosen slide gets its full length.
        this.schedule();
      }

      schedule() {
        window.clearTimeout(this.timer);
        const playing = this.canAutoplay && !this.hovered && !this.focused && this.inView && !document.hidden;
        if (playing) this.timer = window.setTimeout(() => this.goTo(this.index + 1), this.duration);
      }
    }
  );
}
