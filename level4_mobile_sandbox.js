(()=>{
  const STYLE_ID='rx01Level4MobileSandboxStyle';
  const TOGGLE_ID='rx01SandboxPanelToggle';
  const DRAWER_ID='rx01MobileMapDrawer';
  const DRAWER_CONTENT_ID='rx01MobileMapDrawerContent';
  const BACKDROP_ID='rx01MobileMapBackdrop';
  const MAX_HEIGHT=520;

  function isPhoneLandscape(win){
    if(!win)return false;
    return win.innerWidth>win.innerHeight && win.innerHeight<=MAX_HEIGHT && win.innerWidth<=1180;
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

      /* Dedicated phone drawer. It owns the original .left contents while mobile is active. */
      body.rx01-mobile-sandbox #${BACKDROP_ID}{
        display:block!important;position:absolute!important;left:0!important;right:50px!important;top:34px!important;bottom:0!important;
        z-index:2147482995!important;background:rgba(0,0,0,.48)!important;opacity:0!important;visibility:hidden!important;
        pointer-events:none!important;transition:opacity .18s ease,visibility .18s ease!important;
      }
      body.rx01-mobile-sandbox.rx01-sandbox-left-open #${BACKDROP_ID}{
        opacity:1!important;visibility:visible!important;pointer-events:auto!important;
      }
      body.rx01-mobile-sandbox #${DRAWER_ID}{
        display:flex!important;position:absolute!important;left:0!important;top:34px!important;bottom:0!important;
        width:min(72vw,280px)!important;z-index:2147483000!important;flex-direction:column!important;
        background:linear-gradient(180deg,rgba(12,17,12,.985),rgba(5,9,6,.985))!important;
        border-right:1px solid #766b43!important;box-shadow:14px 0 30px rgba(0,0,0,.72)!important;
        transform:translateX(-103%)!important;transition:transform .2s ease!important;overflow:hidden!important;
        pointer-events:auto!important;
      }
      body.rx01-mobile-sandbox.rx01-sandbox-left-open #${DRAWER_ID}{transform:translateX(0)!important;}
      body.rx01-mobile-sandbox .rx01-mobile-drawer-head{
        flex:0 0 auto!important;height:42px!important;display:flex!important;align-items:center!important;gap:8px!important;
        padding:0 9px 0 11px!important;border-bottom:1px solid #4e4b36!important;
        background:linear-gradient(180deg,#161c15,#0b100b)!important;color:#d8cfaa!important;
      }
      body.rx01-mobile-sandbox .rx01-mobile-drawer-title{min-width:0!important;flex:1!important;}
      body.rx01-mobile-sandbox .rx01-mobile-drawer-kicker{
        color:#9fbe59!important;font:800 7px/1.1 'Courier New',monospace!important;letter-spacing:.12em!important;
      }
      body.rx01-mobile-sandbox .rx01-mobile-drawer-name{
        margin-top:2px!important;color:#e4dcae!important;font:900 11px/1 Arial,sans-serif!important;letter-spacing:.04em!important;
      }
      body.rx01-mobile-sandbox .rx01-mobile-drawer-close{
        flex:0 0 30px!important;width:30px!important;height:30px!important;padding:0!important;border:1px solid #5d5940!important;
        border-radius:4px!important;background:#111610!important;color:#d8ba55!important;font:900 20px/1 Arial!important;cursor:pointer!important;
      }
      body.rx01-mobile-sandbox #${DRAWER_CONTENT_ID}{
        min-height:0!important;flex:1!important;overflow:auto!important;padding:7px!important;overscroll-behavior:contain!important;
        -webkit-overflow-scrolling:touch!important;
      }
      body.rx01-mobile-sandbox #${DRAWER_ID} .left{
        display:flex!important;position:relative!important;inset:auto!important;width:100%!important;height:auto!important;min-height:100%!important;
        flex-direction:column!important;padding:0!important;margin:0!important;overflow:visible!important;
        background:transparent!important;border:0!important;box-shadow:none!important;z-index:auto!important;
      }
      body.rx01-mobile-sandbox #${DRAWER_ID} .left .panel{
        padding:7px!important;margin:0 0 7px!important;border-radius:5px!important;background:#101610!important;
      }
      body.rx01-mobile-sandbox #${DRAWER_ID} .left h3{margin:0 0 6px!important;font-size:11px!important;}
      body.rx01-mobile-sandbox #${DRAWER_ID} .left .entry{padding:6px 3px!important;font-size:9px!important;line-height:1.15!important;}
      body.rx01-mobile-sandbox .rx01-mobile-drawer-empty{
        padding:14px 10px!important;border:1px dashed #4c4937!important;border-radius:5px!important;
        color:#8f8a70!important;font:700 10px/1.45 'Courier New',monospace!important;text-align:center!important;
      }
      body.rx01-mobile-sandbox #${TOGGLE_ID}{
        display:flex!important;position:absolute!important;left:6px!important;top:40px!important;z-index:2147483005!important;
        width:32px!important;height:32px!important;padding:0!important;align-items:center!important;justify-content:center!important;
        border:1px solid #817545!important;border-radius:4px!important;background:rgba(8,13,8,.96)!important;
        color:#e0bd48!important;font:900 17px/1 Arial!important;box-shadow:0 3px 10px #000b!important;cursor:pointer!important;
        touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;
      }
      body.rx01-mobile-sandbox.rx01-sandbox-left-open #${TOGGLE_ID}{opacity:0!important;pointer-events:none!important;}
      body:not(.rx01-mobile-sandbox) #${TOGGLE_ID},
      body:not(.rx01-mobile-sandbox) #${DRAWER_ID},
      body:not(.rx01-mobile-sandbox) #${BACKDROP_ID}{display:none!important;}

      /* Compact the scale/ruler palette without taking map space away. */
      body.rx01-mobile-sandbox .rx01-sandbox-map-controls{
        zoom:.84!important;transform-origin:top left!important;
      }

      /* Onomatopoeia is docked in the free top gap between map controls and the right toolbar. */
      body.rx01-mobile-sandbox #rx01MapOnoPng{
        position:absolute!important;right:auto!important;margin:0!important;
        width:var(--rx01-ono-width,150px)!important;max-width:none!important;max-height:92px!important;
        object-fit:contain!important;object-position:center top!important;
        transform:rotate(-2.2deg)!important;transform-origin:center top!important;
        filter:drop-shadow(0 4px 6px rgba(0,0,0,.72))!important;pointer-events:none!important;
      }
      body.rx01-mobile-sandbox #petrovychImg,
      body.rx01-mobile-sandbox .instructorCard .petrovychImg{
        width:auto!important;max-width:90px!important;max-height:108px!important;object-fit:contain!important;
      }
      body.rx01-mobile-sandbox .instructorCard{max-width:125px!important;max-height:125px!important;overflow:hidden!important;}

      body.rx01-mobile-sandbox .toast,
      body.rx01-mobile-sandbox #toast{max-width:38vw!important;font-size:9px!important;}
      body.rx01-mobile-sandbox .modal,
      body.rx01-mobile-sandbox .dialog{max-height:86vh!important;overflow:auto!important;}
    `;
    doc.head.appendChild(style);
  }

  function setOpen(doc,open){
    if(!doc||!doc.body)return;
    doc.body.classList.toggle('rx01-sandbox-left-open',!!open);
    const btn=doc.getElementById(TOGGLE_ID);
    if(btn)btn.setAttribute('aria-expanded',open?'true':'false');
  }

  function ensureDrawer(doc){
    if(!doc)return null;
    const host=doc.querySelector('.screen')||doc.body;
    if(!host)return null;

    let backdrop=doc.getElementById(BACKDROP_ID);
    if(!backdrop){
      backdrop=doc.createElement('div');
      backdrop.id=BACKDROP_ID;
      backdrop.setAttribute('aria-hidden','true');
      backdrop.addEventListener('pointerdown',event=>{
        event.preventDefault();event.stopPropagation();setOpen(doc,false);
      });
      host.appendChild(backdrop);
    }

    let drawer=doc.getElementById(DRAWER_ID);
    if(!drawer){
      drawer=doc.createElement('aside');
      drawer.id=DRAWER_ID;
      drawer.setAttribute('aria-label','Мобільна панель карти');
      drawer.innerHTML=`
        <div class="rx01-mobile-drawer-head">
          <div class="rx01-mobile-drawer-title">
            <div class="rx01-mobile-drawer-kicker">RX-01 · РІВЕНЬ 4</div>
            <div class="rx01-mobile-drawer-name">ПАНЕЛЬ КАРТИ</div>
          </div>
          <button class="rx01-mobile-drawer-close" type="button" aria-label="Закрити панель">×</button>
        </div>
        <div id="${DRAWER_CONTENT_ID}"></div>`;
      drawer.addEventListener('pointerdown',event=>event.stopPropagation());
      drawer.querySelector('.rx01-mobile-drawer-close')?.addEventListener('click',event=>{
        event.preventDefault();event.stopPropagation();setOpen(doc,false);
      });
      host.appendChild(drawer);
    }

    let btn=doc.getElementById(TOGGLE_ID);
    if(!btn){
      btn=doc.createElement('button');
      btn.id=TOGGLE_ID;
      btn.type='button';
      btn.textContent='☰';
      btn.setAttribute('aria-label','Відкрити панель карти');
      btn.setAttribute('aria-controls',DRAWER_ID);
      btn.setAttribute('aria-expanded','false');
      btn.addEventListener('pointerdown',event=>event.stopPropagation());
      btn.addEventListener('click',event=>{
        event.preventDefault();event.stopPropagation();
        setOpen(doc,!doc.body.classList.contains('rx01-sandbox-left-open'));
      });
      host.appendChild(btn);
    }

    if(!doc.__rx01MobileDrawerEscBound){
      doc.__rx01MobileDrawerEscBound=true;
      doc.addEventListener('keydown',event=>{if(event.key==='Escape')setOpen(doc,false)});
    }
    return drawer;
  }

  function dockDesktopLeft(doc){
    const drawer=ensureDrawer(doc);
    const slot=doc.getElementById(DRAWER_CONTENT_ID);
    if(!drawer||!slot)return;

    let left=doc.querySelector('.left');
    if(left&&drawer.contains(left))return;
    if(left){
      if(!left.__rx01MobileOriginalParent){
        left.__rx01MobileOriginalParent=left.parentNode;
        left.__rx01MobileOriginalNext=left.nextSibling;
      }
      left.classList.add('rx01-mobile-docked-left');
      slot.replaceChildren(left);
    }else if(!slot.children.length){
      const empty=doc.createElement('div');
      empty.className='rx01-mobile-drawer-empty';
      empty.textContent='Панель карти готується…';
      slot.appendChild(empty);
    }
  }

  function restoreDesktopLeft(doc){
    const drawer=doc&&doc.getElementById(DRAWER_ID);
    if(!drawer)return;
    const left=drawer.querySelector('.left');
    if(left&&left.__rx01MobileOriginalParent){
      const parent=left.__rx01MobileOriginalParent;
      const next=left.__rx01MobileOriginalNext;
      if(next&&next.parentNode===parent)parent.insertBefore(left,next);else parent.appendChild(left);
      left.classList.remove('rx01-mobile-docked-left');
    }
    setOpen(doc,false);
  }

  function markMapControls(doc){
    const controls=['zin','zout','ruler'].map(id=>doc&&doc.getElementById(id)).filter(Boolean);
    if(!controls.length)return null;
    let parent=controls[0].parentElement;
    while(parent&&parent!==doc.body&&!controls.every(el=>parent.contains(el)))parent=parent.parentElement;
    if(parent&&parent!==doc.body){
      parent.classList.add('rx01-sandbox-map-controls');
      return parent;
    }
    return null;
  }

  function restoreOno(doc){
    const box=doc&&doc.getElementById('rx01MapOnoPng');
    if(!box)return;
    if(box.__rx01MobileOriginalParent){
      const parent=box.__rx01MobileOriginalParent;
      const next=box.__rx01MobileOriginalNext;
      if(next&&next.parentNode===parent)parent.insertBefore(box,next);else parent.appendChild(box);
      box.__rx01MobileOriginalParent=null;
      box.__rx01MobileOriginalNext=null;
    }
    box.style.removeProperty('left');box.style.removeProperty('top');box.style.removeProperty('--rx01-ono-width');
  }

  function layoutOno(doc){
    const box=doc&&doc.getElementById('rx01MapOnoPng');
    const screen=doc&&doc.querySelector('.screen');
    if(!box||!screen)return;

    if(box.parentNode!==screen){
      if(!box.__rx01MobileOriginalParent){
        box.__rx01MobileOriginalParent=box.parentNode;
        box.__rx01MobileOriginalNext=box.nextSibling;
      }
      screen.appendChild(box);
    }

    const screenRect=screen.getBoundingClientRect();
    const controls=markMapControls(doc);
    const controlsRect=controls&&controls.getBoundingClientRect();
    const right=doc.querySelector('.right');
    const rightRect=right&&right.getBoundingClientRect();

    const rightEdge=Math.max(120,(rightRect?rightRect.left:screenRect.right-50)-screenRect.left-8);
    let leftEdge=controlsRect?controlsRect.right-screenRect.left+10:screenRect.width*.54;
    leftEdge=Math.max(44,Math.min(leftEdge,rightEdge-95));
    const gap=Math.max(90,rightEdge-leftEdge);
    const width=Math.max(105,Math.min(168,gap-10));
    const left=leftEdge+Math.max(4,(gap-width)/2);

    box.style.setProperty('left',`${Math.round(left)}px`,'important');
    box.style.setProperty('top','40px','important');
    box.style.setProperty('--rx01-ono-width',`${Math.round(width)}px`);
  }

  function setParentHomeVisibility(frame,hidden){
    try{
      const home=frame&&frame.ownerDocument&&frame.ownerDocument.getElementById('homeLink');
      if(home)home.style.display=hidden?'none':'';
    }catch(_){ }
  }

  function hideInnerLevels(doc,hidden){
    if(!doc)return;
    doc.querySelectorAll('a,button').forEach(el=>{
      if(el.id===TOGGLE_ID||el.closest(`#${DRAWER_ID}`))return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(!text.includes('РІВНІ'))return;
      if(hidden){
        if(el.dataset.rx01MobilePrevDisplay===undefined)el.dataset.rx01MobilePrevDisplay=el.style.display||'';
        el.style.setProperty('display','none','important');
      }else if(el.dataset.rx01MobilePrevDisplay!==undefined){
        el.style.display=el.dataset.rx01MobilePrevDisplay;
        delete el.dataset.rx01MobilePrevDisplay;
      }
    });
  }

  function apply(frame,mode){
    const doc=frame&&frame.contentDocument;
    const win=frame&&frame.contentWindow;
    if(!doc||!win||!doc.body)return;

    if(mode!=='map'){
      setParentHomeVisibility(frame,false);
      return;
    }

    ensureStyle(doc);
    ensureDrawer(doc);
    markMapControls(doc);
    const active=isPhoneLandscape(win);
    doc.body.classList.toggle('rx01-mobile-sandbox',active);
    setParentHomeVisibility(frame,active);
    hideInnerLevels(doc,active);

    if(active){
      dockDesktopLeft(doc);
      layoutOno(doc);
    }else{
      restoreDesktopLeft(doc);
      restoreOno(doc);
    }

    if(!win.__rx01SandboxResizeBound){
      win.__rx01SandboxResizeBound=true;
      win.addEventListener('resize',()=>apply(frame,'map'),{passive:true});
      try{win.screen?.orientation?.addEventListener?.('change',()=>apply(frame,'map'))}catch(_){ }
    }
  }

  window.RX01_APPLY_LEVEL4_MOBILE_SANDBOX=(frame,mode)=>{
    apply(frame,mode);
    requestAnimationFrame(()=>apply(frame,mode));
    setTimeout(()=>apply(frame,mode),120);
    setTimeout(()=>apply(frame,mode),500);
    setTimeout(()=>apply(frame,mode),1100);
  };
})();