(()=>{
  const CONTROL_CLASS='rx01-sandbox-map-controls';
  const TIMER_DELAYS=[0,60,180,620,1250];

  function getSafeControls(doc){
    if(!doc)return null;
    const controls=['zin','zout','ruler'].map(id=>doc.getElementById(id)).filter(Boolean);
    if(!controls.length)return null;
    const parent=controls[0].parentElement;
    if(parent&&controls.every(el=>el.parentElement===parent))return parent;
    return null;
  }

  function placeOno(doc,safeControls){
    const box=doc&&doc.getElementById('rx01MapOnoPng');
    const screen=doc&&doc.querySelector('.screen');
    const right=doc&&doc.querySelector('.right');
    if(!box||!screen||!doc.body.classList.contains('rx01-mobile-sandbox'))return;

    if(box.parentNode!==screen)screen.appendChild(box);
    const screenRect=screen.getBoundingClientRect();
    const controlsRect=safeControls&&safeControls.getBoundingClientRect();
    const rightRect=right&&right.getBoundingClientRect();
    const rightEdge=Math.max(140,(rightRect?rightRect.left:screenRect.right-50)-screenRect.left-8);
    let leftEdge=controlsRect?controlsRect.right-screenRect.left+10:screenRect.width*.54;
    leftEdge=Math.max(48,Math.min(leftEdge,rightEdge-100));
    const gap=Math.max(96,rightEdge-leftEdge);
    const width=Math.max(110,Math.min(168,gap-12));
    const left=leftEdge+Math.max(5,(gap-width)/2);

    box.style.setProperty('left',`${Math.round(left)}px`,'important');
    box.style.setProperty('top','40px','important');
    box.style.setProperty('--rx01-ono-width',`${Math.round(width)}px`);
  }

  function clean(frame){
    const doc=frame&&frame.contentDocument;
    if(!doc||!doc.body)return;
    const safeControls=getSafeControls(doc);
    doc.querySelectorAll(`.${CONTROL_CLASS}`).forEach(el=>{
      if(el!==safeControls)el.classList.remove(CONTROL_CLASS);
    });
    if(safeControls)safeControls.classList.add(CONTROL_CLASS);
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