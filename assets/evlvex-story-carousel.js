/*
  EvlveX — <evlvex-story-carousel> (sections/evlvex-story-carousel.liquid).
  Native scroll-snap carousel: arrows, dots, swipe (native scrolling), keyboard, optional autoplay.
  Autoplay pauses on hover, keyboard focus, hidden tab, off-screen and in the theme editor; it starts
  paused for visitors who prefer reduced motion. Every listener is bound to an AbortController that is
  aborted on disconnect, so theme-editor section reloads never leave duplicate listeners behind.
*/
if (!customElements.get('evlvex-story-carousel')) {
  class EvlvexStoryCarousel extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('.evx-carousel__track');
      this.slides = this.track ? Array.from(this.track.querySelectorAll(':scope > .evx-carousel__slide')) : [];
      if (this.slides.length === 0) return;

      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      this.index = 0;
      this.prevButton = this.querySelector('[data-evx-prev]');
      this.nextButton = this.querySelector('[data-evx-next]');
      this.toggleButton = this.querySelector('[data-evx-toggle]');
      this.dots = Array.from(this.querySelectorAll('[data-evx-dot]'));
      this.counter = this.querySelector('[data-evx-current]');

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.autoplayEnabled = this.dataset.autoplay === 'true' && this.slides.length > 1;
      this.interval = Math.max(3, Number(this.dataset.speed) || 7) * 1000;
      this.timer = null;
      this.state = {
        userPaused: this.reducedMotion.matches,
        hovered: false,
        focused: false,
        inView: false,
        editorSelected: false,
      };

      this.prevButton?.addEventListener('click', () => this.step(-1), { signal });
      this.nextButton?.addEventListener('click', () => this.step(1), { signal });
      this.dots.forEach((dot) =>
        dot.addEventListener('click', () => this.goTo(Number(dot.dataset.evxDot), { user: true }), { signal })
      );
      this.toggleButton?.addEventListener('click', () => this.setUserPaused(!this.state.userPaused), { signal });
      this.addEventListener('keydown', (event) => this.onKeydown(event), { signal });

      if (this.autoplayEnabled) {
        this.addEventListener('mouseenter', () => this.setState({ hovered: true }), { signal });
        this.addEventListener('mouseleave', () => this.setState({ hovered: false }), { signal });
        this.addEventListener(
          'focusin',
          (event) => {
            if (event.target === this.toggleButton) return;
            if (event.target.matches(':focus-visible')) this.setState({ focused: true });
          },
          { signal }
        );
        this.addEventListener(
          'focusout',
          (event) => {
            if (!this.contains(event.relatedTarget)) this.setState({ focused: false });
          },
          { signal }
        );
        document.addEventListener('visibilitychange', () => this.updateAutoplay(), { signal });
        this.reducedMotion.addEventListener('change', (event) => this.setUserPaused(event.matches), { signal });

        this.viewObserver = new IntersectionObserver(
          ([entry]) => this.setState({ inView: entry.isIntersecting }),
          { threshold: 0.25 }
        );
        this.viewObserver.observe(this);
      }

      // Theme editor: show the selected slide and hold it while the block is selected.
      document.addEventListener(
        'shopify:block:select',
        (event) => {
          const i = this.slides.indexOf(event.target);
          if (i === -1) return;
          this.setState({ editorSelected: true });
          this.goTo(i, { instant: true });
        },
        { signal }
      );
      document.addEventListener(
        'shopify:block:deselect',
        (event) => {
          if (this.slides.includes(event.target)) this.setState({ editorSelected: false });
        },
        { signal }
      );

      // The slide that fills most of the track is the current one (covers swipe, trackpad and buttons).
      this.slideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              this.setActive(this.slides.indexOf(entry.target));
            }
          });
        },
        { root: this.track, threshold: [0.6] }
      );
      this.slides.forEach((slide) => this.slideObserver.observe(slide));

      this.setActive(0, true);
      this.updateToggle();
      this.updateAutoplay();
      this.classList.add('is-ready');
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.slideObserver?.disconnect();
      this.viewObserver?.disconnect();
      this.stopTimer();
    }

    step(delta) {
      this.goTo(this.index + delta, { user: true });
    }

    goTo(target, { instant = false, user = false } = {}) {
      const count = this.slides.length;
      const i = ((target % count) + count) % count;
      const rtl = getComputedStyle(this.track).direction === 'rtl';
      const smooth = !instant && !this.reducedMotion.matches;
      this.track.scrollTo({
        left: (rtl ? -1 : 1) * this.slides[i].offsetWidth * i,
        behavior: smooth ? 'smooth' : 'auto',
      });
      this.setActive(i);
      if (user && this.timer) this.restartTimer();
    }

    setActive(i, force = false) {
      if (i < 0 || (i === this.index && !force)) return;
      this.index = i;
      this.slides.forEach((slide, n) => {
        const active = n === i;
        slide.classList.toggle('is-active', active);
        slide.inert = !active;
      });
      this.dots.forEach((dot, n) => dot.setAttribute('aria-current', n === i ? 'true' : 'false'));
      if (this.counter) this.counter.textContent = String(i + 1).padStart(2, '0');

      // Warm up the next slide's image so a swipe never reveals an empty frame.
      const next = this.slides[(i + 1) % this.slides.length];
      next?.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
    }

    onKeydown(event) {
      if (event.target.closest('input, textarea, select')) return;
      const keys = { ArrowLeft: -1, ArrowRight: 1 };
      if (event.key in keys) {
        event.preventDefault();
        const rtl = getComputedStyle(this.track).direction === 'rtl';
        this.step(rtl ? -keys[event.key] : keys[event.key]);
      } else if (event.key === 'Home' || event.key === 'End') {
        if (!event.target.closest('.evx-carousel__controls')) return;
        event.preventDefault();
        this.goTo(event.key === 'Home' ? 0 : this.slides.length - 1, { user: true });
      }
    }

    setState(patch) {
      Object.assign(this.state, patch);
      this.updateAutoplay();
    }

    setUserPaused(paused) {
      this.state.userPaused = paused;
      this.updateToggle();
      this.updateAutoplay();
    }

    updateToggle() {
      if (!this.toggleButton) return;
      const paused = this.state.userPaused;
      this.toggleButton.classList.toggle('is-paused', paused);
      this.toggleButton.setAttribute(
        'aria-label',
        paused ? this.toggleButton.dataset.labelPlay : this.toggleButton.dataset.labelPause
      );
    }

    updateAutoplay() {
      if (!this.autoplayEnabled) return;
      const { userPaused, hovered, focused, inView, editorSelected } = this.state;
      const play = !userPaused && !hovered && !focused && inView && !editorSelected && !document.hidden;
      if (play) {
        if (!this.timer) this.startTimer();
      } else {
        this.stopTimer();
      }
      this.track.setAttribute('aria-live', play ? 'off' : 'polite');
    }

    startTimer() {
      this.timer = window.setInterval(() => this.goTo(this.index + 1), this.interval);
    }

    stopTimer() {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    restartTimer() {
      this.stopTimer();
      this.startTimer();
    }
  }

  customElements.define('evlvex-story-carousel', EvlvexStoryCarousel);
}
