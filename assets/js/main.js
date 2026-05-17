/* ============================================================
   ProductCamp Amsterdam — Main JS
   - Motion One choreography (CDN, ESM)
   - Nav scroll-state, mobile toggle
   - Section reveals (Intersection Observer)
   - Stat counters
   - Hero parallax
   - Heading split-and-stagger
   - View Transitions for nav clicks
   - Full prefers-reduced-motion fallback
   ============================================================ */

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Lazy-import Motion One only when motion is allowed */
let M = null;
async function loadMotion() {
  if (REDUCED) return null;
  if (M) return M;
  try {
    M = await import("https://cdn.jsdelivr.net/npm/motion@10.18.0/+esm");
    return M;
  } catch (e) {
    console.warn("Motion One failed to load:", e);
    return null;
  }
}

/* ===== Nav scroll-state ===== */
function initNavScrollState() {
  const setSolid = () => {
    if (window.scrollY > 60) document.body.classList.add("nav-solid");
    else document.body.classList.remove("nav-solid");
  };
  setSolid();
  window.addEventListener("scroll", setSolid, { passive: true });
}

/* ===== Mobile nav toggle ===== */
function initNavToggle() {
  const btn = document.querySelector(".nav-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", String(open));
  });
  // Close on link click
  document.querySelectorAll(".nav-primary a").forEach(a =>
    a.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
}

/* ===== Section / element reveals (Intersection Observer) ===== */
function initReveals() {
  const els = document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-reveal-from]");
  if (!("IntersectionObserver" in window) || REDUCED) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }
  // Set --i index for stagger children
  document.querySelectorAll("[data-reveal-stagger]").forEach(parent => {
    [...parent.children].forEach((child, i) => child.style.setProperty("--i", i));
  });
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  els.forEach(el => io.observe(el));
}

/* ===== Hero heading split + stagger ===== */
function initHeroSplit() {
  const h = document.querySelector("[data-split]");
  if (!h) return;
  const html = h.innerHTML;
  // Tokenise on whitespace but preserve <em> tags
  const wrapped = html.replace(/(\S+)/g, '<span class="split-word">$1</span>');
  h.innerHTML = wrapped;
  if (REDUCED) {
    h.querySelectorAll(".split-word").forEach(s => s.classList.add("is-visible"));
    return;
  }
  // Stagger via animation-delay
  h.querySelectorAll(".split-word").forEach((s, i) => {
    s.style.animationDelay = `${i * 60}ms`;
  });
  requestAnimationFrame(() => {
    h.querySelectorAll(".split-word").forEach(s => s.classList.add("is-visible"));
  });
}

/* ===== Section--bg gear: slide left → right as the section scrolls past =====
   Plain rAF-throttled scroll listener (no Motion One dep) — sets CSS vars on
   each .section--bg; the ::after watermark gear reads --gear-x and --gear-rot. */
function initSectionBgGearParallax() {
  if (REDUCED) return;
  const sections = document.querySelectorAll(".section--bg");
  if (!sections.length) return;
  let rafId = 0;
  const update = () => {
    rafId = 0;
    const vh = window.innerHeight;
    sections.forEach(sec => {
      const r = sec.getBoundingClientRect();
      // p = 0 when section top enters viewport bottom; p = 1 when section bottom exits viewport top
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      sec.style.setProperty("--gear-x", `${-(1 - p) * sec.clientWidth}px`);
      sec.style.setProperty("--gear-rot", `${p * 360}deg`);
    });
  };
  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(update); };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* ===== Hero parallax (subtle, 4%) ===== */
async function initHeroParallax() {
  if (REDUCED) return;
  const media = document.querySelector(".hero__media img");
  if (!media) return;
  const mod = await loadMotion();
  if (!mod) return;
  const { scroll, animate } = mod;
  scroll(animate(media, { y: [0, -40] }, { ease: "linear" }), {
    target: media.closest(".hero"),
    offset: ["start start", "end start"]
  });
}

/* ===== Stat counters (count up on viewport entry) ===== */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length === 0) return;
  if (REDUCED) {
    counters.forEach(c => { c.textContent = c.dataset.count; });
    return;
  }
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const dur = parseInt(el.dataset.duration, 10) || 700; // fast count-up
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4); // ease-out quart, snappier
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * ease(t)).toString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!("IntersectionObserver" in window)) { counters.forEach(animateCount); return; }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

