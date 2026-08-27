(()=>{
  const previous=window.RX01_APPLY_LEVEL4_ONO;
  window.RX01_APPLY_LEVEL4_ONO=(frame,mode)=>{
    const result=typeof previous==='function'?previous(frame,mode):undefined;
    if(mode!=='rx')return result;
    try{
      const d=frame.contentDocument;
      if(!d)return result;
      let st=d.getElementById('rx01OnoGeometryPreset');
      if(!st){
        st=d.createElement('style');
        st.id='rx01OnoGeometryPreset';
        d.head.appendChild(st);
      }
      st.textContent=`
        #rx01PetroOnoV2,
        #rx01PetroOnoV2.show{
          left:31.4% !important;
          top:20.6% !important;
          bottom:auto !important;
          width:300px !important;
          max-width:none !important;
          opacity:1;
          transform:translate(-50%,-50%) rotate(0deg) !important;
          transform-origin:center center !important;
          filter:drop-shadow(0 10px 14px rgba(0,0,0,.30)) !important;
        }
      `;
    }catch(e){console.warn('RX onomatopoeia geometry preset failed',e)}
    return result;
  };
})();