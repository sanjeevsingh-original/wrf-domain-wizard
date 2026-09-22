// WRF namelist.input generator — research-oriented real-data starter
const namelistInputValues = [];
const niDefaults = {mp:'6', cu:'16', lw:'4', sw:'4', pbl:'1', sfclay:'91', lsm:'2', urban:'0', shcu:'0'};

function niEl(id){ return document.getElementById(id); }
function niNum(id, def){ const v = Number(niEl(id)?.value); return Number.isFinite(v) ? v : def; }
function niBool(id){ return niEl(id)?.value || '.false.'; }
function niOptions(items, value){
  return items.map(x => '<option value="'+x[0]+'"'+(x[0]===String(value)?' selected':'')+'>'+x[1]+'</option>').join('');
}

function buildNamelistInputTable(){
  const n = Number(niEl('domainCount').value);
  while(namelistInputValues.length < n) namelistInputValues.push({...niDefaults});
  namelistInputValues.length = n;
  const t = niEl('namelistInputTable');
  if(!t) return;

  const mp = [
    ['0','0 — off'],['1','1 — Kessler'],['2','2 — Purdue Lin'],['3','3 — WSM3'],
    ['4','4 — WSM5'],['5','5 — Ferrier/Eta'],['6','6 — WSM6'],['7','7 — Goddard'],
    ['8','8 — Thompson'],['9','9 — Milbrandt-Yau'],['10','10 — Morrison'],
    ['11','11 — CAM5.1'],['13','13 — SBU-YLin'],['14','14 — WDM5'],
    ['15','15 — High-res Ferrier'],['16','16 — WDM6'],['18','18 — NSSL 2-moment'],
    ['28','28 — Thompson aerosol-aware']
  ];
  const cu = [
    ['0','0 — No cumulus'],['1','1 — Kain-Fritsch'],['2','2 — BMJ'],
    ['3','3 — Grell-Freitas'],['4','4 — Scale-aware GFS SAS'],['5','5 — Grell-3'],
    ['6','6 — Tiedtke'],['7','7 — Zhang-McFarlane'],['10','10 — KF-CuP'],
    ['11','11 — Multi-scale KF'],['14','14 — New SAS / KSAS'],['16','16 — New Tiedtke'],
    ['93','93 — Grell-Devenyi'],['96','96 — GFS SAS'],['99','99 — Old Kain-Fritsch']
  ];
  const lw = [['0','0 — off'],['1','1 — RRTM'],['3','3 — CAM'],['4','4 — RRTMG'],['5','5 — New Goddard'],['7','7 — FLG'],['14','14 — RRTMG FAST'],['24','24 — CAM3.5'],['31','31 — CAM5']];
  const sw = [['0','0 — off'],['1','1 — Dudhia'],['2','2 — Goddard'],['3','3 — CAM'],['4','4 — RRTMG'],['5','5 — New Goddard'],['7','7 — FLG'],['14','14 — RRTMG FAST'],['24','24 — CAM3.5'],['31','31 — CAM5']];
  const pbl = [['0','0 — off'],['1','1 — YSU'],['2','2 — MYJ'],['4','4 — MYNN'],['5','5 — MYNN 2.5'],['6','6 — MYNN 3.0'],['7','7 — ACM2'],['8','8 — BouLac'],['9','9 — UW'],['10','10 — TEMF'],['11','11 — Shin-Hong'],['12','12 — GBM'],['16','16 — MYNN-EDMF'],['17','17 — MYNN-EDMF 2.0'],['99','99 — MRF']];
  const sf = [['0','0 — off'],['1','1 — MM5 similarity'],['2','2 — Eta'],['5','5 — MYNN'],['7','7 — Pleim-Xiu'],['91','91 — MYNN']];
  const lsm = [['0','0 — thermal diffusion'],['1','1 — 5-layer thermal'],['2','2 — Noah'],['3','3 — RUC'],['4','4 — Noah-MP'],['5','5 — CLM4'],['7','7 — Pleim-Xiu'],['8','8 — SSiB']];
  const urban = [['0','0 — off'],['1','1 — SLUCM'],['2','2 — BEP'],['3','3 — BEM']];
  const shcu = [['0','0 — off'],['2','2 — UW / Park-Bretherton'],['3','3 — GRIMS'],['4','4 — NSAS shallow'],['5','5 — Deng']];

  t.innerHTML =
    '<div class="alert alert-info py-2 small mb-2"><strong>Per-domain physics:</strong> select the actual WRF scheme for each domain. The selected values are written to <code>&physics</code>.</div>'+
    Array.from({length:n},(_,i)=>{
      const v = namelistInputValues[i];
      return '<div class="border rounded p-2 mb-2"><div class="fw-semibold small mb-2">d'+pad(i)+'</div><div class="row g-2">'+
      '<div class="col-6"><label class="form-label small">mp_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="mp">'+niOptions(mp,v.mp)+'</select></div>'+
      '<div class="col-6"><label class="form-label small fw-semibold">cu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="cu">'+niOptions(cu,v.cu)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">ra_lw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lw">'+niOptions(lw,v.lw)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">ra_sw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sw">'+niOptions(sw,v.sw)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">bl_pbl_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="pbl">'+niOptions(pbl,v.pbl)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_sfclay_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sfclay">'+niOptions(sf,v.sfclay)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_surface_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lsm">'+niOptions(lsm,v.lsm)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_urban_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="urban">'+niOptions(urban,v.urban)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">shcu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="shcu">'+niOptions(shcu,v.shcu)+'</select></div>'+
      '</div></div>';
    }).join('');

  document.querySelectorAll('.ni-field').forEach(x => x.addEventListener('change', () => {
    namelistInputValues[Number(x.dataset.d)][x.dataset.k] = x.value;
    updatePhysicsCompatibility();
  }));
  updatePhysicsCompatibility();
}

