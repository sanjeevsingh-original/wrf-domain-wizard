// Single-owner manual drawing controller.
// Uses Leaflet.Draw's own rectangle toolbar so there is only one drawing engine.
(function(){
  if(typeof map==='undefined' || typeof L==='undefined' || typeof domains==='undefined') return;

  const button=document.getElementById('drawBtn');
  const countEl=document.getElementById('domainCount');
  const modeEl=document.getElementById('nestMode');
  if(!button || !countEl || !modeEl) return;

  let active=false;

  function count(){
    const n=Number(countEl.value);
    return Number.isInteger(n) && n>=1 ? n : 1;
  }

  function padDomain(i){return String(i+1).padStart(2,'0');}

  function rectangleToolbarButton(){
    return document.querySelector('.leaflet-draw-draw-rectangle');
  }

  function activateRectangle(){
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

    const btn=rectangleToolbarButton();
    if(!btn){
      showError('Leaflet Draw rectangle tool could not be initialized. Please reload the page.');
      active=false;
      return;
    }

    // Use the exact same rectangle tool exposed by the Leaflet.Draw toolbar.
    btn.click();
  }

  function start(){
    active=false;

    if(modeEl.value==='auto'){
      clearDomains(false);
      autoGenerate();
      return;
    }

    clearDomains(false);
    active=true;
    setTimeout(activateRectangle,80);
  }

  // Do not remove Leaflet's own events. The original application CREATED
  // listener remains installed but is inactive because its drawingActive flag
  // is false. This controller is the only active manual workflow.
  map.on(L.Draw.Event.CREATED,function(e){
    if(!active) return;

    const n=count();
    const index=domains.length;
    if(index>=n){active=false;return;}

    if(index>0 && !domains[index-1].getBounds().contains(e.layer.getBounds())){
      showError(`d${padDomain(index)} must be fully contained inside d${padDomain(index-1)}. Draw it again.`);
      setTimeout(activateRectangle,120);
      return;
    }

    addDomain(e.layer,index);
    updateOutputFromDomains();

    if(domains.length<n){
      setTimeout(activateRectangle,180);
    }else{
      active=false;
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });

  // Replace the button so script.js's old click listener cannot also start a
  // second workflow.
  const replacement=button.cloneNode(true);
  button.replaceWith(replacement);
  replacement.addEventListener('click',start);
  countEl.addEventListener('change',function(){active=false;});
})();
