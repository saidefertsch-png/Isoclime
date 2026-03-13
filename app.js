/**
 * IsoClime – Main Application Logic
 * Shared utilities, background animation, and data storage.
 */

'use strict';

/* ============================================================
   STATE  (stored in sessionStorage so it persists across pages)
   ============================================================ */
const IsoClime = {
  get state() {
    try {
      return JSON.parse(sessionStorage.getItem('isoclime_state') || '{}');
    } catch (_) {
      return {};
    }
  },
  setState(updates) {
    const current = this.state;
    sessionStorage.setItem('isoclime_state', JSON.stringify({ ...current, ...updates }));
  },
  clearState() {
    sessionStorage.removeItem('isoclime_state');
  }
};

/* ============================================================
   ANIMATED BACKGROUND CANVAS
   Draws floating chrome droplets and drifting particles.
   ============================================================ */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x: randomBetween(0, canvas.width),
      y: randomBetween(0, canvas.height),
      r: randomBetween(1, 4),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.5, -0.1),
      alpha: randomBetween(0.08, 0.35),
      hue: randomBetween(160, 200),  // teal-aqua range
    };
  }

  function initParticles() {
    const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000));
    particles = Array.from({ length: count }, createParticle);
  }

  function drawGrid() {
    const spacing = 60;
    ctx.strokeStyle = 'rgba(0,200,176,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
    grad.addColorStop(0, `hsla(${p.hue},80%,70%,${p.alpha})`);
    grad.addColorStop(1, `hsla(${p.hue},80%,50%,0)`);
    ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // subtle radial vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.2,
      canvas.width / 2, canvas.height / 2, canvas.height * 0.85
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    for (const p of particles) {
      drawParticle(p);
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = randomBetween(0, canvas.width);
      }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
    }

    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  loop();
})();

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Animate a counter from 0 to target value.
 * @param {HTMLElement} el - element to update
 * @param {number} target - target number (0-100)
 * @param {string} suffix - e.g. '%'
 * @param {number} duration - ms
 */
function animateCounter(el, target, suffix = '', duration = 1400) {
  let start = null;
  const from = 0;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (target - from) * ease) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Create an SVG gauge ring element.
 * @param {string} label - display label
 * @param {number} value - 0-100
 * @param {string} color - CSS color
 * @returns {HTMLElement}
 */
function createGauge(label, value, color) {
  const circumference = 283; // 2π × 45
  const dashOffset = circumference - (value / 100) * circumference;

  const riskClass = value >= 70 ? 'chip-danger' : value >= 40 ? 'chip-warn' : 'chip-success';

  const wrap = document.createElement('div');
  wrap.className = 'gauge-container';
  wrap.innerHTML = `
    <div class="gauge-ring">
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle class="gauge-bg" cx="50" cy="50" r="45"/>
        <circle
          class="gauge-fill"
          cx="50" cy="50" r="45"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference}"
          id="gauge-fill-${label.replace(/\s/g,'')}"
        />
      </svg>
      <div class="gauge-center">
        <div class="gauge-value" style="color:${color}" id="gauge-val-${label.replace(/\s/g,'')}">0%</div>
        <div class="gauge-label">${label}</div>
      </div>
    </div>
    <span class="status-chip ${riskClass}" style="font-size:0.6rem">
      ${value >= 70 ? '▲ HIGH' : value >= 40 ? '▶ MED' : '▼ LOW'}
    </span>
  `;

  // Animate after a short delay
  setTimeout(() => {
    const fill = wrap.querySelector(`#gauge-fill-${label.replace(/\s/g,'')}`);
    const valEl = wrap.querySelector(`#gauge-val-${label.replace(/\s/g,'')}`);
    if (fill) fill.style.strokeDashoffset = dashOffset;
    if (valEl) animateCounter(valEl, value, '%');
  }, 300);

  return wrap;
}

/**
 * Create a recommendation card element.
 */
function createRecCard(icon, priority, priorityClass, title, desc) {
  const div = document.createElement('div');
  div.className = 'recommendation-card chrome-panel anim-slide-up';
  div.innerHTML = `
    <div class="rec-icon-wrap">${icon}</div>
    <div class="rec-content">
      <div class="rec-priority ${priorityClass}">${priority}</div>
      <div class="rec-title">${title}</div>
      <div class="rec-desc">${desc}</div>
    </div>
  `;
  return div;
}
