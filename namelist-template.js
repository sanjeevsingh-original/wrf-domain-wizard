function generateNamelist(boundsList, options = {}) {
  if (!Array.isArray(boundsList) || !boundsList.length) throw new Error('At least one domain is required.');
  const maxDom=boundsList.length, dx=Number(options.dx??9000), dy=Number(options.dy??9000);
  const ratios=options.ratios||[1,...Array(maxDom-1).fill(3)];
  const projection=options.projection||'lambert', refLat=Number(options.refLat??boundsList[0].getCenter().lat), refLon=Number(options.refLon??boundsList[0].getCenter().lng);
  const truelat1=Number(options.truelat1??20), truelat2=Number(options.truelat2??30), polarLat=Number(options.polarLat??60), hemisphere=options.hemisphere||'north';
  const geogDataRes=options.geogDataRes||'default';
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||dx<=0||dy<=0)throw new Error('dx and dy must be positive.');
  const parentId=[1], iStart=[1], jStart=[1], eWe=[], eSn=[];let cdx=dx,cdy=dy;
  const settings={projection,refLat,refLon,truelat1,truelat2,polarLat,hemisphere};
  const parentGrids=[];
  for(let i=0;i<maxDom;i++){
    if(i){parentId.push(i);cdx/=Number(ratios[i]);cdy/=Number(ratios[i]);}
    const r=i?Number(ratios[i]):1,raw=WRF.gridDimensions(boundsList[i],cdx,cdy,settings),ew=i?WRF.snapDimension(raw.e_we,r):raw.e_we,es=i?WRF.snapDimension(raw.e_sn,r):raw.e_sn;
    eWe.push(ew);eSn.push(es);parentGrids.push({e_we:ew,e_sn:es});
    if(i){const ps=WRF.parentStart(boundsList[i-1],boundsList[i],parentGrids[i-1],{e_we:ew,e_sn:es},r,settings);iStart.push(ps.i);jStart.push(ps.j);} }
  const repeat=v=>Array(maxDom).fill(v).join(', ');
  let projectionLines;
  if(projection==='lambert') projectionLines=` map_proj = 'lambert',\n ref_lat = ${refLat.toFixed(6)},\n ref_lon = ${refLon.toFixed(6)},\n truelat1 = ${truelat1.toFixed(6)},\n truelat2 = ${truelat2.toFixed(6)},\n stand_lon = ${refLon.toFixed(6)},`;
  else if(projection==='mercator') projectionLines=` map_proj = 'mercator',\n ref_lat = ${refLat.toFixed(6)},\n ref_lon = ${refLon.toFixed(6)},\n stand_lon = ${refLon.toFixed(6)},`;
  else if(projection==='polar') projectionLines=` map_proj = 'polar',\n ref_lat = ${refLat.toFixed(6)},\n ref_lon = ${refLon.toFixed(6)},\n truelat1 = ${(hemisphere==='south'?-polarLat:polarLat).toFixed(6)},\n stand_lon = ${refLon.toFixed(6)},`;
  else projectionLines=` map_proj = 'lat-lon',\n ref_lat = ${refLat.toFixed(6)},\n ref_lon = ${refLon.toFixed(6)},\n stand_lon = ${refLon.toFixed(6)},`;
  return `&share
 wrf_core = 'ARW',
 max_dom = ${maxDom},
 start_date = ${repeat("'2000-01-01_00:00:00'")},
 end_date = ${repeat("'2000-01-02_00:00:00'")},
 interval_seconds = 21600,
 io_form_geogrid = 2,
 opt_output_from_geogrid_path = './',
 debug_level = 0,
/

&geogrid
 parent_id = ${parentId.join(', ')},
 parent_grid_ratio = ${ratios.join(', ')},
 i_parent_start = ${iStart.join(', ')},
 j_parent_start = ${jStart.join(', ')},
 e_we = ${eWe.join(', ')},
 e_sn = ${eSn.join(', ')},
 geog_data_res = ${repeat(`'${geogDataRes}'`)},
 dx = ${dx},
 dy = ${dy},
${projectionLines}
 geog_data_path = './geog/',
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
