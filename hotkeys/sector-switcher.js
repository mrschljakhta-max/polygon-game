(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;
  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc)return;
      if(!doc.getElementById('vidlik-sector-switcher-style')){
        const style=doc.createElement('style');
        style.id='vidlik-sector-switcher-style';
        style.textContent=`
          .vidlik-sector-switcher{margin-top:.55em!important;border:0!important;background:transparent!important;color:#79d8cf!important;padding:.55em 0!important;text-align:left!important;font-weight:750!important;letter-spacing:.04em!important;cursor:pointer!important}
          .vidlik-sector-switcher:hover{color:#a7fff6!important;text-shadow:0 0 12px rgba(70,230,215,.25)!important}
          .vidlik-sector-switcher:before{content:'▦';display:inline-block;margin-right:.7em;color:#45d9ce;font-size:1.15em}
        `;
        doc.head.appendChild(style);
      }
      const sync=()=>{
        const actions=doc.querySelector('.main-menu .hero-actions');
        if(!actions||actions.querySelector('.vidlik-sector-switcher'))return;
        const btn=doc.createElement('button');
        btn.type='button';
        btn.className='vidlik-sector-switcher';
        btn.textContent='СЕКТОРИ 01–08';
        btn.addEventListener('click',()=>{frame.contentWindow.location.href='desktop-sectors.html'});
        actions.appendChild(btn);
      };
      sync();
      const root=doc.getElementById('game');
      if(root){const mo=new MutationObserver(sync);mo.observe(root,{childList:true,subtree:true})}
    }catch(e){console.error('VIDLIK sector switcher failed',e)}
  }
  frame.addEventListener('load',install);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')install();
})();