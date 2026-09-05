(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;
  let observer=null;

  function sync(doc){
    try{
      doc.querySelectorAll('.desktop .body').forEach(body=>{
        const appWindow=body.querySelector(':scope > .window');
        body.classList.toggle('vidlik-app-maximized',!!appWindow);
      });
    }catch(e){}
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc||!doc.documentElement)return;

      if(!doc.getElementById('vidlik-application-maximize-style')){
        const style=doc.createElement('style');
        style.id='vidlik-application-maximize-style';
        style.textContent=`
          /* Applications (text editor / spreadsheets / presentations) use the full monitor work area. */
          .desktop .body.vidlik-app-maximized{
            place-items:stretch!important;
            align-items:stretch!important;
            justify-items:stretch!important;
          }
          .desktop .body.vidlik-app-maximized > .window{
            width:100%!important;
            height:100%!important;
            max-width:none!important;
            max-height:none!important;
            margin:0!important;
            border-radius:0!important;
            box-shadow:none!important;
          }
          .desktop .body.vidlik-app-maximized > .window > .wtitle{
            border-radius:0!important;
          }
        `;
        doc.head.appendChild(style);
      }

      sync(doc);
      if(observer)observer.disconnect();
      const root=doc.getElementById('game')||doc.body;
      observer=new MutationObserver(()=>sync(doc));
      observer.observe(root,{childList:true,subtree:true});
    }catch(e){console.error('VIDLIK application maximize failed',e)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')install();
})();
