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

    return result;
  };
})();