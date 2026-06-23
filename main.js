/* =============================================
   PROECO — main.js
   ============================================= */

// ── CUSTOM CURSOR ──────────────────────────────

class CustomCursor {
  constructor() {
    this.dot  = document.getElementById('cursorDot');
    this.ring = document.getElementById('cursorRing');
    if (!this.dot || !this.ring) return;

    this.x = 0; this.y = 0;
    this.rx = 0; this.ry = 0;
    this.visible = false;

    document.addEventListener('mousemove', e => {
      this.x = e.clientX;
      this.y = e.clientY;
      if (!this.visible) { this.show(); this.visible = true; }
      // Dot follows instantly
      this.dot.style.transform = `translate(calc(${this.x}px - 50%), calc(${this.y}px - 50%))`;
    });

    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => { if (this.visible) this.show(); });

    // Hover state on interactive elements
    const hoverEls = 'a, button, .sector-card, .btn, .about-tags span, .clients-track img';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('ring-hover'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('ring-hover'));
    });

    this.animate();
  }

  show() {
    this.dot.style.opacity  = '1';
    this.ring.style.opacity = '1';
  }
  hide() {
    this.dot.style.opacity  = '0';
    this.ring.style.opacity = '0';
  }

  animate() {
    // Ring lags behind with lerp
    this.rx += (this.x - this.rx) * 0.11;
    this.ry += (this.y - this.ry) * 0.11;
    this.ring.style.transform = `translate(calc(${this.rx}px - 50%), calc(${this.ry}px - 50%))`;
    requestAnimationFrame(() => this.animate());
  }
}

// ── PARTICLE SYSTEM ────────────────────────────

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.pts    = [];
    this.mouse  = { x: -9999, y: -9999 };
    this.COUNT    = 75;
    this.MAX_DIST = 140;
    this.MOUSE_DIST = 200;

    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.pts = [];
    for (let i = 0; i < this.COUNT; i++) {
      this.pts.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r:  Math.random() * 1.6 + 0.4,
        o:  Math.random() * 0.38 + 0.08,
      });
    }
  }

  draw() {
    const { ctx, canvas, pts, mouse, MAX_DIST, MOUSE_DIST } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update + draw dots
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,120,48,${p.o})`;
      ctx.fill();
    });

    // Draw inter-particle connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(232,120,48,${(1 - d / MAX_DIST) * 0.14})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse connections
      const mx = pts[i].x - mouse.x;
      const my = pts[i].y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < MOUSE_DIST) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(232,120,48,${(1 - md / MOUSE_DIST) * 0.38})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    requestAnimationFrame(() => this.draw());
  }

  start() { this.draw(); }
}

// ── NAV SCROLL ─────────────────────────────────

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── MOBILE MENU ────────────────────────────────

const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  })
);

// ── HERO ENTRANCE SEQUENCE ─────────────────────

function runHeroEntrance() {
  const badge      = document.querySelector('.hero-badge');
  const lines      = document.querySelectorAll('.hl-line');
  const accentLine = document.querySelector('.accent-line');
  const sub        = document.querySelector('.hero-sub');
  const actions    = document.querySelector('.hero-actions');
  const stats      = document.getElementById('heroStats');

  setTimeout(() => badge.classList.add('vis'), 100);

  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('vis'), 260 + i * 170);
  });

  // accent line draws after the last headline line appears
  setTimeout(() => accentLine && accentLine.classList.add('vis'), 260 + lines.length * 170 + 100);

  setTimeout(() => sub.classList.add('vis'), 760);
  setTimeout(() => actions.classList.add('vis'), 940);

  setTimeout(() => {
    stats.classList.add('vis');
    stats.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
  }, 1080);
}

// ── COUNTER ANIMATION ──────────────────────────

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  (function tick(now) {
    const t     = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  })(performance.now());
}

// ── INTERSECTION OBSERVER ──────────────────────

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('vis', 'animated');
    io.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .sector-card').forEach(el => io.observe(el));

// ── INIT ───────────────────────────────────────

function init() {
  // Hero entrance
  runHeroEntrance();

  // Particle system (desktop only)
  const canvas = document.getElementById('particleCanvas');
  if (canvas && window.matchMedia('(hover: hover)').matches) {
    const ps = new ParticleSystem(canvas);
    ps.start();
  }

  // Custom cursor (desktop only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    new CustomCursor();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
