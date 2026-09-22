// WRF namelist.input generator
const namelistInputValues=[];
const niDefaults={mp:'6',cu:'16',lw:'4',sw:'4',pbl:'1',sfclay:'91',lsm:'2'};
function niOptions(a,v){return a.map(x=>'<option value="'+x[0]+'"'+(x[0]===String(v)?' selected':'')+'>'+x[1]+'</option>').join('');}
function buildNamelistInputTable(){
 const n=Number(document.getElementById('domainCount').value);
 while(namelistInputValues.length<n)namelistInputValues.push({...niDefaults});
 namelistInputValues.length=n;
 const t=document.getElementById('namelistInputTable');
 t.innerHTML=Array.from({length:n},(_,i)=>{const v=namelistInputValues[i];return '<div class="border rounded p-2 mb-2"><div class="fw-semibold small mb-2">d'+pad(i)+'</div><div class="row g-2">'+
 '<div class="col-6"><label class="form-label small">mp_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="mp">'+niOptions([['6','6 — WSM6'],['8','8 — Thompson'],['10','10 — Morrison'],['18','18 — NSSL'],['3','3 — WSM3'],['5','5 — WSM5']],v.mp)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">cu_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="cu">'+niOptions([['16','16 — New Tiedtke'],['6','6 — Tiedtke'],['3','3 — GF'],['11','11 — MSKF'],['0','0 — off']],v.cu)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">ra_lw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lw">'+niOptions([['4','4 — RRTMG'],['1','1 — RRTM'],['3','3 — CAM'],['0','0 — off']],v.lw)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">ra_sw_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sw">'+niOptions([['4','4 — RRTMG'],['1','1 — Dudhia'],['2','2 — Goddard'],['3','3 — CAM'],['0','0 — off']],v.sw)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">bl_pbl_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="pbl">'+niOptions([['1','1 — YSU'],['2','2 — MYJ'],['5','5 — MYNN'],['0','0 — off']],v.pbl)+'</select></div>'+
 '<div class="col-6"><label class="form-label small">sf_sfclay_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="sfclay">'+niOptions([['91','91 — MM5'],['1','1 — MM5'],['2','2 — Eta'],['5','5 — MYNN'],['0','0 — off']],v.sfclay)+'</select></div>'+
 '<div class="col-12"><label class="form-label small">sf_surface_physics</label><select class="form-select form-select-sm ni-field" data-d="'+i+'" data-k="lsm">'+niOptions([['2','2 — Noah'],['1','1 — 5-layer thermal'],['3','3 — RUC'],['4','4 — Noah-MP'],['0','0 — thermal diffusion']],v.lsm)+'</select></div>'+
 '</div></div>';}).join('');
 document.querySelectorAll('.ni-field').forEach(x=>x.addEventListener('change',()=>{namelistInputValues[Number(x.dataset.d)][x.dataset.k]=x.value;}));
}
function generateNamelistInput(){
 const n=Number(document.getElementById('domainCount').value);
 if(domains.length!==n)throw new Error('Complete all selected domains before downloading namelist.input.');
 const w=wpsSettings(),rs=ratios(),sp=spacing(),ss=settings(),d=namelistInputValues;
 let cdx=sp.dx,cdy=sp.dy,g=[];
 domains.forEach((dom,i)=>{if(i){cdx/=rs[i];cdy/=rs[i];}const q=WRF.gridDimensions(dom.getBounds(),cdx,cdy,ss);g.push({ew:i?WRF.snapDimension(q.e_we,rs[i]):q.e_we,es:i?WRF.snapDimension(q.e_sn,rs[i]):q.e_sn});});
 const is=[1],js=[1];for(let i=1;i<n;i++){const p=WRF.parentStart(domains[i-1].getBounds(),domains[i].getBounds(),g[i-1],g[i],rs[i],ss);is.push(p.i);js.push(p.j);}
 const v=a=>a.join(', ');
 return '&time_control\n run_days = 0,\n run_hours = 24,\n start_year = '+v(domains.map(()=>w.startDate.slice(0,4)))+',\n start_month = '+v(domains.map(()=>w.startDate.slice(5,7)))+',\n start_day = '+v(domains.map(()=>w.startDate.slice(8,10)))+',\n start_hour = '+v(domains.map(()=>w.startDate.slice(11,13)))+',\n end_year = '+v(domains.map(()=>w.endDate.slice(0,4)))+',\n end_month = '+v(domains.map(()=>w.endDate.slice(5,7)))+',\n end_day = '+v(domains.map(()=>w.endDate.slice(8,10)))+',\n end_hour = '+v(domains.map(()=>w.endDate.slice(11,13)))+',\n interval_seconds = '+w.intervalSeconds+',\n input_from_file = .true.,\n history_interval = 60,\n frames_per_outfile = 1,\n restart = .false.,\n io_form_history = 2,\n io_form_restart = 2,\n io_form_input = 2,\n io_form_boundary = 2,\n/\n\n'+
 '&domains\n time_step = '+Math.max(1,Math.round(sp.dx/1000*6))+',\n max_dom = '+n+',\n e_we = '+v(g.map(x=>x.ew))+',\n e_sn = '+v(g.map(x=>x.es))+',\n e_vert = '+v(domains.map(()=>45))+',\n p_top_requested = 5000,\n num_metgrid_levels = 34,\n num_metgrid_soil_levels = 4,\n dx = '+sp.dx+',\n dy = '+sp.dy+',\n grid_id = '+v(domains.map((_,i)=>i+1))+',\n parent_id = '+v(domains.map((_,i)=>i))+',\n i_parent_start = '+v(is)+',\n j_parent_start = '+v(js)+',\n parent_grid_ratio = '+v(rs)+',\n parent_time_step_ratio = '+v(rs)+',\n feedback = 1,\n smooth_option = 0,\n/\n\n'+
 '&physics\n physics_suite = ''+document.getElementById('physicsSuiteInput').value+'',\n mp_physics = '+v(d.map(x=>x.mp))+',\n cu_physics = '+v(d.map(x=>x.cu))+',\n ra_lw_physics = '+v(d.map(x=>x.lw))+',\n ra_sw_physics = '+v(d.map(x=>x.sw))+',\n bl_pbl_physics = '+v(d.map(x=>x.pbl))+',\n sf_sfclay_physics = '+v(d.map(x=>x.sfclay))+',\n sf_surface_physics = '+v(d.map(x=>x.lsm))+',\n num_soil_layers = 4,\n num_land_cat = 21,\n/\n\n'+
 '&dynamics\n hybrid_opt = 2,\n w_damping = 0,\n diff_opt = 2,\n km_opt = 4,\n non_hydrostatic = .true.,\n moist_adv_opt = 1,\n scalar_adv_opt = 1,\n/\n\n&bdy_control\n spec_bdy_width = 5,\n specified = .true.,\n nested = .false.,\n/\n\n&namelist_quilt\n nio_tasks_per_group = 0,\n nio_groups = 1,\n/\n';
}
function downloadNamelistInput(){try{const x=generateNamelistInput(),b=new Blob([x],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='namelist.input';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}catch(e){showError(e.message);}}
document.getElementById('domainCount').addEventListener('change',buildNamelistInputTable);
document.getElementById('exportInputBtn').addEventListener('click',downloadNamelistInput);
buildNamelistInputTable();
