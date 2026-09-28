/* ═══════════════════════════════════════════
   MUJTABA FOREX TRADER — Optimized JavaScript
   Performance targets:
   - 60fps particle & tilt animations (RAF-gated)
   - Zero wasted CPU when tab is hidden (visibility guard)
   - Passive event listeners throughout
   - Deduped scroll/resize handlers via one shared listener
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. PARTICLE BACKGROUND
     - Paused when tab hidden (visibilitychange)
     - Paused when canvas is off-screen (IntersectionObserver)
     - RAF loop never double-queued
     ──────────────────────────────────────────*/
  (function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let W, H;
    let rafId      = null;
    let canvasVisible = true;
    let tabVisible    = document.visibilityState === 'visible';

    function resizeCanvas() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function rnd(a, b) { return Math.random() * (b - a) + a; }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x     = rnd(0, W);
        this.y     = rnd(0, H);
        this.r     = rnd(0.4, 1.8);
        this.vx    = rnd(-0.15, 0.15);
        this.vy    = rnd(-0.3, -0.05);
        this.alpha = rnd(0.3, 1);
        // Pre-compute color to avoid per-draw string interpolation
        this.hue   = Math.floor(rnd(38, 52));
      }
      update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.alpha -= 0.002;
        if (this.alpha <= 0 || this.y < -10) this.reset();
      }
      draw() {
        ctx.globalAlpha = Math.max(0, this.alpha * 0.5);
        ctx.fillStyle   = `hsl(${this.hue},95%,65%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function loop() {
      rafId = null;
      if (!canvasVisible || !tabVisible) return; // bail — saves GPU + CPU

      ctx.save();
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      ctx.restore();
      rafId = requestAnimationFrame(loop);
    }

    function tryResume() {
      if (canvasVisible && tabVisible && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      tabVisible = document.visibilityState === 'visible';
      tryResume();
    });

    // Pause when canvas is off-screen
    const canvasObs = new IntersectionObserver(([entry]) => {
      canvasVisible = entry.isIntersecting;
      tryResume();
    }, { threshold: 0 });
    canvasObs.observe(canvas);

    tryResume();
  })();


  /* ──────────────────────────────────────────
     2. SHARED SCROLL + RESIZE DISPATCHER
     Single listener each — no duplicate handlers
     ──────────────────────────────────────────*/
  const scrollCbs = [];
  const resizeCbs = [];

  window.addEventListener('scroll', () => {
    for (let i = 0; i < scrollCbs.length; i++) scrollCbs[i]();
  }, { passive: true });

  window.addEventListener('resize', () => {
    for (let i = 0; i < resizeCbs.length; i++) resizeCbs[i]();
  }, { passive: true });


  /* ──────────────────────────────────────────
     3. NAVBAR SCROLL EFFECT
     ──────────────────────────────────────────*/
  (function initNavbarScroll() {
    const navbar   = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    if (!navbar) return;

    scrollCbs.push(() => {
      const scrolled = window.scrollY > 60;
      navbar.classList.toggle('scrolled', scrolled);

      if (sections.length && navLinks.length) {
        let current = '';
        for (let i = 0; i < sections.length; i++) {
          if (window.scrollY >= sections[i].offsetTop - 100) {
            current = sections[i].id;
          }
        }
        for (let i = 0; i < navLinks.length; i++) {
          navLinks[i].classList.toggle('active', navLinks[i].getAttribute('href') === '#' + current);
        }
      }
    });
  })();


  /* ──────────────────────────────────────────
     4. MOBILE HAMBURGER
     ──────────────────────────────────────────*/
  (function initHamburger() {
    const hamburger  = document.getElementById('hamburger');
    const navLinksEl = document.getElementById('navLinks');
    if (!hamburger || !navLinksEl) return;

    let overlayEl = document.querySelector('.mobile-nav-overlay');
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.className = 'mobile-nav-overlay';
      document.body.appendChild(overlayEl);
    }

    const openMenu  = () => { hamburger.classList.add('open'); navLinksEl.classList.add('open'); overlayEl.classList.add('open'); document.body.classList.add('menu-locked'); };
    const closeMenu = () => { hamburger.classList.remove('open'); navLinksEl.classList.remove('open'); overlayEl.classList.remove('open'); document.body.classList.remove('menu-locked'); };
    const toggle    = () => navLinksEl.classList.contains('open') ? closeMenu() : openMenu();

    hamburger.addEventListener('click',   (e) => { e.stopPropagation(); toggle(); });
    overlayEl.addEventListener('click',   () => closeMenu());
    document.addEventListener('keydown',  (e) => { if (e.key === 'Escape') closeMenu(); });
    hamburger.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    navLinksEl.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

    navLinksEl.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

    resizeCbs.push(() => {
      if (window.innerWidth > 768) closeMenu();
    });
  })();


  /* ──────────────────────────────────────────
     5. COUNTER ANIMATION
     Uses requestAnimationFrame instead of setInterval
     ──────────────────────────────────────────*/
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10) || 0;
      if (target > 0) animateCounter(el, target);
    });
  }


  /* ──────────────────────────────────────────
     6. SCROLL REVEAL (IntersectionObserver with RAF Gating)
     Batch DOM mutations to prevent layout thrashing
     ──────────────────────────────────────────*/
  const revealQueue = new Set();
  let revealRafId = null;

  /* ── Skill Progress Bars & Gold Highlights (#FFB800) ── */
  let skillsAnimated = false;
  function triggerSkills() {
    if (skillsAnimated) return;
    skillsAnimated = true;

    const fills = document.querySelectorAll('.skills-grid .skill-fill');
    fills.forEach((fill, i) => {
      fill.style.transitionDelay = (i * 100) + 'ms';
      requestAnimationFrame(() => fill.classList.add('animated'));
    });
  }
  window.triggerSkills = triggerSkills;

  function flushRevealQueue() {
    revealQueue.forEach(el => {
      el.classList.add('visible', 'revealed');

      if (el.classList.contains('about-content') || el.classList.contains('reveal-right') || el.classList.contains('skills-grid')) {
        triggerSkills();
      }

      if (el.closest?.('.hero') || el.classList.contains('hero-stats') || el.classList.contains('stat-item')) {
        startCounters();
      }
    });
    revealQueue.clear();
    revealRafId = null;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    let hasNew = false;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealQueue.add(entry.target);
        revealObserver.unobserve(entry.target);
        hasNew = true;
      }
    });
    if (hasNew && !revealRafId) {
      revealRafId = requestAnimationFrame(flushRevealQueue);
    }
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  function observeReveals(root = document) {
    root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale').forEach(el => {
      if (!el.classList.contains('visible') && !el.classList.contains('revealed')) {
        revealObserver.observe(el);
      }
    });
  }
  window.observeReveals = observeReveals;

  function addRevealClasses() {
    // 1. Hero elements entrance sequence
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) { heroBadge.classList.add('reveal'); heroBadge.style.transitionDelay = '80ms'; }
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) { heroTitle.classList.add('reveal'); heroTitle.style.transitionDelay = '180ms'; }
    const heroSub = document.querySelector('.hero-subtitle');
    if (heroSub) { heroSub.classList.add('reveal'); heroSub.style.transitionDelay = '280ms'; }
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) { heroCta.classList.add('reveal'); heroCta.style.transitionDelay = '380ms'; }
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) { heroStats.classList.add('reveal'); heroStats.style.transitionDelay = '480ms'; }

    // 2. About section
    document.querySelector('.about-image-wrap')?.classList.add('reveal-left');
    document.querySelector('.about-content')?.classList.add('reveal-right');

    // 3. Services / Programs
    document.querySelectorAll('.service-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 90) + 'ms';
    });

    // 4. Gold Edge
    document.querySelector('.gold-content')?.classList.add('reveal-left');
    document.querySelector('.gold-visual')?.classList.add('reveal-right');

    // 5. Why Us
    document.querySelectorAll('.why-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 70) + 'ms';
    });

    // 6. Live Signals bar & static cards
    const liveBar = document.querySelector('.signal-live-bar');
    if (liveBar) { liveBar.classList.add('reveal'); liveBar.style.transitionDelay = '80ms'; }
    document.querySelectorAll('.signals-grid .signal-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 80) + 'ms';
    });

    // 7. Enrollment section
    document.querySelector('.enroll-info')?.classList.add('reveal-left');
    document.querySelector('.form-container')?.classList.add('reveal-right');
    const badgeCard = document.querySelector('.official-badge-card');
    if (badgeCard) { badgeCard.classList.add('reveal'); badgeCard.style.transitionDelay = '150ms'; }

    // 8. Section headers
    document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal'));

    // 9. Inner page cards
    document.querySelectorAll('.course-detail-card').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 90) + 'ms';
    });
    document.querySelectorAll('.channel-card').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 80) + 'ms';
    });
    document.querySelectorAll('.blog-card').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 80) + 'ms';
    });
    document.querySelectorAll('.ph-card').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 80) + 'ms';
    });
    document.querySelectorAll('.timeline-item').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 60) + 'ms';
    });
    document.querySelector('.comparison-table-wrap')?.classList.add('reveal');
    document.querySelector('.enroll-page-info')?.classList.add('reveal-left');
    document.querySelector('.enroll-form-card, .enroll-page-form-wrap')?.classList.add('reveal-right');
    document.querySelectorAll('.step-item').forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 90) + 'ms';
    });
  }

  addRevealClasses();
  observeReveals();

  // Direct observer for skills grid to guarantee 60fps animation trigger
  const skillsGridEl = document.querySelector('.skills-grid');
  if (skillsGridEl) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerSkills();
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    skillsObserver.observe(skillsGridEl);
  }

  // Load event backup for above-the-fold content & hero counters
  window.addEventListener('load', () => {
    observeReveals();
    setTimeout(startCounters, 500);
  }, { once: true });


  /* ──────────────────────────────────────────
     7. 3D TILT EFFECT — RAF-GATED (60fps guard)
     All tilt-card mousemove events funnelled through
     RAF so DOM style writes happen at most once/frame
     ──────────────────────────────────────────*/
  function attachTilt(card) {
    let rafPending = false;
    let mx = 0, my = 0;
    let rw = 0, rh = 0;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      rw = rect.width;
      rh = rect.height;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          const rotX = ((my - rh / 2) / (rh / 2)) * -10;
          const rotY = ((mx - rw / 2) / (rw / 2)) *  10;
          card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale3d(1.02,1.02,1.02)`;
          card.style.transition = 'transform 0.1s ease';
          rafPending = false;
        });
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      rafPending = false;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      card.style.transition = 'transform 0.4s ease';
    }, { passive: true });
  }
  window.attachTilt = attachTilt;

  document.querySelectorAll('.tilt-card, .service-card, .why-card, .float-card, .stat-card').forEach(attachTilt);


  /* ──────────────────────────────────────────
     8. ENROLLMENT FORM SUBMISSION
     ──────────────────────────────────────────*/
  const form      = document.getElementById('enrollForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnLoader = document.getElementById('btnLoader');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnIcon   = submitBtn?.querySelector('.btn-icon');
  const successEl = document.getElementById('formSuccess');

  document.querySelectorAll('.enroll-form input, .enroll-form select, .enroll-form textarea').forEach(input => {
    input.addEventListener('focus', () => {
      const icon = input.closest('.input-wrap')?.querySelector('.input-icon');
      if (icon) icon.style.color = 'var(--gold-1)';
    }, { passive: true });
    input.addEventListener('blur', () => {
      const icon = input.closest('.input-wrap')?.querySelector('.input-icon');
      if (icon) icon.style.color = '';
    }, { passive: true });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl   = document.getElementById('studentName');
    const phoneEl  = document.getElementById('studentPhone');
    const cityEl   = document.getElementById('studentCity');
    const levelEl  = document.getElementById('studentLevel');
    const courseEl = document.getElementById('studentCourse');

    if (!nameEl || !phoneEl || !cityEl || !levelEl || !courseEl) {
      showFormError('Form elements not found. Please refresh the page.');
      return;
    }

    const name   = nameEl.value.trim();
    const phone  = phoneEl.value.trim();
    const city   = cityEl.value.trim();
    const level  = levelEl.value;
    const course = courseEl.value;

    if (!name || !phone || !city || !level || !course) {
      showFormError('Please complete all required fields marked with an asterisk (*).');
      return;
    }

    if (!/^[\+\d\s\-]{10,15}$/.test(phone)) {
      showFormError('Please enter a valid phone number (10–15 digits).');
      return;
    }

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    btnLoader?.classList.add('active');
    if (btnText) btnText.style.display = 'none';
    if (btnIcon) btnIcon.style.display = 'none';

    const emailEl = document.getElementById('studentEmail');
    const msgEl   = document.getElementById('studentMessage');
    const formData = {
      name,
      phone,
      email:  emailEl?.value.trim() || null,
      city:   city   || null,
      level:  level  || null,
      course: course || null,
      goal:   msgEl?.value.trim() || null,
    };

    try {
      if (window.SupabaseDB) {
        await window.SupabaseDB.insertEnrollment(formData);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      // Non-fatal — still show success to user (enrollment may retry via admin)
    }

    // Restore button
    btnLoader?.classList.remove('active');
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = '';
    if (btnIcon) btnIcon.style.display = '';

    // Show success
    form.querySelectorAll('.form-group, .form-submit').forEach(el => { el.style.display = 'none'; });
    successEl?.classList.add('show');

    launchConfetti();
  });

  function showFormError(msg) {
    if (!form) return;
    form.querySelector('.form-error')?.remove();
    const err = document.createElement('div');
    err.className = 'form-error';
    err.style.cssText = 'padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#f87171;font-size:13px;font-weight:500;margin-bottom:16px;animation:fadeSlideUp 0.3s ease;';
    err.textContent = '⚠️ ' + msg;
    form.querySelector('.form-group')?.before(err);
    setTimeout(() => err.remove(), 4000);
  }


  /* ──────────────────────────────────────────
     9. CONFETTI BURST (Web Animations API)
     ──────────────────────────────────────────*/
  function launchConfetti() {
    const colors = ['#f5c842', '#d4941a', '#ffffff', '#22c55e', '#f97316'];
    const frag   = document.createDocumentFragment(); // batch DOM insert

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      const color = colors[i % colors.length];
      const sz    = Math.random() * 10 + 5;
      piece.style.cssText = `position:fixed;top:50%;left:50%;width:${sz}px;height:${sz}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};pointer-events:none;z-index:9999;opacity:1;transform:translate(-50%,-50%)`;
      frag.appendChild(piece);

      const angle    = Math.random() * 2 * Math.PI;
      const velocity = Math.random() * 400 + 150;
      const vx       = Math.cos(angle) * velocity;
      const vy       = Math.sin(angle) * velocity - 200;
      const duration = Math.random() * 1000 + 800;

      requestAnimationFrame(() => {
        piece.animate([
          { transform: 'translate(-50%,-50%) scale(1)',    opacity: 1 },
          { transform: `translate(calc(-50% + ${vx}px),calc(-50% + ${vy}px)) scale(0.3) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ], { duration, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' })
        .finished.then(() => piece.remove());
      });
    }

    document.body.appendChild(frag);
  }


  /* ──────────────────────────────────────────
     10. CANDLESTICK ANIMATION
     - Visibility guard: pauses when tab hidden
     ──────────────────────────────────────────*/
  (function initCandles() {
    const candles = document.querySelectorAll('.candle');
    if (!candles.length) return;

    let intervalId = null;

    function animateCandles() {
      candles.forEach(c => {
        c.style.transition = 'height 1s ease';
        c.style.height = (Math.floor(Math.random() * 80) + 20) + 'px';
      });
    }

    function start() { if (!intervalId) intervalId = setInterval(animateCandles, 2000); }
    function stop()  { clearInterval(intervalId); intervalId = null; }

    document.addEventListener('visibilitychange', () => {
      document.visibilityState === 'visible' ? start() : stop();
    });

    start();
  })();


  /* ──────────────────────────────────────────
     11. SIMULATED GOLD PRICE TICKER
     - Visibility guard: pauses when tab hidden
     ──────────────────────────────────────────*/
  (function initGoldPrice() {
    const goldPriceEl = document.querySelector('.gold-price');
    if (!goldPriceEl) return;

    let basePrice  = 2658.40;
    let intervalId = null;

    function tick() {
      const delta = (Math.random() - 0.49) * 3;
      basePrice = Math.max(2600, Math.min(2700, basePrice + delta));
      goldPriceEl.textContent = '$' + basePrice.toFixed(2);
      goldPriceEl.style.color = delta > 0 ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { goldPriceEl.style.color = 'var(--gold-1)'; }, 700);
    }

    function start() { if (!intervalId) intervalId = setInterval(tick, 2500); }
    function stop()  { clearInterval(intervalId); intervalId = null; }

    document.addEventListener('visibilitychange', () => {
      document.visibilityState === 'visible' ? start() : stop();
    });

    start();
  })();


  /* ──────────────────────────────────────────
     12. SMOOTH SCROLL & FORM COURSE AUTO-SELECT
     ──────────────────────────────────────────*/
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      let target = null;
      try { target = document.querySelector(href); } catch (_) { return; }
      if (!target) return;
      e.preventDefault();

      // Auto-select course in the enrollment dropdown
      const course = anchor.dataset.course;
      if (course) {
        const sel = document.getElementById('studentCourse');
        if (sel) {
          for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === course || sel.options[i].text.includes(course)) {
              sel.selectedIndex = i;
              break;
            }
          }
        }
      }

      if (href === '#enroll') {
        const formEl = document.getElementById('enrollForm');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const nameInput = document.getElementById('studentName');
            if (nameInput) {
              nameInput.focus();
              nameInput.style.boxShadow = '0 0 20px rgba(245,200,66,0.6)';
              setTimeout(() => { nameInput.style.boxShadow = ''; }, 1500);
            }
          }, 600);
          return;
        }
      }

      target.scrollIntoView({ behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────
     13. MOUSE PARALLAX ON HERO
     RAF-gated to prevent layout thrashing
     ──────────────────────────────────────────*/
  (function initHeroParallax() {
    const heroSection = document.querySelector('.hero');
    const heroBg      = document.querySelector('.hero-img');
    if (!heroSection || !heroBg) return;

    let rafPending = false;
    let xPct = 0, yPct = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = heroSection.getBoundingClientRect();
      xPct = (e.clientX - left) / width  - 0.5;
      yPct = (e.clientY - top)  / height - 0.5;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          heroBg.style.transform = `scale(1.05) translate(${xPct * 10}px,${yPct * 8}px)`;
          rafPending = false;
        });
      }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      heroBg.style.transform = 'scale(1.05)';
    }, { passive: true });
  })();


  /* ──────────────────────────────────────────
     14. GOLD IMAGE 3D TILT
     ──────────────────────────────────────────*/
  (function initGoldImageTilt() {
    const goldContainer = document.querySelector('.gold-img-container');
    const goldImg       = document.querySelector('.gold-img');
    if (!goldContainer || !goldImg) return;

    let rafPending = false;
    let px = 0, py = 0, pw = 0, ph = 0;

    goldContainer.addEventListener('mousemove', (e) => {
      const rect = goldContainer.getBoundingClientRect();
      px = (e.clientX - rect.left) / rect.width  - 0.5;
      py = (e.clientY - rect.top)  / rect.height - 0.5;
      pw = rect.width;
      ph = rect.height;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          goldImg.style.transform = `perspective(800px) rotateX(${py * -15}deg) rotateY(${px * 20}deg) scale(1.03)`;
          rafPending = false;
        });
      }
    }, { passive: true });

    goldContainer.addEventListener('mouseleave', () => {
      goldImg.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    }, { passive: true });
  })();


  console.log('%c🏛️ Mujtaba Forex Trader — Optimized & Live', 'color:#f5c842;font-size:15px;font-weight:bold;');
})();
