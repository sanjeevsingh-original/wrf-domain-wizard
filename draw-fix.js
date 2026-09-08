// Reliable sequential manual drawing controller for WRF domains.
(function(){
  // These names are declared by script.js in the same classic-script scope.
  if(typeof map==='undefined' || typeof L==='undefined') return;
  if(typeof drawnItems==='undefined' || typeof domains==='undefined') return;

  const button=document.getElementById('drawBtn');
  const countEl=document.getElementById('domainCount');
  if(!button || !countEl) return;

  let active=false;
  let handler=null;

  function count(){
    const n=Number(countEl.value);
    return Number.isInteger(n) && n>=1 ? n : 1;
  }
  function padDomain(index){return String(index+1).padStart(2,'0');}
  function disableHandler(){
    if(handler){try{handler.disable();}catch(e){}handler=null;}
  }
  function stop(){active=false;disableHandler();}

  function startNext(){
    if(!active)return;
    const n=count();
    if(domains.length>=n){
      stop();
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
      return;
    }
    disableHandler();
    const index=domains.length;
    showMessage(index===0?'Draw d01 now using the rectangle tool.':`Draw d${padDomain(index)} now. It must be fully contained inside d${padDomain(index-1)}.`);
    handler=new L.Draw.Rectangle(map);
    handler.enable();
  }

  function start(){
    stop();
    if(document.getElementById('nestMode').value==='auto'){
      autoGenerate();
      return;
    }
    clearDomains(false);
    active=true;
    setTimeout(startNext,80);
  }

  // Remove all previous CREATED callbacks. This controller owns manual drawing.
  map.off(L.Draw.Event.CREATED);
  map.on(L.Draw.Event.CREATED,function(e){
    if(!active)return;
    const n=count();
    const index=domains.length;
    if(index>=n){stop();return;}

    if(index>0 && !domains[index-1].getBounds().contains(e.layer.getBounds())){
      showError(`d${padDomain(index)} must be fully contained inside d${padDomain(index-1)}. Draw it again.`);
      setTimeout(startNext,120);
      return;
    }

    disableHandler();
    addDomain(e.layer,index);
    updateOutputFromDomains();

    if(domains.length<n)setTimeout(startNext,180);
    else{
      stop();
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });

  // Replace the original button so its old click listener cannot run as well.
  const replacement=button.cloneNode(true);
  button.replaceWith(replacement);
  replacement.addEventListener('click',start);
  countEl.addEventListener('change',stop);
})();