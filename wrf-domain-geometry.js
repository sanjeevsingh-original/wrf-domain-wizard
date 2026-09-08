// WRF grid-geometry helpers.
// Geographic-distance calculations are approximate; verify the final domain with WPS geogrid.exe.
const WRF = {
  haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0088, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  },
  eastWestKm(bounds) { return this.haversineKm(bounds.getCenter().lat, bounds.getWest(), bounds.getCenter().lat, bounds.getEast()); },
  northSouthKm(bounds) { return this.haversineKm(bounds.getSouth(), bounds.getCenter().lng, bounds.getNorth(), bounds.getCenter().lng); },
  gridDimensions(bounds, dx, dy) {
    return {
      e_we: Math.max(3, Math.round((this.eastWestKm(bounds) * 1000) / dx) + 1),
      e_sn: Math.max(3, Math.round((this.northSouthKm(bounds) * 1000) / dy) + 1)
    };
  },
  shrinkBounds(bounds, factor) {
    const c = bounds.getCenter();
    const latHalf = (bounds.getNorth() - bounds.getSouth()) * factor / 2;
    const lonHalf = (bounds.getEast() - bounds.getWest()) * factor / 2;
    return L.latLngBounds([c.lat - latHalf, c.lng - lonHalf], [c.lat + latHalf, c.lng + lonHalf]);
  },
  normalizeGridDimension(value, ratio) {
    const cells = Math.max(1, Math.round((value - 1) / ratio));
    return cells * ratio + 1;
  },
  validate(domains, dx, dy, ratios) {
    const errors = [];
    if (!Number.isFinite(dx) || dx < 100) errors.push('dx must be at least 100 m.');
    if (!Number.isFinite(dy) || dy < 100) errors.push('dy must be at least 100 m.');
    if (!domains.length) errors.push('At least one domain is required.');
    let cumulativeRatio = 1;
    for (let i = 0; i < domains.length; i++) {
      if (i > 0) {
        const ratio = Number(ratios[i]);
        if (!Number.isInteger(ratio) || ratio < 2) errors.push(`d${i + 1} has an invalid nesting ratio.`);
        cumulativeRatio *= ratio;
      }
      const g = this.gridDimensions(domains[i].getBounds(), dx / cumulativeRatio, dy / cumulativeRatio);
      if (g.e_we < 20 || g.e_sn < 20) errors.push(`d${i + 1} is too small (${g.e_we} × ${g.e_sn} grid points).`);
      if (i > 0 && !domains[i - 1].getBounds().contains(domains[i].getBounds())) {
        errors.push(`d${i + 1} is not fully contained inside d${i}.`);
      }
    }
    return errors;
  }
};
