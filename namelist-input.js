// WRF namelist.input generator — real-data / WRF-ARW starter configuration
const namelistInputValues=[];
const niDefaults={mp:'6',cu:'16',lw:'4',sw:'4',pbl:'1',sfclay:'91',lsm:'2',urban:'0',shcu:'0'};
const niAdvancedDefaults={kfeta:'1',ishallow:'0',cugd:'1',nsas:'0',convtrans:'30',cudiag:'0',curad:'.false.',kfeds:'0',forcedra:'.false.',maxiens:'1',maxens:'3',maxens2:'3',maxens3:'16',ensdim:'144'};

function niOptions(a,v){
  return a.map(x=>'<option value="'+x[0]+'"'+(x[0]===String(v)?' selected':'')+'>'+x[1]+'</option>').join('');
}
function niEl(id){return document.getElementById(id);}
function niNum(id,def){const v=Number(niEl(id)?.value);return Number.isFinite(v)?v:def;}
function niBool(id){return niEl(id)?.value||'.false.';}

function buildNamelistInputTable(){
  const n=Number(niEl('domainCount').value);
  while(namelistInputValues.length<n)namelistInputValues.push({...niDefaults});
  namelistInputValues.length=n;
  const t=niEl('namelistInputTable');
  if(!t)return;

  const mp=[
    ['0','0 — off'],['1','1 — Kessler'],['2','2 — Lin et al.'],['3','3 — WSM3'],
    ['4','4 — WSM5'],['5','5 — Eta'],['6','6 — WSM6'],['7','7 — Goddard'],
    ['8','8 — Thompson'],['9','9 — Milbrandt-Yau'],['10','10 — Morrison'],
    ['11','11 — CAM5.1'],['13','13 — SBU-YLin'],['14','14 — WDM5'],
    ['15','15 — WDM6'],['16','16 — WDM7'],['18','18 — NSSL 2-moment'],
    ['28','28 — Thompson aerosol-aware']
  ];
  const cu=[
    ['0','0 — off'],['1','1 — BMJ'],['2','2 — KFETA'],['3','3 — Grell-Freitas'],
    ['4','4 — Simplified Arakawa-Schubert'],['5','5 — GD'],['6','6 — Tiedtke'],
    ['7','7 — Zhang-McFarlane'],['10','10 — New SAS'],['11','11 — MSKF'],
    ['14','14 — New Tiedtke'],['16','16 — New Tiedtke (tropical suite)'],
    ['93','93 — G3'],['96','96 — Grell 3D'],['99','99 — Multi-scale KF']
  ];
  const lw=[
    ['0','0 — off'],['1','1 — RRTM'],['3','3 — CAM'],['4','4 — RRTMG'],
    ['5','5 — New Goddard'],['7','7 — FLG'],['14','14 — RRTMG FAST'],
    ['24','24 — CAM3.5'],['31','31 — CAM5']
  ];
  const sw=[
    ['0','0 — off'],['1','1 — Dudhia'],['2','2 — Goddard'],['3','3 — CAM'],
    ['4','4 — RRTMG'],['5','5 — New Goddard'],['7','7 — FLG'],
    ['14','14 — RRTMG FAST'],['24','24 — CAM3.5'],['31','31 — CAM5']
  ];
  const pbl=[
    ['0','0 — off'],['1','1 — YSU'],['2','2 — MYJ'],['4','4 — MYNN'],
    ['5','5 — MYNN 2.5'],['6','6 — MYNN 3.0'],['7','7 — ACM2'],
    ['8','8 — BouLac'],['9','9 — UW'],['10','10 — TEMF'],
    ['11','11 — Shin-Hong'],['12','12 — GBM'],['16','16 — MYNN-EDMF'],
    ['17','17 — MYNN-EDMF 2.0'],['99','99 — MRF']
  ];
  const sf=[
    ['0','0 — off'],['1','1 — MM5 similarity'],['2','2 — Eta'],
    ['5','5 — MYNN'],['91','91 — MYNN'],['7','7 — Pleim-Xiu']
  ];
  const lsm=[
    ['0','0 — thermal diffusion'],['1','1 — 5-layer thermal'],
    ['2','2 — Noah'],['3','3 — RUC'],['4','4 — Noah-MP'],
    ['5','5 — CLM4'],['7','7 — Pleim-Xiu'],['8','8 — SSiB']
  ];
  const urban=[
    ['0','0 — off'],['1','1 — SLUCM'],['2','2 — BEP'],['3','3 — BEM']
  ];
  const shcu=[['0','0 — off'],['2','2 — UW / Park-Bretherton'],['3','3 — GRIMS'],['4','4 — NSAS shallow'],['5','5 — Deng']];

  t.innerHTML='<div class="alert alert-info py-2 small mb-2"><strong>Per-domain physics:</strong> cu_physics, mp_physics, radiation, PBL, surface layer, LSM and urban physics are configured here for every domain. These values are written directly to the <code>&physics</code> section.</div>'+
    Array.from({length:n},(_,i)=>{
      const v=namelistInputValues[i];
      return '<div class="border rounded p-2 mb-2"><div class="fw-semibold small mb-2">d'+pad(i)+'</div><div class="row g-2">'+
      '<div class="col-6"><label class="form-label small">mp_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="mp">'+niOptions(mp,v.mp)+'</select></div>'+
      '<div class="col-6"><label class="form-label small fw-semibold">cu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="cu">'+niOptions(cu,v.cu)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">ra_lw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lw">'+niOptions(lw,v.lw)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">ra_sw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sw">'+niOptions(sw,v.sw)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">bl_pbl_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="pbl">'+niOptions(pbl,v.pbl)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_sfclay_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sfclay">'+niOptions(sf,v.sfclay)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_surface_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lsm">'+niOptions(lsm,v.lsm)+'</select></div>'+
      '<div class="col-6"><label class="form-label small">sf_urban_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="urban">'+niOptions(urban,v.urban)+'</select></div>'+\
      '<div class="col-6"><label class="form-label small">shcu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="shcu">'+niOptions(shcu,v.shcu)+'</select></div>'+
      '</div></div>';
    }).join('');

  document.querySelectorAll('.ni-field').forEach(x=>x.addEventListener('change',()=>{
    namelistInputValues[Number(x.dataset.d)][x.dataset.k]=x.value;
    updatePhysicsCompatibility();
  }));
  updatePhysicsCompatibility();
}

