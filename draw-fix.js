// Robust single-owner manual drawing controller.
// This intentionally creates Leaflet.Draw's rectangle handler directly instead
// of depending on the toolbar button or on script.js's drawing state.
(function(){
  if(typeof L==='undefined' || typeof map==='undefined' || typeof domains==='undefined') return;

  const button=document.getElementById('drawBtn');
  const countEl=document.getElementById('domainCount');
  const modeEl=document.getElementById('nestMode');
  if(!button || !countEl || !modeEl) return;

  let active=false;
  let handler=null;

  function count(){
    const n=Number(countEl.value);
    return Number.isInteger(n) && n>=1 ? n : 1;
  }

  function padDomain(i){return String(i+1).padStart(2,'0');}

  function stopHandler(){
    if(handler){
      try{handler.disable();}catch(e){}
      handler=null;
    }
  }

  function activate(){
    stopHandler();
    if(!active) return;

    const n=count();
    if(domains.length>=n){
      active=false;
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
      return;
    }

    const index=domains.length;
    showMessage(index===0
      ? 'Draw d01 now: click and drag on the map.'
      : `Draw d${padDomain(index)} now. It must be fully contained inside d${padDomain(index-1)}.`);

    if(typeof L.Draw.Rectangle!=='function'){
      active=false;
      showError('Leaflet Draw rectangle support is unavailable. Please reload the page.');
      return;
    }

    try{
      handler=new L.Draw.Rectangle(map,{shapeOptions:{color:'#dc3545',weight:2,fillOpacity:.08}});
      handler.enable();
    }catch(e){
      handler=null;
      active=false;
      showError(`Could not activate rectangle drawing: ${e.message}`);
    }
  }

  function start(){
    active=false;
    stopHandler();

    if(modeEl.value==='auto'){
      clearDomains(false);
      autoGenerate();
      return;
    }

    clearDomains(false);
    active=true;
    setTimeout(activate,50);
  }

  // Remove script.js's original click handler from the button. Its handler
  // remains in memory but is attached to the replaced DOM node, so it cannot
  // start a competing drawing workflow.
  const replacement=button.cloneNode(true);
  button.replaceWith(replacement);
  replacement.addEventListener('click',start);

  countEl.addEventListener('change',function(){
    active=false;
    stopHandler();
  });

  // The original CREATED listener remains registered, but its drawingActive
  // flag is deliberately false because start() never changes that variable.
  // Therefore this is the only listener that accepts manually drawn domains.
  map.on(L.Draw.Event.CREATED,function(e){
    if(!active) return;

    stopHandler();

    const n=count();
    const index=domains.length;
    if(index>=n){
      active=false;
      return;
    }

    if(index>0 && !domains[index-1].getBounds().contains(e.layer.getBounds())){
      showError(`d${padDomain(index)} must be fully contained inside d${padDomain(index-1)}. Draw it again.`);
      setTimeout(activate,80);
      return;
    }

    addDomain(e.layer,index);
    updateOutputFromDomains();

    if(domains.length<n){
      setTimeout(activate,100);
    }else{
      active=false;
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });
})();
