(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  function installCompat(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win||!doc)return;

      // enhanced-visuals.js is injected into the iframe and must not depend
      // on lexical variables from game.html. Expose safe DOM-derived values
      // before the enhancement script runs.
      try{
        Object.defineProperty(win,'phase',{
          configurable:true,
          get(){return doc.querySelector('.taskbox')&&doc.querySelector('.reader')?'playing':'menu'}
        });
      }catch(e){win.phase='menu'}

      try{
        Object.defineProperty(win,'levelIndex',{
          configurable:true,
          get(){
            const text=doc.querySelector('.taskbox .kicker')?.textContent||'';
            const match=text.match(/РІВЕНЬ\s+(\d+)/i);
            return match?Math.max(0,Math.min(9,Number(match[1])-1)):0;
          }
        });
      }catch(e){win.levelIndex=0}

      if(!win.LEVELS){
        win.LEVELS=Array.from({length:10},(_,i)=>({noHint:i===9}));
      }

      if(!doc.getElementById('vidlik-responsive-fixes')){
        const link=doc.createElement('link');
        link.id='vidlik-responsive-fixes';
        link.rel='stylesheet';
        link.href='./responsive-fixes.css';
        doc.head.appendChild(link);
      }
    }catch(e){console.error('VIDLIK runtime compatibility failed',e)}
  }

  // Registered before enhanced-visuals.js, therefore it runs first on iframe load.
  frame.addEventListener('load',installCompat);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')installCompat();
})();
