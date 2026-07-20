(() => {
  const GITHUB_URL = "https://github.com/Datwebguy/Metiora";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme: dark default, respect saved preference */
  const root = document.documentElement;
  const stored = localStorage.getItem("metiora-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = stored === "light" || stored === "dark" ? stored : prefersLight ? "light" : "dark";
  root.setAttribute("data-theme", initial);

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("metiora-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#050505" : "#f4f6f2");
  };
  setTheme(initial);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  });

  /* GitHub links */
  document.querySelectorAll("[data-github]").forEach((el) => {
    if (el.tagName === "A") el.setAttribute("href", GITHUB_URL);
  });

  /* Sticky nav */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /**
   * In-page section links (About, Services, …) used to leave #services etc. in the URL.
   * That is normal HTML anchor behavior. We scroll smoothly and keep the address bar clean
   * (pathname only) so the bar stays agentmetiora.xyz/ while still jumping to the section.
   */
  const cleanUrlPath = () => {
    const path = window.location.pathname + window.location.search;
    if (window.location.hash || window.location.href.endsWith("#")) {
      history.replaceState(null, "", path || "/");
    }
  };

  const scrollToSection = (id) => {
    if (!id) return false;
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      cleanUrlPath();
      return true;
    }
    const el = document.getElementById(id);
    if (!el) return false;
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    cleanUrlPath();
    return true;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("target") === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = decodeURIComponent(href.slice(1));
    if (!id) return;
    // Only intercept if the target exists on this page
    if (id !== "top" && !document.getElementById(id)) return;
    e.preventDefault();
    scrollToSection(id);
    const drawerEl = document.querySelector(".nav-drawer");
    const toggleEl = document.querySelector(".nav-toggle");
    if (drawerEl) drawerEl.classList.remove("is-open");
    if (toggleEl) toggleEl.setAttribute("aria-expanded", "false");
  });

  // Shared links like /#services still open the right section, then drop the hash from the bar
  if (window.location.hash) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    requestAnimationFrame(() => {
      scrollToSection(id);
    });
  }

  /* Mobile drawer */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Parallax orbs */
  if (!reduceMotion) {
    const orbs = document.querySelectorAll(".bg-orb");
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    window.addEventListener(
      "pointermove",
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        tx = x * 28;
        ty = y * 22;
      },
      { passive: true }
    );

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      orbs.forEach((el, i) => {
        const f = (i + 1) * 0.55;
        el.style.transform = `translate3d(${cx * f}px, ${cy * f}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Keep mosaic tiles grid-aligned (no free translate drift) */

  /* Live status text on kicker */
  const liveChip = document.querySelector("[data-live-status]");
  if (liveChip) {
    fetch("/health", { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.status === "HEALTHY") {
          liveChip.textContent = "Metiora online";
        }
      })
      .catch(() => {
        liveChip.textContent = "Metiora";
      });
  }

  /* Magnetic buttons */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* Scroll reveal */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* Side nav active hash */
  const sideLinks = document.querySelectorAll(".side-nav a[href^='#']");
  if (sideLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    sideLinks.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = map.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            sideLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    map.forEach((_, el) => io.observe(el));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
