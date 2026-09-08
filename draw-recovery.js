// Drawing reliability fallback
// Ensures a CREATED rectangle is accepted even if the primary drawing state was lost.
(function(){
  if(typeof map==='undefined' || typeof L==='undefined') return;
  function layers(){
    return drawnItems.getLayers().slice().sort((a,b)=>(a.options.domainIndex??999)-(b.options.domainIndex??999));
  }
  map.on(L.Draw.Event.CREATED,function(e){
    const n=Number(document.getElementById('domainCount').value);
    const current=layers();
    if(current.some(x=>x===e.layer)) return;
    if(current.length>=n) return;
    if(current.length && !current[current.length-1].getBounds().contains(e.layer.getBounds())){
      if(typeof showError==='function') showError(`d${String(current.length+1).padStart(2,'0')} must be fully contained inside d${String(current.length).padStart(2,'0')}.`);
      setTimeout(()=>new L.Draw.Rectangle(map).enable(),50);
      return;
    }
    if(typeof addDomain==='function') addDomain(e.layer,current.length);
    if(typeof updateOutputFromDomains==='function') updateOutputFromDomains();
    if(current.length+1<n){
      setTimeout(()=>new L.Draw.Rectangle(map).enable(),50);
    }else if(typeof showMessage==='function'){
      showMessage(`All ${n} domains are drawn. Edit rectangles as needed, then export after validation.`);
    }
  });
})();
