/**
 * IsoClime – Diagnosis Screen Logic
 * Manages the multi-step questionnaire.
 */

'use strict';

/* ============================================================
   QUESTIONS DATA
   ============================================================ */
const QUESTIONS = [
  {
    id: 'symptoms',
    icon: '🌡️',
    text: 'Are you experiencing any of these in your home?',
    options: [
      { value: 'mold',     label: 'Mold or musty odors',    icon: '🍄' },
      { value: 'humidity', label: 'Excessive humidity',      icon: '💧' },
      { value: 'heat',     label: 'Extreme heat indoors',    icon: '🔥' },
      { value: 'none',     label: 'None of the above',       icon: '✅' },
    ],
    multi: true,
  },
  {
    id: 'building_type',
    icon: '🏠',
    text: 'What type of building do you live in?',
    options: [
      { value: 'apartment', label: 'Apartment / Flat',   icon: '🏢' },
      { value: 'house',     label: 'Detached House',     icon: '🏠' },
      { value: 'semi',      label: 'Semi-detached',      icon: '🏘️' },
      { value: 'commercial',label: 'Commercial Building', icon: '🏬' },
    ],
    multi: false,
  },
  {
    id: 'sunlight',
    icon: '☀️',
    text: 'Does your home receive direct sunlight?',
    options: [
      { value: 'all_day',   label: 'Yes, most of the day', icon: '🌞' },
      { value: 'partial',   label: 'Partially (morning/evening)', icon: '⛅' },
      { value: 'minimal',   label: 'Very little sunlight', icon: '🌥️' },
      { value: 'none',      label: 'No direct sunlight',  icon: '🌑' },
    ],
    multi: false,
  },
  {
    id: 'urgency',
    icon: '⚡',
    text: 'How urgent is the issue for you?',
    options: [
      { value: 'critical', label: 'Critical – needs immediate action', icon: '🚨' },
      { value: 'moderate', label: 'Moderate – within a few months',   icon: '⚠️' },
      { value: 'planning', label: 'Planning – within a year',         icon: '📅' },
      { value: 'curious',  label: 'Just curious / exploring',         icon: '🔍' },
    ],
    multi: false,
  },
  {
    id: 'budget',
    icon: '💰',
    text: 'What is your budget for climate improvements?',
    options: [
      { value: 'free',     label: 'Free / DIY solutions only', icon: '🆓' },
      { value: 'low',      label: 'Under $500',                icon: '💵' },
      { value: 'medium',   label: '$500 – $2,000',             icon: '💳' },
      { value: 'high',     label: 'Over $2,000',               icon: '💎' },
    ],
    multi: false,
  },
];

/* ============================================================
   STATE
   ============================================================ */
let currentStep = 0;
const answers = {};

/* ============================================================
   RENDER
   ============================================================ */
function renderQuestion(index) {
  const q = QUESTIONS[index];
  const container = document.getElementById('questions-container');
  if (!container) return;

  const existing = answers[q.id] || [];

  container.innerHTML = `
    <div class="question-card glass-panel active anim-slide-up">
      <div class="question-number">Question ${index + 1} of ${QUESTIONS.length}</div>
      <div class="question-icon">${q.icon}</div>
      <div class="question-text">${q.text}</div>
      ${q.multi ? `<div class="pixel-label" style="margin-bottom:8px;color:var(--chrome-dark)">Select all that apply</div>` : ''}
      <div class="options-grid" id="options-grid">
        ${q.options.map(opt => `
          <button
            class="toggle-btn${existing.includes(opt.value) ? ' selected' : ''}"
            data-value="${opt.value}"
            onclick="toggleOption('${q.id}', '${opt.value}', ${q.multi})"
            aria-pressed="${existing.includes(opt.value)}"
          >
            <span class="btn-icon">${opt.icon}</span>
            ${opt.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  updateNavButtons();
  updateProgress();
}

function toggleOption(qId, value, multi) {
  if (multi) {
    // Toggle in array
    if (!answers[qId]) answers[qId] = [];
    const idx = answers[qId].indexOf(value);
    if (idx === -1) answers[qId].push(value);
    else answers[qId].splice(idx, 1);
  } else {
    answers[qId] = [value];
  }

  // Update button states
  const grid = document.getElementById('options-grid');
  if (grid) {
    grid.querySelectorAll('.toggle-btn').forEach(btn => {
      const v = btn.dataset.value;
      const selected = (answers[qId] || []).includes(v);
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', selected);
    });
  }

  updateNavButtons();
}

function updateNavButtons() {
  const q = QUESTIONS[currentStep];
  const answered = answers[q.id] && answers[q.id].length > 0;

  const nextBtn  = document.getElementById('next-btn');
  const prevBtn  = document.getElementById('prev-btn');
  const stepLabel = document.getElementById('step-label');

  if (nextBtn) {
    nextBtn.style.opacity = answered ? '1' : '0.4';
    nextBtn.style.pointerEvents = answered ? 'auto' : 'none';

    // Last question → button becomes Submit
    if (currentStep === QUESTIONS.length - 1 && answered) {
      nextBtn.textContent = 'Submit →';
    } else {
      nextBtn.textContent = 'Next →';
    }
  }

  if (prevBtn) {
    prevBtn.style.display = currentStep > 0 ? 'inline-flex' : 'none';
  }

  if (stepLabel) {
    stepLabel.textContent = `Step ${currentStep + 2}/${QUESTIONS.length + 1}`;
  }
}

function updateProgress() {
  const pct = Math.round((currentStep / QUESTIONS.length) * 100);
  const fill = document.getElementById('progress-fill');
  const pctEl = document.getElementById('progress-pct');
  if (fill) fill.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function diagnosisNav(direction) {
  const q = QUESTIONS[currentStep];

  if (direction > 0) {
    // Validate
    if (!answers[q.id] || answers[q.id].length === 0) return;

    if (currentStep === QUESTIONS.length - 1) {
      // Last step → save and go to processing
      IsoClime.setState({ diagnosisAnswers: answers });
      window.location.href = 'processing.html';
      return;
    }
    currentStep++;
  } else {
    currentStep = Math.max(0, currentStep - 1);
  }

  renderQuestion(currentStep);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Restore any previous answers
  const saved = IsoClime.state.diagnosisAnswers;
  if (saved) Object.assign(answers, saved);

  renderQuestion(currentStep);
});
