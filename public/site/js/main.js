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

  /* Mobile drawer */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
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

  /* Tilt hero panel */
  const panel = document.querySelector(".hero-panel");
  if (panel && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    panel.addEventListener("pointermove", (e) => {
      const r = panel.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      panel.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 7}deg) translateZ(0)`;
    });
    panel.addEventListener("pointerleave", () => {
      panel.style.transform = "";
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

  /* Live health ping */
  const liveChip = document.querySelector("[data-live-status]");
  if (liveChip) {
    fetch("/health", { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.status === "HEALTHY") {
          liveChip.textContent = "API healthy";
          liveChip.classList.add("chip--live");
        }
      })
      .catch(() => {});
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
