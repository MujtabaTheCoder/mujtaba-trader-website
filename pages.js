// pages.js — Shared interactive helpers for all inner pages
// ------------------------------------------------------------
// 1. Mobile navigation hamburger toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// 2. Close mobile menu on link click (for better UX)
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

// 3. Scroll reveal animations (elements with .reveal class)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px 0px -80px 0px', // start a bit before fully in view
  threshold: 0.1
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
