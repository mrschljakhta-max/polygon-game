(()=>{
  const STYLE_ID='rx01Level4MobileSandboxStyle';
  const TOGGLE_ID='rx01SandboxPanelToggle';
  const MAX_HEIGHT=500;

  function isShortLandscape(win){
    if(!win)return false;
    return win.innerWidth>win.innerHeight && win.innerHeight<=MAX_HEIGHT;
  }

  function ensureStyle(doc){
    if(!doc||!doc.head||doc.getElementById(STYLE_ID))return;
    const style=doc.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body.rx01-mobile-sandbox{display:block!important;padding:0!important;background:#020402!important;}
      body.rx01-mobile-sandbox .shell{
        width:100vw!important;height:100vh!important;max-height:none!important;aspect-ratio:auto!important;
        padding:2px!important;clip-path:none!important;filter:none!important;background:#0b100b!important;
      }
      body.rx01-mobile-sandbox .shell:before,
      body.rx01-mobile-sandbox .shell:after,
      body.rx01-mobile-sandbox .rib,
      body.rx01-mobile-sandbox .bolt{display:none!important;}
      body.rx01-mobile-sandbox .innerBezel{
        width:100%!important;height:100%!important;padding:0!important;clip-path:none!important;
        box-shadow:none!important;background:#090d09!important;
      }
      body.rx01-mobile-sandbox .screen{
        position:relative!important;width:100%!important;height:100%!important;border:0!important;
        border-radius:0!important;box-shadow:none!important;overflow:hidden!important;
      }
      body.rx01-mobile-sandbox .top{
        height:38px!important;min-height:38px!important;padding:0 9px!important;
        grid-template-columns:1.15fr 1fr 1fr .65fr!important;font-size:11px!important;line-height:1!important;
        border-bottom:1px solid #3f4439!important;
      }
      body.rx01-mobile-sandbox .work{
        position:relative!important;height:calc(100% - 38px)!important;display:grid!important;
        grid-template-columns:minmax(0,1fr) 58px!important;grid-template-rows:1fr!important;
      }
      body.rx01-mobile-sandbox .left{display:none!important;}
      body.rx01-mobile-sandbox.rx01-sandbox-left-open .left{
        display:flex!important;position:absolute!important;left:0!important;top:0!important;bottom:0!important;
        width:min(40vw,270px)!important;z-index:120!important;padding:7px!important;overflow:auto!important;
        border-right:1px solid #655f45!important;box-shadow:12px 0 28px #000b!important;
      }
      body.rx01-mobile-sandbox .left .panel{padding:7px!important;margin-bottom:6px!important;}
      body.rx01-mobile-sandbox .left h3{margin:0 0 5px!important;font-size:11px!important;}
      body.rx01-mobile-sandbox .left .entry{padding:5px 2px!important;font-size:9px!important;}
      body.rx01-mobile-sandbox .map{
        grid-column:1!important;grid-row:1!important;width:100%!important;height:100%!important;min-width:0!important;
        overflow:hidden!important;
      }
      body.rx01-mobile-sandbox .right{
        grid-column:2!important;grid-row:1!important;width:58px!important;min-width:58px!important;
        padding:3px!important;gap:3px!important;border-left:1px solid #3f4338!important;
      }
      body.rx01-mobile-sandbox .right button{
        min-height:0!important;padding:2px 1px!important;border-radius:4px!important;font-size:8px!important;
        line-height:1.05!important;
      }
      body.rx01-mobile-sandbox .right button img,
      body.rx01-mobile-sandbox .right .tool img{max-width:24px!important;max-height:24px!important;}
      body.rx01-mobile-sandbox #${TOGGLE_ID}{
        display:flex!important;position:absolute!important;left:5px!important;top:43px!important;z-index:160!important;
        width:34px!important;height:34px!important;align-items:center!important;justify-content:center!important;
        border:1px solid #766b43!important;border-radius:5px!important;background:rgba(8,13,8,.9)!important;
        color:#d8ba55!important;font:900 18px/1 Arial!important;box-shadow:0 4px 12px #0009!important;cursor:pointer!important;
      }
      body.rx01-mobile-sandbox.rx01-sandbox-left-open #${TOGGLE_ID}{left:min(40vw,270px)!important;transform:translateX(-39px)!important;}
      body:not(.rx01-mobile-sandbox) #${TOGGLE_ID}{display:none!important;}

      /* Comic instruction must support the map instead of covering it. */
      body.rx01-mobile-sandbox #rx01MapOnoPng{
        left:44px!important;top:46px!important;width:min(27vw,205px)!important;max-width:205px!important;
        max-height:39vh!important;object-fit:contain!important;object-position:left top!important;
        filter:drop-shadow(0 5px 7px rgba(0,0,0,.75))!important;
      }
      body.rx01-mobile-sandbox #petrovychImg,
      body.rx01-mobile-sandbox .instructorCard .petrovychImg{
        width:auto!important;max-width:105px!important;max-height:128px!important;object-fit:contain!important;
      }
      body.rx01-mobile-sandbox .instructorCard{
        max-width:150px!important;max-height:150px!important;overflow:hidden!important;
      }

      /* Keep floating help/toasts inside the short viewport. */
      body.rx01-mobile-sandbox .toast,
      body.rx01-mobile-sandbox #toast{max-width:42vw!important;font-size:10px!important;}
      body.rx01-mobile-sandbox .modal,
      body.rx01-mobile-sandbox .dialog{max-height:86vh!important;overflow:auto!important;}
    `;
    doc.head.appendChild(style);
  }

  function ensureToggle(doc){
    if(!doc)return;
    let btn=doc.getElementById(TOGGLE_ID);
    if(btn)return btn;
    const host=doc.querySelector('.screen')||doc.body;
    if(!host)return null;
    btn=doc.createElement('button');
    btn.id=TOGGLE_ID;
    btn.type='button';
    btn.textContent='☰';
    btn.setAttribute('aria-label','Показати панель карти');
    btn.addEventListener('click',()=>{
      doc.body.classList.toggle('rx01-sandbox-left-open');
      btn.textContent=doc.body.classList.contains('rx01-sandbox-left-open')?'×':'☰';
    });
    host.appendChild(btn);
    return btn;
  }

  function apply(frame,mode){
    if(mode!=='map')return;
    const doc=frame&&frame.contentDocument;
    const win=frame&&frame.contentWindow;
    if(!doc||!win||!doc.body)return;
    ensureStyle(doc);
    ensureToggle(doc);
    const active=isShortLandscape(win);
    doc.body.classList.toggle('rx01-mobile-sandbox',active);
    if(!active)doc.body.classList.remove('rx01-sandbox-left-open');

    if(!win.__rx01SandboxResizeBound){
      win.__rx01SandboxResizeBound=true;
      win.addEventListener('resize',()=>apply(frame,mode),{passive:true});
      try{win.screen?.orientation?.addEventListener?.('change',()=>apply(frame,mode))}catch(e){}
    }
  }

  window.RX01_APPLY_LEVEL4_MOBILE_SANDBOX=(frame,mode)=>{
    apply(frame,mode);
    requestAnimationFrame(()=>apply(frame,mode));
    setTimeout(()=>apply(frame,mode),120);
    setTimeout(()=>apply(frame,mode),500);
  };
})();