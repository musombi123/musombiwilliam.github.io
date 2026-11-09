(() => {
  "use strict";

  // Homepage-only controls. Shared animation, counters, lightbox, clipboard,
  // theme system, progress and cross-page navigation are owned by site.js.
  const doc = document;
  const root = doc.documentElement;
  const themeButton = doc.querySelector("#themeBtn");
  const menuButton = doc.querySelector("#menuBtn");
  const nav = doc.querySelector("#navlinks");
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  if (themeButton) {
    const applyTheme = (theme) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      themeButton.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      themeButton.setAttribute("title", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    };
    const saved = storage.get("theme");
    const initial = saved === "light" || saved === "dark"
      ? saved
      : (window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark");
    applyTheme(initial);
    themeButton.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      storage.set("theme", next);
    });
  }

  if (menuButton && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  // site.js supplies the shared current-year, typewriter, reveal and lightbox
  // behaviours. This marker makes the homepage integration easy to diagnose.
  doc.documentElement.classList.add("portfolio-home-runtime");
})();