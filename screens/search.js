/**
 * IsoClime – Search Screen Logic
 * Handles Leaflet map setup, zone selection, and neighborhood search.
 */

'use strict';

/* ============================================================
   SAMPLE ZONE DATA (would be fetched from an API in production)
   ============================================================ */
const ZONES = [
  { id: 'z01', name: 'Riverside District',    lat: 40.7128, lng: -74.0060, risk: 'high',     riskLevel: 82 },
  { id: 'z02', name: 'Greenfield Heights',    lat: 40.7282, lng: -73.9942, risk: 'moderate',  riskLevel: 55 },
  { id: 'z03', name: 'Eastbrook Quarter',     lat: 40.6782, lng: -73.9442, risk: 'low',       riskLevel: 28 },
  { id: 'z04', name: 'Northgate Commons',     lat: 40.7580, lng: -73.9855, risk: 'moderate',  riskLevel: 48 },
  { id: 'z05', name: 'Silverpine Valley',     lat: 40.6892, lng: -74.0445, risk: 'high',      riskLevel: 76 },
  { id: 'z06', name: 'Maplewood Terrace',     lat: 40.7412, lng: -74.0076, risk: 'low',       riskLevel: 19 },
  { id: 'z07', name: 'Harbor Front',          lat: 40.7018, lng: -74.0155, risk: 'high',      riskLevel: 90 },
  { id: 'z08', name: 'Skyline Park',          lat: 40.7484, lng: -73.9967, risk: 'moderate',  riskLevel: 63 },
];

const RISK_COLORS = {
  high:     '#ff6b6b',
  moderate: '#ffd166',
  low:      '#06d6a0',
};

/* ============================================================
   MAP SETUP
   ============================================================ */
let map;
let selectedZone = null;
let markers = [];

function initMap() {
  map = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: false,
  }).setView([40.7128, -74.0060], 12);

  // Tile layer – OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map);

  // Add zone markers
  ZONES.forEach(zone => {
    const color = RISK_COLORS[zone.risk];

    // Custom pulsing icon
    const icon = L.divIcon({
      className: '',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      html: `
        <div style="
          width:26px;height:26px;
          border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.5);
          box-shadow:0 0 12px ${color}, 0 0 0 0 ${color}66;
          animation:pulse-ring 2s infinite;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;color:#fff;font-weight:bold;
        ">📍</div>
      `,
    });

    const marker = L.marker([zone.lat, zone.lng], { icon })
      .bindPopup(`
        <div style="min-width:160px">
          <div style="font-family:'Orbitron',sans-serif;font-size:0.8rem;color:#00e5d4;margin-bottom:4px">${zone.name}</div>
          <div style="font-size:0.8rem;color:${color};text-transform:uppercase;letter-spacing:0.1em">
            ${zone.risk} risk
          </div>
          <div style="margin-top:6px;font-size:0.75rem;color:#a0e4d8">Risk index: ${zone.riskLevel}/100</div>
          <button
            onclick="selectZone('${zone.id}')"
            style="
              margin-top:8px;width:100%;
              background:linear-gradient(135deg,#00d4be,#007a6b);
              border:none;border-radius:8px;
              color:#fff;padding:7px;
              font-family:'Rajdhani',sans-serif;
              font-weight:600;cursor:pointer;font-size:0.8rem;
            "
          >Select This Zone</button>
        </div>
      `, { maxWidth: 200 })
      .addTo(map);

    markers.push({ id: zone.id, marker });
  });

  // Click on map to attempt reverse geocode / place pin
  map.on('click', e => {
    handleMapClick(e.latlng);
  });
}

