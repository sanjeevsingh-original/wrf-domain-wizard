// Client-side validator for the generated WRF namelist.input selections.
// This checks cross-section consistency and common WRF runtime constraints before export.
// It does not replace real WRF parsing/initialization with the user's installed WRF version.

(function(){
  function el(id){ return document.getElementById(id); }
  function num(id, fallback=NaN){
    const v=Number(el(id)?.value);
    return Number.isFinite(v)?v:fallback;
  }
  function bool(id){ return el(id)?.value === '.true.'; }
  function per(key, i){
    const x=el('nid_'+key+'_'+i);
    if(!x) return null;
    if(x.tagName==='SELECT' && (x.value==='.true.' || x.value==='.false.')) return x.value==='.true.';
    const n=Number(x.value);
    return Number.isFinite(n)?n:x.value;
  }
  function physics(i){
    const x=namelistInputValues?.[i] || {};
    return {mp:Number(x.mp),cu:Number(x.cu),lw:Number(x.lw),sw:Number(x.sw),pbl:Number(x.pbl),sfclay:Number(x.sfclay),lsm:Number(x.lsm),urban:Number(x.urban),shcu:Number(x.shcu)};
  }
  function add(a,severity,msg,field){
    a.push({severity,msg,field:field||''});
  }

  function validateNamelistSelections(){
    const errors=[], warnings=[], infos=[];
    const n=Number(el('domainCount')?.value||0);

    if(!Number.isInteger(n)||n<1||n>10) add(errors,'error','Number of domains must be an integer from 1 to 10.','domainCount');

    if(typeof domains!=='undefined' && domains.length!==n)
      add(errors,'error','Draw all selected domains before validating/exporting namelist.input.','domainCount');

    const dx=num('dxInput'), dy=num('dyInput'), dt=num('niTimeStep'), evert=num('niEvert'), ptop=num('niPtop');
    if(!(dx>0)) add(errors,'error','d01 dx must be greater than zero.','dxInput');
    if(!(dy>0)) add(errors,'error','d01 dy must be greater than zero.','dyInput');
    if(!(dt>0)) add(errors,'error','time_step must be greater than zero.','niTimeStep');
    if(!Number.isInteger(evert)||evert<10) add(errors,'error','e_vert must be an integer of at least 10.','niEvert');
    if(!(ptop>0)) add(errors,'error','p_top_requested must be greater than zero.','niPtop');

    const ratios=typeof window.ratios==='function'?window.ratios():[];
    for(let i=1;i<n;i++){
      const r=Number(ratios[i]);
      if(!Number.isInteger(r)||r<2||r>10) add(errors,'error',`d${String(i+1).padStart(2,'0')} nesting ratio must be an integer from 2 to 10.`);
      else {
        if(r%2===0) add(warnings,'warning',`d${String(i+1).padStart(2,'0')} uses an even ${r}:1 ratio; verify this is intended for your feedback configuration.`);
        if(r>7) add(warnings,'warning',`d${String(i+1).padStart(2,'0')} uses ${r}:1, which is unusually large for many real-data WRF configurations.`);
      }
    }

    if(bool('niRestart') && !(num('niRestartInterval')>0))
      add(errors,'error','restart=true requires restart_interval > 0.','niRestartInterval');

    const hist=num('niHistoryInterval');
    if(!(hist>=0)) add(errors,'error','history_interval must be zero or positive.');
    if(!(num('niFramesPerOutfile')>=1)) add(errors,'error','frames_per_outfile must be at least 1.','niFramesPerOutfile');

    if(num('niSpecBdyWidth')<1) add(errors,'error','spec_bdy_width must be at least 1.','niSpecBdyWidth');
    if(num('niSpecZone')<1) add(errors,'error','spec_zone must be at least 1.','niSpecZone');
    if(num('niRelaxZone')<0) add(errors,'error','relax_zone cannot be negative.','niRelaxZone');

    if(num('niGridFdda')>0){
      for(let i=0;i<n;i++){
        if(per('gfdda_interval_m',i)<=0) add(warnings,'warning',`d${String(i+1).padStart(2,'0')}: grid_fdda is enabled but gfdda_interval_m is not positive.`);
        if(per('gfdda_end_h',i)<=0) add(warnings,'warning',`d${String(i+1).padStart(2,'0')}: grid_fdda is enabled but gfdda_end_h is not positive.`);
      }
    }
    if(num('niObsNudge')>0 && !Array.from({length:n},(_,i)=>per('obs_nudge_opt',i)).some(Boolean))
      add(warnings,'warning','obs_nudge_opt is off for every domain while the global obs_nudge_opt control is enabled.');

    const p=Array.from({length:n},(_,i)=>physics(i));
    p.forEach((x,i)=>{
      const d='d'+String(i+1).padStart(2,'0');
      if(!Number.isInteger(x.mp)||x.mp<0) add(errors,'error',`${d}: invalid mp_physics value.`);
      if(!Number.isInteger(x.cu)||x.cu<0) add(errors,'error',`${d}: invalid cu_physics value.`);
      if(!Number.isInteger(x.pbl)||x.pbl<0) add(errors,'error',`${d}: invalid bl_pbl_physics value.`);
      if(x.lsm===4 && num('niNoahMp')===0) add(warnings,'warning',`${d}: sf_surface_physics=4 selects Noah-MP, but the Noah-MP advanced block is disabled.`);
      if(x.urban>0 && x.lsm===0) add(warnings,'warning',`${d}: urban physics is enabled with sf_surface_physics=0; verify the intended land-surface configuration.`);
      if(x.shcu===4 && x.cu!==14) add(warnings,'warning',`${d}: shcu_physics=4 is intended for a compatible KSAS/cumulus configuration; verify cu_physics.`);
      if(x.shcu===5 && ![2,5,6].includes(x.pbl)) add(warnings,'warning',`${d}: shcu_physics=5 may require a MYJ/MYNN-family PBL; verify your WRF version.`);
      if(x.cu===0 && num('niCuDiag')===1) add(warnings,'warning',`${d}: cu_diag=1 is enabled while cu_physics=0.`);
      if(x.cu===0 && bool('niCuRadFeedback')) add(warnings,'warning',`${d}: cu_rad_feedback=true while cu_physics=0.`);
      if(per('radt',i)<=0) add(errors,'error',`${d}: radt must be positive.`);
      if(per('bldt',i)<0 || per('cudt',i)<0) add(errors,'error',`${d}: bldt/cudt cannot be negative.`);
      if(per('diff_opt',i)!==null && per('km_opt',i)!==null && Number(per('diff_opt',i))<0)
        add(warnings,'warning',`${d}: diff_opt is not set to a standard non-negative choice; verify the installed WRF Registry/version.`);
    });

    if(num('niFeedback')===1 && n===1)
      add(infos,'info','feedback=1 has no nested domain to receive feedback; this is harmless but has no nesting effect.');
    if(num('niFeedback')===1 && n>1)
      add(infos,'info','Two-way feedback is enabled for the selected multi-domain configuration.');
    if(Math.abs(dx-dy)>1e-9 && ['lambert','mercator','polar'].includes(el('projectionInput')?.value))
      add(warnings,'warning','dx and dy differ for a projected grid. Verify that unequal spacing is intentional.');

    const report={valid:errors.length===0,errors,warnings,infos,domainCount:n};
    renderNamelistValidation(report);
    return report;
  }

  function renderNamelistValidation(r){
    const box=el('namelistValidation');
    if(!box)return;
    const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const block=(title,arr,cls)=>arr.length?`<div class="alert ${cls} py-2 mb-2"><div class="fw-semibold mb-1">${title} (${arr.length})</div><ul class="mb-0 ps-3">${arr.map(x=>'<li>'+esc(x.msg)+'</li>').join('')}</ul></div>`:'';
    box.innerHTML=(r.valid
      ? '<div class="alert alert-success py-2 mb-2"><strong>namelist.input selections passed the built-in checks.</strong> The generated file can still depend on the exact WRF version and compiled physics modules.</div>'
      : '<div class="alert alert-danger py-2 mb-2"><strong>Validation found errors.</strong> Fix the items below before using the generated namelist.input.</div>')
      +block('Errors',r.errors,'alert-danger')
      +block('Warnings',r.warnings,'alert-warning')
      +block('Notes',r.infos,'alert-info');
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  window.validateNamelistSelections=validateNamelistSelections;
  document.addEventListener('DOMContentLoaded',()=>{
    const b=el('validateNamelistBtn');
    if(b)b.addEventListener('click',validateNamelistSelections);
  });
})();