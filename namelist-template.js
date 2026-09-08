function generateNamelist(boundsList) {
  if (!Array.isArray(boundsList) || boundsList.length === 0) {
    throw new Error('At least one domain is required.');
  }

  const maxDom = boundsList.length;
  const parentGridRatio = [1];
  const iParentStart = [1];
  const jParentStart = [1];
  const eWe = [];
  const eSn = [];

  // Default horizontal grid spacing. Change these values to match your WRF setup.
  const dx = 10000;
  const dy = 10000;

  for (let i = 0; i < maxDom; i++) {
    const b = boundsList[i];
    const centerLat = b.getCenter().lat;
    const widthKm = haversineKm(centerLat, b.getWest(), centerLat, b.getEast());
    const heightKm = haversineKm(b.getSouth(), b.getCenter().lng, b.getNorth(), b.getCenter().lng);

    // Grid dimensions are grid points, so add one after converting cell count to points.
    eWe.push(Math.max(3, Math.round((widthKm * 1000) / dx) + 1));
    eSn.push(Math.max(3, Math.round((heightKm * 1000) / dy) + 1));

    if (i > 0) {
      const parent = boundsList[i - 1];
      const ratio = 3;
      parentGridRatio.push(ratio);

      const parentWidthKm = haversineKm(parent.getCenter().lat, parent.getWest(), parent.getCenter().lat, parent.getEast());
      const parentHeightKm = haversineKm(parent.getSouth(), parent.getCenter().lng, parent.getNorth(), parent.getCenter().lng);
      const childCenter = b.getCenter();

      const parentDxKm = parentWidthKm / Math.max(1, eWe[i - 1] - 1);
      const parentDyKm = parentHeightKm / Math.max(1, eSn[i - 1] - 1);
      const westOffsetKm = haversineKm(parent.getCenter().lat, parent.getWest(), parent.getCenter().lat, childCenter.lng);
      const southOffsetKm = haversineKm(parent.getSouth(), parent.getCenter().lng, childCenter.lat, parent.getCenter().lng);

      iParentStart.push(Math.max(1, Math.round(westOffsetKm / parentDxKm) + 1));
      jParentStart.push(Math.max(1, Math.round(southOffsetKm / parentDyKm) + 1));
    }
  }

  const ref = boundsList[0].getCenter();
  const geogDataRes = Array(maxDom).fill("'default'").join(', ');

  return `&share
 wrf_core = 'ARW',
 max_dom = ${maxDom},
 start_date = ${Array(maxDom).fill("'2000-01-01_00:00:00'").join(', ')},
 end_date   = ${Array(maxDom).fill("'2000-01-02_00:00:00'").join(', ')},
 interval_seconds = 21600,
 io_form_geogrid = 2,
 opt_output_from_geogrid_path = './',
 debug_level = 0,
/

&geogrid
 parent_id         = ${Array(maxDom).fill(1).join(', ')},
 parent_grid_ratio = ${parentGridRatio.join(', ')},
 i_parent_start    = ${iParentStart.join(', ')},
 j_parent_start    = ${jParentStart.join(', ')},
 e_we              = ${eWe.join(', ')},
 e_sn              = ${eSn.join(', ')},
 geog_data_res     = ${geogDataRes},
 dx                = ${dx},
 dy                = ${dy},
 map_proj          = 'lat-lon',
 ref_lat           = ${ref.lat.toFixed(4)},
 ref_lon           = ${ref.lng.toFixed(4)},
 truelat1          = ${ref.lat.toFixed(4)},
 truelat2          = ${ref.lat.toFixed(4)},
 stand_lon         = ${ref.lng.toFixed(4)},
 geog_data_path    = './geog/',
/

&ungrib
 out_format = 'WPS',
 prefix = 'FILE',
/

&metgrid
 fg_name = 'FILE',
 io_form_metgrid = 2,
/\n`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
