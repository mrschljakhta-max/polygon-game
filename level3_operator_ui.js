(()=>{
  const LEVEL3_TASK_PATHS=[
    '/stages/07_level3_tasks_01_05.html',
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
      background:rgba(8,9,7,.86);
      border:1px solid rgba(206,163,41,.66);
      color:#d8c995;
      font:900 clamp(9px,.82vw,13px)/1.1 "Courier New",monospace;
      letter-spacing:.035em;text-shadow:1px 1px 0 #000;
    }
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

  function apply(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w)return;
      if(!LEVEL3_TASK_PATHS.some(path=>w.location.pathname.endsWith(path)))return;
      if(!d.getElementById('stage'))return;

      let style=d.getElementById('rxOperatorUiStyle');
      if(!style){
        style=d.createElement('style');
        style.id='rxOperatorUiStyle';
        d.head.appendChild(style);
      }
      style.textContent=CSS;

      const stage=d.getElementById('stage');
      let status=d.getElementById('rxOperatorStatus');
      if(!status){
        status=d.createElement('div');
        status.id='rxOperatorStatus';
        stage.appendChild(status);
      }
      let hint=d.getElementById('rxOperatorHint');
      if(!hint){
        hint=d.createElement('div');
        hint.id='rxOperatorHint';
        hint.textContent='← → / A D — ПЕЛЕНГ · ENTER — LOCK';
        stage.appendChild(hint);
      }

      let hideTimer=null;
      const showStatus=(state,label)=>{
        clearTimeout(hideTimer);
        status.dataset.state=state;
        status.textContent=label;
        status.classList.add('show');
        hideTimer=setTimeout(()=>status.classList.remove('show'),state==='peak'?1900:1350);
      };

      if(!window.__rx01Level3ControlsShown){
        window.__rx01Level3ControlsShown=true;
        setTimeout(()=>hint.classList.add('show'),700);
        setTimeout(()=>hint.classList.remove('show'),5000);
      }

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
        };
        new w.MutationObserver(sync).observe(feedback,{childList:true,subtree:true,characterData:true});
      }
    }catch(e){console.warn('RX-01 level 3 operator UI failed',e)}
  }

  window.RX01_APPLY_LEVEL3_OPERATOR_UI=apply;
  const frame=document.getElementById('frame');
  if(frame)frame.addEventListener('load',()=>apply(frame));
})();
