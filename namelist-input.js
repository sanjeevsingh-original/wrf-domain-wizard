// WRF namelist.input generator — research-oriented real-data starter
const namelistInputValues = [];
const niDefaults = {mp:'6', cu:'16', lw:'4', sw:'4', pbl:'1', sfclay:'91', lsm:'2', urban:'0', shcu:'0'};

function niEl(id){ return document.getElementById(id); }
function niNum(id, def){ const v = Number(niEl(id)?.value); return Number.isFinite(v) ? v : def; }
function niBool(id){ return niEl(id)?.value || '.false.'; }
function niOptions(items, value){
  return items.map(x => '<option value="'+x[0]+'"'+(x[0]===String(value)?' selected':'')+'>'+x[1]+'</option>').join('');
}

const perDomainFields = [
  {section:'Time control',key:'history_interval',label:'history_interval (min)',type:'number',def:60},
  {section:'Time control',key:'history_begin',label:'history_begin (min)',type:'number',def:0},
  {section:'Time control',key:'frames_per_outfile',label:'frames_per_outfile',type:'number',def:1},
  {section:'Time control',key:'input_from_file',label:'input_from_file',type:'bool',def:'.true.'},
  {section:'Time control',key:'fine_input_stream',label:'fine_input_stream',type:'number',def:0},
  {section:'Time control',key:'auxinput4_interval',label:'auxinput4_interval (min)',type:'number',def:360},
  {section:'Time control',key:'auxhist9_interval',label:'auxhist9_interval (min)',type:'number',def:10},
  {section:'Time control',key:'frames_per_auxhist9',label:'frames_per_auxhist9',type:'number',def:1000},
  {section:'Time control',key:'auxinput11_interval',label:'auxinput11_interval (min)',type:'number',def:10},
  {section:'Time control',key:'auxinput11_end_h',label:'auxinput11_end_h',type:'number',def:6},
  {section:'Physics',key:'radt',label:'radt (min)',type:'number',def:5},
  {section:'Physics',key:'bldt',label:'bldt (min)',type:'number',def:0},
  {section:'Physics',key:'cudt',label:'cudt (min)',type:'number',def:0},
  {section:'Physics',key:'mfshconv',label:'mfshconv',type:'number',def:1},
  {section:'Physics',key:'bl_mynn_tkebudget',label:'bl_mynn_tkebudget',type:'number',def:0},
  {section:'Physics',key:'bl_mynn_tkeadvect',label:'bl_mynn_tkeadvect',type:'bool',def:'.false.'},
  {section:'Physics',key:'bl_mynn_cloudmix',label:'bl_mynn_cloudmix',type:'number',def:1},
  {section:'Physics',key:'bl_mynn_edmf',label:'bl_mynn_edmf',type:'number',def:1},
  {section:'Physics',key:'bl_mynn_edmf_mom',label:'bl_mynn_edmf_mom',type:'number',def:1},
  {section:'Physics',key:'bl_mynn_edmf_tke',label:'bl_mynn_edmf_tke',type:'number',def:0},
  {section:'Physics',key:'scalar_pblmix',label:'scalar_pblmix',type:'number',def:0},
  {section:'Physics',key:'tracer_pblmix',label:'tracer_pblmix',type:'number',def:1},
  {section:'Physics',key:'shinhong_tke_diag',label:'shinhong_tke_diag',type:'number',def:1},
  {section:'Physics',key:'acc_phy_tend',label:'acc_phy_tend',type:'number',def:0},
  {section:'Physics',key:'progn',label:'progn',type:'number',def:0},
  {section:'Physics',key:'shallowcu_forced_ra',label:'shallowcu_forced_ra',type:'bool',def:'.false.'},
  {section:'Physics',key:'kf_edrates',label:'kf_edrates',type:'number',def:0},
  {section:'Physics',key:'cu_diag',label:'cu_diag',type:'number',def:0},
  {section:'Physics',key:'cu_rad_feedback',label:'cu_rad_feedback',type:'bool',def:'.false.'},
  {section:'Physics',key:'wif_fire_inj',label:'wif_fire_inj',type:'number',def:1},
  {section:'Physics',key:'slope_rad',label:'slope_rad',type:'number',def:0},
  {section:'Physics',key:'topo_shading',label:'topo_shading',type:'number',def:0},
  {section:'Physics',key:'aer_aod550_opt',label:'aer_aod550_opt',type:'number',def:1},
  {section:'Physics',key:'aer_aod550_val',label:'aer_aod550_val',type:'number',def:0.12},
  {section:'Physics',key:'aer_angexp_opt',label:'aer_angexp_opt',type:'number',def:1},
  {section:'Physics',key:'aer_angexp_val',label:'aer_angexp_val',type:'number',def:1.3},
  {section:'Physics',key:'aer_ssa_opt',label:'aer_ssa_opt',type:'number',def:1},
  {section:'Physics',key:'aer_ssa_val',label:'aer_ssa_val',type:'number',def:0.85},
  {section:'Physics',key:'aer_asy_opt',label:'aer_asy_opt',type:'number',def:1},
  {section:'Physics',key:'aer_asy_val',label:'aer_asy_val',type:'number',def:0.90},
  {section:'Physics',key:'aer_type',label:'aer_type',type:'number',def:1},
  {section:'Physics',key:'sf_lake_physics',label:'sf_lake_physics',type:'number',def:0},
  {section:'Physics',key:'lakedepth_default',label:'lakedepth_default (m)',type:'number',def:50},
  {section:'Physics',key:'lake_min_elev',label:'lake_min_elev',type:'number',def:5},
  {section:'Physics',key:'use_lakedepth',label:'use_lakedepth',type:'number',def:1},
  {section:'Physics',key:'lightning_option',label:'lightning_option',type:'number',def:0},
  {section:'Physics',key:'lightning_dt',label:'lightning_dt (s)',type:'number',def:0},
  {section:'Physics',key:'lightning_start_seconds',label:'lightning_start_seconds',type:'number',def:0},
  {section:'Physics',key:'flashrate_factor',label:'flashrate_factor',type:'number',def:1},
  {section:'Physics',key:'cellcount_method',label:'cellcount_method',type:'number',def:0},
  {section:'Physics',key:'hailcast_opt',label:'hailcast_opt',type:'number',def:0},
  {section:'Physics',key:'haildt',label:'haildt (s)',type:'number',def:0},
  {section:'Physics',key:'sf_surf_irr_scheme',label:'sf_surf_irr_scheme',type:'number',def:0},
  {section:'Physics',key:'irr_daily_amount',label:'irr_daily_amount (mm/day)',type:'number',def:0},
  {section:'Dynamics',key:'diff_opt',label:'diff_opt',type:'number',def:-1},
  {section:'Dynamics',key:'km_opt',label:'km_opt',type:'number',def:-1},
  {section:'Dynamics',key:'diff_6th_opt',label:'diff_6th_opt',type:'number',def:0},
  {section:'Dynamics',key:'diff_6th_factor',label:'diff_6th_factor',type:'number',def:0.12},
  {section:'Dynamics',key:'diff_6th_slopeopt',label:'diff_6th_slopeopt',type:'number',def:0},
  {section:'Dynamics',key:'diff_6th_thresh',label:'diff_6th_thresh',type:'number',def:0.1},
  {section:'Dynamics',key:'c_s',label:'c_s',type:'number',def:0.25},
  {section:'Dynamics',key:'c_k',label:'c_k',type:'number',def:0.15},
  {section:'Dynamics',key:'zdamp',label:'zdamp (m)',type:'number',def:5000},
  {section:'Dynamics',key:'dampcoef',label:'dampcoef',type:'number',def:0.2},
  {section:'Dynamics',key:'khdif',label:'khdif (m²/s)',type:'number',def:0},
  {section:'Dynamics',key:'kvdif',label:'kvdif (m²/s)',type:'number',def:0},
  {section:'Dynamics',key:'smdiv',label:'smdiv',type:'number',def:0.1},
  {section:'Dynamics',key:'emdiv',label:'emdiv',type:'number',def:0.01},
  {section:'Dynamics',key:'epssm',label:'epssm',type:'number',def:0.1},
  {section:'Dynamics',key:'non_hydrostatic',label:'non_hydrostatic',type:'bool',def:'.true.'},
  {section:'Dynamics',key:'mix_full_fields',label:'mix_full_fields',type:'bool',def:'.false.'},
  {section:'Dynamics',key:'mix_isotropic',label:'mix_isotropic',type:'number',def:0},
  {section:'Dynamics',key:'mix_upper_bound',label:'mix_upper_bound',type:'number',def:0.1},
  {section:'Dynamics',key:'h_mom_adv_order',label:'h_mom_adv_order',type:'number',def:5},
  {section:'Dynamics',key:'v_mom_adv_order',label:'v_mom_adv_order',type:'number',def:3},
  {section:'Dynamics',key:'h_sca_adv_order',label:'h_sca_adv_order',type:'number',def:5},
  {section:'Dynamics',key:'v_sca_adv_order',label:'v_sca_adv_order',type:'number',def:3},
  {section:'Dynamics',key:'time_step_sound',label:'time_step_sound',type:'number',def:0},
  {section:'Dynamics',key:'moist_adv_opt',label:'moist_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'scalar_adv_opt',label:'scalar_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'tke_adv_opt',label:'tke_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'phi_adv_z',label:'phi_adv_z',type:'number',def:1},
  {section:'Dynamics',key:'chem_adv_opt',label:'chem_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'tracer_adv_opt',label:'tracer_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'momentum_adv_opt',label:'momentum_adv_opt',type:'number',def:1},
  {section:'Dynamics',key:'gwd_opt',label:'gwd_opt',type:'number',def:0},
  {section:'Dynamics',key:'do_avgflx_em',label:'do_avgflx_em',type:'number',def:0},
  {section:'Dynamics',key:'do_avgflx_cugd',label:'do_avgflx_cugd',type:'number',def:0},
  {section:'Dynamics',key:'sfs_opt',label:'sfs_opt',type:'number',def:0},
  {section:'Dynamics',key:'m_opt',label:'m_opt',type:'number',def:0},
  {section:'Dynamics',key:'tracer_opt',label:'tracer_opt',type:'number',def:0},
  {section:'Boundary',key:'specified',label:'specified',type:'bool',def:'.false.'},
  {section:'Boundary',key:'nested',label:'nested',type:'bool',def:'.false.'},
  {section:'Boundary',key:'periodic_x',label:'periodic_x',type:'bool',def:'.false.'},
  {section:'Boundary',key:'symmetric_xs',label:'symmetric_xs',type:'bool',def:'.false.'},
  {section:'Boundary',key:'symmetric_xe',label:'symmetric_xe',type:'bool',def:'.false.'},
  {section:'Boundary',key:'open_xs',label:'open_xs',type:'bool',def:'.false.'},
  {section:'Boundary',key:'open_xe',label:'open_xe',type:'bool',def:'.false.'},
  {section:'Boundary',key:'periodic_y',label:'periodic_y',type:'bool',def:'.false.'},
  {section:'Boundary',key:'symmetric_ys',label:'symmetric_ys',type:'bool',def:'.false.'},
  {section:'Boundary',key:'symmetric_ye',label:'symmetric_ye',type:'bool',def:'.false.'},
  {section:'Boundary',key:'open_ys',label:'open_ys',type:'bool',def:'.false.'},
  {section:'Boundary',key:'open_ye',label:'open_ye',type:'bool',def:'.false.'},
  {section:'Boundary',key:'have_bcs_moist',label:'have_bcs_moist',type:'bool',def:'.false.'},
  {section:'Boundary',key:'have_bcs_scalar',label:'have_bcs_scalar',type:'bool',def:'.false.'},
  {section:'FDDA',key:'grid_fdda',label:'grid_fdda',type:'number',def:0},
  {section:'FDDA',key:'gfdda_interval_m',label:'gfdda_interval_m',type:'number',def:0},
  {section:'FDDA',key:'gfdda_end_h',label:'gfdda_end_h',type:'number',def:0},
  {section:'FDDA',key:'fgdt',label:'fgdt',type:'number',def:0},
  {section:'FDDA',key:'if_no_pbl_nudging_uv',label:'if_no_pbl_nudging_uv',type:'number',def:0},
  {section:'FDDA',key:'if_no_pbl_nudging_t',label:'if_no_pbl_nudging_t',type:'number',def:0},
  {section:'FDDA',key:'if_no_pbl_nudging_q',label:'if_no_pbl_nudging_q',type:'number',def:0},
  {section:'FDDA',key:'guv',label:'guv',type:'number',def:0},
  {section:'FDDA',key:'gt',label:'gt',type:'number',def:0},
  {section:'FDDA',key:'gq',label:'gq',type:'number',def:0},
  {section:'FDDA',key:'grid_sfdda',label:'grid_sfdda',type:'number',def:0},
  {section:'FDDA',key:'sgfdda_interval_m',label:'sgfdda_interval_m',type:'number',def:0},
  {section:'FDDA',key:'sgfdda_end_h',label:'sgfdda_end_h',type:'number',def:0},
  {section:'FDDA',key:'guv_sfc',label:'guv_sfc',type:'number',def:0},
  {section:'FDDA',key:'gt_sfc',label:'gt_sfc',type:'number',def:0},
  {section:'FDDA',key:'gq_sfc',label:'gq_sfc',type:'number',def:0},
  {section:'FDDA',key:'rinblw',label:'rinblw',type:'number',def:0},
  {section:'FDDA',key:'obs_nudge_opt',label:'obs_nudge_opt',type:'number',def:0},
  {section:'FDDA',key:'fdda_start',label:'fdda_start (min)',type:'number',def:0},
  {section:'FDDA',key:'fdda_end',label:'fdda_end (min)',type:'number',def:0},
  {section:'FDDA',key:'obs_nudge_wind',label:'obs_nudge_wind',type:'number',def:0},
  {section:'FDDA',key:'obs_coef_wind',label:'obs_coef_wind',type:'number',def:0},
  {section:'FDDA',key:'obs_nudge_temp',label:'obs_nudge_temp',type:'number',def:0},
  {section:'FDDA',key:'obs_coef_temp',label:'obs_coef_temp',type:'number',def:0},
  {section:'FDDA',key:'obs_nudge_mois',label:'obs_nudge_mois',type:'number',def:0},
  {section:'FDDA',key:'obs_coef_mois',label:'obs_coef_mois',type:'number',def:0},
  {section:'FDDA',key:'obs_rinxy',label:'obs_rinxy (km)',type:'number',def:0},
  {section:'FDDA',key:'obs_twindo',label:'obs_twindo (h)',type:'number',def:0},
  {section:'FDDA',key:'obs_ionf',label:'obs_ionf',type:'number',def:1},
  {section:'FDDA',key:'obs_prt_freq',label:'obs_prt_freq',type:'number',def:1000},
  {section:'FDDA',key:'obs_no_pbl_nudge_uv',label:'obs_no_pbl_nudge_uv',type:'number',def:0},
  {section:'FDDA',key:'obs_no_pbl_nudge_t',label:'obs_no_pbl_nudge_t',type:'number',def:0},
  {section:'FDDA',key:'obs_no_pbl_nudge_q',label:'obs_no_pbl_nudge_q',type:'number',def:0}
];

function perDomainValue(key,i,def){
  const el=niEl('nid_'+key+'_'+i);
  return el ? (el.type==='checkbox' ? (el.checked?'.true.':'.false.') : el.value) : String(def);
}
const globalPerDomainDefaults={
  history_interval:'niHistoryInterval', frames_per_outfile:'niFramesPerOutfile',
  radt:'niRadt', bldt:'niBldt', cudt:'niCudt',
  non_hydrostatic:'niNonHydro', diff_opt:'niDiffOpt', km_opt:'niKmOpt',
  zdamp:'niZdamp', dampcoef:'niDampcoef', khdif:'niKhdif', kvdif:'niKvdif',
  moist_adv_opt:'niMoistAdv', scalar_adv_opt:'niScalarAdv', gwd_opt:'niGwdOpt',
  grid_fdda:'niGridFdda', obs_nudge_opt:'niObsNudge'
};
function fieldDefault(f){
  const id=globalPerDomainDefaults[f.key], e=id&&niEl(id);
  return e?.value ?? f.def;
}
function niInputForField(f,i){
  const id='nid_'+f.key+'_'+i, def=fieldDefault(f);
  if(f.type==='bool'){
    return '<select id="'+id+'" class="form-select form-select-sm"><option value=".false."'+(def==='.false.'?' selected':'')+'>false</option><option value=".true."'+(def==='.true.'?' selected':'')+'>true</option></select>';
  }
  return '<input id="'+id+'" class="form-control form-control-sm" type="number" step="any" value="'+def+'">';
}
function applyGlobalPerDomain(key,id){
  const e=niEl(id); if(!e)return;
  const n=Number(niEl('domainCount')?.value||0);
  for(let i=0;i<n;i++){const x=niEl('nid_'+key+'_'+i);if(x)x.value=e.value;}
}
function bindGlobalPerDomainControls(){
  Object.entries(globalPerDomainDefaults).forEach(([key,id])=>{
    niEl(id)?.addEventListener('change',()=>applyGlobalPerDomain(key,id));
  });
}
function buildPerDomainNamelistPanel(){
  const n=Number(niEl('domainCount').value), root=niEl('perDomainNamelistTable');
  if(!root)return;
  const sections=[...new Set(perDomainFields.map(x=>x.section))];
  root.innerHTML=Array.from({length:n},(_,i)=>{
    return '<details class="border rounded p-2 mb-2"'+(i===0?' open':'')+'><summary class="fw-semibold small">Domain d'+pad(i)+'</summary>'+
      sections.map(sec=>'<div class="mt-2"><div class="small fw-semibold text-secondary mb-1">'+sec+'</div><div class="row g-2">'+
        perDomainFields.filter(f=>f.section===sec).map(f=>'<div class="col-6 col-lg-4"><label class="form-label small">'+f.label+'</label>'+niInputForField(f,i)+'</div>').join('')+
      '</div></div>').join('')+'</details>';
  }).join('');
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
  if(sh.includes(5) && pbl.some(x=>![2,5,6].includes(x))) notes.push('shcu_physics=5 (Deng) requires a compatible MYJ/MYNN-family PBL; verify the exact WRF version.');
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

function emitPerDomainFields(L,section,skip){
  const skipSet=new Set(skip||[]);
  perDomainFields.filter(f=>f.section===section&&!skipSet.has(f.key)).forEach(f=>{
    L.push(' '+f.key+' = '+v(domains.map((_,i)=>perDomainValue(f.key,i,f.def)))+',');
  });
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
  if(domains.length!==n) throw new Error('Complete all selected WPS domains before downloading namelist.input.');
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
    bmjrad:niEl('niBmjRadFeedback').value,
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
  L.push(' interval_seconds = '+w.intervalSeconds+','); L.push(' input_from_file = '+v(domains.map((_,i)=>perDomainValue('input_from_file',i,'.true.')))+',');
  L.push(' history_interval = '+v(domains.map((_,i)=>perDomainValue('history_interval',i,niNum('niHistoryInterval',60)))+',');
  L.push(' frames_per_outfile = '+v(domains.map((_,i)=>perDomainValue('frames_per_outfile',i,niNum('niFramesPerOutfile',1)))+',');
  L.push(' restart = '+niBool('niRestart')+','); L.push(' restart_interval = '+niNum('niRestartInterval',7200)+',');
  L.push(' io_form_history = '+niEl('niIoHistory').value+','); L.push(' io_form_restart = '+niEl('niIoRestart').value+',');
  L.push(' io_form_input = 2,'); L.push(' io_form_boundary = 2,'); L.push(' debug_level = '+niNum('niDebugLevel',0)+',');
  L.push('/','');

  L.push('&domains');
  L.push(' time_step = '+niNum('niTimeStep',Math.max(1,Math.round(sp.dx/1000*6)))+',');
  L.push(' time_step_fract_num = 0,'); L.push(' time_step_fract_den = 1,'); L.push(' max_dom = '+n+',');
  L.push(' e_we = '+v(g.map(x=>x.ew))+','); L.push(' e_sn = '+v(g.map(x=>x.es))+',');
  L.push(' e_vert = '+v(domains.map(()=>niNum('niEvert',45)))+','); L.push(' p_top_requested = '+niNum('niPtop',5000)+',');
  L.push(' num_metgrid_levels = '+niNum('niMetgridLevels',34)+','); L.push(' num_metgrid_soil_levels = '+niNum('niMetgridSoilLevels',4)+',');
  L.push(' dx = '+sp.dx+','); L.push(' dy = '+sp.dy+',');
  L.push(' grid_id = '+v(domains.map((_,i)=>i+1))+','); L.push(' parent_id = '+v(domains.map((_,i)=>i===0?1:i))+',');
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
  L.push(' radt = '+v(domains.map((_,i)=>perDomainValue('radt',i,niNum('niRadt',5))))+',');
  L.push(' bldt = '+v(domains.map((_,i)=>perDomainValue('bldt',i,niNum('niBldt',0))))+',');
  L.push(' cudt = '+v(domains.map((_,i)=>perDomainValue('cudt',i,niNum('niCudt',0))))+',');
  L.push(' kfeta_trigger = '+ad.kfeta+','); L.push(' ishallow = '+ad.ishallow+',');
  L.push(' cugd_avedx = '+ad.cugd+','); L.push(' nsas_dx_factor = '+ad.nsas+',');
  L.push(' convtrans_avglen_m = '+ad.convtrans+',');
  L.push(' cu_diag = '+v(domains.map((_,i)=>perDomainValue('cu_diag',i,0)))+',');
  L.push(' cu_rad_feedback = '+v(domains.map((_,i)=>perDomainValue('cu_rad_feedback',i,'.false.')))+',');
  L.push(' bmj_rad_feedback = '+ad.bmjrad+',');
  L.push(' kf_edrates = '+v(domains.map((_,i)=>perDomainValue('kf_edrates',i,0)))+',');
  L.push(' shallowcu_forced_ra = '+v(domains.map((_,i)=>perDomainValue('shallowcu_forced_ra',i,'.false.')))+','); emitPerDomainFields(L,'Physics',['radt','bldt','cudt','cu_diag','cu_rad_feedback','kf_edrates','shallowcu_forced_ra']);
  L.push(' maxiens = '+ad.maxiens+','); L.push(' maxens = '+ad.maxens+',');
  L.push(' maxens2 = '+ad.maxens2+','); L.push(' maxens3 = '+ad.maxens3+','); L.push(' ensdim = '+ad.ensdim+',');
  L.push(' num_soil_layers = '+niNum('niSoilLayers',4)+','); L.push(' num_land_cat = '+niNum('niLandCat',21)+',');
  L.push(' icloud = '+niEl('niIcloud').value+','); L.push(' fractional_seaice = '+niEl('niFractionalSeaice').value+',');
  L.push(' sst_update = '+niBool('niSstUpdate')+','); L.push('/','');

  L.push('&dynamics');
  L.push(' hybrid_opt = '+niEl('niHybridOpt').value+','); L.push(' non_hydrostatic = '+v(domains.map((_,i)=>perDomainValue('non_hydrostatic',i,'.true.')))+',');
  L.push(' w_damping = '+niEl('niWDamping').value+','); L.push(' diff_opt = '+v(domains.map((_,i)=>perDomainValue('diff_opt',i,-1)))+',');
  L.push(' km_opt = '+v(domains.map((_,i)=>perDomainValue('km_opt',i,-1)))+','); L.push(' damp_opt = '+niEl('niDampOpt').value+',');
  L.push(' zdamp = '+v(domains.map((_,i)=>perDomainValue('zdamp',i,5000)))+','); L.push(' dampcoef = '+v(domains.map((_,i)=>perDomainValue('dampcoef',i,0.2)))+',');
  L.push(' moist_adv_opt = '+v(domains.map((_,i)=>perDomainValue('moist_adv_opt',i,1)))+','); L.push(' scalar_adv_opt = '+v(domains.map((_,i)=>perDomainValue('scalar_adv_opt',i,1)))+',');
  L.push(' gwd_opt = '+v(domains.map((_,i)=>perDomainValue('gwd_opt',i,0)))+','); L.push(' use_theta_m = '+niEl('niThetaM').value+',');
  L.push(' khdif = '+v(domains.map((_,i)=>perDomainValue('khdif',i,0)))+','); L.push(' kvdif = '+v(domains.map((_,i)=>perDomainValue('kvdif',i,0)))+','); emitPerDomainFields(L,'Dynamics',['diff_opt','km_opt','zdamp','dampcoef','khdif','kvdif','moist_adv_opt','scalar_adv_opt','gwd_opt','non_hydrostatic']); L.push('/','');

  L.push('&bdy_control');
  L.push(' spec_bdy_width = '+niNum('niSpecBdyWidth',5)+','); L.push(' spec_zone = '+niNum('niSpecZone',1)+',');
  L.push(' relax_zone = '+niNum('niRelaxZone',4)+','); L.push(' spec_exp = '+niNum('niSpecExp',0)+',');
  L.push(' specified = '+specified+','); L.push(' nested = '+nested+','); emitPerDomainFields(L,'Boundary',['specified','nested']); L.push('/','');

  L.push('&fdda');
  L.push(' grid_fdda = '+v(domains.map(()=>niEl('niGridFdda').value))+',');
  L.push(' obs_nudge_opt = '+v(domains.map((_,i)=>perDomainValue('obs_nudge_opt',i,0)))+','); emitPerDomainFields(L,'FDDA',['grid_fdda','obs_nudge_opt']); L.push('/','');
  L.push('&dfi_control'); L.push(' dfi_opt = '+niEl('niDfiOpt').value+','); L.push('/','');
  if(niEl('niNoahMp')?.value==='1'){
    L.push('&noah_mp');
    L.push(' dveg = 4,');
    L.push(' opt_crs = 1,'); L.push(' opt_sfc = 1,'); L.push(' opt_btr = 1,'); L.push(' opt_run = 3,');
    L.push(' opt_infdv = 0,'); L.push(' opt_frz = 1,'); L.push(' opt_inf = 1,'); L.push(' opt_rad = 3,');
    L.push(' opt_alb = 2,'); L.push(' opt_snf = 1,'); L.push(' opt_tbot = 2,'); L.push(' opt_stc = 1,');
    L.push(' opt_gla = 1,'); L.push(' opt_rsf = 1,'); L.push(' opt_soil = 1,'); L.push(' opt_pedo = 1,');
    L.push(' opt_crop = 0,'); L.push(' opt_irr = 0,'); L.push(' opt_irrm = 0,'); L.push(' opt_tdrn = 0,');
    L.push(' soiltstep = 0.0,'); L.push(' noahmp_output = 1,'); L.push(' noahmp_acc_dt = 0.0,');
    L.push('/');
  }
  L.push('&namelist_quilt'); L.push(' nio_tasks_per_group = '+niNum('niNioTasks',0)+','); L.push(' nio_groups = '+niNum('niNioGroups',1)+','); L.push('/');
  return L.join('\n');
}

function downloadNamelistInput(){
  try{
    if(typeof window.validateNamelistSelections==='function'){
      const report=window.validateNamelistSelections();
      if(!report.valid) throw new Error('Namelist validation failed. Fix the reported errors before downloading namelist.input.');
    }
    const x=generateNamelistInput();
    const b=new Blob([x],{type:'text/plain;charset=utf-8'});
    const u=URL.createObjectURL(b), a=document.createElement('a');
    a.href=u; a.download='namelist.input'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
  }catch(e){ showError(e.message); }
}

niEl('domainCount').addEventListener('change',()=>{buildNamelistInputTable();buildPerDomainNamelistPanel();bindGlobalPerDomainControls();});
bindGlobalPerDomainControls();
niEl('exportInputBtn').addEventListener('click',downloadNamelistInput);
['niBmjRadFeedback','niKfetaTrigger','niIshallow','niCugdAvedx','niNsasDxFactor','niConvtransAvglen','niCuDiag','niCuRadFeedback','niKfEdrates','niShallowForcedRa','niMaxiens','niMaxens','niMaxens2','niMaxens3','niEnsdim'].forEach(id=>{
  niEl(id)?.addEventListener('change',updatePhysicsCompatibility);
});
buildNamelistInputTable();
buildPerDomainNamelistPanel();
