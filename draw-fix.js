// Stable sequential manual drawing controller.
// Replaces the previous overlapping CREATED handlers so N selected domains always means N rectangles.
(function(){
  if(typeof map==='undefined' || typeof L==='undefined') return;

  const button=document.getElementById('drawBtn');
  if(!button || typeof drawnItems==='undefined' || typeof domains==='undefined') return;

  // Remove the older CREATED listeners installed by script.js/draw-recovery.js.
  map.off(L.Draw.Event.CREATED);

  let active=false;
  let rectangleHandler=null;

  function count(){return Number(document.getElementById('domainCount').value);}
  function padLocal(i){return String(i+1).padStart(2,'0');}

  function stopCurrentHandler(){
    try{
      if(rectangleHandler) rectangleHandler.disable();
      if(typeof drawControl!=='undefined' && drawControl._toolbars && drawControl._toolbars.draw && drawControl._toolbars.draw._activeMode){
        drawControl._toolbars.draw._activeMode.handler.disable();
      }
    }catch(e){}
    rectangleHandler=null;
  }

  function startNext(){
    const n=count();
    if(!active || domains.length>=n){
      active=false;
      stopCurrentHandler();
      if(typeof showMessage==='function') showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
      return;
    }

    const child=domains.length;
    if(typeof showMessage==='function'){
      showMessage(child===0
        ? 'Draw d01 now.'
        : `Draw d${padLocal(child)} now. It must be fully contained inside d${padLocal(child-1)}.`);
    }

    stopCurrentHandler();
    rectangleHandler=new L.Draw.Rectangle(map);
    rectangleHandler.enable();
  }

  function start(){
    active=false;
    stopCurrentHandler();
    if(typeof clearDomains==='function') clearDomains(false);

    if(document.getElementById('nestMode').value==='auto'){
      if(typeof autoGenerate==='function') autoGenerate();
      return;
    }

    active=true;
    startNext();
  }

  map.on(L.Draw.Event.CREATED,function(e){
    if(!active) return;

    const n=count();
    const index=domains.length;
    if(index>=n){
      active=false;
      stopCurrentHandler();
      return;
    }

    // Child must be inside the immediately preceding parent.
    if(index>0 && !domains[index-1].getBounds().contains(e.layer.getBounds())){
      if(typeof showError==='function') showError(`d${padLocal(index)} must be fully contained inside d${padLocal(index-1)}. Draw it again.`);
      setTimeout(startNext,100);
      return;
    }

    stopCurrentHandler();
    if(typeof addDomain==='function') addDomain(e.layer,index);
    if(typeof updateOutputFromDomains==='function') updateOutputFromDomains();

    if(domains.length<n){
      // Wait for Leaflet.Draw to finish its CREATED cleanup before enabling the next handler.
      setTimeout(startNext,180);
    }else{
      active=false;
      if(typeof showMessage==='function') showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });

  button.replaceWith(button.cloneNode(true));
  document.getElementById('drawBtn').addEventListener('click',start);

  // Keep the drawing state coherent if the user changes the requested count.
  document.getElementById('domainCount').addEventListener('change',function(){
    active=false;
    stopCurrentHandler();
  });
})();
