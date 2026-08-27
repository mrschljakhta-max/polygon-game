(()=>{
  const TARGET='stages/14_level4_intro.html';
  const STYLE_ID='rx01-level4-exact-dali-style';
  const CLASS_NAME='rx01-level4-exact-dali';
  const ASSET='../assets/button_dali_exact.webp?v=20260827-l4-exact-1';

  function ensureStyle(doc){
    if(doc.getElementById(STYLE_ID)) return;
    const style=doc.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${CLASS_NAME},
      .${CLASS_NAME}:hover,
      .${CLASS_NAME}:focus,
      .${CLASS_NAME}:focus-visible,
      .${CLASS_NAME}:active{
        color:transparent!important;
        text-shadow:none!important;
        background:none!important;
        border:0!important;
        border-color:transparent!important;
        border-radius:0!important;
        outline:0!important;
        outline-offset:0!important;
        box-shadow:none!important;
        -webkit-box-shadow:none!important;
        -webkit-appearance:none!important;
        appearance:none!important;
        overflow:visible!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      .${CLASS_NAME}::before,.${CLASS_NAME}::after{display:none!important}
      .${CLASS_NAME}>img.rx01-level4-dali-image{
        position:absolute!important;
        left:50%!important;
        top:50%!important;
        width:100%!important;
        max-width:none!important;
        height:auto!important;
        display:block!important;
        visibility:visible!important;
        opacity:1!important;
        pointer-events:none!important;
        transform:translate(-50%,-50%) scale(1);
        transform-origin:center center;
        filter:drop-shadow(5px 7px 0 rgba(0,0,0,.78));
        animation:rx01L4DaliIdle 2.4s ease-in-out .55s infinite;
      }
      .${CLASS_NAME}:hover>img.rx01-level4-dali-image{
        animation:none;
        transform:translate(-50%,-50%) scale(1.045);
        filter:drop-shadow(7px 9px 0 rgba(0,0,0,.82)) drop-shadow(0 0 14px rgba(255,210,35,.25));
      }
      .${CLASS_NAME}:active>img.rx01-level4-dali-image{
        animation:none;
        transform:translate(-50%,-50%) scale(.975);
        filter:drop-shadow(3px 4px 0 rgba(0,0,0,.82));
      }
      @keyframes rx01L4DaliIdle{
        0%,100%{transform:translate(-50%,-50%) scale(1);filter:drop-shadow(5px 7px 0 rgba(0,0,0,.78)) drop-shadow(0 0 0 rgba(255,210,35,0))}
        50%{transform:translate(-50%,calc(-50% - 2px)) scale(1.025);filter:drop-shadow(6px 9px 0 rgba(0,0,0,.8)) drop-shadow(0 0 13px rgba(255,210,35,.24))}
      }
      @media(prefers-reduced-motion:reduce){.${CLASS_NAME}>img.rx01-level4-dali-image{animation:none!important}}
    `;
    doc.head.appendChild(style);
  }

  function isServiceHint(text){
    const t=(text||'').replace(/\s+/g,' ').trim().toUpperCase();
    return t.includes('ПІСЛЯ ЗАСТАВКИ НАТИСНИ') && t.includes('ДАЛІ');
  }

  function hideServiceHint(doc){
    const all=[...doc.querySelectorAll('body *')];
    for(const el of all){
      if(!isServiceHint(el.textContent)) continue;
      const childHasSame=[...el.children].some(ch=>isServiceHint(ch.textContent));
      if(!childHasSame) el.style.setProperty('display','none','important');
    }
  }

  function installCleanup(doc){
    if(!doc?.documentElement || doc.documentElement.dataset.rx01L4Cleanup==='1') return;
    doc.documentElement.dataset.rx01L4Cleanup='1';
    hideServiceHint(doc);
    const Obs=doc.defaultView?.MutationObserver;
    if(!Obs) return;
    const obs=new Obs(()=>hideServiceHint(doc));
    obs.observe(doc.body||doc.documentElement,{childList:true,subtree:true,characterData:true});
    setTimeout(()=>obs.disconnect(),30000);
  }

  function findDaliButton(doc){
    const candidates=[...doc.querySelectorAll('button,a,[role="button"]')];
    return candidates.find(el=>((el.textContent||'').replace(/\s+/g,' ').trim().toUpperCase()==='ДАЛІ'))
      || doc.querySelector('#nextBtn,.next-btn,.nextButton,.continue-btn,.continueButton');
  }

  function applyToFrame(frame){
    const src=frame.getAttribute('src')||'';
    if(!src.includes(TARGET)) return false;
    let doc;
    try{doc=frame.contentDocument||frame.contentWindow?.document}catch(e){return false}
    if(!doc?.documentElement) return false;
    ensureStyle(doc);
    installCleanup(doc);
    hideServiceHint(doc);
    const btn=findDaliButton(doc);
    if(!btn) return false;

    btn.classList.add(CLASS_NAME);
    btn.style.setProperty('border','0','important');
    btn.style.setProperty('outline','0','important');
    btn.style.setProperty('box-shadow','none','important');
    btn.style.setProperty('background','none','important');
    btn.style.setProperty('border-radius','0','important');
    if(getComputedStyle(btn).position==='static') btn.style.position='relative';

    if(btn.dataset.rx01ExactDali==='1') return true;
    btn.dataset.rx01ExactDali='1';
    [...btn.children].forEach(child=>{child.style.visibility='hidden'});
    const img=doc.createElement('img');
    img.className='rx01-level4-dali-image';
    img.src=ASSET;
    img.alt='';
    img.draggable=false;
    btn.appendChild(img);
    return true;
  }

  function schedule(frame){
    let tries=0;
    const tick=()=>{
      applyToFrame(frame);
      if(++tries<160) setTimeout(tick,125);
    };
    tick();
  }

  window.RX01_APPLY_LEVEL4_INTRO_DALI=schedule;
  const frame=document.getElementById('frame');
  if(frame){
    frame.addEventListener('load',()=>schedule(frame));
    schedule(frame);
  }
})();
