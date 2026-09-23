/* ═══════════════════════════════════════════
   MUJTABA FOREX TRADER — JavaScript
   All interactivity, animations, and logic
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. PARTICLE BACKGROUND
     ──────────────────────────────────────────*/
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function randomBetween(a, b) { return Math.random() * (b - a) + a; }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = randomBetween(0, W);
      this.y    = randomBetween(0, H);
      this.r    = randomBetween(0.4, 1.8);
      this.vx   = randomBetween(-0.15, 0.15);
      this.vy   = randomBetween(-0.3, -0.05);
      this.life = randomBetween(0.3, 1);
      this.alpha = this.life;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.002;
      if (this.alpha <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha * 0.5);
      ctx.fillStyle = `hsl(${randomBetween(38,52)}, 95%, 65%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ──────────────────────────────────────────
     2. NAVBAR SCROLL EFFECT
     ──────────────────────────────────────────*/
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Scrolled style
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link
    let current = '';
    sections.forEach(section => {
      const sTop = section.offsetTop - 100;
      if (window.scrollY >= sTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  /* ──────────────────────────────────────────
     3. MOBILE HAMBURGER
     ──────────────────────────────────────────*/
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ──────────────────────────────────────────
     4. COUNTER ANIMATION
     ──────────────────────────────────────────*/
  function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.textContent = Math.floor(start);
    }, 16);
  }

  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
    });
    countersStarted = true;
  }

  /* ──────────────────────────────────────────
     5. SCROLL REVEAL
     ──────────────────────────────────────────*/
  function addRevealClasses() {
    // About
    document.querySelector('.about-image-wrap')?.classList.add('reveal-left');
    document.querySelector('.about-content')?.classList.add('reveal-right');

    // Services cards
    document.querySelectorAll('.service-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 100) + 'ms';
    });

    // Gold section
    document.querySelector('.gold-content')?.classList.add('reveal-left');
    document.querySelector('.gold-visual')?.classList.add('reveal-right');

    // Why cards
    document.querySelectorAll('.why-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 80) + 'ms';
    });

    // Enroll
    document.querySelector('.enroll-info')?.classList.add('reveal-left');
    document.querySelector('.form-container')?.classList.add('reveal-right');

    // Section headers
    document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal'));
  }
  addRevealClasses();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger skill bars
        if (entry.target.classList.contains('about-content') ||
            entry.target.classList.contains('reveal-right')) {
          document.querySelectorAll('.skill-fill').forEach(fill => {
            fill.classList.add('animated');
          });
        }

        // Trigger counters when hero is visible
        if (entry.target.closest('.hero')) startCounters();
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  // Trigger counters on page load (hero is visible)
  window.addEventListener('load', () => {
    setTimeout(startCounters, 800);
  });

  /* ──────────────────────────────────────────
     6. 3D TILT EFFECT on Gold Image
     ──────────────────────────────────────────*/
  const goldContainer = document.querySelector('.gold-img-container');
  const goldImg       = document.querySelector('.gold-img');

  if (goldContainer && goldImg) {
    goldContainer.addEventListener('mousemove', (e) => {
      const rect   = goldContainer.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const rotX   = y * -15;
      const rotY   = x *  20;
      goldImg.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });
    goldContainer.addEventListener('mouseleave', () => {
      goldImg.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  /* ──────────────────────────────────────────
     7. 3D CARD TILT
     ──────────────────────────────────────────*/
  document.querySelectorAll('.service-card, .why-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(600px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────
     8. ENROLLMENT FORM SUBMISSION
     ──────────────────────────────────────────*/
  const form      = document.getElementById('enrollForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnLoader = document.getElementById('btnLoader');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnIcon   = submitBtn?.querySelector('.btn-icon');
  const successEl = document.getElementById('formSuccess');

  // Input focus glow effect
  document.querySelectorAll('.enroll-form input, .enroll-form select, .enroll-form textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.input-wrap')?.querySelector('.input-icon')?.style && (input.closest('.input-wrap').querySelector('.input-icon').style.color = 'var(--gold-1)');
    });
    input.addEventListener('blur', () => {
      input.closest('.input-wrap')?.querySelector('.input-icon')?.style && (input.closest('.input-wrap').querySelector('.input-icon').style.color = '');
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    const name   = document.getElementById('studentName').value.trim();
    const phone  = document.getElementById('studentPhone').value.trim();
    const city   = document.getElementById('studentCity').value.trim();
    const level  = document.getElementById('studentLevel').value;
    const course = document.getElementById('studentCourse').value;

    if (!name || !phone || !city || !level || !course) {
      showFormError('Please complete all required fields marked with an asterisk (*).');
      return;
    }

    // Phone validation
    const phoneRegex = /^[\+\d\s\-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      showFormError('Please enter a valid phone number');
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    btnLoader.classList.add('active');
    if (btnText)  btnText.style.display  = 'none';
    if (btnIcon)  btnIcon.style.display  = 'none';

    // Collect form data
    const formData = {
      name,
      phone,
      email:   document.getElementById('studentEmail').value.trim() || null,
      city:    city || null,
      level:   level || null,
      course:  course || null,
      goal:    document.getElementById('studentMessage').value.trim() || null
    };

    // Insert into Supabase if available
    try {
      if (window.SupabaseDB) {
        await window.SupabaseDB.insertEnrollment(formData);
      }
    } catch (err) {
      console.error('Supabase error:', err);
    }

    // Success
    btnLoader.classList.remove('active');
    submitBtn.disabled = false;
    if (btnText) btnText.style.display = '';
    if (btnIcon) btnIcon.style.display = '';

    // Hide form fields, show success
    const formInputs = form.querySelectorAll('.form-group, .form-submit');
    formInputs.forEach(el => { el.style.display = 'none'; });
    successEl.classList.add('show');

    // Confetti burst
    launchConfetti();
  });

  function showFormError(msg) {
    // Remove old error
    const oldErr = form.querySelector('.form-error');
    if (oldErr) oldErr.remove();

    const err = document.createElement('div');
    err.className = 'form-error';
    err.style.cssText = `
      padding: 12px 16px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px;
      color: #f87171;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 16px;
      animation: fadeSlideUp 0.3s ease;
    `;
    err.textContent = '⚠️ ' + msg;
    form.querySelector('.form-group').before(err);
    setTimeout(() => err.remove(), 4000);
  }

  function fakeDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ──────────────────────────────────────────
     9. CONFETTI BURST
     ──────────────────────────────────────────*/
  function launchConfetti() {
    const colors = ['#f5c842', '#d4941a', '#ffffff', '#22c55e', '#f97316'];
    const pieces = 60;

    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: fixed;
        top: 50%; left: 50%;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(piece);

      const angle    = Math.random() * 2 * Math.PI;
      const velocity = Math.random() * 400 + 150;
      const duration = Math.random() * 1000 + 800;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 200;

      piece.animate([
        { transform: 'translate(-50%, -50%) scale(1)',    opacity: 1 },
        { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(0.3) rotate(${Math.random()*720}deg)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' })
      .finished.then(() => piece.remove());
    }
  }

  /* ──────────────────────────────────────────
     10. LIVE CANDLESTICK ANIMATION
     ──────────────────────────────────────────*/
  const candles = document.querySelectorAll('.candle');
  function animateCandles() {
    candles.forEach(c => {
      const newH = Math.floor(Math.random() * 80 + 20);
      c.style.transition = 'height 1s ease';
      c.style.height = newH + 'px';
    });
  }
  setInterval(animateCandles, 2000);

  /* ──────────────────────────────────────────
     11. LIVE GOLD PRICE TICKER (simulated)
     ──────────────────────────────────────────*/
  const goldPriceEl = document.querySelector('.gold-price');
  if (goldPriceEl) {
    let basePrice = 2658.40;
    setInterval(() => {
      const delta = (Math.random() - 0.49) * 3;
      basePrice = Math.max(2600, Math.min(2700, basePrice + delta));
      goldPriceEl.textContent = '$' + basePrice.toFixed(2);
      goldPriceEl.style.color = delta > 0 ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { goldPriceEl.style.color = 'var(--gold-1)'; }, 700);
    }, 2500);
  }

  /* ──────────────────────────────────────────
     12. SMOOTH SCROLL FOR ANCHOR LINKS & AUTO-SELECT
     ──────────────────────────────────────────*/
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Auto-select course if specified on card
        const course = anchor.dataset.course;
        if (course) {
          const selectEl = document.getElementById('studentCourse');
          if (selectEl) {
            for (let i = 0; i < selectEl.options.length; i++) {
              if (selectEl.options[i].value === course || selectEl.options[i].text.includes(course)) {
                selectEl.selectedIndex = i;
                break;
              }
            }
          }
        }

        // Smooth scroll directly to form
        const formEl = document.getElementById('enrollForm');
        if (href === '#enroll' && formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const nameInput = document.getElementById('studentName');
          if (nameInput) {
            setTimeout(() => {
              nameInput.focus();
              nameInput.style.boxShadow = '0 0 20px rgba(245, 200, 66, 0.6)';
              setTimeout(() => { nameInput.style.boxShadow = ''; }, 1500);
            }, 600);
          }
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ──────────────────────────────────────────
     13. MOUSE PARALLAX on Hero
     ──────────────────────────────────────────*/
  const heroSection = document.querySelector('.hero');
  const heroBg      = document.querySelector('.hero-img');

  if (heroSection && heroBg) {
    heroSection.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = heroSection.getBoundingClientRect();
      const xPct = (e.clientX - left) / width  - 0.5;
      const yPct = (e.clientY - top)  / height - 0.5;
      heroBg.style.transform = `scale(1.05) translate(${xPct * 10}px, ${yPct * 8}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroBg.style.transform = 'scale(1.05)';
    });
  }

  /* ──────────────────────────────────────────
     14. 3D INTERACTIVE TILT PHYSICS FOR CARDS
     ──────────────────────────────────────────*/
  const tiltCards = document.querySelectorAll('.tilt-card, .service-card, .why-card, .float-card, .stat-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.4s ease';
    });
  });

  console.log('%c🏛️ Mujtaba Forex Trader — 3D Institutional Experience Active!', 'color:#f5c842;font-size:16px;font-weight:bold;');
})();
