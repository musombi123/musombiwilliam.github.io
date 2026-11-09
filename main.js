(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const $ = (selector, context = doc) => context.querySelector(selector);
  const $$ = (selector, context = doc) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  root.classList.add('js');

  // Theme: preserve the saved preference and keep the browser chrome in sync.
  const themeButton = $('#themeBtn');
  const applyTheme = theme => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f6f8fc' : '#0b1020';
    if (themeButton) {
      themeButton.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      themeButton.setAttribute('title', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  };
  const storedTheme = safeStorage.get('theme');
  const initialTheme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : (window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark');
  applyTheme(initialTheme);
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    safeStorage.set('theme', next);
  });

  // Mobile navigation, including Escape and link selection.
  const menuButton = $('#menuBtn');
  const nav = $('#navlinks');
  const setMenu = open => {
    if (!nav || !menuButton) return;
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuButton?.addEventListener('click', () => setMenu(!nav?.classList.contains('open')));
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });

  // Scroll progress and compact header state.
  const progress = $('.progress');
  const topbar = $('#topbar');
  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const scrollable = root.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
      topbar?.classList.toggle('scrolled', window.scrollY > 12);
      scrollQueued = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // IntersectionObserver enhancement with graceful fallback.
  const hasObserver = 'IntersectionObserver' in window;
  const navLinks = $$('#navlinks a');
  if (hasObserver && navLinks.length) {
    const linkMap = new Map(navLinks.map(link => [link.getAttribute('href')?.slice(1), link]));
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.remove('active'));
        linkMap.get(entry.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    linkMap.forEach((_, id) => {
      const section = doc.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  const revealItems = $$('.reveal');
  if (reduceMotion || !hasObserver) {
    revealItems.forEach(element => element.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((element, index) => {
      element.style.setProperty('--d', `${(index % 4) * 80}ms`);
      revealObserver.observe(element);
    });
  }

  // Count-up statistics.
  const animateCount = element => {
    const end = Number(element.dataset.count);
    if (!Number.isFinite(end)) return;
    if (reduceMotion || !hasObserver) { element.textContent = String(end); return; }
    const start = performance.now();
    const duration = 1200;
    const frame = now => {
      const progressValue = Math.min((now - start) / duration, 1);
      element.textContent = String(Math.round(end * (1 - Math.pow(1 - progressValue, 3))));
      if (progressValue < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const counters = $$('[data-count]');
  if (hasObserver) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    });
    counters.forEach(counter => countObserver.observe(counter));
  } else {
    counters.forEach(animateCount);
  }

  // Typewriter uses the words declared in the HTML, with a static fallback.
  const typed = $('#typed');
  if (typed && !reduceMotion) {
    let words;
    try {
      words = JSON.parse(typed.dataset.words || '[]').filter(word => typeof word === 'string' && word.length);
    } catch { words = []; }
    if (words.length) {
      let wordIndex = 0;
      let characterIndex = words[0].length;
      let deleting = true;
      const typeLoop = () => {
        const word = words[wordIndex];
        typed.textContent = word.slice(0, characterIndex);
        if (!deleting && characterIndex === word.length) {
          deleting = true;
          window.setTimeout(typeLoop, 1700);
          return;
        }
        if (deleting && characterIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        characterIndex += deleting ? -1 : 1;
        window.setTimeout(typeLoop, deleting ? 28 : 55);
      };
      window.setTimeout(typeLoop, 1800);
    }
  }

  // Accessible project image lightbox.
  const lightbox = $('#lightbox');
  const lightboxImage = lightbox ? $('img', lightbox) : null;
  const lightboxCaption = lightbox ? $('p', lightbox) : null;
  $$('.shot[data-full]').forEach(button => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) return;
      lightboxImage.src = button.dataset.full;
      lightboxImage.alt = button.dataset.cap || 'Project image preview';
      lightboxCaption.textContent = button.dataset.cap || '';
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
      else lightbox.setAttribute('open', '');
    });
  });
  $('.lb-close', lightbox || doc)?.addEventListener('click', () => {
    if (typeof lightbox?.close === 'function') lightbox.close();
    else lightbox?.removeAttribute('open');
  });
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) {
      if (typeof lightbox.close === 'function') lightbox.close();
      else lightbox.removeAttribute('open');
    }
  });

  // Copy email with a visible, accessible status message.
  const toast = $('#toast');
  const announce = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $('#copyMail')?.addEventListener('click', async () => {
    const email = 'musombiwilliam769@gmail.com';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(email);
      announce('Email copied to clipboard');
    } catch {
      announce(`Copy unavailable — ${email}`);
    }
  });

  const year = $('#yr');
  if (year) year.textContent = String(new Date().getFullYear());
})();