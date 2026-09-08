// WRF grid-geometry helpers.
// These calculations are intentionally transparent and browser-only; final production
// domains should still be verified with the installed WPS geogrid.exe.

const WRF = {
  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  },

  haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0088;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  },

  eastWestKm(bounds) {
    return this.haversineKm(bounds.getCenter().lat, bounds.getWest(), bounds.getCenter().lat, bounds.getEast());
  },

  northSouthKm(bounds) {
    return this.haversineKm(bounds.getSouth(), bounds.getCenter().lng, bounds.getNorth(), bounds.getCenter().lng);
  },

  gridDimensions(bounds, dx, dy) {
    const nx = Math.max(3, Math.round((this.eastWestKm(bounds) * 1000) / dx) + 1);
    const ny = Math.max(3, Math.round((this.northSouthKm(bounds) * 1000) / dy) + 1);
    return { e_we: nx, e_sn: ny };
  },

  shrinkBounds(bounds, factor) {
    const center = bounds.getCenter();
    const latHalf = (bounds.getNorth() - bounds.getSouth()) * factor / 2;
    const lonHalf = (bounds.getEast() - bounds.getWest()) * factor / 2;
    return L.latLngBounds(
      [center.lat - latHalf, center.lng - lonHalf],
      [center.lat + latHalf, center.lng + lonHalf]
    );
  },

  normalizeGridDimension(value, ratio) {
    // WRF nested dimensions should correspond to an integer number of parent cells
    // at the requested nesting ratio: child_points = parent_cells * ratio + 1.
    const cells = Math.max(1, Math.round((value - 1) / ratio));
    return cells * ratio + 1;
  },

  parentStart(parentBounds, childBounds, parentDx, parentDy) {
    const westKm = this.haversineKm(parentBounds.getCenter().lat, parentBounds.getWest(), parentBounds.getCenter().lat, childBounds.getWest());
    const southKm = this.haversineKm(parentBounds.getSouth(), parentBounds.getCenter().lng, childBounds.getSouth(), parentBounds.getCenter().lng);
    return {
      i: Math.max(1, Math.round((westKm * 1000) / parentDx) + 1),
      j: Math.max(1, Math.round((southKm * 1000) / parentDy) + 1)
    };
  },

  validate(domains, dx, dy, ratios) {
    const errors = [];
    if (!Number.isFinite(dx) || dx < 100) errors.push('dx must be at least 100 m.');
    if (!Number.isFinite(dy) || dy < 100) errors.push('dy must be at least 100 m.');
    if (!domains.length) errors.push('At least one domain is required.');

    for (let i = 0; i < domains.length; i++) {
      const b = domains[i].getBounds();
      const g = this.gridDimensions(b, dx * (ratios.slice(0, i).reduce((a, r) => a * r, 1)), dy * (ratios.slice(0, i).reduce((a, r) => a * r, 1)));
      if (g.e_we < 20 || g.e_sn < 20) errors.push(`d${i + 1} is too small (${g.e_we} × ${g.e_sn} grid points).`);
      if (i > 0) {
        const p = domains[i - 1].getBounds();
        if (!p.contains(b)) errors.push(`d${i + 1} is not fully contained inside d${i}.`);
        if (ratios[i] < 2 || !Number.isInteger(ratios[i])) errors.push(`d${i + 1} has an invalid nesting ratio.`);
      }
    }
    return errors;
  }
};
