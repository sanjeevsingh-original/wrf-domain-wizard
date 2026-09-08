// Client-side WPS output validator. No files leave the browser.
function validateWPSFiles(files, logText='') {
  const results=[], errors=[], warnings=[];
  const expected=Number(document.getElementById('domainCount')?.value||0);
  if(!files.length) errors.push('Select at least one geo_em.d0*.nc file.');
  const seen=new Set();
  for(const file of files){
    const m=file.name.match(/geo_em\.d(\d{2})\.nc$/i); if(!m){warnings.push(`${file.name}: filename does not match geo_em.dNN.nc.`);continue;} seen.add(Number(m[1])); }
  if(expected && seen.size && seen.size!==expected) warnings.push(`Selected ${seen.size} geo_em domain file(s), while the design requests ${expected}.`);
  if(logText && /Successful completion of geogrid/i.test(logText)) results.push('geogrid.log reports successful completion of geogrid.');
  if(logText && /(FATAL|ERROR|error:)/i.test(logText)) warnings.push('geogrid.log contains error-like text; inspect the log before using the domains.');
  return {results,errors,warnings};
}
async function inspectGeoFile(file){
  const buf=await file.arrayBuffer();
  if(typeof NetCDFReader==='undefined') throw new Error('NetCDF reader library was not loaded.');
  const nc=new NetCDFReader(new Uint8Array(buf));
  const dim=n=>nc.dimensions.find(d=>d.name===n)?.size;
  const attr=n=>{const a=nc.globalAttributes.find(x=>x.name===n);return a?.value;};
  const required=['XLAT_M','XLONG_M','MAPFAC_M'];
  const missing=required.filter(name=>!nc.variables.some(v=>v.name===name));
  const lat=dim('south_north'),lon=dim('west_east');
  const out={name:file.name,bytes:file.size,dimensions:{west_east:lon,south_north:lat},missing,attributes:{MAP_PROJ:attr('MAP_PROJ'),DX:attr('DX'),DY:attr('DY'),TRUELAT1:attr('TRUELAT1'),TRUELAT2:attr('TRUELAT2'),STAND_LON:attr('STAND_LON'),CEN_LAT:attr('CEN_LAT'),CEN_LON:attr('CEN_LON')}};
  if(!lat||!lon) out.warnings=['Missing expected south_north/west_east dimensions.'];
  if(missing.length) out.warnings=[...(out.warnings||[]),`Missing expected variables: ${missing.join(', ')}.`];
  const v=nc.variables.find(x=>x.name==='XLAT_M'); if(v){try{const data=nc.getDataVariable(v);const nums=Array.from(data).filter(Number.isFinite);if(nums.length){out.latRange=[Math.min(...nums),Math.max(...nums)];}}catch(e){out.warnings=[...(out.warnings||[]),'Could not read XLAT_M values.'];}}
  return out;
}
async function runWPSOutputValidation(){
  const out=document.getElementById('fileValidation'),files=[...document.getElementById('geoFilesInput').files],logFile=document.getElementById('logFileInput').files[0];
  out.innerHTML='<div class="alert alert-info py-2">Reading files locally…</div>';
  try{
    const log=logFile?await logFile.text():'';const summary=validateWPSFiles(files,log),details=[];
    for(const f of files){try{details.push(await inspectGeoFile(f));}catch(e){details.push({name:f.name,error:e.message});}}
    const allErrors=[...summary.errors,...details.filter(d=>d.error).map(d=>`${d.name}: ${d.error}`)], allWarnings=[...summary.warnings,...details.flatMap(d=>d.warnings||[])];
    const cards=details.map(d=>`<div class="border rounded p-2 mb-2"><strong>${escapeHtml(d.name)}</strong>${d.error?`<div class="text-danger">${escapeHtml(d.error)}</div>`:`<div>${d.dimensions?.west_east||'?'} × ${d.dimensions?.south_north||'?'} grid · MAP_PROJ=${escapeHtml(d.attributes?.MAP_PROJ??'n/a')}</div>${d.latRange?`<div class="small text-muted">XLAT_M range: ${d.latRange[0].toFixed(3)} to ${d.latRange[1].toFixed(3)}°</div>`:''}${(d.missing||[]).length?`<div class="text-warning small">Missing: ${escapeHtml(d.missing.join(', '))}</div>`:''}`}</div>`).join('');
    out.innerHTML=(allErrors.length?`<div class="alert alert-danger py-2"><strong>Validation errors</strong><ul class="mb-0">${allErrors.map(escapeHtml).map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'<div class="alert alert-success py-2">File-level checks passed.</div>')+(allWarnings.length?`<div class="alert alert-warning py-2"><strong>Warnings</strong><ul class="mb-0">${allWarnings.map(escapeHtml).map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'')+cards;
  }catch(e){out.innerHTML=`<div class="alert alert-danger py-2">${escapeHtml(e.message)}</div>`;}
}
