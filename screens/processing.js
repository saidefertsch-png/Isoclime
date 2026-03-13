/**
 * IsoClime – Processing Screen Logic
 * Simulates AI analysis with animated log stream and progress bar.
 */

'use strict';

/* ============================================================
   LOG MESSAGES (simulated AI pipeline)
   ============================================================ */
const LOG_STEPS = [
  { delay: 200,  cls: 'log-scan', msg: '[ MAP ] Loading zone geometry data…' },
  { delay: 600,  cls: 'log-ok',   msg: '[ OK  ] Zone data loaded successfully' },
  { delay: 1000, cls: 'log-scan', msg: '[ AI  ] Parsing symptom responses…' },
  { delay: 1400, cls: 'log-scan', msg: '[ AI  ] Cross-referencing climate database…' },
  { delay: 1800, cls: 'log-ok',   msg: '[ OK  ] Historical humidity data found' },
  { delay: 2200, cls: 'log-warn', msg: '[ WRN ] Elevated mold risk index detected' },
  { delay: 2700, cls: 'log-scan', msg: '[ AI  ] Calculating heat retention score…' },
  { delay: 3100, cls: 'log-ok',   msg: '[ OK  ] Building type factor applied' },
  { delay: 3500, cls: 'log-scan', msg: '[ AI  ] Generating personalized recommendations…' },
  { delay: 4000, cls: 'log-ok',   msg: '[ OK  ] Risk profile compiled' },
  { delay: 4400, cls: 'log-scan', msg: '[ OUT ] Writing results to dashboard…' },
  { delay: 4800, cls: 'log-ok',   msg: '[ OK  ] Analysis complete ✓' },
];

const STATUS_LABELS = [
  { pct: 0,   label: 'INITIALIZING' },
  { pct: 15,  label: 'LOADING ZONE DATA' },
  { pct: 30,  label: 'PARSING RESPONSES' },
  { pct: 45,  label: 'CROSS-REFERENCING DB' },
  { pct: 60,  label: 'CALCULATING RISKS' },
  { pct: 75,  label: 'BUILDING PROFILE' },
  { pct: 88,  label: 'GENERATING ACTIONS' },
  { pct: 95,  label: 'COMPILING RESULTS' },
  { pct: 100, label: 'COMPLETE' },
];

const SUB_MESSAGES = [
  'Initializing AI engine…',
  'Loading microclimate vectors…',
  'Scanning urban heat signatures…',
  'Evaluating humidity corridors…',
  'Modeling ventilation pathways…',
  'Synthesizing risk matrix…',
  'Preparing recommendations…',
];

/* ============================================================
   PROGRESS ANIMATION
   ============================================================ */
function startProcessing() {
  const progressEl  = document.getElementById('proc-progress');
  const statusEl    = document.getElementById('proc-status');
  const pctEl       = document.getElementById('proc-pct');
  const subEl       = document.getElementById('processing-sub');
  const logEl       = document.getElementById('log-stream');

  if (!progressEl) return;

  let currentPct = 0;
  let subIdx = 0;

  // Animate progress bar smoothly
  const totalDuration = 5200; // ms – matches last LOG_STEP delay
  const startTime = performance.now();

  function updateProgress(ts) {
    const elapsed = ts - startTime;
    const rawPct = Math.min((elapsed / totalDuration) * 100, 100);

    // Ease-in-out curve
    const t = rawPct / 100;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    currentPct = Math.round(eased * 100);

    if (progressEl) progressEl.style.width = `${currentPct}%`;
    if (pctEl) pctEl.textContent = `${currentPct}%`;

    // Update status label
    const currentStatus = STATUS_LABELS.slice().reverse().find(s => currentPct >= s.pct);
    if (statusEl && currentStatus) statusEl.textContent = currentStatus.label;

    if (rawPct < 100) {
      requestAnimationFrame(updateProgress);
    }
  }
  requestAnimationFrame(updateProgress);

  // Update sub message every ~700ms
  const subTimer = setInterval(() => {
    subIdx = (subIdx + 1) % SUB_MESSAGES.length;
    if (subEl) subEl.textContent = SUB_MESSAGES[subIdx];
  }, 700);

  // Schedule log lines
  LOG_STEPS.forEach(step => {
    setTimeout(() => {
      if (!logEl) return;
      const line = document.createElement('div');
      line.className = `log-line ${step.cls}`;
      line.textContent = step.msg;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    }, step.delay);
  });

  // Complete: compute results and navigate
  setTimeout(() => {
    clearInterval(subTimer);
    computeResults();

    // Short pause so user sees 100%
    setTimeout(() => {
      window.location.href = 'results.html';
    }, 800);
  }, totalDuration + 200);
}

