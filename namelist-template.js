function generateNamelist(boundsList, options = {}) {
  if (!Array.isArray(boundsList) || !boundsList.length) throw new Error('At least one domain is required.');

  const maxDom = boundsList.length;
  const dx = Number(options.dx ?? 9000);
  const dy = Number(options.dy ?? 9000);
  const ratios = options.ratios || [1, ...Array(maxDom - 1).fill(3)];
  const projection = options.projection || 'lambert';
  const refLat = Number(options.refLat ?? boundsList[0].getCenter().lat);
  const refLon = Number(options.refLon ?? boundsList[0].getCenter().lng);
  const truelat1 = Number(options.truelat1 ?? 20);
  const truelat2 = Number(options.truelat2 ?? 30);
  const geogDataRes = options.geogDataRes || 'default';

  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx < 100 || dy < 100) {
    throw new Error('dx and dy must be valid values of at least 100 m.');
  }

  const parentId = [1];
  const iParentStart = [1];
  const jParentStart = [1];
  const eWe = [];
  const eSn = [];
  let cumulativeRatio = 1;

  for (let i = 0; i < maxDom; i++) {
    if (i > 0) { parentId.push(i); cumulativeRatio *= ratios[i]; }
    const childDx = dx / cumulativeRatio;
    const childDy = dy / cumulativeRatio;
    const grid = WRF.gridDimensions(boundsList[i], childDx, childDy);
    let ew = grid.e_we;
    let es = grid.e_sn;

    if (i > 0) {
      ew = WRF.normalizeGridDimension(ew, ratios[i]);
      es = WRF.normalizeGridDimension(es, ratios[i]);
    }
    eWe.push(ew); eSn.push(es);

    if (i > 0) {
      const parent = boundsList[i - 1];
      const ratio = ratios[i];
      const childCellsX = Math.max(1, Math.round((ew - 1) / ratio));
      const childCellsY = Math.max(1, Math.round((es - 1) / ratio));
      const xFraction = (boundsList[i].getWest() - parent.getWest()) / (parent.getEast() - parent.getWest());
      const yFraction = (boundsList[i].getSouth() - parent.getSouth()) / (parent.getNorth() - parent.getSouth());
      iParentStart.push(clamp(Math.round(xFraction * (eWe[i - 1] - 1)) + 1, 1, Math.max(1, eWe[i - 1] - childCellsX)));
      jParentStart.push(clamp(Math.round(yFraction * (eSn[i - 1] - 1)) + 1, 1, Math.max(1, eSn[i - 1] - childCellsY)));
    }
  }

  const repeat = value => Array(maxDom).fill(value).join(', ');
  const projectionLines = projection === 'lambert'
    ? ` map_proj          = 'lambert',\n ref_lat           = ${refLat.toFixed(4)},\n ref_lon           = ${refLon.toFixed(4)},\n truelat1          = ${truelat1.toFixed(4)},\n truelat2          = ${truelat2.toFixed(4)},\n stand_lon         = ${refLon.toFixed(4)},`
    : projection === 'mercator'
      ? ` map_proj          = 'mercator',\n ref_lat           = ${refLat.toFixed(4)},\n ref_lon           = ${refLon.toFixed(4)},\n stand_lon         = ${refLon.toFixed(4)},`
      : ` map_proj          = 'lat-lon',\n ref_lat           = ${refLat.toFixed(4)},\n ref_lon           = ${refLon.toFixed(4)},\n stand_lon         = ${refLon.toFixed(4)},`;

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
 parent_grid_ratio = ${ratios.join(', ')},
 i_parent_start    = ${iParentStart.join(', ')},
 j_parent_start    = ${jParentStart.join(', ')},
 e_we              = ${eWe.join(', ')},
 e_sn              = ${eSn.join(', ')},
 geog_data_res     = ${repeat(`'${geogDataRes}'`)},
 dx                = ${dx},
 dy                = ${dy},
${projectionLines}
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

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
