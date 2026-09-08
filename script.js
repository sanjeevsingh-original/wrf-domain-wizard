// WRF Domain Wizard
// Uses the current map extent as the parent domain and creates centered nested domains.

const map = L.map('map').setView([20, 78], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const drawnItems = new L.FeatureGroup().addTo(map);
const domains = [];

const domainColors = ['#dc3545', '#0d6efd', '#198754'];
const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems, edit: true, remove: true },
  draw: {
    rectangle: false,
    polygon: false,
    circle: false,
    circlemarker: false,
    marker: false,
    polyline: false
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.EDITED, updateOutputFromDomains);
map.on(L.Draw.Event.DELETED, () => {
  domains.length = 0;
  drawnItems.eachLayer(layer => domains.push(layer));
  domains.sort((a, b) => (a.options.domainIndex ?? 0) - (b.options.domainIndex ?? 0));
  updateOutputFromDomains();
});

document.getElementById('drawBtn').addEventListener('click', drawDomains);
document.getElementById('exportBtn').addEventListener('click', exportNamelist);

function drawDomains() {
  const domainCount = Number(document.getElementById('domainCount').value);
  const bounds = map.getBounds();

  if (!bounds.isValid() || bounds.getNorth() <= bounds.getSouth() || bounds.getEast() <= bounds.getWest()) {
    showError('Please zoom to a valid geographic area first.');
    return;
  }

  drawnItems.clearLayers();
  domains.length = 0;

  let parentBounds = bounds;
  for (let i = 0; i < domainCount; i++) {
    const domainBounds = i === 0 ? parentBounds : shrinkBounds(parentBounds, 0.80);
    const domain = L.rectangle(domainBounds, {
      color: domainColors[i],
      weight: 2,
      fillOpacity: 0.08,
      domainIndex: i
    }).addTo(drawnItems);

    domain.bindTooltip(`d${i + 1}`, { sticky: true });
    domains.push(domain);
    parentBounds = domainBounds;
  }

  updateOutputFromDomains();
}

function shrinkBounds(bounds, factor) {
  const center = bounds.getCenter();
  const latHalf = (bounds.getNorth() - bounds.getSouth()) * factor / 2;
  const lonHalf = (bounds.getEast() - bounds.getWest()) * factor / 2;
  return L.latLngBounds(
    [center.lat - latHalf, center.lng - lonHalf],
    [center.lat + latHalf, center.lng + lonHalf]
  );
}

function updateOutputFromDomains() {
  const output = document.getElementById('output');
  if (!domains.length) {
    output.innerHTML = '<p class="text-muted mb-0">Draw domains to see their boundaries.</p>';
    return;
  }

  output.innerHTML = '<h5>Domain Boundaries</h5>' + domains.map((domain, i) => {
    const b = domain.getBounds();
    return `<div class="domain-summary mb-2">
      <strong>Domain ${i + 1}</strong><br>
      SW: ${b.getSouthWest().lat.toFixed(4)}, ${b.getSouthWest().lng.toFixed(4)}<br>
      NE: ${b.getNorthEast().lat.toFixed(4)}, ${b.getNorthEast().lng.toFixed(4)}
    </div>`;
  }).join('');
}

function exportNamelist() {
  if (!domains.length) {
    showError('Please draw domains first.');
    return;
  }

  try {
    const namelist = generateNamelist(domains.map(d => d.getBounds()));
    const blob = new Blob([namelist], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namelist.wps';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    showError(error.message || 'Unable to generate namelist.wps.');
  }
}

function showError(message) {
  const output = document.getElementById('output');
  output.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}
