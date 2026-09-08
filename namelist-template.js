function generateNamelist(boundsList) {
  if (!Array.isArray(boundsList) || boundsList.length === 0) {
    throw new Error('At least one domain is required.');
  }

  const maxDom = boundsList.length;
  const dx = 10000;
  const dy = 10000;
  const parentGridRatio = [1];
  const parentId = [1];
  const iParentStart = [1];
  const jParentStart = [1];
  const eWe = [];
  const eSn = [];

  // Calculate grid dimensions from the actual geographic rectangles.
  for (let i = 0; i < maxDom; i++) {
    const b = boundsList[i];
    const centerLat = b.getCenter().lat;
    const widthKm = haversineKm(centerLat, b.getWest(), centerLat, b.getEast());
    const heightKm = haversineKm(b.getSouth(), b.getCenter().lng, b.getNorth(), b.getCenter().lng);

    let ew = Math.max(4, Math.round((widthKm * 1000) / dx) + 1);
    let es = Math.max(4, Math.round((heightKm * 1000) / dy) + 1);

    // For nested domains with a 3:1 ratio, make (e_we-1) and (e_sn-1)
    // divisible by 3 so the nest aligns cleanly with the parent grid.
    if (i > 0) {
      ew = Math.max(4, Math.floor((ew - 1) / 3) * 3 + 1);
      es = Math.max(4, Math.floor((es - 1) / 3) * 3 + 1);
    }

    eWe.push(ew);
    eSn.push(es);

    if (i > 0) {
      const parent = boundsList[i - 1];
      const child = b;
      const parentEw = eWe[i - 1];
      const parentEs = eSn[i - 1];
      const ratio = 3;

      parentGridRatio.push(ratio);
      parentId.push(i);

      const xFraction = (child.getWest() - parent.getWest()) / (parent.getEast() - parent.getWest());
      const yFraction = (child.getSouth() - parent.getSouth()) / (parent.getNorth() - parent.getSouth());

      iParentStart.push(clamp(
        Math.round(xFraction * (parentEw - 1)) + 1,
        1,
        Math.max(1, parentEw - Math.round((ew - 1) / ratio))
      ));
      jParentStart.push(clamp(
        Math.round(yFraction * (parentEs - 1)) + 1,
        1,
        Math.max(1, parentEs - Math.round((es - 1) / ratio))
      ));
    }
  }

  const ref = boundsList[0].getCenter();
  const repeat = (value) => Array(maxDom).fill(value).join(', ');
  const dates = repeat("'2000-01-01_00:00:00'");
  const endDates = repeat("'2000-01-02_00:00:00'");
  const geogDataRes = repeat("'default'");

  return `&share
 wrf_core = 'ARW',
 max_dom = ${maxDom},
 start_date = ${dates},
 end_date   = ${endDates},
 interval_seconds = 21600,
 io_form_geogrid = 2,
 opt_output_from_geogrid_path = './',
 debug_level = 0,
/

&geogrid
 parent_id         = ${parentId.join(', ')},
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
/
`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