function updatePhysicsCompatibility(){
  const box=niEl('physicsCompatibility');
  if(!box)return;
  const notes=[],cu=namelistInputValues.map(x=>Number(x.cu)),pbl=namelistInputValues.map(x=>Number(x.pbl)),sh=namelistInputValues.map(x=>Number(x.shcu));
  if(cu.some(x=>x===1)&&Number(niEl('niKfetaTrigger')?.value)!==1) notes.push('kfeta_trigger is only used with cu_physics=1 (Kain-Fritsch).');
  if(Number(niEl('niIshallow')?.value)===1&&!cu.some(x=>x===3||x===5)) notes.push('ishallow=1 requires cu_physics=3 (Grell-Freitas) or 5 (Grell-3D).');
  if(sh.some(x=>x===5)&&pbl.some(x=>![2,4,5,6].includes(x))) notes.push('shcu_physics=5 (Deng) is documented only with MYJ/MYNN-family PBL options; verify the exact PBL code/version.');
  if(sh.some(x=>x===4)&&!cu.some(x=>x===14)) notes.push('shcu_physics=4 is intended for the KSAS / cu_physics=14 combination.');
  if(Number(niEl('niCugdAvedx')?.value)===3&&!cu.some(x=>x===5)) notes.push('cugd_avedx=3 is documented for cu_physics=5.');
  if(Number(niEl('niNsasDxFactor')?.value)===1&&!cu.some(x=>[14,96].includes(x))) notes.push('nsas_dx_factor is an NSAS-related option; verify compatibility with your selected SAS scheme.');
  if(Number(niEl('niCuDiag')?.value)===1&&!cu.some(x=>[3,5,93].includes(x))) notes.push('cu_diag=1 is documented for cu_physics=3, 5, or 93.');
  if(niEl('niCuRadFeedback')?.value==='.true.'&&!cu.some(x=>[1,3,5,10,11,93,99].includes(x))) notes.push('cu_rad_feedback=.true. is documented for cu_physics=1, 3, 5, 10, 11, 93, or 99.');
  if(Number(niEl('niKfEdrates')?.value)===1&&!cu.some(x=>[1,11,99].includes(x))) notes.push('kf_edrates=1 is documented for KF-based schemes 1, 11, and 99.');
  box.innerHTML=notes.length?'<div class="alert alert-warning py-2 mb-0">'+notes.map(x=>'• '+x).join('<br>')+'</div>':'<div class="alert alert-success py-2 mb-0">No obvious cumulus/PBL compatibility conflicts detected from the selected options.</div>';
}
\nfunction durationParts(start,end){
  const a=new Date(start.replace('_','T')+'Z'),b=new Date(end.replace('_','T')+'Z');
  if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a)throw new Error('Invalid WRF start/end time.');
  let s=Math.round((b-a)/1000),days=Math.floor(s/86400);s-=days*86400;
  let hours=Math.floor(s/3600);s-=hours*3600;
  let minutes=Math.floor(s/60);s-=minutes*60;
  return {days,hours,minutes,seconds:s};
}
function parseStartEnd(w){
  const parts=x=>({y:x.slice(0,4),m:x.slice(5,7),d:x.slice(8,10),h:x.slice(11,13),mi:x.slice(14,16),s:x.slice(17,19)});
  return {start:parts(w.startDate),end:parts(w.endDate)};
}

