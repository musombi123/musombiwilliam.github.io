(() => {
  'use strict';
  const d = document, root = d.documentElement, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle (persisted)
  $('#themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    $('meta[name="theme-color"]').content = next === 'light' ? '#f6f8fc' : '#0b1020';
  });

  // Mobile menu
  const menuBtn = $('#menuBtn'), nav = $('#navlinks');
  const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  d.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  // Scroll: progress bar + header state
  const bar = $('.progress'), top = $('#topbar');
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const h = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      top.classList.toggle('scrolled', scrollY > 12);
      tick = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Active nav link
  const links = $$('#navlinks a'), map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = d.getElementById(id); s && spy.observe(s); });

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.setProperty('--d', `${(i % 4) * 80}ms`); io.observe(el); });

  // Count-up stats
  const count = el => {
    const end = +el.dataset.count; if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1200;
    const step = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); p < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }));
  $$('[data-count]').forEach(el => cio.observe(el));

  // Typewriter
  const typed = $('#typed');
  if (typed && !reduce) {
    const words = JSON.parse(typed.dataset.words); let w = 0, c = words[0].length, del = true;
    const loop = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(loop, 1800); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(loop, del ? 28 : 55);
    };
    setTimeout(loop, 2200);
  }

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('p', lb);
  $$('.shot').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.full; lbImg.alt = b.dataset.cap; lbCap.textContent = b.dataset.cap;
    lb.showModal ? lb.showModal() : lb.setAttribute('open', '');
  }));
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  // Copy email + toast
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); };
  $('#copyMail').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('musombiwilliam769@gmail.com'); say('Email copied to clipboard'); }
    catch (e) { say('Copy failed — musombiwilliam769@gmail.com'); }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
