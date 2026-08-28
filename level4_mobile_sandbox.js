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
        height:34px!important;min-height:34px!important;padding:0 8px!important;
        grid-template-columns:1.1fr 1fr 1fr .62fr!important;font-size:10px!important;line-height:1!important;
        border-bottom:1px solid #3f4439!important;
      }
      body.rx01-mobile-sandbox .work{
        position:relative!important;height:calc(100% - 34px)!important;display:grid!important;
        grid-template-columns:minmax(0,1fr) 50px!important;grid-template-rows:1fr!important;
      }
      body.rx01-mobile-sandbox .left{display:none!important;}
      body.rx01-mobile-sandbox.rx01-sandbox-left-open .left{
        display:flex!important;position:absolute!important;left:0!important;top:0!important;bottom:0!important;
        width:min(38vw,250px)!important;z-index:120!important;padding:6px!important;overflow:auto!important;
        border-right:1px solid #655f45!important;box-shadow:12px 0 28px #000b!important;
      }
      body.rx01-mobile-sandbox .left .panel{padding:6px!important;margin-bottom:5px!important;}
      body.rx01-mobile-sandbox .left h3{margin:0 0 4px!important;font-size:10px!important;}
      body.rx01-mobile-sandbox .left .entry{padding:4px 2px!important;font-size:8.5px!important;}
      body.rx01-mobile-sandbox .map{
        grid-column:1!important;grid-row:1!important;width:100%!important;height:100%!important;min-width:0!important;
        overflow:hidden!important;
      }
      body.rx01-mobile-sandbox .right{
        grid-column:2!important;grid-row:1!important;width:50px!important;min-width:50px!important;
        padding:2px!important;gap:2px!important;border-left:1px solid #3f4338!important;
      }
      body.rx01-mobile-sandbox .right button{
        min-height:0!important;padding:1px!important;border-radius:3px!important;font-size:7px!important;
        line-height:1!important;
      }
      body.rx01-mobile-sandbox .right button img,
      body.rx01-mobile-sandbox .right .tool img{max-width:21px!important;max-height:21px!important;}
      body.rx01-mobile-sandbox #${TOGGLE_ID}{
        display:flex!important;position:absolute!important;left:5px!important;top:39px!important;z-index:160!important;
        width:31px!important;height:31px!important;align-items:center!important;justify-content:center!important;
        border:1px solid #766b43!important;border-radius:4px!important;background:rgba(8,13,8,.9)!important;
        color:#d8ba55!important;font:900 16px/1 Arial!important;box-shadow:0 3px 10px #0009!important;cursor:pointer!important;
      }
      body.rx01-mobile-sandbox.rx01-sandbox-left-open #${TOGGLE_ID}{left:min(38vw,250px)!important;transform:translateX(-36px)!important;}
      body:not(.rx01-mobile-sandbox) #${TOGGLE_ID}{display:none!important;}

      /* Compact the scale/ruler palette without taking map space away. */
      body.rx01-mobile-sandbox .rx01-sandbox-map-controls{
        zoom:.84!important;
        transform-origin:top left!important;
      }

      /* Comic instruction is a small HUD hint, never a map-covering panel. */
      body.rx01-mobile-sandbox #rx01MapOnoPng{
        left:40px!important;top:40px!important;width:min(21vw,170px)!important;max-width:170px!important;
        max-height:34vh!important;object-fit:contain!important;object-position:left top!important;
        transform:rotate(-2.5deg)!important;transform-origin:left top!important;
        filter:drop-shadow(0 4px 6px rgba(0,0,0,.72))!important;
      }
      body.rx01-mobile-sandbox #petrovychImg,
      body.rx01-mobile-sandbox .instructorCard .petrovychImg{
        width:auto!important;max-width:90px!important;max-height:108px!important;object-fit:contain!important;
      }
      body.rx01-mobile-sandbox .instructorCard{
        max-width:125px!important;max-height:125px!important;overflow:hidden!important;
      }

      /* Keep floating help/toasts inside the short viewport. */
      body.rx01-mobile-sandbox .toast,
      body.rx01-mobile-sandbox #toast{max-width:38vw!important;font-size:9px!important;}
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

  function markMapControls(doc){
    if(!doc)return;
    const controls=['zin','zout','ruler'].map(id=>doc.getElementById(id)).filter(Boolean);
    if(!controls.length)return;
    const firstParent=controls[0].parentElement;
    if(firstParent&&controls.every(el=>firstParent.contains(el))){
      firstParent.classList.add('rx01-sandbox-map-controls');
    }
  }

  function apply(frame,mode){
    if(mode!=='map')return;
    const doc=frame&&frame.contentDocument;
    const win=frame&&frame.contentWindow;
    if(!doc||!win||!doc.body)return;
    ensureStyle(doc);
    ensureToggle(doc);
    markMapControls(doc);
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