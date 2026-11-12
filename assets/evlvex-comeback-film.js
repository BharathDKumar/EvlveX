/*
  EvlveX — <evlvex-comeback-film> (sections/evlvex-comeback-film.liquid).
  Plays scenes like a film: a timer (with remaining-time tracking, so pause/resume continue where they left off)
  drives the 3D scene turn; the timeline fill and camera move are CSS animations paused with the same state.
  Pauses on keyboard focus, hidden tab, off-screen and theme-editor block selection; starts paused under
  prefers-reduced-motion. Pointer tilt (fine pointers only), touch swipe, arrow keys. Every listener is bound to an
  AbortController aborted on disconnect, so theme-editor section reloads never duplicate listeners.
*/
if (!customElements.get('evlvex-comeback-film')) {
  class EvlvexComebackFilm extends HTMLElement {
    connectedCallback() {
      this.scenes = Array.from(this.querySelectorAll('.evx-film__scene'));
      if (this.scenes.length === 0) return;

      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      this.chapters = Array.from(this.querySelectorAll('[data-evx-goto]'));
      this.counter = this.querySelector('[data-evx-film-current]');
      this.toggleButton = this.querySelector('[data-evx-film-toggle]');
      this.live = this.querySelector('.evx-film__scenes');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

      this.duration = Math.max(3, Number(this.dataset.speed) || 7) * 1000;
      // Playback is possible with 2+ scenes; it only starts on its own when the section's autoplay is on.
      this.canAutoplay = this.scenes.length > 1;
      this.index = 0;
      this.timer = null;
      this.remaining = this.duration;
      this.startedAt = 0;
      this.state = {
        userPaused: this.reducedMotion.matches || this.dataset.autoplay !== 'true',
        focused: false,
        inView: true,
        hidden: document.hidden,
        editor: false,
      };

      this.querySelector('[data-evx-film-prev]')?.addEventListener('click', () => this.step(-1), { signal });
      this.querySelector('[data-evx-film-next]')?.addEventListener('click', () => this.step(1), { signal });
      this.chapters.forEach((button) =>
        button.addEventListener('click', () => this.goTo(Number(button.dataset.evxGoto)), { signal })
      );
      this.toggleButton?.addEventListener('click', () => this.setUserPaused(!this.state.userPaused), { signal });

      this.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); this.step(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); this.step(-1); }
      }, { signal });

      this.addEventListener('focusin', (event) => {
        if (event.target !== this.toggleButton && event.target.matches(':focus-visible')) this.setState({ focused: true });
      }, { signal });
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.setState({ focused: false });
      }, { signal });

      document.addEventListener('visibilitychange', () => this.setState({ hidden: document.hidden }), { signal });
      this.reducedMotion.addEventListener('change', (event) => { if (event.matches) this.setUserPaused(true); }, { signal });

      this.viewObserver = new IntersectionObserver(([entry]) => this.setState({ inView: entry.isIntersecting }), { threshold: 0.3 });
      this.viewObserver.observe(this);

      // 3D tilt following the pointer (desktop only).
      this.addEventListener('pointermove', (event) => this.onPointerMove(event), { signal });
      this.addEventListener('pointerleave', () => this.setTilt(0, 0), { signal });

      // Touch swipe.
      this.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        this.swipeStart = { x: event.clientX, y: event.clientY };
      }, { signal });
      this.addEventListener('pointerup', (event) => {
        if (!this.swipeStart) return;
        const dx = event.clientX - this.swipeStart.x;
        const dy = event.clientY - this.swipeStart.y;
        this.swipeStart = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) this.step(dx < 0 ? 1 : -1);
      }, { signal });

      // Theme editor.
      document.addEventListener('shopify:block:select', (event) => {
        const i = this.scenes.indexOf(event.target);
        if (i === -1) return;
        this.state.editor = true;
        this.goTo(i);
      }, { signal });
      document.addEventListener('shopify:block:deselect', (event) => {
        if (this.scenes.includes(event.target)) this.setState({ editor: false });
      }, { signal });

      // Fit the first screen: subtract whatever sits above the film (announcement bar, header) when it opens the page.
      const measureTop = () => {
        const top = this.getBoundingClientRect().top + window.scrollY;
        this.style.setProperty('--evx-film-top', top < window.innerHeight * 0.5 ? `${Math.round(top)}px` : '0px');
      };
      measureTop();
      window.addEventListener('resize', measureTop, { signal });
      window.addEventListener('load', measureTop, { signal, once: true });

      this.show(0, { initial: true });
      this.updateToggle();
      this.update();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.viewObserver?.disconnect();
      clearTimeout(this.timer);
      this.timer = null;
      cancelAnimationFrame(this.tiltFrame);
    }

    get playing() {
      const { userPaused, focused, inView, hidden, editor } = this.state;
      return this.canAutoplay && !userPaused && !focused && inView && !hidden && !editor;
    }

    step(delta) {
      this.goTo(this.index + delta, delta < 0 ? 'back' : 'forward');
    }

    goTo(target, dir) {
      const count = this.scenes.length;
      const i = ((target % count) + count) % count;
      if (i === this.index) return;
      this.dataset.dir = dir || (i > this.index ? 'forward' : 'back');
      this.show(i);
    }

    show(i, { initial = false } = {}) {
      const previous = this.scenes[this.index];
      this.index = i;
      this.scenes.forEach((scene, n) => {
        const active = n === i;
        scene.classList.toggle('is-leaving', !initial && scene === previous && !active);
        if (active) {
          // Restart the camera move and copy reveal for the incoming scene.
          scene.classList.remove('is-active');
          void scene.offsetWidth;
        }
        scene.classList.toggle('is-active', active);
        scene.inert = !active;
      });
      window.clearTimeout(this.leaveTimer);
      this.leaveTimer = window.setTimeout(() => previous?.classList.remove('is-leaving'), 1300);

      this.classList.toggle('is-light', this.scenes[i].classList.contains('evx-film__scene--light'));
      if (this.counter) this.counter.textContent = String(i + 1).padStart(2, '0');

      this.chapters.forEach((chapter, n) => {
        chapter.setAttribute('aria-current', n === i ? 'true' : 'false');
        chapter.classList.toggle('is-done', n < i);
        chapter.classList.remove('is-playing', 'is-static');
      });
      const current = this.chapters[i];
      if (current) {
        void current.offsetWidth;
        current.classList.add(this.canAutoplay ? 'is-playing' : 'is-static');
      }
      this.setTilt(0, 0);

      // Warm up the next scene's images.
      this.scenes[(i + 1) % this.scenes.length]?.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });

      this.remaining = this.duration;
      this.restartTimer();
    }

    // ---------- Playback ----------
    setState(patch) {
      Object.assign(this.state, patch);
      this.update();
    }

    setUserPaused(paused) {
      this.state.userPaused = paused;
      this.updateToggle();
      this.update();
    }

    update() {
      const playing = this.playing;
      this.classList.toggle('is-paused', !playing);
      this.classList.toggle('is-user-paused', this.state.userPaused);
      this.live?.setAttribute('aria-live', playing ? 'off' : 'polite');
      if (playing && !this.timer) this.startTimer();
      if (!playing && this.timer) this.stopTimer();
    }

    startTimer() {
      this.startedAt = performance.now();
      this.timer = window.setTimeout(() => {
        this.timer = null;
        this.dataset.dir = 'forward';
        this.show((this.index + 1) % this.scenes.length);
      }, this.remaining);
    }

    stopTimer() {
      window.clearTimeout(this.timer);
      this.timer = null;
      this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt));
    }

    restartTimer() {
      window.clearTimeout(this.timer);
      this.timer = null;
      if (this.playing) this.startTimer();
    }

    updateToggle() {
      if (!this.toggleButton) return;
      const paused = this.state.userPaused;
      this.toggleButton.setAttribute('aria-label', paused ? this.toggleButton.dataset.labelPlay : this.toggleButton.dataset.labelPause);
    }

    // ---------- 3D tilt ----------
    onPointerMove(event) {
      if (!this.finePointer.matches || this.reducedMotion.matches) return;
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      this.setTilt(-y * 8, x * 12);
    }

    setTilt(rx, ry) {
      cancelAnimationFrame(this.tiltFrame);
      this.tiltFrame = requestAnimationFrame(() => {
        const visual = this.scenes[this.index]?.querySelector('.evx-film__visual');
        if (!visual) return;
        visual.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        visual.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      });
    }
  }

  customElements.define('evlvex-comeback-film', EvlvexComebackFilm);
}
