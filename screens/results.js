/**
 * IsoClime – Results Screen Logic
 * Renders gauges, zone chips, and recommendation cards.
 */

'use strict';

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const state   = IsoClime.state;
  const results = state.results;

  if (!results) {
    // No results data – redirect to home
    window.location.href = '../index.html';
    return;
  }

  renderZoneChips(results);
  renderGauges(results);
  renderRecommendations(results.recommendations || []);
});

/* ============================================================
   ZONE CHIPS
   ============================================================ */
function renderZoneChips(results) {
  const container = document.getElementById('zone-chips');
  if (!container) return;

  const chips = [
    { label: results.zone || 'Unknown Zone', cls: 'chip-success' },
    { label: results.urgency === 'critical' ? 'CRITICAL' : results.urgency?.toUpperCase() || 'MODERATE', cls: results.urgency === 'critical' ? 'chip-danger' : 'chip-warn' },
    { label: 'AI Assessed', cls: 'chip-success' },
  ];

  container.innerHTML = chips.map(c =>
    `<span class="status-chip ${c.cls}">${c.label}</span>`
  ).join('');
}

/* ============================================================
   GAUGES
   ============================================================ */
function renderGauges(results) {
  const row = document.getElementById('gauges-row');
  if (!row) return;

  const gaugeData = [
    { label: 'Mold Risk',      value: results.moldRisk,      color: '#ff6b6b' },
    { label: 'Heat Retention', value: results.heatRisk,      color: '#ffd166' },
    { label: 'Humidity',       value: results.humidityLevel, color: '#06d6a0' },
  ];

  gaugeData.forEach(g => {
    row.appendChild(createGauge(g.label, g.value, g.color));
  });
}

/* ============================================================
   RECOMMENDATIONS
   ============================================================ */
function renderRecommendations(recs) {
  const list = document.getElementById('recommendations-list');
  if (!list) return;

  if (!recs.length) {
    list.innerHTML = `
      <div class="glass-panel" style="padding:20px;text-align:center">
        <div style="font-size:2rem;margin-bottom:8px">✅</div>
        <div style="color:var(--success);font-family:var(--font-display);font-size:0.9rem">Low Risk Profile</div>
        <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:6px">
          Your microclimate profile looks healthy. Continue monitoring periodically.
        </div>
      </div>
    `;
    return;
  }

  recs.forEach((r, i) => {
    const card = createRecCard(r.icon, r.priority, r.priorityClass, r.title, r.desc);
    card.style.animationDelay = `${i * 0.1}s`;
    list.appendChild(card);
  });
}
