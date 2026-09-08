// Live grid-point summary for the manually drawn WRF domains.
(function(){
  const panel=document.getElementById('gridCountOutput');if(!panel)return;
  const fmt=n=>Number.isFinite(n)?n.toLocaleString():'—';
  const dec=(n,p=2)=>Number.isFinite(n)?n.toFixed(p):'—';
  function render(){
    if(typeof domains==='undefined'||!domains.length){panel.innerHTML='<span class="text-muted">Draw d01 to calculate the grid dimensions for each domain.</span>';return;}
    try{const{dx,dy}=spacing(),s=settings(),rs=ratios();let cdx=dx,cdy=dy,total=0;
      const rows=domains.map((d,i)=>{if(i){cdx/=rs[i];cdy/=rs[i];}const raw=WRF.gridDimensions(d.getBounds(),cdx,cdy,s),ew=i?WRF.snapDimension(raw.e_we,rs[i]):raw.e_we,es=i?WRF.snapDimension(raw.e_sn,rs[i]):raw.e_sn,points=ew*es;total+=points;return `<tr><td><strong>d${String(i+1).padStart(2,'0')}</strong></td><td>${fmt(ew)}</td><td>${fmt(es)}</td><td><strong>${fmt(points)}</strong></td><td>${dec(cdx,s.projection==='lat-lon'?5:0)}</td><td>${dec(cdy,s.projection==='lat-lon'?5:0)}</td><td>${i?`${rs[i]}:1`:'—'}</td></tr>`;}).join('');
      const unit=s.projection==='lat-lon'?'°':'m';panel.innerHTML=`<div class="table-responsive"><table class="table table-sm table-bordered align-middle mb-2"><thead><tr><th>Domain</th><th>e_we</th><th>e_sn</th><th>Grid points</th><th>dx (${unit})</th><th>dy (${unit})</th><th>Ratio</th></tr></thead><tbody>${rows}</tbody></table></div><div class="small"><strong>Total horizontal grid points:</strong> ${fmt(total)}</div><div class="small text-muted mt-1">Grid points = e_we × e_sn. Nested spacing is derived recursively from the parent→child ratio.</div>`;
    }catch(e){panel.innerHTML=`<div class="text-danger small">${escapeHtml(e.message)}</div>`;}
  }
  window.updateGridCountPanel=render;window.addEventListener('wrf-domains-changed',render);
  ['domainCount','dxInput','dyInput','projectionInput','refLatInput','refLonInput','trueLat1Input','trueLat2Input','polarLatInput','polarHemisphere','autoCenterInput'].forEach(id=>{document.getElementById(id)?.addEventListener('input',render);document.getElementById(id)?.addEventListener('change',render);});
  render();
})();