/* ============================================================
   COMPUTE RESULTS
   Based on diagnosis answers and selected zone.
   ============================================================ */
function computeResults() {
  const state   = IsoClime.state;
  const answers = state.diagnosisAnswers || {};
  const zone    = state.selectedZone    || {};

  const symptoms = answers.symptoms      || [];
  const sunlight = (answers.sunlight     || [])[0] || 'partial';
  const urgency  = (answers.urgency      || [])[0] || 'moderate';
  const budget   = (answers.budget       || [])[0] || 'low';
  const building = (answers.building_type|| [])[0] || 'house';

  // --- Mold Risk ---
  let moldRisk = (zone.riskLevel || 50) * 0.4;
  if (symptoms.includes('mold'))     moldRisk += 35;
  if (symptoms.includes('humidity')) moldRisk += 20;
  if (building === 'apartment')      moldRisk += 10;
  if (sunlight === 'none')           moldRisk += 15;
  moldRisk = Math.min(100, Math.round(moldRisk));

  // --- Heat Retention ---
  let heatRisk = (zone.riskLevel || 50) * 0.35;
  if (symptoms.includes('heat'))     heatRisk += 30;
  if (sunlight === 'all_day')        heatRisk += 25;
  if (building === 'commercial')     heatRisk += 15;
  heatRisk = Math.min(100, Math.round(heatRisk));

  // --- Humidity Level ---
  let humidityLevel = (zone.riskLevel || 50) * 0.45;
  if (symptoms.includes('humidity')) humidityLevel += 30;
  if (symptoms.includes('mold'))     humidityLevel += 15;
  if (sunlight === 'none')           humidityLevel += 12;
  humidityLevel = Math.min(100, Math.round(humidityLevel));

  // --- Recommendations ---
  const recs = [];

  if (moldRisk >= 60 || symptoms.includes('mold')) {
    recs.push({
      icon: '💧', priority: 'IMMEDIATE', priorityClass: 'priority-immediate',
      title: 'Install Dehumidifier',
      desc: 'Reduce indoor humidity below 50% to prevent mold growth. Use a portable unit in damp areas.',
    });
  }

  if (heatRisk >= 50 || sunlight === 'all_day') {
    recs.push({
      icon: '🌬️', priority: 'IMMEDIATE', priorityClass: 'priority-immediate',
      title: 'Improve Ventilation',
      desc: 'Cross-ventilate by opening opposing windows during cooler morning or evening hours.',
    });
  }

  if (budget === 'free' || budget === 'low') {
    recs.push({
      icon: '🍃', priority: 'LOW-COST', priorityClass: 'priority-low',
      title: 'Add Shade with Plants',
      desc: 'Climbing plants and window shading can reduce solar heat gain by up to 30%.',
    });
  }

  if (budget !== 'free') {
    recs.push({
      icon: '🔲', priority: 'LOW-COST', priorityClass: 'priority-low',
      title: 'Reflective Window Film',
      desc: 'Applies to existing glass and reduces heat gain without blocking natural light.',
    });
  }

  if (budget === 'medium' || budget === 'high') {
    recs.push({
      icon: '🏠', priority: 'LONG-TERM', priorityClass: 'priority-long',
      title: 'Cool Roof Coating',
      desc: 'White or reflective roof coatings can reduce roof surface temperature by 10–15°C.',
    });
    recs.push({
      icon: '🌡️', priority: 'LONG-TERM', priorityClass: 'priority-long',
      title: 'Smart HVAC Installation',
      desc: 'Adaptive climate control systems optimize cooling and reduce energy consumption by up to 25%.',
    });
  }

  if (urgency === 'critical') {
    recs.unshift({
      icon: '🚨', priority: 'IMMEDIATE', priorityClass: 'priority-immediate',
      title: 'Emergency Ventilation Assessment',
      desc: 'Contact a certified building inspector immediately for an urgent microclimate assessment.',
    });
  }

  IsoClime.setState({
    results: {
      moldRisk,
      heatRisk,
      humidityLevel,
      recommendations: recs,
      zone: zone.name || 'Unknown Zone',
      urgency,
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', startProcessing);
