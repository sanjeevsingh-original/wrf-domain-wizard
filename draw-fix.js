// Reliable sequential manual drawing controller for WRF domains.
// This controller intentionally owns the manual rectangle workflow.
(function(){
  const mapRef=window.map;
  const Leaflet=window.L;
  const button=document.getElementById('drawBtn');
  const countEl=document.getElementById('domainCount');
  if(!mapRef || !Leaflet || !button || !countEl) return;

  let active=false;
  let handler=null;

  function getDomains(){
    return Array.isArray(window.__wrfDomains) ? window.__wrfDomains : null;
  }

  function padDomain(index){
    return String(index+1).padStart(2,'0');
  }

  function currentCount(){
    const n=Number(countEl.value);
    return Number.isInteger(n) && n>=1 ? n : 1;
  }

  function disableHandler(){
    if(handler){
      try{ handler.disable(); }catch(e){}
      handler=null;
    }
  }

  function stop(){
    active=false;
    disableHandler();
  }

  function domainsNow(){
    const d=getDomains();
    return d || [];
  }

  function startNext(){
    if(!active) return;

    const n=currentCount();
    const domains=domainsNow();

    if(domains.length>=n){
      stop();
      if(typeof window.showMessage==='function')
        window.showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
      return;
    }

    disableHandler();

    const index=domains.length;
    if(typeof window.showMessage==='function'){
      window.showMessage(index===0
        ? 'Draw d01 now using the rectangle tool.'
        : `Draw d${padDomain(index)} now. It must be fully contained inside d${padDomain(index-1)}.`);
    }

    handler=new Leaflet.Draw.Rectangle(mapRef,{shapeOptions:{weight:2,fillOpacity:0.08}});
    handler.enable();
  }

  function start(){
    stop();

    // Auto mode remains controlled by the original application logic.
    if(document.getElementById('nestMode').value==='auto'){
      if(typeof window.autoGenerate==='function') window.autoGenerate();
      return;
    }

    if(typeof window.clearDomains==='function') window.clearDomains(false);
    active=true;

    // Let Leaflet finish any previous toolbar state before enabling our handler.
    setTimeout(startNext,80);
  }

  // Keep the authoritative domain array mirrored onto window. The original
  // application uses a top-level const, so we discover it through a tiny hook.
  // If the hook is unavailable, the CREATED handler below still works through
  // the application's addDomain/update flow and the DOM count.
  const originalAdd=window.addDomain;
  if(typeof originalAdd==='function'){
    window.addDomain=function(layer,index){
      originalAdd(layer,index);
      window.__wrfDomains=domainsFromApplication();
    };
  }

  function domainsFromApplication(){
    try{
      const layers=[];
      if(window.drawnItems && typeof window.drawnItems.eachLayer==='function'){
        window.drawnItems.eachLayer(x=>layers.push(x));
      }
      return layers.sort((a,b)=>(a.options.domainIndex??999)-(b.options.domainIndex??999));
    }catch(e){
      return [];
    }
  }

  // Use the Leaflet layer group as the source of truth, avoiding dependence on
  // the application's top-level lexical `domains` variable.
  function liveDomains(){
    return domainsFromApplication();
  }

  mapRef.off(Leaflet.Draw.Event.CREATED);
  mapRef.on(Leaflet.Draw.Event.CREATED,function(e){
    if(!active) return;

    const n=currentCount();
    const domains=liveDomains();
    const index=domains.length;

    if(index>=n){
      stop();
      return;
    }

    if(index>0 && !domains[index-1].getBounds().contains(e.layer.getBounds())){
      if(typeof window.showError==='function')
        window.showError(`d${padDomain(index)} must be fully contained inside d${padDomain(index-1)}. Draw it again.`);
      setTimeout(startNext,120);
      return;
    }

    disableHandler();

    if(typeof originalAdd==='function'){
      originalAdd(e.layer,index);
    }else if(window.drawnItems){
      window.drawnItems.addLayer(e.layer);
    }

    window.__wrfDomains=liveDomains();
    if(typeof window.updateOutputFromDomains==='function') window.updateOutputFromDomains();

    if(liveDomains().length<n){
      setTimeout(startNext,180);
    }else{
      stop();
      if(typeof window.showMessage==='function')
        window.showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });

  // Replace the original button so only this controller responds to clicks.
  const replacement=button.cloneNode(true);
  button.replaceWith(replacement);
  replacement.addEventListener('click',start);

  countEl.addEventListener('change',stop);

  // Seed the mirror from any existing layers.
  window.__wrfDomains=liveDomains();
})();