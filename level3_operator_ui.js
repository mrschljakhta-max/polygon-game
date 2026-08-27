(()=>{
  const FIRST_LEVEL3_TASK_PATH='/stages/07_level3_tasks_01_05.html';
  const LEVEL3_TASK_PATHS=[
    FIRST_LEVEL3_TASK_PATH,
    '/stages/08_level3_task_06.html',
    '/stages/09_level3_task_07.html',
    '/stages/10_level3_task_08.html',
    '/stages/11_level3_task_09.html',
    '/stages/13_level3_task_10.html'
  ];

  const CSS=`
    #miniHud{display:none!important}

    #rxOperatorStatus,#rxOperatorHint{
      position:absolute;left:50%;z-index:86;pointer-events:none;
      opacity:0;visibility:hidden;
      transform:translate(-50%,14px) scale(.97);
      transition:opacity .28s ease,transform .34s cubic-bezier(.2,.9,.25,1),visibility 0s linear .34s;
      color:#f5e9c5;text-align:center;text-transform:uppercase;
      text-shadow:2px 2px 0 #000;
      filter:drop-shadow(0 8px 12px rgba(0,0,0,.78));
    }
    #rxOperatorStatus.show,#rxOperatorHint.show{
      opacity:1;visibility:visible;transform:translate(-50%,0) scale(1);
      transition:opacity .2s ease,transform .3s cubic-bezier(.2,1.2,.3,1),visibility 0s;
    }
    #rxOperatorStatus{
      bottom:5.2%;min-width:24%;max-width:58%;
      padding:10px 26px 11px;
      background:linear-gradient(180deg,rgba(25,23,15,.96),rgba(7,8,6,.96));
      border:2px solid #c99b1d;border-left:7px solid #f1bc1d;
      clip-path:polygon(2.5% 0,100% 0,97.5% 100%,0 100%);
      box-shadow:6px 6px 0 rgba(0,0,0,.58),inset 0 0 16px rgba(241,188,29,.08);
      font:1000 italic clamp(12px,1.25vw,20px)/1 Arial,sans-serif;
      letter-spacing:.055em;
    }
    #rxOperatorStatus[data-state="peak"]{
      color:#fff3a6;border-color:#f5cf3d;border-left-color:#ffe05a;
      box-shadow:6px 6px 0 rgba(0,0,0,.58),0 0 18px rgba(255,202,40,.22),inset 0 0 18px rgba(255,220,80,.10);
    }
    #rxOperatorHint{
      bottom:2.1%;
      padding:7px 15px 8px;
      background:rgba(8,9,7,.90);
      border:1px solid rgba(206,163,41,.78);
      color:#f0dda2;
      font:1000 clamp(10px,.9vw,14px)/1.1 "Courier New",monospace;
      letter-spacing:.045em;text-shadow:1px 1px 0 #000;
    }

    #rxBearingTutorialShade{
      position:absolute;inset:0;z-index:78;pointer-events:none;
      background:rgba(0,0,0,.18);opacity:0;transition:opacity .35s ease;
    }
    #rxBearingTutorialShade.show{opacity:1}
    #rxBearingTutorial{
      position:absolute;right:7.4%;top:39.5%;z-index:88;pointer-events:none;
      width:25%;padding:15px 18px 14px;
      opacity:0;visibility:hidden;transform:translateY(12px) scale(.96);
      transition:opacity .28s ease,transform .38s cubic-bezier(.2,1.2,.3,1),visibility 0s linear .38s;
      background:linear-gradient(180deg,rgba(29,26,16,.97),rgba(7,8,6,.97));
      border:2px solid #d1a21d;border-left:7px solid #f2bd1e;
      clip-path:polygon(3% 0,100% 0,96% 100%,0 100%);
      box-shadow:7px 7px 0 rgba(0,0,0,.62),0 0 22px rgba(242,189,30,.12);
      color:#f6e7bd;text-align:center;text-transform:uppercase;
      text-shadow:2px 2px 0 #000;
    }
    #rxBearingTutorial.show{
      opacity:1;visibility:visible;transform:none;
      transition:opacity .2s ease,transform .34s cubic-bezier(.2,1.2,.3,1),visibility 0s;
    }
    #rxBearingTutorial .title{
      color:#ffd541;font:1000 italic clamp(13px,1.3vw,21px)/1 Arial,sans-serif;
      letter-spacing:.05em;margin-bottom:10px;
    }
    #rxBearingTutorial .keys{display:flex;align-items:center;justify-content:center;gap:9px;margin:5px 0 8px}
    #rxBearingTutorial .key{
      display:grid;place-items:center;min-width:43px;height:35px;padding:0 9px;
      border:2px solid #e2b52c;background:#17160e;color:#fff1bd;
      box-shadow:inset 0 0 10px rgba(255,212,55,.08),3px 3px 0 #000;
      font:1000 clamp(15px,1.25vw,21px)/1 Arial,sans-serif;
    }
    #rxBearingTutorial .sub{
      color:#d8c995;font:900 clamp(9px,.82vw,13px)/1.25 "Courier New",monospace;
      letter-spacing:.02em;
    }
    #rxBearingTutorial .action{
      margin-top:10px;color:#fff4bd;
      font:1000 clamp(10px,.9vw,14px)/1.15 Arial,sans-serif;
      letter-spacing:.03em;
    }

    #leftHit.rxBearingPulse,#rightHit.rxBearingPulse{
      border:2px solid #ffe04a!important;
      border-radius:5px!important;
      box-shadow:0 0 0 2px rgba(0,0,0,.72),0 0 9px #ffd238,0 0 22px rgba(255,193,31,.85)!important;
      background:rgba(255,213,54,.08)!important;
      animation:rxBearingPulse 1.05s ease-in-out infinite;
      z-index:87!important;
    }
    #rightHit.rxBearingPulse{animation-delay:.52s}
    @keyframes rxBearingPulse{
      0%,100%{filter:brightness(1);transform:scale(1)}
      50%{filter:brightness(1.65);transform:scale(1.08)}
    }

    #lockHit.rxLockPulse{
      border:2px solid #ffe04a!important;border-radius:6px!important;
      box-shadow:0 0 0 2px rgba(0,0,0,.72),0 0 10px #ffd238,0 0 24px rgba(255,193,31,.82)!important;
      background:rgba(255,213,54,.07)!important;
      animation:rxLockPulse .88s ease-in-out infinite;z-index:87!important;
    }
    @keyframes rxLockPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.75)}}
  `;

  const classify=text=>{
    const s=(text||'').toUpperCase();
    if(!s)return null;
    if(s.includes('ПІК'))return {key:'peak',label:'ПІК СИГНАЛУ — ПІДТВЕРДЬ LOCK'};
    if(s.includes('ДУЖЕ СИЛЬН')||s.includes('СИЛЬНИЙ СИГНАЛ'))return {key:'strong',label:'СИЛЬНИЙ СИГНАЛ'};
    if(s.includes('РОСТЕ')||s.includes('ПОСИЛЮ'))return {key:'rising',label:'СИГНАЛ ПОСИЛЮЄТЬСЯ'};
    if(s.includes('ЗНАЙДЕНО')||s.includes('ВИЯВЛЕНО'))return {key:'found',label:'СИГНАЛ ВИЯВЛЕНО'};
    return null;
  };

  function ensureBearingTutorial(d,stage){
    let shade=d.getElementById('rxBearingTutorialShade');
    if(!shade){shade=d.createElement('div');shade.id='rxBearingTutorialShade';stage.appendChild(shade)}
    let box=d.getElementById('rxBearingTutorial');
    if(!box){
      box=d.createElement('div');box.id='rxBearingTutorial';
      box.innerHTML='<div class="title">ПОВЕРТАЙ ПЕЛЕНГ</div><div class="keys"><span class="key">←</span><span class="key">→</span></div><div class="sub">СТРІЛКИ НА КЛАВІАТУРІ<br>A / D — ТАКОЖ ПРАЦЮЮТЬ</div><div class="action">НАТИСНИ ← АБО →, ЩОБ ПРОДОВЖИТИ</div>';
      stage.appendChild(box);
    }
    return {shade,box};
  }

  function bindBearingTutorial(d,w,stage){
    if(window.__rx01Level3BearingTutorialDone||w.__rx01BearingTutorialBound)return;
    if(!w.location.pathname.endsWith(FIRST_LEVEL3_TASK_PATH))return;
    const left=d.getElementById('leftHit'),right=d.getElementById('rightHit'),az=d.getElementById('azimuthDisplay');
    if(!left||!right||!az)return;
    w.__rx01BearingTutorialBound=true;

    const {shade,box}=ensureBearingTutorial(d,stage);
    let active=false,attempted=false,initialAz=az.textContent;

    const show=()=>{
      if(window.__rx01Level3BearingTutorialDone)return;
      active=true;initialAz=az.textContent;
      left.classList.add('rxBearingPulse');right.classList.add('rxBearingPulse');
      shade.classList.add('show');box.classList.add('show');
    };
    const finish=()=>{
      if(!active)return;
      active=false;window.__rx01Level3BearingTutorialDone=true;
      left.classList.remove('rxBearingPulse');right.classList.remove('rxBearingPulse');
      shade.classList.remove('show');box.classList.remove('show');
    };

    const azObserver=new w.MutationObserver(()=>{
      if(active&&attempted&&az.textContent!==initialAz)finish();
    });
    azObserver.observe(az,{childList:true,subtree:true,characterData:true});

    w.addEventListener('keydown',e=>{
      if(!active)return;
      const k=e.key.toLowerCase();
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'||k==='a'||k==='d')attempted=true;
      else if(e.key==='Enter'){
        e.preventDefault();e.stopImmediatePropagation();
      }
    },true);
    const markAttempt=()=>{if(active)attempted=true};
    left.addEventListener('pointerdown',markAttempt,true);
    right.addEventListener('pointerdown',markAttempt,true);

    setTimeout(show,2300);
  }

  function bindFirstLockTutorial(d,w,hint){
    const lock=d.getElementById('lockHit');
    if(!lock||w.__rx01LockTutorialBound)return;
    w.__rx01LockTutorialBound=true;

    const hide=()=>{
      if(!lock.classList.contains('rxLockPulse'))return;
      lock.classList.remove('rxLockPulse');hint.classList.remove('show');
      window.__rx01Level3LockTutorialDone=true;
    };
    w.addEventListener('keydown',e=>{if(e.key==='Enter'&&lock.classList.contains('rxLockPulse'))hide()},true);
    lock.addEventListener('click',hide,true);
  }

  function apply(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w)return;
      if(!LEVEL3_TASK_PATHS.some(path=>w.location.pathname.endsWith(path)))return;
      if(!d.getElementById('stage'))return;

      let style=d.getElementById('rxOperatorUiStyle');
      if(!style){style=d.createElement('style');style.id='rxOperatorUiStyle';d.head.appendChild(style)}
      style.textContent=CSS;

      const stage=d.getElementById('stage');
      let status=d.getElementById('rxOperatorStatus');
      if(!status){status=d.createElement('div');status.id='rxOperatorStatus';stage.appendChild(status)}
      let hint=d.getElementById('rxOperatorHint');
      if(!hint){hint=d.createElement('div');hint.id='rxOperatorHint';stage.appendChild(hint)}

      let hideTimer=null;
      const showStatus=(state,label)=>{
        clearTimeout(hideTimer);
        status.dataset.state=state;status.textContent=label;status.classList.add('show');
        hideTimer=setTimeout(()=>status.classList.remove('show'),state==='peak'?2100:1350);
      };

      bindBearingTutorial(d,w,stage);
      bindFirstLockTutorial(d,w,hint);

      const feedback=d.getElementById('feedback');
      if(feedback&&!w.__rx01OperatorFeedbackBound){
        w.__rx01OperatorFeedbackBound=true;
        let last=classify(feedback.textContent)?.key||null;
        const sync=()=>{
          const next=classify(feedback.textContent);
          if(!next){last=null;return}
          if(next.key===last)return;
          last=next.key;
          showStatus(next.key,next.label);
          if(next.key==='peak'&&!window.__rx01Level3LockTutorialDone){
            const lock=d.getElementById('lockHit');
            if(lock){
              lock.classList.add('rxLockPulse');
              hint.textContent='ENTER — LOCK';hint.classList.add('show');
            }
          }
        };
        new w.MutationObserver(sync).observe(feedback,{childList:true,subtree:true,characterData:true});
      }
    }catch(e){console.warn('RX-01 level 3 operator UI failed',e)}
  }

  window.RX01_APPLY_LEVEL3_OPERATOR_UI=apply;
  const frame=document.getElementById('frame');
  if(frame)frame.addEventListener('load',()=>apply(frame));
})();
