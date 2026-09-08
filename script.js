// WRF Domain Wizard
const map = L.map('map').setView([20, 78], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
}).addTo(map);

const drawnItems = new L.FeatureGroup().addTo(map);
const domains = [];
const domainColors = ['#dc3545', '#0d6efd', '#198754'];
const ratioInput = document.getElementById('nestRatio');

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems, edit: true, remove: true },
  draw: { rectangle: false, polygon: false, circle: false, circlemarker: false, marker: false, polyline: false }
});
map.addControl(drawControl);

map.on(L.Draw.Event.EDITED, () => {
  syncDomains();
  updateOutputFromDomains();
});
map.on(L.Draw.Event.DELETED, () => {
  syncDomains();
  updateOutputFromDomains();
});

document.getElementById('drawBtn').addEventListener('click', drawDomains);
document.getElementById('exportBtn').addEventListener('click', exportNamelist);
document.getElementById('projectionInput').addEventListener('change', updateProjectionUI);
document.getElementById('autoCenterInput').addEventListener('change', updateOutputFromDomains);
ratioInput.addEventListener('change', () => { if (domains.length) drawDomains(); });
updateProjectionUI();

function drawDomains() {
  const count = Number(document.getElementById('domainCount').value);
  const ratio = Number(ratioInput.value);
  const bounds = map.getBounds();
  const dx = Number(document.getElementById('dxInput').value);
  const dy = Number(document.getElementById('dyInput').value);

  if (!bounds.isValid() || bounds.getNorth() <= bounds.getSouth() || bounds.getEast() <= bounds.getWest()) {
    showError('Please zoom to a valid geographic area first.'); return;
  }
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx < 100 || dy < 100) {
    showError('dx and dy must be valid values of at least 100 m.'); return;
  }

  drawnItems.clearLayers(); domains.length = 0;
  let parentBounds = bounds;
  for (let i = 0; i < count; i++) {
    const domainBounds = i === 0 ? parentBounds : WRF.shrinkBounds(parentBounds, 1 / ratio);
    const domain = L.rectangle(domainBounds, {
      color: domainColors[i], weight: 2, fillOpacity: 0.08, domainIndex: i
    }).addTo(drawnItems);
    domain.bindTooltip(`d${i + 1}`, { sticky: true });
    domains.push(domain);
    parentBounds = domainBounds;
  }
  updateOutputFromDomains();
}

function syncDomains() {
  domains.length = 0;
  drawnItems.eachLayer(layer => domains.push(layer));
  domains.sort((a, b) => (a.options.domainIndex ?? 0) - (b.options.domainIndex ?? 0));
}

function updateProjectionUI() {
  const projection = document.getElementById('projectionInput').value;
  document.getElementById('lambertOptions').style.display = projection === 'lambert' ? 'block' : 'none';
  updateOutputFromDomains();
}

function getReferencePoint() {
  const b = domains[0].getBounds();
  const auto = document.getElementById('autoCenterInput').checked;
  const lat = auto ? b.getCenter().lat : Number(document.getElementById('refLatInput').value);
  const lon = auto ? b.getCenter().lng : Number(document.getElementById('refLonInput').value);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('Reference latitude/longitude must be valid.');
  }
  return { lat, lon };
}

function getProjectionSettings() {
  const projection = document.getElementById('projectionInput').value;
  const ref = getReferencePoint();
  const settings = { projection, refLat: ref.lat, refLon: ref.lon };
  if (projection === 'lambert') {
    settings.truelat1 = Number(document.getElementById('trueLat1Input').value);
    settings.truelat2 = Number(document.getElementById('trueLat2Input').value);
    if (![settings.truelat1, settings.truelat2].every(Number.isFinite) ||
        Math.abs(settings.truelat1) >= 90 || Math.abs(settings.truelat2) >= 90) {
      throw new Error('Lambert true latitudes must be valid values between -90 and 90 degrees.');
    }
  }
  return settings;
}

function updateOutputFromDomains() {
  const output = document.getElementById('output');
  if (!domains.length) {
    output.innerHTML = '<p class="text-muted mb-0">Generate domains to see grid dimensions and validation.</p>'; return;
  }

  try {
    const dx = Number(document.getElementById('dxInput').value);
    const dy = Number(document.getElementById('dyInput').value);
    const ratio = Number(ratioInput.value);
    const ratios = Array(domains.length).fill(ratio); ratios[0] = 1;
    const errors = WRF.validate(domains, dx, dy, ratios);
    const projection = getProjectionSettings();
    const cumulative = { x: 1, y: 1 };

    const rows = domains.map((domain, i) => {
      const b = domain.getBounds();
      if (i > 0) { cumulative.x *= ratio; cumulative.y *= ratio; }
      const g = WRF.gridDimensions(b, dx / cumulative.x, dy / cumulative.y);
      const validEW = i === 0 ? g.e_we : WRF.normalizeGridDimension(g.e_we, ratio);
      const validES = i === 0 ? g.e_sn : WRF.normalizeGridDimension(g.e_sn, ratio);
      return `<div class="domain-summary mb-2"><strong>d${i + 1}</strong> — ${validEW} × ${validES} grid points<br>` +
        `SW: ${b.getSouthWest().lat.toFixed(4)}, ${b.getSouthWest().lng.toFixed(4)}<br>` +
        `NE: ${b.getNorthEast().lat.toFixed(4)}, ${b.getNorthEast().lng.toFixed(4)}<br>` +
        `<span class="text-muted">grid spacing: ${(dx / cumulative.x).toFixed(0)} × ${(dy / cumulative.y).toFixed(0)} m</span></div>`;
    }).join('');

    const status = errors.length
      ? `<div class="alert alert-danger py-2"><strong>Validation:</strong><ul class="mb-0">${errors.map(escapeHtml).map(e => `<li>${e}</li>`).join('')}</ul></div>`
      : '<div class="alert alert-success py-2 mb-2">Nesting and basic grid checks passed.</div>';

    output.innerHTML = `<h5>Domain Summary</h5>${status}${rows}` +
      `<div class="small text-muted">Projection: <strong>${escapeHtml(projection.projection)}</strong> · ref: ${projection.refLat.toFixed(3)}, ${projection.refLon.toFixed(3)}</div>`;
  } catch (error) {
    output.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(error.message)}</div>`;
  }
}

function exportNamelist() {
  if (!domains.length) { showError('Please generate domains first.'); return; }
  try {
    const dx = Number(document.getElementById('dxInput').value);
    const dy = Number(document.getElementById('dyInput').value);
    const ratio = Number(ratioInput.value);
    const ratios = Array(domains.length).fill(ratio); ratios[0] = 1;
    const errors = WRF.validate(domains, dx, dy, ratios);
    if (errors.length) throw new Error(`Fix validation issues before export: ${errors.join(' ')}`);
    const settings = getProjectionSettings();
    const geogRes = document.getElementById('geogResInput').value;
    const namelist = generateNamelist(domains.map(d => d.getBounds()), {
      dx, dy, ratios, projection: settings.projection, refLat: settings.refLat,
      refLon: settings.refLon, truelat1: settings.truelat1, truelat2: settings.truelat2,
      geogDataRes: geogRes
    });
    const blob = new Blob([namelist], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'namelist.wps';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { showError(error.message || 'Unable to generate namelist.wps.'); }
}

function showError(message) {
  document.getElementById('output').innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(message)}</div>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
