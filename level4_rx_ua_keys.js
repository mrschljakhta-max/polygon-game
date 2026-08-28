(()=>{
  const RX_PATH='/stages/16_level4_rx.html';

  function bind(frame){
    try{
      const w=frame?.contentWindow,d=frame?.contentDocument;
      if(!w||!d||!d.body||!w.location.pathname.endsWith(RX_PATH))return;
      if(w.__rx01UaKeysBound)return;
      w.__rx01UaKeysBound=true;

      let holding=0;
      const direction=e=>{
        const k=(e.key||'').toLowerCase();
        if(e.code==='KeyA' && k!=='a')return -1;
        if(e.code==='KeyD' && k!=='d')return +1;
        if(k==='ф')return -1;
        if(k==='в')return +1;
        return 0;
      };

      w.addEventListener('keydown',e=>{
        if(d.body.classList.contains('rx-calibration'))return;
        const dir=direction(e);
        if(!dir)return;
        const api=w.RX01_DF_CONTROL;
        if(!api)return;
        const state=api.getState?.();
        if(state?.frequencySetupOpen)return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        if(e.repeat||holding===dir)return;
        if(holding)api.stop?.();
        holding=dir;
        if(dir<0)api.leftDown?.();
        else api.rightDown?.();
      },true);

      w.addEventListener('keyup',e=>{
        const dir=direction(e);
        if(!dir)return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if(holding){
          holding=0;
          w.RX01_DF_CONTROL?.stop?.();
        }
      },true);

      w.addEventListener('blur',()=>{
        if(!holding)return;
        holding=0;
        w.RX01_DF_CONTROL?.stop?.();
      });
    }catch(err){
      console.warn('RX-01 Ukrainian A/D keyboard patch failed',err);
    }
  }

  window.RX01_BIND_LEVEL4_UA_KEYS=bind;
  const frame=document.getElementById('frame');
  if(frame){
    frame.addEventListener('load',()=>bind(frame));
    setTimeout(()=>bind(frame),0);
  }
})();