// pages.js — Shared interactive helpers for all inner pages
// ------------------------------------------------------------
// 1. MOBILE HAMBURGER — Robust Implementation (aligned with script.js)
(function initHamburgerPages() {
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  if (!hamburger || !navLinksEl) return;

  let overlayEl = document.querySelector('.mobile-nav-overlay');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'mobile-nav-overlay';
    document.body.appendChild(overlayEl);
  }

  function openMenu() {
    hamburger.classList.add('open');
    navLinksEl.classList.add('open');
    overlayEl.classList.add('open');
    document.body.classList.add('menu-locked');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    overlayEl.classList.remove('open');
    document.body.classList.remove('menu-locked');
  }

  function toggleMenu() {
    navLinksEl.classList.contains('open') ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  overlayEl.addEventListener('click', () => {
    if (overlayEl.classList.contains('open')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksEl.classList.contains('open')) closeMenu();
  });

  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinksEl.classList.contains('open')) closeMenu();
  });

  hamburger.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  navLinksEl.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
})();

// 3. Scroll reveal animations (elements with .reveal, .reveal-left, .reveal-right, etc.)
(function initPagesScrollReveal() {
  if (typeof window.observeReveals === 'function') {
    window.observeReveals();
    return;
  }

  const revealQueue = new Set();
  let rafId = null;

  function flush() {
    revealQueue.forEach(el => el.classList.add('visible', 'revealed'));
    revealQueue.clear();
    rafId = null;
  }

  const observer = new IntersectionObserver((entries) => {
    let hasNew = false;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealQueue.add(entry.target);
        observer.unobserve(entry.target);
        hasNew = true;
      }
    });
    if (hasNew && !rafId) {
      rafId = requestAnimationFrame(flush);
    }
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale').forEach(el => {
    if (!el.classList.contains('visible') && !el.classList.contains('revealed')) {
      observer.observe(el);
    }
  });
})();

// 4. Simple fade‑slide‑up animation via CSS (adds .revealed class)
//    The actual animation is defined in style.css – this script only toggles the class.

// 5. Blog filter functionality – works on blog.html only
const blogFilters = document.querySelectorAll('.blog-filter');
if (blogFilters.length) {
  const blogGrid = document.querySelector('.blog-grid');
  blogFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      blogFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      blogGrid.querySelectorAll('.blog-card').forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.style.display = '';
          card.style.animation = 'fadeSlideUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 6. Global smooth scroll for internal anchor links (e.g., breadcrumb)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 7. Simple utility to format numbers with commas (used in charts if needed)
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 8. Optional: Auto‑play particles canvas (already handled in script.js) – nothing needed here.

// End of pages.js – keep it lightweight for fast load on all pages.
