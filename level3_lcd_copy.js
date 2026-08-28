(()=>{
  const COPY={
    '/stages/08_level3_task_06.html':'ЗНАЙДИ СИГНАЛ',
    '/stages/09_level3_task_07.html':'ВІДСІЙ ХИБНІ ПІКИ',
    '/stages/10_level3_task_08.html':'ЗНАЙДИ СПРАВЖНІЙ ПІК',
    '/stages/11_level3_task_09.html':'ЗНАЙДИ ЦІЛЬОВИЙ СИГНАЛ'
  };

  const CSS=`
    @media (orientation:landscape) and (max-height:500px){
      body.rxShortLcdCopy #taskPanel{padding:2.6% 4%!important}
      body.rxShortLcdCopy #taskTitle,
      body.rxShortLcdCopy #taskProgress,
      body.rxShortLcdCopy #taskState{display:none!important}
      body.rxShortLcdCopy #taskText{
        margin:0!important;
        font-size:clamp(13px,1.65vw,20px)!important;
        line-height:1.22!important;
        letter-spacing:.045em!important;
        white-space:normal!important;
        text-wrap:balance;
      }
    }
  `;

  function apply(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w)return;
      const copy=COPY[w.location.pathname];
      if(!copy)return;
      if(!w.matchMedia('(orientation:landscape) and (max-height:500px)').matches)return;
      const taskText=d.getElementById('taskText');
      if(!taskText)return;

      d.body?.classList.add('rxShortLcdCopy');
      let style=d.getElementById('rxShortLcdCopyStyle');
      if(!style){
        style=d.createElement('style');
        style.id='rxShortLcdCopyStyle';
        d.head.appendChild(style);
      }
      style.textContent=CSS;

      let syncing=false;
      const sync=()=>{
        if(syncing||taskText.textContent===copy)return;
        syncing=true;
        taskText.textContent=copy;
        syncing=false;
      };
      sync();
      if(!w.__rx01ShortLcdCopyBound){
        w.__rx01ShortLcdCopyBound=true;
        new w.MutationObserver(sync).observe(taskText,{childList:true,subtree:true,characterData:true});
      }
    }catch(e){console.warn('RX-01 short LCD copy failed',e)}
  }

  window.RX01_APPLY_LEVEL3_LCD_COPY=apply;
  const frame=document.getElementById('frame');
  if(frame)frame.addEventListener('load',()=>apply(frame));
})();
