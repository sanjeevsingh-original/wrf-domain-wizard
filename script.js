// WRF Domain Wizard
const map = L.map('map').setView([20, 78], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
}).addTo(map);

const drawnItems = new L.FeatureGroup().addTo(map);
const domains = [];
const domainColors = ['#dc3545', '#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#20c997', '#d63384', '#6610f2', '#1982c4', '#495057'];
const domainCountInput = document.getElementById('domainCount');
const ratioInput = document.getElementById('nestRatio');
let drawingActive = false;

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems, edit: true, remove: true },
  draw: {
    rectangle: true,
    polygon: false,
    circle: false,
    circlemarker: false,
    marker: false,
    polyline: false
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, event => {
  const expected = Number(domainCountInput.value);
  if (domains.length >= expected) {
    showError(`You selected ${expected} domain${expected === 1 ? '' : 's'}. Change the number of domains or clear the drawing first.`);
    return;
  }

  const index = domains.length;
  const layer = event.layer;
  layer.options.domainIndex = index;
  layer.setStyle({ color: domainColors[index], weight: 2, fillOpacity: 0.08 });
  layer.bindTooltip(`d${index + 1}`, { sticky: true });
  drawnItems.addLayer(layer);
  domains.push(layer);

  if (index > 0 && !domains[index - 1].getBounds().contains(layer.getBounds())) {
    layer.setStyle({ color: '#dc3545', dashArray: '6 4' });
    showError(`d${index + 1} must be fully contained inside d${index}. Please edit or redraw it.`);
  } else {
    updateOutputFromDomains();
  }

  if (domains.length === expected) {
    drawingActive = false;
    showMessage(`All ${expected} domain${expected === 1 ? '' : 's'} drawn. You can edit them using the map edit tool.`);
  }
});

map.on(L.Draw.Event.EDITED, () => {
  syncDomains();
  updateOutputFromDomains();
});
map.on(L.Draw.Event.DELETED, () => {
  syncDomains();
  updateOutputFromDomains();
});

document.getElementById('drawBtn').addEventListener('click', startDrawing);
document.getElementById('clearBtn').addEventListener('click', clearDomains);
document.getElementById('exportBtn').addEventListener('click', exportNamelist);
document.getElementById('projectionInput').addEventListener('change', updateProjectionUI);
document.getElementById('autoCenterInput').addEventListener('change', updateOutputFromDomains);
ratioInput.addEventListener('input', updateOutputFromDomains);
domainCountInput.addEventListener('change', () => {
  const expected = Number(domainCountInput.value);
  if (domains.length > expected) {
    showError(`You now require ${expected} domains, but ${domains.length} are already drawn. Clear and redraw to apply the new count.`);
  } else if (domains.length) {
    updateOutputFromDomains();
  }
});
updateProjectionUI();

function startDrawing() {
  clearDomains(false);
  drawingActive = true;
  const expected = Number(domainCountInput.value);
  showMessage(`Draw d01 first, then d02 through d${String(expected).padStart(2, '0')}. Use the rectangle tool in the map toolbar.`);
  // Programmatically activate Leaflet.Draw's rectangle tool for the first domain.
  new L.Draw.Rectangle(map, drawControl.options.draw.rectangle ? drawControl.options.draw : {}).enable();
}

function clearDomains(show = true) {
  drawnItems.clearLayers();
  domains.length = 0;
  drawingActive = false;
  if (show) showMessage('All domains cleared. Select the number of domains and start drawing again.');
  else updateOutputFromDomains();
}

function syncDomains() {
  domains.length = 0;
  drawnItems.eachLayer(layer => domains.push(layer));
  domains.sort((a, b) => (a.options.domainIndex ?? 999) - (b.options.domainIndex ?? 999));
  domains.forEach((layer, i) => {
    layer.options.domainIndex = i;
    layer.setStyle({ color: domainColors[i], weight: 2, fillOpacity: 0.08 });
    if (layer.getTooltip()) layer.setTooltipContent(`d${i + 1}`);
    else layer.bindTooltip(`d${i + 1}`, { sticky: true });
  });
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
    if (![settings.truelat1, settings.truelat2].every(Number.isFinite) || Math.abs(settings.truelat1) >= 90 || Math.abs(settings.truelat2) >= 90) {
      throw new Error('Lambert true latitudes must be valid values between -90 and 90 degrees.');
    }
  }
  return settings;
}

function getNestRatio() {
  const ratio = Number(ratioInput.value);
  if (!Number.isInteger(ratio) || ratio < 2 || ratio > 10) throw new Error('Nest ratio must be an integer from 2 to 10.');
  return ratio;
}

function updateOutputFromDomains() {
  const output = document.getElementById('output');
  if (!domains.length) {
    output.innerHTML = '<p class="text-muted mb-0">Select the number of domains, then draw the rectangles on the map.</p>'; return;
  }

  try {
    const dx = Number(document.getElementById('dxInput').value);
    const dy = Number(document.getElementById('dyInput').value);
    const ratio = getNestRatio();
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

    const expected = Number(domainCountInput.value);
    const progress = domains.length < expected
      ? `<div class="alert alert-warning py-2">Draw ${expected - domains.length} more domain${expected - domains.length === 1 ? '' : 's'} to complete the configuration (${domains.length}/${expected}).</div>`
      : '';

    output.innerHTML = `<h5>Domain Summary</h5>${progress}${status}${rows}` +
      `<div class="small text-muted">Projection: <strong>${escapeHtml(projection.projection)}</strong> · ref: ${projection.refLat.toFixed(3)}, ${projection.refLon.toFixed(3)} · nest ratio: ${ratio}:1</div>`;
  } catch (error) {
    output.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(error.message)}</div>`;
  }
}

function exportNamelist() {
  if (!domains.length) { showError('Please draw at least d01 first.'); return; }
  const expected = Number(domainCountInput.value);
  if (domains.length !== expected) { showError(`You selected ${expected} domains but have drawn ${domains.length}. Please complete the domain drawing.`); return; }
  try {
    const dx = Number(document.getElementById('dxInput').value);
    const dy = Number(document.getElementById('dyInput').value);
    const ratio = getNestRatio();
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

function showMessage(message) { document.getElementById('output').innerHTML = `<div class="alert alert-info mb-0">${escapeHtml(message)}</div>`; }
function showError(message) { document.getElementById('output').innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(message)}</div>`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