function updatePhysicsCompatibility(){
  const box = niEl('physicsCompatibility');
  if(!box) return;
  const cu = namelistInputValues.map(x=>Number(x.cu));
  const pbl = namelistInputValues.map(x=>Number(x.pbl));
  const sh = namelistInputValues.map(x=>Number(x.shcu));
  const notes = [];
  if(cu.includes(1) && Number(niEl('niKfetaTrigger')?.value)!==1) notes.push('kfeta_trigger applies only to cu_physics=1 (Kain-Fritsch).');
  if(Number(niEl('niIshallow')?.value)===1 && !cu.some(x=>x===3||x===5)) notes.push('ishallow=1 is documented for cu_physics=3 or 5.');
  if(sh.includes(5) && pbl.some(x=>![2,4,5,6].includes(x))) notes.push('shcu_physics=5 (Deng) requires a compatible MYJ/MYNN-family PBL; verify the exact WRF version.');
  if(sh.includes(4) && !cu.includes(14)) notes.push('shcu_physics=4 is intended for the KSAS / cu_physics=14 combination.');
  if(Number(niEl('niCugdAvedx')?.value)===3 && !cu.includes(5)) notes.push('cugd_avedx=3 is documented for cu_physics=5.');
  if(Number(niEl('niCuDiag')?.value)===1 && !cu.some(x=>[3,5,93].includes(x))) notes.push('cu_diag=1 is documented for cu_physics=3, 5, or 93.');
  if(niEl('niCuRadFeedback')?.value==='.true.' && !cu.some(x=>[1,3,5,10,11,93,99].includes(x))) notes.push('cu_rad_feedback=.true. is documented for cu_physics=1, 3, 5, 10, 11, 93, or 99.');
  if(Number(niEl('niKfEdrates')?.value)===1 && !cu.some(x=>[1,11,99].includes(x))) notes.push('kf_edrates=1 is documented for KF-based schemes 1, 11, and 99.');
  if(Number(niEl('niNsasDxFactor')?.value)===1 && !cu.some(x=>[14,96].includes(x))) notes.push('nsas_dx_factor is NSAS/SAS-related; verify compatibility with the selected scheme.');
  box.innerHTML = notes.length
    ? '<div class="alert alert-warning py-2 mb-0">'+notes.map(x=>'• '+x).join('<br>')+'</div>'
    : '<div class="alert alert-success py-2 mb-0">No obvious cumulus/PBL compatibility conflicts detected from the selected options.</div>';
}