function handleMapClick(latlng) {
  // Find the nearest zone
  let nearest = null;
  let minDist = Infinity;
  ZONES.forEach(zone => {
    const d = Math.hypot(zone.lat - latlng.lat, zone.lng - latlng.lng);
    if (d < minDist) { minDist = d; nearest = zone; }
  });

  if (nearest && minDist < 0.08) {
    selectZone(nearest.id);
  } else {
    // Custom click pin (free location)
    const customZone = {
      id: 'custom',
      name: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      lat: latlng.lat,
      lng: latlng.lng,
      risk: 'moderate',
      riskLevel: 50,
    };
    selectCustomZone(customZone);
  }
}

/* ============================================================
   ZONE SELECTION
   ============================================================ */
function selectZone(zoneId) {
  selectedZone = ZONES.find(z => z.id === zoneId);
  if (!selectedZone) return;
  activateZone(selectedZone);
}

function selectCustomZone(zone) {
  selectedZone = zone;
  activateZone(zone);
}

function activateZone(zone) {
  // Fly to zone
  map.flyTo([zone.lat, zone.lng], 14, { animate: true, duration: 1.2 });

  // Show scan overlay
  const overlay = document.getElementById('scan-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.display = 'none'; }, 3000);
  }

  // Update UI
  const zoneInfo = document.getElementById('zone-info');
  const zoneName = document.getElementById('selected-zone-name');
  const coordInfo = document.getElementById('coord-info');
  const coordText = document.getElementById('coord-text');
  const continueBtn = document.getElementById('continue-btn');

  if (zoneInfo) zoneInfo.style.display = 'block';
  if (zoneName) zoneName.textContent = zone.name;
  if (coordInfo) coordInfo.style.display = 'block';
  if (coordText) coordText.textContent = `LAT: ${zone.lat.toFixed(5)} | LNG: ${zone.lng.toFixed(5)}`;

  // Enable continue button
  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.pointerEvents = 'auto';
    continueBtn.removeAttribute('aria-disabled');
  }

  // Store in session
  IsoClime.setState({
    selectedZone: {
      id: zone.id,
      name: zone.name,
      lat: zone.lat,
      lng: zone.lng,
      risk: zone.risk,
      riskLevel: zone.riskLevel,
    }
  });
}

/* ============================================================
   SEARCH / SUGGESTIONS
   ============================================================ */
const searchInput = document.getElementById('search-input');
const suggestionsEl = document.getElementById('suggestions');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) {
      suggestionsEl.style.display = 'none';
      return;
    }
    const matches = ZONES.filter(z => z.name.toLowerCase().includes(q));
    renderSuggestions(matches);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toLowerCase();
      const match = ZONES.find(z => z.name.toLowerCase().includes(q));
      if (match) selectZone(match.id);
      suggestionsEl.style.display = 'none';
    }
  });
}

const searchGoBtn = document.getElementById('search-go-btn');
if (searchGoBtn) {
  searchGoBtn.addEventListener('click', () => {
    const q = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    const match = ZONES.find(z => z.name.toLowerCase().includes(q));
    if (match) { selectZone(match.id); suggestionsEl.style.display = 'none'; }
  });
}

function renderSuggestions(matches) {
  if (!matches.length) {
    suggestionsEl.style.display = 'none';
    return;
  }
  suggestionsEl.style.display = 'block';
  suggestionsEl.innerHTML = matches.map(z => `
    <div
      onclick="selectZone('${z.id}');document.getElementById('search-input').value='${z.name}';document.getElementById('suggestions').style.display='none'"
      style="
        padding:10px 12px;
        cursor:pointer;
        border-radius:10px;
        display:flex;align-items:center;gap:10px;
        transition:background 0.15s;
        font-family:var(--font-body);font-size:0.9rem;color:var(--text-primary);
      "
      onmouseenter="this.style.background='rgba(0,200,176,0.15)'"
      onmouseleave="this.style.background='transparent'"
    >
      <div style="width:10px;height:10px;border-radius:50%;background:${RISK_COLORS[z.risk]};flex-shrink:0"></div>
      ${z.name}
      <span style="margin-left:auto;font-size:0.72rem;color:var(--chrome-dark)">${z.risk}</span>
    </div>
  `).join('');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', initMap);
