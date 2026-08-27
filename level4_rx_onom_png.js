(()=>{
  const previousApply=window.RX01_APPLY_LEVEL4_ONO;
  const ROOT='../assets/level4/onomatopoeia/rx/';
  const FILES={
    p10:'01_10_input_value.png',
    p11:'02_11_find_maximum.png',
    p12:'03_12_close_pull_signal.png',
    p13:'04_13_watch_scale.png',
    p14:'05_14_not_maximum.png',
    p15:'06_15_got_it.png',
    p16:'07_16_next_value.png',
    p17:'08_17_last_value.png',
    p18:'09_18_direction_skill.png',
    p19:'10_19_no_direction_hint.png',
    p20:'11_20_return_map.png'
  };
  const PHRASES={
    p10:'Введи значення.',
    p11:'Тепер шукай максимум.',
    p12:'Поруч. Дотягни сигнал.',
    p13:'Є щось. Дивись на шкалу.',
    p14:'Ні. Це не максимум.',
    p15:'Оце воно.',
    p16:'Наступне значення.',
    p17:'Останнє значення.',
    p18:'Ну добре. Напрямок уже ловиш.',
    p19:'А тепер я тобі навіть напрямок не скажу.',
    p20:'Дані зібрані. Повертайся на карту.'
  };
  const WIDTHS={p10:300,p11:330,p12:340,p13:340,p14:330,p15:300,p16:330,p17:315,p18:365,p19:405,p20:370};
  const norm=s=>(s||'').toLowerCase().replace(/[“”«»]/g,'').replace(/\s+/g,' ').trim();
  const exact=Object.fromEntries(Object.entries(PHRASES).map(([id,text])=>[norm(text),id]));

  function resolve(raw){
    const s=norm(raw); if(!s)return null;
    if(exact[s])return exact[s];
    if(s.includes('дані зібрані')||s.includes('три частоти підтверджені'))return'p20';
    if(s.includes('а тепер я тобі навіть напрямок'))return'p19';
    if(s.includes('ну добре')&&s.includes('напрямок'))return'p18';
    if(s.includes('залишився останній')||s.includes('останнє значення'))return'p17';
    if(s.includes('перший є')||s.includes('наступне значення'))return'p16';
    if(s.includes('оце воно'))return'p15';
    if(s.includes('не максимум'))return'p14';
    if(s.includes('є щось')||s.includes('дивись на шкалу'))return'p13';
    if(s.includes('поруч')||s.includes('дотягни сигнал'))return'p12';
    if(s.includes('шукай максимум'))return'p11';
    if(s.includes('перевір частоту')||s.includes('введи')||s.includes('частоти у тебе є')||s.includes('дивись на коло'))return'p10';
    return null;
  }

  function applyRx(frame){
    const w=frame&&frame.contentWindow,d=frame&&frame.contentDocument;
    if(!w||!d||!d.head||d.documentElement.dataset.rxOnoPng==='1')return;
    d.documentElement.dataset.rxOnoPng='1';

    const base=new URL(ROOT,d.baseURI);
    const urlFor=id=>FILES[id]?new URL(FILES[id],base).href:null;

    const style=d.createElement('style');
    style.id='rx01RxOnoPngStyle';
    style.textContent=`
      #rx01RxOnoPng{
        position:absolute;
        left:31.4%;
        top:20.6%;
        z-index:100000;
        width:300px;
        max-width:43vw;
        opacity:0;
        visibility:hidden;
        transform:translate(-50%,-50%) scale(.97);
        transform-origin:center center;
        transition:opacity .20s ease,transform .20s ease,visibility .20s;
        pointer-events:none;
        filter:drop-shadow(0 10px 14px rgba(0,0,0,.30));
      }
      #rx01RxOnoPng.show{
        opacity:1;
        visibility:visible;
        transform:translate(-50%,-50%) scale(1);
      }
      #rx01RxOnoPng img{display:block;width:100%;height:auto;object-fit:contain}
      html.rx01-rx-png-ready #rx01PetroOnoV2,
      html.rx01-rx-png-ready #rx01PetroOnoV3,
      html.rx01-rx-png-ready #rxOno,
      html.rx01-rx-png-ready #petroBox,
      html.rx01-rx-png-ready .speech{display:none!important}
      @media(max-width:1100px){#rx01RxOnoPng{max-width:34vw}}
    `;
    d.head.appendChild(style);

    const box=d.createElement('div');
    box.id='rx01RxOnoPng';
    const img=d.createElement('img');
    img.alt='Репліка Петровича';
    img.decoding='async';
    img.draggable=false;
    box.appendChild(img);
    (d.getElementById('stage')||d.getElementById('app')||d.body).appendChild(box);

    let current=null;
    let pendingToken=0;
    function showId(id){
      const src=urlFor(id); if(!src)return;
      if(id===current&&box.classList.contains('show'))return;
      current=id;
      const token=++pendingToken;
      box.classList.remove('show');
      box.style.width=(WIDTHS[id]||330)+'px';
      img.onload=()=>{
        if(token!==pendingToken)return;
        d.documentElement.classList.add('rx01-rx-png-ready');
        requestAnimationFrame(()=>box.classList.add('show'));
      };
      img.onerror=()=>{
        if(token!==pendingToken)return;
        d.documentElement.classList.remove('rx01-rx-png-ready');
        box.classList.remove('show');
        console.warn('Level 4 RX onomatopoeia PNG missing:',src);
      };
      img.src=src+'?v=20260827-rx-png-1';
      if(img.complete&&img.naturalWidth)img.onload();
    }

    function syncFromText(text){const id=resolve(text);if(id)showId(id)}

    const generated=d.getElementById('rx01PetroOnoV2');
    const generatedText=generated&&generated.querySelector('.onoText');
    if(generatedText){
      const sync=()=>syncFromText(generatedText.textContent);
      new MutationObserver(sync).observe(generatedText,{childList:true,subtree:true,characterData:true});
      sync();
    }else{
      const petro=d.getElementById('petroText');
      if(petro){
        const sync=()=>syncFromText(petro.textContent);
        new MutationObserver(sync).observe(petro,{childList:true,subtree:true,characterData:true});
        sync();
      }else showId('p10');
    }

    Object.keys(FILES).forEach(id=>{const pre=new Image();pre.src=urlFor(id)+'?v=20260827-rx-png-1'});
  }

  window.RX01_APPLY_LEVEL4_ONO=(frame,mode)=>{
    const result=typeof previousApply==='function'?previousApply(frame,mode):undefined;
    if(mode==='rx'){
      try{applyRx(frame)}catch(err){console.warn('Level 4 RX PNG onomatopoeia:',err)}
    }
    return result;
  };
})();
