function generateNamelist(boundsList) {
  if (!Array.isArray(boundsList) || boundsList.length === 0) {
    throw new Error('At least one domain is required.');
  }

  const maxDom = boundsList.length;
  const dx = readGridSpacing('dxInput', 10000);
  const dy = readGridSpacing('dyInput', 10000);
  const parentGridRatio = [1];
  const parentId = [1];
  const iParentStart = [1];
  const jParentStart = [1];
  const eWe = [];
  const eSn = [];

  for (let i = 0; i < maxDom; i++) {
    const b = boundsList[i];
    const centerLat = b.getCenter().lat;
    const widthKm = haversineKm(centerLat, b.getWest(), centerLat, b.getEast());
    const heightKm = haversineKm(b.getSouth(), b.getCenter().lng, b.getNorth(), b.getCenter().lng);

    let ew = Math.max(4, Math.round((widthKm * 1000) / dx) + 1);
    let es = Math.max(4, Math.round((heightKm * 1000) / dy) + 1);

    // With the default 3:1 nesting ratio, make nested dimensions compatible
    // with the parent-grid relationship: (e_we - 1) and (e_sn - 1) are divisible by 3.
    if (i > 0) {
      ew = Math.max(4, Math.floor((ew - 1) / 3) * 3 + 1);
      es = Math.max(4, Math.floor((es - 1) / 3) * 3 + 1);
    }

    eWe.push(ew);
    eSn.push(es);

    if (i > 0) {
      const parent = boundsList[i - 1];
      const ratio = 3;
      parentGridRatio.push(ratio);
      parentId.push(i);

      const xFraction = (b.getWest() - parent.getWest()) / (parent.getEast() - parent.getWest());
      const yFraction = (b.getSouth() - parent.getSouth()) / (parent.getNorth() - parent.getSouth());
      const childWidthOnParent = Math.round((ew - 1) / ratio);
      const childHeightOnParent = Math.round((es - 1) / ratio);

      iParentStart.push(clamp(
        Math.round(xFraction * (eWe[i - 1] - 1)) + 1,
        1,
        Math.max(1, eWe[i - 1] - childWidthOnParent)
      ));
      jParentStart.push(clamp(
        Math.round(yFraction * (eSn[i - 1] - 1)) + 1,
        1,
        Math.max(1, eSn[i - 1] - childHeightOnParent)
      ));
    }
  }

  const ref = boundsList[0].getCenter();
  const repeat = value => Array(maxDom).fill(value).join(', ');

  return `&share
 wrf_core = 'ARW',
 max_dom = ${maxDom},
 start_date = ${repeat("'2000-01-01_00:00:00'")},
 end_date   = ${repeat("'2000-01-02_00:00:00'")},
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
 geog_data_res     = ${repeat("'default'")},
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

function readGridSpacing(id, fallback) {
  const element = document.getElementById(id);
  const value = Number(element?.value);
  if (!Number.isFinite(value) || value < 100) {
    throw new Error('dx and dy must be valid values of at least 100 m.');
  }
  return value;
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
