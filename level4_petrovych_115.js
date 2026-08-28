(()=>{
  const previousApply=window.RX01_APPLY_LEVEL4_ONO;

  function enlargePetrovych(frame){
    const d=frame&&frame.contentDocument;
    if(!d||!d.head)return;

    let style=d.getElementById('rx01Petrovych115Style');
    if(!style){
      style=d.createElement('style');
      style.id='rx01Petrovych115Style';
      style.textContent=`
        #petrovychImg,
        .instructorCard .petrovychImg{
          width:96.6%!important;
          max-height:219px!important;
        }
      `;
      d.head.appendChild(style);
    }
  }

  window.RX01_APPLY_LEVEL4_ONO=(frame,mode)=>{
    const result=typeof previousApply==='function'
      ? previousApply(frame,mode)
      : undefined;

    if(mode==='map'){
      enlargePetrovych(frame);
      requestAnimationFrame(()=>enlargePetrovych(frame));
      setTimeout(()=>enlargePetrovych(frame),120);
    }

    if(mode==='rx'){
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_LAYOUT?.(frame),0);
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_LAYOUT?.(frame),180);
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_LAYOUT?.(frame),700);
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_SERVICE_PANEL?.(frame),0);
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_SERVICE_PANEL?.(frame),180);
      setTimeout(()=>window.RX01_APPLY_LEVEL4_RX_SERVICE_PANEL?.(frame),700);
    }

    return result;
  };

  if(!document.querySelector('script[data-rx01-rx-onom-png]')){
    const script=document.createElement('script');
    script.src='level4_rx_onom_png.js?v=20260827-rx-png-2';
    script.dataset.rx01RxOnomPng='1';
    script.async=true;
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-rx01-rx-layout-v2]')){
    const script=document.createElement('script');
    script.src='level4_rx_layout_v2.js?v=20260828-layout-v2-hotfix-1';
    script.dataset.rx01RxLayoutV2='1';
    script.async=false;
    document.head.appendChild(script);
  }

  if(!document.querySelector('script[data-rx01-service-panel-v1]')){
    const script=document.createElement('script');
    script.src='level4_rx_service_panel_v1.js?v=20260827-service-panel-1';
    script.dataset.rx01ServicePanelV1='1';
    script.async=false;
    document.head.appendChild(script);
  }
})();