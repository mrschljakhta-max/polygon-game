(()=>{
  const LEVEL1_PATH='/stages/02_level1.html';
  const LEVEL3_TASK_PATHS=[
    '/stages/07_level3_tasks_01_05.html',
    '/stages/08_level3_task_06.html',
    '/stages/09_level3_task_07.html',
    '/stages/10_level3_task_08.html',
    '/stages/11_level3_task_09.html',
    '/stages/13_level3_task_10.html'
  ];
  const LEVEL1_TUTORIAL_RECTS=[
    [30.6,31.4,34,29],
    [30.6,31.4,34,29],
    [29.4,66.4,25.329,11],
    [70.8,39.7,17.8965,34.6584],
    [55.6123,65.3231,9.236,14.2491]
  ];

  const LEVEL1_CSS=`
    #displayOverlay{left:30.7274% !important;top:33.5071% !important;width:33.8545% !important;height:28.6472% !important}
    #uHz{left:29.7757% !important;top:66.656% !important;width:5.1666% !important;height:10.0266% !important}
    #ukHz{left:35.758% !important;top:66.2468% !important;width:5.8464% !important;height:9.8219% !important}
    #uMHz{left:42.2842% !important;top:66.4514% !important;width:5.0306% !important;height:9.4127% !important}
    #uGHz{left:49.0823% !important;top:66.4514% !important;width:4.6227% !important;height:9.4127% !important}
    #lock{left:56.1523% !important;top:66.0421% !important;width:8.0218% !important;height:13.5051% !important}
    #k7{left:71.38% !important;top:40.2596% !important;width:4.4867% !important;height:7.1618% !important}
    #k8{left:76.9545% !important;top:40.055% !important;width:4.8946% !important;height:7.3664% !important}
    #k9{left:83.2087% !important;top:40.4642% !important;width:4.3508% !important;height:6.5479% !important}
    #k4{left:71.1081% !important;top:49.263% !important;width:4.7587% !important;height:6.3433% !important}
    #k5{left:77.2264% !important;top:49.0584% !important;width:4.6227% !important;height:7.3664% !important}
    #k6{left:82.9368% !important;top:49.0584% !important;width:5.0306% !important;height:6.7526% !important}
    #k1{left:71.244% !important;top:58.0618% !important;width:5.0306% !important;height:6.9572% !important}
    #k2{left:77.2264% !important;top:58.2665% !important;width:4.6227% !important;height:6.3433% !important}
    #k3{left:83.0727% !important;top:57.6526% !important;width:4.8946% !important;height:7.3664% !important}
    #kdot{left:70.9721% !important;top:67.0653% !important;width:4.8946% !important;height:7.5711% !important}
    #k0{left:77.2264% !important;top:66.656% !important;width:4.7587% !important;height:6.7526% !important}
    #kback{left:82.9368% !important;top:67.0653% !important;width:5.1666% !important;height:6.7526% !important}
  `;

  const LEVEL3_LCD_CSS=`
    #taskPanel{
      color:#061006 !important;
      font-family:"Courier New",monospace !important;
      font-weight:1000 !important;
      padding:2.7% !important;
      text-shadow:0 1px 0 rgba(210,255,170,.45),0 0 1px #071207 !important;
      filter:contrast(1.45) !important;
      -webkit-font-smoothing:none;
      text-rendering:geometricPrecision;
    }
    #taskTitle{
      font-size:clamp(18px,2.35vw,39px) !important;
      font-weight:1000 !important;
      line-height:1.02 !important;
      letter-spacing:.045em !important;
    }
    #taskText{
      margin-top:4.5% !important;
      font-size:clamp(13px,1.65vw,27px) !important;
      font-weight:1000 !important;
      line-height:1.18 !important;
      letter-spacing:.015em !important;
      transform:scaleX(1.10) !important;
      transform-origin:center center !important;
    }
    #taskProgress{
      margin-top:5.5% !important;
      font-size:clamp(11px,1.15vw,19px) !important;
      font-weight:1000 !important;
      letter-spacing:.16em !important;
    }
    #taskState{
      margin-top:3.5% !important;
      font-size:clamp(11px,1.1vw,18px) !important;
      font-weight:1000 !important;
      letter-spacing:.03em !important;
    }
  `;

  function bindLevel1Keyboard(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w||w.__rx01Level1KeyboardBound)return;
      w.__rx01Level1KeyboardBound=true;

      w.addEventListener('keydown',e=>{
        if(e.ctrlKey||e.altKey||e.metaKey)return;

        if(e.key==='Escape'){
          e.preventDefault();
          e.stopPropagation();
          window.location.href='./#levels';
          return;
        }

        const hud=d.querySelector('#hud');
        const gameOver=d.querySelector('#gameOver');
        const gameplayActive=!!hud&&!hud.classList.contains('hidden')&&(!gameOver||gameOver.classList.contains('hidden'));
        if(!gameplayActive)return;

        let target=null;
        if(/^[0-9]$/.test(e.key)){
          target=d.querySelector(`[data-key="${e.key}"]`);
        }else if(e.key==='.'||e.key===','||e.code==='NumpadDecimal'){
          target=d.querySelector('#kdot');
        }else if(e.key==='Backspace'){
          target=d.querySelector('#kback');
        }else if(e.key==='Enter'||e.code==='NumpadEnter'){
          target=d.querySelector('#lock');
        }

        if(!target)return;
        e.preventDefault();
        e.stopPropagation();
        target.click();
      },true);
    }catch(e){console.warn('RX-01 level 1 keyboard shortcuts failed',e)}
  }

  function applyLevel1Geometry(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w)return;
      if(!w.location.pathname.endsWith(LEVEL1_PATH))return;

      let st=d.getElementById('rx01Level1GeometryPreset');
      if(!st){
        st=d.createElement('style');
        st.id='rx01Level1GeometryPreset';
        d.head.appendChild(st);
      }
      st.textContent=LEVEL1_CSS;

      const rects=JSON.stringify(LEVEL1_TUTORIAL_RECTS);
      w.eval(`(()=>{try{const r=${rects};if(typeof tutSteps!=='undefined'){for(let i=0;i<r.length;i++){if(tutSteps[i])tutSteps[i].hl=r[i];}if(typeof showTut==='function'&&typeof ts!=='undefined'&&document.querySelector('#tutorial:not(.hidden)'))showTut();}}catch(e){console.warn('RX-01 level 1 tutorial geometry patch failed',e)}})();`);
      bindLevel1Keyboard(frame);
    }catch(e){console.warn('RX-01 level 1 geometry preset failed',e)}
  }

  function applyLevel3LCD(frame){
    try{
      const d=frame?.contentDocument;
      const w=frame?.contentWindow;
      if(!d||!w)return;
      if(!LEVEL3_TASK_PATHS.some(path=>w.location.pathname.endsWith(path)))return;
      if(!d.getElementById('taskPanel'))return;

      let st=d.getElementById('rx01Level3LCDPreset');
      if(!st){
        st=d.createElement('style');
        st.id='rx01Level3LCDPreset';
        d.head.appendChild(st);
      }
      st.textContent=LEVEL3_LCD_CSS;
    }catch(e){console.warn('RX-01 level 3 LCD preset failed',e)}
  }

  window.RX01_APPLY_LEVEL1_GEOMETRY=applyLevel1Geometry;
  window.RX01_APPLY_LEVEL3_LCD=applyLevel3LCD;

  const frame=document.getElementById('frame');
  if(frame){
    frame.addEventListener('load',()=>{
      applyLevel1Geometry(frame);
      applyLevel3LCD(frame);
    });
  }

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