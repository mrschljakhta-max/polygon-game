(()=>{
  const CONTROL_CLASS='rx01-sandbox-map-controls';
  const TOGGLE_ID='rx01SandboxPanelToggle';
  const DRAWER_ID='rx01MobileMapDrawer';
  const BACKDROP_ID='rx01MobileMapBackdrop';
  const OPEN_CLASS='rx01-sandbox-left-open';
  const TIMER_DELAYS=[0,60,180,420,820,1400];

  function getSafeControls(doc){
    if(!doc)return null;
    const controls=['zin','zout','ruler'].map(id=>doc.getElementById(id)).filter(Boolean);
    if(!controls.length)return null;
    const parent=controls[0].parentElement;
    if(parent&&controls.every(el=>el.parentElement===parent))return parent;
    return null;
  }

  function findCompass(doc,screenRect,controlsRect){
    if(!doc||!screenRect)return null;
    const direct=[
      ...doc.querySelectorAll('[id*="compass" i],[class*="compass" i],img[src*="compass" i],img[alt*="компас" i],img[title*="компас" i]')
    ].filter(el=>{
      const r=el.getBoundingClientRect();
      return r.width>30&&r.height>30&&r.right>screenRect.left&&r.left<screenRect.right;
    });
    if(direct.length)return direct[0];

    const limitRight=controlsRect?controlsRect.left:screenRect.left+screenRect.width*.55;
    const candidates=[...doc.querySelectorAll('img,svg,canvas,div')].filter(el=>{
      if(el.id===TOGGLE_ID||el.closest(`#${DRAWER_ID}`))return false;
      const r=el.getBoundingClientRect();
      if(r.width<45||r.height<45||r.width>125||r.height>125)return false;
      if(Math.abs(r.width-r.height)>30)return false;
      if(r.left<screenRect.left||r.right>limitRight)return false;
      const top=r.top-screenRect.top;
      return top>=30&&top<=145;
    });
    candidates.sort((a,b)=>{
      const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
      return (ar.left-br.left)||((ar.top-screenRect.top)-(br.top-screenRect.top));
    });
    return candidates[0]||null;
  }

  function placeOno(doc,safeControls){
    const box=doc&&doc.getElementById('rx01MapOnoPng');
    const screen=doc&&doc.querySelector('.screen');
    if(!box||!screen||!doc.body.classList.contains('rx01-mobile-sandbox'))return;

    if(box.parentNode!==screen)screen.appendChild(box);
    const screenRect=screen.getBoundingClientRect();
    const controlsRect=safeControls&&safeControls.getBoundingClientRect();
    const compass=findCompass(doc,screenRect,controlsRect);
    const compassRect=compass&&compass.getBoundingClientRect();

    // The speech card belongs in the LEFT upper gap: compass -> zoom/ruler controls.
    let leftEdge=compassRect?compassRect.right-screenRect.left+8:Math.max(92,screenRect.width*.11);
    let rightEdge=controlsRect?controlsRect.left-screenRect.left-10:Math.min(screenRect.width*.57,480);
    if(rightEdge-leftEdge<120){
      leftEdge=Math.max(78,screenRect.width*.10);
      rightEdge=Math.max(leftEdge+120,Math.min(screenRect.width*.55,screenRect.width-190));
    }

    const gap=Math.max(120,rightEdge-leftEdge);
    const width=Math.max(118,Math.min(178,gap-14));
    // Bias slightly toward the compass/left side instead of centering it too far right.
    const spare=Math.max(0,gap-width);
    const left=leftEdge+Math.max(4,spare*.28);

    box.style.setProperty('left',`${Math.round(left)}px`,'important');
    box.style.setProperty('right','auto','important');
    box.style.setProperty('top','40px','important');
    box.style.setProperty('--rx01-ono-width',`${Math.round(width)}px`);
    box.style.setProperty('z-index','2147482500','important');
  }

  function setDrawerState(doc,open){
    if(!doc||!doc.body)return;
    const drawer=doc.getElementById(DRAWER_ID);
    const backdrop=doc.getElementById(BACKDROP_ID);
    const toggle=doc.getElementById(TOGGLE_ID);
    doc.body.classList.toggle(OPEN_CLASS,!!open);

    if(drawer){
      drawer.style.setProperty('position','fixed','important');
      drawer.style.setProperty('left','0','important');
      drawer.style.setProperty('top','34px','important');
      drawer.style.setProperty('bottom','0','important');
      drawer.style.setProperty('z-index','2147483640','important');
      drawer.style.setProperty('transform',open?'translate3d(0,0,0)':'translate3d(-103%,0,0)','important');
      drawer.style.setProperty('visibility','visible','important');
      drawer.style.setProperty('pointer-events','auto','important');
    }
    if(backdrop){
      backdrop.style.setProperty('position','fixed','important');
      backdrop.style.setProperty('z-index','2147483630','important');
      backdrop.style.setProperty('opacity',open?'1':'0','important');
      backdrop.style.setProperty('visibility',open?'visible':'hidden','important');
      backdrop.style.setProperty('pointer-events',open?'auto':'none','important');
    }
    if(toggle){
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.style.setProperty('position','fixed','important');
      toggle.style.setProperty('z-index','2147483646','important');
      toggle.style.setProperty('pointer-events',open?'none':'auto','important');
      toggle.style.setProperty('opacity',open?'0':'1','important');
    }
  }

  function bindDrawer(doc){
    if(!doc||doc.__rx01DrawerHardFixBound)return;
    const toggle=doc.getElementById(TOGGLE_ID);
    const drawer=doc.getElementById(DRAWER_ID);
    if(!toggle||!drawer)return;
    doc.__rx01DrawerHardFixBound=true;

    // Capture phase prevents the map/pan layer from swallowing the hamburger click.
    doc.addEventListener('click',event=>{
      const target=event.target instanceof Element?event.target:null;
      if(!target)return;
      const toggleHit=target.closest(`#${TOGGLE_ID}`);
      const closeHit=target.closest(`#${DRAWER_ID} .rx01-mobile-drawer-close`);
      const backdropHit=target.closest(`#${BACKDROP_ID}`);
      if(!toggleHit&&!closeHit&&!backdropHit)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if(toggleHit)setDrawerState(doc,!doc.body.classList.contains(OPEN_CLASS));
      else setDrawerState(doc,false);
    },true);

    toggle.style.setProperty('touch-action','manipulation','important');
    toggle.style.setProperty('-webkit-tap-highlight-color','transparent','important');
    setDrawerState(doc,false);
  }

  function clean(frame){
    const doc=frame&&frame.contentDocument;
    if(!doc||!doc.body)return;
    const safeControls=getSafeControls(doc);
    doc.querySelectorAll(`.${CONTROL_CLASS}`).forEach(el=>{
      if(el!==safeControls)el.classList.remove(CONTROL_CLASS);
    });
    if(safeControls)safeControls.classList.add(CONTROL_CLASS);
    bindDrawer(doc);
    placeOno(doc,safeControls);
  }

  function schedule(frame){
    TIMER_DELAYS.forEach(delay=>setTimeout(()=>clean(frame),delay));
  }

  function arm(){
    const frame=document.getElementById('frame');
    if(!frame)return;
    frame.addEventListener('load',()=>schedule(frame));
    window.addEventListener('resize',()=>schedule(frame),{passive:true});
    try{screen.orientation?.addEventListener?.('change',()=>schedule(frame))}catch(_){ }
    schedule(frame);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arm,{once:true});
  else arm();
})();