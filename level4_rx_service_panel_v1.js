(()=>{
  const RX_PATH='/stages/16_level4_rx.html';
  const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();

  function apply(frame){
    try{
      const w=frame?.contentWindow,d=frame?.contentDocument;
      if(!w||!d||!d.head||!d.body||!w.location.pathname.endsWith(RX_PATH))return;

      const hud=d.getElementById('miniHud');
      if(!hud)return;

      let style=d.getElementById('rx01ServicePanelV1Style');
      if(!style){
        style=d.createElement('style');
        style.id='rx01ServicePanelV1Style';
        style.textContent=`
          #miniHud{
            overflow:hidden!important;
          }
          #miniHud .missionLabel{
            font-size:clamp(15px,1.28vw,20px)!important;
            line-height:1.12!important;
            margin-bottom:8px!important;
          }
          #miniHud .missionText{
            font-size:clamp(15px,1.24vw,20px)!important;
            line-height:1.24!important;
          }
          #miniHud .missionSub{
            margin-top:8px!important;
            font-size:clamp(12px,1vw,16px)!important;
            line-height:1.22!important;
          }
          #miniHud .journalPreview{
            margin-top:10px!important;
            padding-top:8px!important;
            gap:5px!important;
            font-size:clamp(12px,.96vw,15px)!important;
            line-height:1.22!important;
          }
          #miniHud .journalRow{
            grid-template-columns:52px 1fr 58px!important;
            gap:10px!important;
            align-items:center!important;
          }
        `;
        d.head.appendChild(style);
      }

      const sub=d.getElementById('missionSub');
      if(sub){
        const text=norm(sub.textContent).replace(/–/g,'—');
        const remove=(
          text==='lock — підтвердити' ||
          text==='lock — підтвердити введення' ||
          text==='lock - підтвердити' ||
          text==='lock - підтвердити введення'
        );
        if(remove){
          sub.textContent='';
          sub.style.setProperty('display','none','important');
        }else if(text){
          sub.style.removeProperty('display');
        }
      }

      if(!hud.dataset.rx01ServicePanelObserved){
        hud.dataset.rx01ServicePanelObserved='1';
        let timer=null;
        new MutationObserver(()=>{
          clearTimeout(timer);
          timer=setTimeout(()=>apply(frame),20);
        }).observe(hud,{subtree:true,childList:true,characterData:true});
      }
    }catch(err){
      console.warn('RX-01 service panel patch failed',err);
    }
  }

  function arm(frame){
    apply(frame);
    [80,180,400,800,1500,2600].forEach(ms=>setTimeout(()=>apply(frame),ms));
  }

  window.RX01_APPLY_LEVEL4_RX_SERVICE_PANEL=arm;
  const frame=document.getElementById('frame');
  if(frame){
    frame.addEventListener('load',()=>arm(frame));
    setTimeout(()=>arm(frame),0);
  }
})();