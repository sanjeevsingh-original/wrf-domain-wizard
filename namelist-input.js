// WRF namelist.input generator — real-data / WRF-ARW starter configuration
const namelistInputValues=[];
const niDefaults={mp:'6',cu:'16',lw:'4',sw:'4',pbl:'1',sfclay:'1',lsm:'2',urban:'0'};
function niOptions(a,v){return a.map(x=>'<option value="'+x[0]+'"'+(x[0]===String(v)?' selected':'')+'>'+x[1]+'</option>').join('');}
function niEl(id){return document.getElementById(id);}
function niNum(id,def){const v=Number(niEl(id)?.value);return Number.isFinite(v)?v:def;}
function niBool(id){return niEl(id)?.value||'.false.';}
function buildNamelistInputTable(){
 const n=Number(niEl('domainCount').value);
 while(namelistInputValues.length<n)namelistInputValues.push({...niDefaults});
 namelistInputValues.length=n;
 const t=niEl('namelistInputTable');
 const mp=[['6','6 — WSM6'],['8','8 — Thompson'],['10','10 — Morrison'],['18','18 — NSSL'],['3','3 — WSM3'],['5','5 — WSM5']];
 const cu=[['16','16 — New Tiedtke'],['6','6 — Tiedtke'],['3','3 — Grell-Freitas'],['11','11 — MSKF'],['1','1 — BMJ'],['0','0 — off']];
 const lw=[['4','4 — RRTMG'],['1','1 — RRTM'],['3','3 — CAM'],['0','0 — off']];
 const sw=[['4','4 — RRTMG'],['1','1 — Dudhia'],['2','2 — Goddard'],['3','3 — CAM'],['0','0 — off']];
 const pbl=[['1','1 — YSU'],['2','2 — MYJ'],['5','5 — MYNN'],['6','6 — MYNN2'],['0','0 — off']];
 const sf=[['1','1 — MM5 similarity'],['2','2 — Eta'],['5','5 — MYNN'],['91','91 — MYNN'],['0','0 — off']];
 const lsm=[['2','2 — Noah'],['1','1 — 5-layer thermal'],['3','3 — RUC'],['4','4 — Noah-MP'],['0','0 — thermal diffusion']];
 t.innerHTML=Array.from({length:n},(_,i)=>{const v=namelistInputValues[i];return '<div class="border rounded p-2 mb-2"><div class="fw-semibold small mb-2">d'+pad(i)+'</div><div class="row g-2">'+
 '<div class="col-6"><label class="form-label small">mp_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="mp">'+niOptions(mp,v.mp)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">cu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="cu">'+niOptions(cu,v.cu)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">ra_lw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lw">'+niOptions(lw,v.lw)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">ra_sw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sw">'+niOptions(sw,v.sw)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">bl_pbl_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="pbl">'+niOptions(pbl,v.pbl)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">sf_sfclay_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sfclay">'+niOptions(sf,v.sfclay)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">sf_surface_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lsm">'+niOptions(lsm,v.lsm)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">sf_urban_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="urban">'+niOptions([['0','0 — off'],['1','1 — SLUCM'],['2','2 — BEP'],['3','3 — BEM']],v.urban)+'</select></div>'+
 '</div></div>';}).join('');
 document.querySelectorAll('.ni-field').forEach(x=>x.addEventListener('change',()=>{namelistInputValues[Number(x.dataset.d)][x.dataset.k]=x.value;}));
}
function durationParts(start,end){
 const a=new Date(start.replace('_','T')+'Z'),b=new Date(end.replace('_','T')+'Z');
 if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a)throw new Error('Invalid WRF start/end time.');
 let s=Math.round((b-a)/1000),days=Math.floor(s/86400);s-=days*86400;let hours=Math.floor(s/3600);s-=hours*3600;let minutes=Math.floor(s/60);s-=minutes*60;
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
 domains.forEach((dom,i)=>{if(i){cdx/=rs[i];cdy/=rs[i];}const q=WRF.gridDimensions(dom.getBounds(),cdx,cdy,ss);g.push({ew:i?WRF.snapDimension(q.e_we,rs[i]):q.e_we,es:i?WRF.snapDimension(q.e_sn,rs[i]):q.e_sn});});
 const is=[1],js=[1];for(let i=1;i<n;i++){const p=WRF.parentStart(domains[i-1].getBounds(),domains[i].getBounds(),g[i-1],g[i],rs[i],ss);is.push(p.i);js.push(p.j);}
 const v=a=>a.join(', ');
 const inputFromFile=v(domains.map(()=>'.true.'));
 const zeros=v(domains.map(()=>0));
 const ones=v(domains.map(()=>1));
 const specified=domains.map((_,i)=>i===0?'.true.':'.false.').join(', ');
 const nested=domains.map((_,i)=>i===0?'.false.':'.true.').join(', ');
 const suite=niEl('physicsSuiteInput').value;
 const physicsSuite=suite==='none'?'':"physics_suite = '"+suite+"',\n ";
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
 '&physics\n '+physicsSuite+
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
 '&namelist_quilt\n nio_tasks_per_group = '+niNum('niNioTasks',0)+',\n nio_groups = '+niNum('niNioGroups',1)+',\n/\n';
}
function downloadNamelistInput(){try{const x=generateNamelistInput(),b=new Blob([x],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='namelist.input';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}catch(e){showError(e.message);}}
niEl('domainCount').addEventListener('change',buildNamelistInputTable);
niEl('exportInputBtn').addEventListener('click',downloadNamelistInput);
buildNamelistInputTable();