function generateNamelistInput(){
  const n=Number(niEl('domainCount').value);
  if(domains.length!==n)throw new Error('Complete all selected domains before downloading namelist.input.');
  const w=wpsSettings(),rs=ratios(),sp=spacing(),ss=settings(),d=namelistInputValues;
  const dur=durationParts(w.startDate,w.endDate),te=parseStartEnd(w);
  let cdx=sp.dx,cdy=sp.dy,g=[];
  domains.forEach((dom,i)=>{
    if(i){cdx/=rs[i];cdy/=rs[i];}
    const q=WRF.gridDimensions(dom.getBounds(),cdx,cdy,ss);
    g.push({ew:i?WRF.snapDimension(q.e_we,rs[i]):q.e_we,es:i?WRF.snapDimension(q.e_sn,rs[i]):q.e_sn});
  });
  const is=[1],js=[1];
  for(let i=1;i<n;i++){
    const p=WRF.parentStart(domains[i-1].getBounds(),domains[i].getBounds(),g[i-1],g[i],rs[i],ss);
    is.push(p.i);js.push(p.j);
  }
  const v=a=>a.join(', ');
  const inputFromFile=v(domains.map(()=>'.true.'));
  const specified=domains.map((_,i)=>i===0?'.true.':'.false.').join(', ');
  const nested=domains.map((_,i)=>i===0?'.false.':'.true.').join(', ');
  const suite=niEl('physicsSuiteInput').value;
  const ad={kfeta:niEl('niKfetaTrigger').value,ishallow:niEl('niIshallow').value,cugd:niEl('niCugdAvedx').value,nsas:niEl('niNsasDxFactor').value,convtrans:niNum('niConvtransAvglen',30),cudiag:niEl('niCuDiag').value,curad:niEl('niCuRadFeedback').value,kfeds:niEl('niKfEdrates').value,forcedra:niEl('niShallowForcedRa').value,maxiens:niNum('niMaxiens',1),maxens:niNum('niMaxens',3),maxens2:niNum('niMaxens2',3),maxens3:niNum('niMaxens3',16),ensdim:niNum('niEnsdim',144)};
  const physicsSuite=suite==='none'?'':" physics_suite = '"+suite+"',\n";

  return '&time_control\n'+
  ' run_days = '+dur.days+',\n run_hours = '+dur.hours+',\n run_minutes = '+dur.minutes+',\n run_seconds = '+dur.seconds+',\n'+
  ' start_year = '+v(domains.map(()=>te.start.y))+',\n start_month = '+v(domains.map(()=>te.start.m))+',\n start_day = '+v(domains.map(()=>te.start.d))+',\n start_hour = '+v(domains.map(()=>te.start.h))+',\n start_minute = '+v(domains.map(()=>te.start.mi))+',\n start_second = '+v(domains.map(()=>te.start.s))+',\n'+
  ' end_year = '+v(domains.map(()=>te.end.y))+',\n end_month = '+v(domains.map(()=>te.end.m))+',\n end_day = '+v(domains.map(()=>te.end.d))+',\n end_hour = '+v(domains.map(()=>te.end.h))+',\n end_minute = '+v(domains.map(()=>te.end.mi))+',\n end_second = '+v(domains.map(()=>te.end.s))+',\n'+
  ' interval_seconds = '+w.intervalSeconds+',\n input_from_file = '+inputFromFile+',\n history_interval = '+niNum('niHistoryInterval',60)+',\n frames_per_outfile = '+niNum('niFramesPerOutfile',1)+',\n restart = '+niBool('niRestart')+',\n restart_interval = '+niNum('niRestartInterval',720)+',\n io_form_history = '+niEl('niIoHistory').value+',\n io_form_restart = '+niEl('niIoRestart').value+',\n io_form_input = 2,\n io_form_boundary = 2,\n/\n\n'+
  '&domains\n'+
  ' time_step = '+niNum('niTimeStep',Math.max(1,Math.round(sp.dx/1000*6)))+',\n time_step_fract_num = 0,\n time_step_fract_den = 1,\n max_dom = '+n+',\n'+
  ' e_we = '+v(g.map(x=>x.ew))+',\n e_sn = '+v(g.map(x=>x.es))+',\n e_vert = '+v(domains.map(()=>niNum('niEvert',45)))+',\n'+
  ' p_top_requested = '+niNum('niPtop',5000)+',\n num_metgrid_levels = '+niNum('niMetgridLevels',34)+',\n num_metgrid_soil_levels = '+niNum('niMetgridSoilLevels',4)+',\n'+
  ' dx = '+sp.dx+',\n dy = '+sp.dy+',\n grid_id = '+v(domains.map((_,i)=>i+1))+',\n parent_id = '+v(domains.map((_,i)=>i))+',\n'+
  ' i_parent_start = '+v(is)+',\n j_parent_start = '+v(js)+',\n parent_grid_ratio = '+v(rs)+',\n parent_time_step_ratio = '+v(rs)+',\n'+
  ' feedback = '+niEl('niFeedback').value+',\n smooth_option = '+niEl('niSmoothOption').value+',\n/\n\n'+
  '&physics\n'+physicsSuite+
  ' mp_physics = '+v(d.map(x=>x.mp))+',\n cu_physics = '+v(d.map(x=>x.cu))+',\n ra_lw_physics = '+v(d.map(x=>x.lw))+',\n ra_sw_physics = '+v(d.map(x=>x.sw))+',\n'+
  ' bl_pbl_physics = '+v(d.map(x=>x.pbl))+',\n sf_sfclay_physics = '+v(d.map(x=>x.sfclay))+',\n sf_surface_physics = '+v(d.map(x=>x.lsm))+',\n sf_urban_physics = '+v(d.map(x=>x.urban))+',\n'+
  ' radt = '+v(domains.map(()=>niNum('niRadt',5)))+',\n bldt = '+v(domains.map(()=>niNum('niBldt',0)))+',\n cudt = '+v(domains.map(()=>niNum('niCudt',5)))+',\n'+
  ' num_soil_layers = '+niNum('niSoilLayers',4)+',\n num_land_cat = '+niNum('niLandCat',21)+',\n icloud = '+niEl('niIcloud').value+',\n fractional_seaice = '+niEl('niFractionalSeaice').value+',\n sst_update = '+niBool('niSstUpdate')+',\n/\n\n'+
  '&dynamics\n hybrid_opt = '+niEl('niHybridOpt').value+',\n non_hydrostatic = '+niBool('niNonHydro')+',\n'+
  ' w_damping = '+niEl('niWDamping').value+',\n diff_opt = '+niEl('niDiffOpt').value+',\n km_opt = '+niEl('niKmOpt').value+',\n damp_opt = '+niEl('niDampOpt').value+',\n'+
  ' zdamp = '+niNum('niZdamp',5000)+',\n dampcoef = '+niNum('niDampcoef',0.2)+',\n moist_adv_opt = '+niNum('niMoistAdv',1)+',\n scalar_adv_opt = '+niNum('niScalarAdv',1)+',\n'+
  ' gwd_opt = '+niEl('niGwdOpt').value+',\n use_theta_m = '+niEl('niThetaM').value+',\n khdif = '+niNum('niKhdif',0)+',\n kvdif = '+niNum('niKvdif',0)+',\n/\n\n'+
  '&bdy_control\n spec_bdy_width = '+niNum('niSpecBdyWidth',5)+',\n spec_zone = '+niNum('niSpecZone',1)+',\n relax_zone = '+niNum('niRelaxZone',4)+',\n specified = '+specified+',\n nested = '+nested+',\n/\n\n'+
  '&fdda\n grid_fdda = '+v(domains.map(()=>niEl('niGridFdda').value))+',\n obs_nudge_opt = '+v(domains.map(()=>niEl('niObsNudge').value))+',\n/\n\n'+
  '&dfi_control\n dfi_opt = '+niEl('niDfiOpt').value+',\n/\n\n'+
  '&grib2\n/\n\n'+
  (niEl('niNoahMp').value==='1'?'&noah_mp\n/\n\n':'')+
  '&namelist_quilt\n nio_tasks_per_group = '+niNum('niNioTasks',0)+',\n nio_groups = '+niNum('niNioGroups',1)+',\n/';
}

function downloadNamelistInput(){
  try{
    const x=generateNamelistInput(),b=new Blob([x],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='namelist.input';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }catch(e){showError(e.message);}
}

niEl('domainCount').addEventListener('change',buildNamelistInputTable);
niEl('exportInputBtn').addEventListener('click',downloadNamelistInput);
buildNamelistInputTable();