/* ===== View Transitions for in-site nav ===== */
function initViewTransitions() {
  if (!document.startViewTransition) return;
  document.querySelectorAll('a[href$=".html"], a[href="/"], a[href="./"]').forEach(a => {
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return; // external
    a.addEventListener("click", e => {
      // Let Cmd/Ctrl/middle-click open new tab
      if (e.metaKey || e.ctrlKey || e.button === 1 || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.startViewTransition(() => { location.href = a.href; });
    });
  });
}

/* ===== Gallery lightbox ===== */
function initLightbox() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;
  const imgs = [...gallery.querySelectorAll("img")];
  if (imgs.length === 0) return;

  // Make each gallery img keyboard-focusable + role=button
  imgs.forEach((img, i) => {
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", `View larger: ${img.alt || "photo " + (i + 1)}`);
  });

  // Build overlay once
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Image gallery");
  lb.innerHTML = `
    <button class="lightbox__close" type="button" aria-label="Close">×</button>
    <button class="lightbox__prev" type="button" aria-label="Previous image">‹</button>
    <img alt="" />
    <button class="lightbox__next" type="button" aria-label="Next image">›</button>
    <div class="lightbox__caption" aria-live="polite"></div>`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const lbCaption = lb.querySelector(".lightbox__caption");
  const btnClose = lb.querySelector(".lightbox__close");
  const btnPrev = lb.querySelector(".lightbox__prev");
  const btnNext = lb.querySelector(".lightbox__next");

  let idx = 0;
  let lastFocus = null;

  const show = (i) => {
    idx = (i + imgs.length) % imgs.length;
    const src = imgs[idx];
    lbImg.src = src.src;
    lbImg.alt = src.alt || "";
    lbCaption.textContent = src.alt || "";
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    btnClose.focus();
  };
  const close = () => {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  imgs.forEach((img, i) => {
    img.addEventListener("click", () => open(i));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(idx - 1));
  btnNext.addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
  });
}

/* ===== Pattern page: motion replay buttons ===== */
function initPatternReplays() {
  document.querySelectorAll("[data-replay]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.replay);
      if (!target) return;
      target.classList.remove("is-visible");
      // restart
      void target.offsetWidth;
      target.classList.add("is-visible");
    });
  });
}

/* ===== Obfuscated email links =====
   Markup pattern:
     <a class="js-email" data-u="user" data-d="example.com" data-s="Subject%20here" href="#">Label</a>
   JS rebuilds href + sets rel/no-referrer. Visual text content is preserved.
   Plain-text fallback span:
     <span class="js-email-text" data-u="user" data-d="example.com"></span>
*/
function initEmailObfuscation() {
  const make = (u, d, s) => "ma" + "il" + "to:" + u + "@" + d + (s ? "?subject=" + s : "");
  document.querySelectorAll("a.js-email").forEach(a => {
    const u = a.dataset.u, d = a.dataset.d, s = a.dataset.s || "";
    if (!u || !d) return;
    a.setAttribute("href", make(u, d, s));
    a.setAttribute("rel", "noopener");
  });
  document.querySelectorAll(".js-email-text").forEach(el => {
    const u = el.dataset.u, d = el.dataset.d;
    if (!u || !d) return;
    el.textContent = u + "@" + d;
  });
}

/* ===== Contact form (Web3Forms AJAX) ===== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const success = document.getElementById("contact-success");

  // Pre-select topic from ?topic=… URL param
  const params = new URLSearchParams(location.search);
  const topic = params.get("topic");
  if (topic) {
    const sel = form.querySelector('select[name="topic"]');
    if (sel) {
      const match = [...sel.options].find(o => o.value === topic || o.value.startsWith(topic + "-"));
      if (match) sel.value = match.value;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Manual validation (form has `novalidate` to suppress default styling)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // hCaptcha token check (if widget is on the page)
    if (form.querySelector(".h-captcha")) {
      const token = form.querySelector('textarea[name="h-captcha-response"]')?.value
                 || form.querySelector('input[name="h-captcha-response"]')?.value;
      if (!token) {
        let err = form.querySelector(".contact-form__error");
        if (!err) {
          err = document.createElement("div");
          err.className = "contact-form__error";
          err.setAttribute("role", "alert");
          form.querySelector(".contact-form__actions").before(err);
        }
        err.textContent = "Please complete the anti-spam check before sending.";
        return;
      }
    }
    const fd = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    // Honeypot check (client-side)
    if (fd.get("botcheck")) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; return; }

    const showError = (msg) => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      if (window.hcaptcha) window.hcaptcha.reset();
      let errEl = form.querySelector(".contact-form__error");
      if (!errEl) {
        errEl = document.createElement("div");
        errEl.className = "contact-form__error";
        errEl.setAttribute("role", "alert");
        form.appendChild(errEl);
      }
      errEl.textContent = msg;
    };

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      });
      let data = null;
      try { data = await res.json(); } catch (_) { /* non-JSON */ }
      // Web3Forms returns {success: true/false, message: "..."} even on 200
      if (res.ok && data && data.success) {
        form.style.display = "none";
        if (success) {
          success.classList.add("is-shown");
          success.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
          success.focus?.();
        }
        return;
      }
      const reason = (data && data.message) ? data.message : `HTTP ${res.status}`;
      console.warn("Form submit failed:", reason, data);
      showError(`Couldn't send your message: ${reason}. Please try again or DM us on LinkedIn.`);
    } catch (err) {
      console.warn("Form submit network error:", err);
      showError("Network error — please check your connection and try again, or DM us on LinkedIn.");
    }
  });
}

/* ===== Boot ===== */
function boot() {
  initNavScrollState();
  initNavToggle();
  initReveals();
  initHeroSplit();
  initCounters();
  initViewTransitions();
  initPatternReplays();
  initLightbox();
  initEmailObfuscation();
  initContactForm();
  initSectionBgGearParallax();
  initHeroParallax(); // async, non-blocking
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