function durationParts(start,end){
  const a=new Date(start.replace('_','T')+'Z');
  const b=new Date(end.replace('_','T')+'Z');
  if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a) throw new Error('Invalid WRF start/end time.');
  let s=Math.round((b-a)/1000);
  const days=Math.floor(s/86400); s-=days*86400;
  const hours=Math.floor(s/3600); s-=hours*3600;
  const minutes=Math.floor(s/60); s-=minutes*60;
  return {days,hours,minutes,seconds:s};
}

function parseStartEnd(w){
  const p=x=>({y:x.slice(0,4),m:x.slice(5,7),d:x.slice(8,10),h:x.slice(11,13),mi:x.slice(14,16),s:x.slice(17,19)});
  return {start:p(w.startDate),end:p(w.endDate)};
}

function generateNamelistInput(){
  const n=Number(niEl('domainCount').value);
  if(domains.length!==n) throw new Error('Complete all selected domains before downloading namelist.input.');
  const w=wpsSettings(), rs=ratios(), sp=spacing(), ss=settings(), d=namelistInputValues;
  const dur=durationParts(w.startDate,w.endDate), te=parseStartEnd(w);
  let cdx=sp.dx, cdy=sp.dy, g=[];
  domains.forEach((dom,i)=>{
    if(i){ cdx/=rs[i]; cdy/=rs[i]; }
    const q=WRF.gridDimensions(dom.getBounds(),cdx,cdy,ss);
    g.push({ew:i?WRF.snapDimension(q.e_we,rs[i]):q.e_we,es:i?WRF.snapDimension(q.e_sn,rs[i]):q.e_sn});
  });
  const is=[1], js=[1];
  for(let i=1;i<n;i++){
    const p=WRF.parentStart(domains[i-1].getBounds(),domains[i].getBounds(),g[i-1],g[i],rs[i],ss);
    is.push(p.i); js.push(p.j);
  }
  const v=a=>a.join(', ');
  const specified=domains.map((_,i)=>i===0?'.true.':'.false.').join(', ');
  const nested=domains.map((_,i)=>i===0?'.false.':'.true.').join(', ');
  const suite=niEl('physicsSuiteInput').value;
  const physicsSuite=suite==='none'?'':" physics_suite = '"+suite+"',";
  const ad={
    kfeta:niEl('niKfetaTrigger').value, ishallow:niEl('niIshallow').value,
    cugd:niEl('niCugdAvedx').value, nsas:niEl('niNsasDxFactor').value,
    convtrans:niNum('niConvtransAvglen',30), cudiag:niEl('niCuDiag').value,
    curad:niEl('niCuRadFeedback').value, kfeds:niEl('niKfEdrates').value,
    forcedra:niEl('niShallowForcedRa').value, maxiens:niNum('niMaxiens',1),
    maxens:niNum('niMaxens',3), maxens2:niNum('niMaxens2',3),
    maxens3:niNum('niMaxens3',16), ensdim:niNum('niEnsdim',144)
  };

  const L=[];
  L.push('&time_control');
  L.push(' run_days = '+dur.days+','); L.push(' run_hours = '+dur.hours+',');
  L.push(' run_minutes = '+dur.minutes+','); L.push(' run_seconds = '+dur.seconds+',');
  L.push(' start_year = '+v(domains.map(()=>te.start.y))+','); L.push(' start_month = '+v(domains.map(()=>te.start.m))+',');
  L.push(' start_day = '+v(domains.map(()=>te.start.d))+','); L.push(' start_hour = '+v(domains.map(()=>te.start.h))+',');
  L.push(' start_minute = '+v(domains.map(()=>te.start.mi))+','); L.push(' start_second = '+v(domains.map(()=>te.start.s))+',');
  L.push(' end_year = '+v(domains.map(()=>te.end.y))+','); L.push(' end_month = '+v(domains.map(()=>te.end.m))+',');
  L.push(' end_day = '+v(domains.map(()=>te.end.d))+','); L.push(' end_hour = '+v(domains.map(()=>te.end.h))+',');
  L.push(' end_minute = '+v(domains.map(()=>te.end.mi))+','); L.push(' end_second = '+v(domains.map(()=>te.end.s))+',');
  L.push(' interval_seconds = '+w.intervalSeconds+','); L.push(' input_from_file = '+v(domains.map(()=>'.true.'))+',');
  L.push(' history_interval = '+niNum('niHistoryInterval',60)+','); L.push(' frames_per_outfile = '+niNum('niFramesPerOutfile',1)+',');
  L.push(' restart = '+niBool('niRestart')+','); L.push(' restart_interval = '+niNum('niRestartInterval',7200)+',');
  L.push(' io_form_history = '+niEl('niIoHistory').value+','); L.push(' io_form_restart = '+niEl('niIoRestart').value+',');
  L.push(' io_form_input = 2,'); L.push(' io_form_boundary = 2,'); L.push('/','');

  L.push('&domains');
  L.push(' time_step = '+niNum('niTimeStep',Math.max(1,Math.round(sp.dx/1000*6)))+',');
  L.push(' time_step_fract_num = 0,'); L.push(' time_step_fract_den = 1,'); L.push(' max_dom = '+n+',');
  L.push(' e_we = '+v(g.map(x=>x.ew))+','); L.push(' e_sn = '+v(g.map(x=>x.es))+',');
  L.push(' e_vert = '+v(domains.map(()=>niNum('niEvert',45)))+','); L.push(' p_top_requested = '+niNum('niPtop',5000)+',');
  L.push(' num_metgrid_levels = '+niNum('niMetgridLevels',34)+','); L.push(' num_metgrid_soil_levels = '+niNum('niMetgridSoilLevels',4)+',');
  L.push(' dx = '+sp.dx+','); L.push(' dy = '+sp.dy+',');
  L.push(' grid_id = '+v(domains.map((_,i)=>i+1))+','); L.push(' parent_id = '+v(domains.map((_,i)=>i))+',');
  L.push(' i_parent_start = '+v(is)+','); L.push(' j_parent_start = '+v(js)+',');
  L.push(' parent_grid_ratio = '+v(rs)+','); L.push(' parent_time_step_ratio = '+v(rs)+',');
  L.push(' feedback = '+niEl('niFeedback').value+','); L.push(' smooth_option = '+niEl('niSmoothOption').value+','); L.push('/','');

  L.push('&physics');
  if(physicsSuite) L.push(physicsSuite);
  L.push(' mp_physics = '+v(d.map(x=>x.mp))+',');
  L.push(' cu_physics = '+v(d.map(x=>x.cu))+',');
  L.push(' ra_lw_physics = '+v(d.map(x=>x.lw))+',');
  L.push(' ra_sw_physics = '+v(d.map(x=>x.sw))+',');
  L.push(' bl_pbl_physics = '+v(d.map(x=>x.pbl))+',');
  L.push(' sf_sfclay_physics = '+v(d.map(x=>x.sfclay))+',');
  L.push(' sf_surface_physics = '+v(d.map(x=>x.lsm))+',');
  L.push(' sf_urban_physics = '+v(d.map(x=>x.urban))+',');
  L.push(' shcu_physics = '+v(d.map(x=>x.shcu))+',');
  L.push(' radt = '+v(domains.map(()=>niNum('niRadt',5)))+',');
  L.push(' bldt = '+v(domains.map(()=>niNum('niBldt',0)))+',');
  L.push(' cudt = '+v(domains.map(()=>niNum('niCudt',0)))+',');
  L.push(' kfeta_trigger = '+ad.kfeta+','); L.push(' ishallow = '+ad.ishallow+',');
  L.push(' cugd_avedx = '+ad.cugd+','); L.push(' nsas_dx_factor = '+ad.nsas+',');
  L.push(' convtrans_avglen_m = '+ad.convtrans+',');
  L.push(' cu_diag = '+v(domains.map(()=>ad.cudiag))+',');
  L.push(' cu_rad_feedback = '+v(domains.map(()=>ad.curad))+',');
  L.push(' kf_edrates = '+v(domains.map(()=>ad.kfeds))+',');
  L.push(' shallowcu_forced_ra = '+v(domains.map(()=>ad.forcedra))+',');
  L.push(' maxiens = '+ad.maxiens+','); L.push(' maxens = '+ad.maxens+',');
  L.push(' maxens2 = '+ad.maxens2+','); L.push(' maxens3 = '+ad.maxens3+','); L.push(' ensdim = '+ad.ensdim+',');
  L.push(' num_soil_layers = '+niNum('niSoilLayers',4)+','); L.push(' num_land_cat = '+niNum('niLandCat',21)+',');
  L.push(' icloud = '+niEl('niIcloud').value+','); L.push(' fractional_seaice = '+niEl('niFractionalSeaice').value+',');
  L.push(' sst_update = '+niBool('niSstUpdate')+','); L.push('/','');

  L.push('&dynamics');
  L.push(' hybrid_opt = '+niEl('niHybridOpt').value+','); L.push(' non_hydrostatic = '+niBool('niNonHydro')+',');
  L.push(' w_damping = '+niEl('niWDamping').value+','); L.push(' diff_opt = '+niEl('niDiffOpt').value+',');
  L.push(' km_opt = '+niEl('niKmOpt').value+','); L.push(' damp_opt = '+niEl('niDampOpt').value+',');
  L.push(' zdamp = '+niNum('niZdamp',5000)+','); L.push(' dampcoef = '+niNum('niDampcoef',0.2)+',');
  L.push(' moist_adv_opt = '+niNum('niMoistAdv',1)+','); L.push(' scalar_adv_opt = '+niNum('niScalarAdv',1)+',');
  L.push(' gwd_opt = '+niEl('niGwdOpt').value+','); L.push(' use_theta_m = '+niEl('niThetaM').value+',');
  L.push(' khdif = '+niNum('niKhdif',0)+','); L.push(' kvdif = '+niNum('niKvdif',0)+','); L.push('/','');

  L.push('&bdy_control');
  L.push(' spec_bdy_width = '+niNum('niSpecBdyWidth',5)+','); L.push(' spec_zone = '+niNum('niSpecZone',1)+',');
  L.push(' relax_zone = '+niNum('niRelaxZone',4)+','); L.push(' specified = '+specified+','); L.push(' nested = '+nested+','); L.push('/','');

  L.push('&fdda');
  L.push(' grid_fdda = '+v(domains.map(()=>niEl('niGridFdda').value))+',');
  L.push(' obs_nudge_opt = '+v(domains.map(()=>niEl('niObsNudge').value))+','); L.push('/','');
  L.push('&dfi_control'); L.push(' dfi_opt = '+niEl('niDfiOpt').value+','); L.push('/','');
  L.push('&namelist_quilt'); L.push(' nio_tasks_per_group = '+niNum('niNioTasks',0)+','); L.push(' nio_groups = '+niNum('niNioGroups',1)+','); L.push('/');
  return L.join('\n');
}

function downloadNamelistInput(){
  try{
    const x=generateNamelistInput();
    const b=new Blob([x],{type:'text/plain;charset=utf-8'});
    const u=URL.createObjectURL(b), a=document.createElement('a');
    a.href=u; a.download='namelist.input'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
  }catch(e){ showError(e.message); }
}

niEl('domainCount').addEventListener('change',buildNamelistInputTable);
niEl('exportInputBtn').addEventListener('click',downloadNamelistInput);
['niKfetaTrigger','niIshallow','niCugdAvedx','niNsasDxFactor','niConvtransAvglen','niCuDiag','niCuRadFeedback','niKfEdrates','niShallowForcedRa','niMaxiens','niMaxens','niMaxens2','niMaxens3','niEnsdim'].forEach(id=>{
  niEl(id)?.addEventListener('change',updatePhysicsCompatibility);
});
buildNamelistInputTable();
