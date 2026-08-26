(()=>{
  const oldApply=window.RX01_APPLY_LEVEL4_ONO;
  const norm=s=>(s||'').toLowerCase().replace(/[“”«»]/g,'').replace(/\s+/g,' ').trim();

  const MAIN={
    p01:'01_01_scale_start.png',
    p02:'02_02_zoom_back.png',
    p03:'03_03_north.png',
    p04:'04_04_gps.png',
    p05:'05_05_open_mission.png',
    p06:'06_06_bravo_task.png',
    p07:'07_07_bravo_first.png',
    p08:'08_08_bravo_second.png',
    p09:'09_09_bravo_complete.png',
    p21:'10_10_return_map.png',
    p22:'11_11_journal.png',
    p23:'12_12_intersection_first.png',
    p24:'13_13_intersection_second.png',
    p25:'14_14_sources_complete.png',
    p26:'15_15_ruler.png',
    p27:'16_16_measure_one.png',
    p28:'17_17_measure_two.png',
    p29:'18_18_measure_complete.png',
    p30:'19_19_report.png',
    p31:'20_20_final.png'
  };
  const AUX={
    p32:'01_21_orient_first.png',
    p33:'02_22_press_gps.png',
    p34:'03_23_no_gps.png',
    p35:'04_24_gps_position.png',
    p36:'05_25_north_first.png',
    p37:'06_26_get_rx_bearings.png',
    p38:'07_27_journal_locked.png',
    p39:'08_28_layers.png',
    p40:'09_29_clear_map.png',
    p41:'10_30_plot_own.png',
    p42:'11_31_position_ready.png',
    p43:'12_32_bravo_ready.png',
    p44:'13_33_bravo_done.png',
    p45:'14_34_bravo_data.png',
    p46:'15_35_bravo_bearings.png',
    p47:'16_36_open_bravo.png',
    p48:'17_37_sources_ruler.png',
    p49:'18_38_three_sources_ruler.png'
  };

  function resolve(raw){
    const s=norm(raw); if(!s)return null;
    if(s.includes('почнемо з карти'))return'p01';
    if(s.includes('а тепер віддали'))return'p02';
    if(s.includes('масштаб потрібен')||s.includes('карта повернута')||s.includes('приведи її до нормального'))return'p03';
    if(s.includes('північ угорі'))return'p04';
    if(s.includes('наша позиція визначена')&&s.includes('сусіди'))return'p05';
    if((s.includes('ось їхні дані')||s.includes('пост браво'))&&s.includes('пеленг'))return'p06';
    if(s.includes('перший є')&&s.includes('напрямок'))return'p07';
    if(s.includes('другий нанесено'))return'p08';
    if((s.includes('усі три пеленги')&&s.includes('браво'))||s.includes('бери приймач'))return'p09';

    if(s.includes('пеленги браво залишилися'))return'p21';
    if(s.includes('це наші результати'))return'p22';
    if(s.includes('перший перетин'))return'p23';
    if(s==='другий.'||s==='другий')return'p24';
    if(s.includes('три джерела локалізовано')&&s.includes('відстан'))return'p25';
    if(s.includes('лінійка активна')||s.includes('увімкни лінійку')||s.includes('виміряй відстань'))return'p26';
    if(s.includes('1/3')||s.includes('залишилось цілей: 2')||s.includes('залишилося цілей: 2'))return'p27';
    if(s.includes('2/3')||s.includes('залишилось цілей: 1')||s.includes('залишилося цілей: 1'))return'p28';
    if(s.includes('всі відстані є')||s.includes('усі три відстані є')||s.includes('даних достатньо для доповіді'))return'p29';
    if((s.includes('формуй звіт')||s.includes('частоти є'))&&s.includes('відстан'))return'p30';
    if(s.includes('от тепер усе')||s.includes('звіт пішов')||s.includes('рівень виконано'))return'p31';

    if(s.includes('спершу зорієнтуй')||s.includes('виконай поточний крок'))return'p32';
    if(s.includes('тисни gps')||s.includes('нехай планшет спочатку знайде нас'))return'p33';
    if(s.includes('без gps'))return'p34';
    if(s.includes('спочатку визнач нашу позицію')||s.includes('спочатку увімкни gps'))return'p35';
    if(s.includes('спочатку північ')||s.includes('я ж казав'))return'p36';
    if(s.includes('спочатку збери власні'))return'p37';
    if(s.includes('наш журнал')&&s.includes('недоступ'))return'p38';
    if(s.includes('вмикати й вимикати')&&s.includes('шари'))return'p39';
    if(s.includes('прибрати зайве'))return'p40';
    if(s.includes('нанось наші пеленги')||s.includes('точки перетину'))return'p41';
    if(s.includes('позицію маємо'))return'p42';
    if(s.includes('дані браво на карті'))return'p43';
    if(s.includes('пеленги браво нанесені'))return'p44';
    if(s.includes('ось дані екіпажу браво'))return'p45';
    if(s.includes('ось пеленги екіпажу браво'))return'p46';
    if(s.includes('нашу точку визначено'))return'p47';
    if(s.includes('три джерела локалізовано')&&s.includes('лінійку'))return'p49';
    if((s.includes('джерела локалізовано')||s.includes('спочатку локалізуй'))&&s.includes('ліній'))return'p48';
    return null;
  }

  function applyMap(frame){
    const w=frame.contentWindow,d=frame.contentDocument;
    if(!w||!d||d.documentElement.dataset.rxMapOnoPng==='1')return;
    d.documentElement.dataset.rxMapOnoPng='1';

    const mainBase=new URL('../assets/level4/onomatopoeia/main/',d.baseURI);
    const auxBase=new URL('../assets/level4/onomatopoeia/aux/',d.baseURI);
    const urlFor=id=>MAIN[id]?new URL(MAIN[id],mainBase).href:AUX[id]?new URL(AUX[id],auxBase).href:null;

    const st=d.createElement('style');
    st.id='rx01MapOnoPngStyle';
    st.textContent=`
      #rx01PetroOnoV2,#rx01PetroOnoV3,#toast,.toast,#petrovychSpeech,.petrovychSpeech{display:none!important}
      .instructorCard #petrovychSpeech{display:none!important}
      #rx01MapOnoPng{
        position:absolute;
        left:26.9%;
        top:34.6%;
        z-index:99999;
        width:293px;
        opacity:0;
        visibility:hidden;
        transform:translate(-50%,-50%) rotate(-4.9deg);
        transform-origin:center center;
        transition:opacity .2s ease,visibility .2s;
        pointer-events:none;
        filter:drop-shadow(0 10px 14px rgba(0,0,0,.28));
      }
      #rx01MapOnoPng.show{opacity:1;visibility:visible}
      #rx01MapOnoPng img{display:block;width:100%;height:auto;object-fit:contain}
    `;
    d.head.appendChild(st);

    const old2=d.getElementById('rx01PetroOnoV2'); if(old2)old2.remove();
    const old2Style=d.getElementById('rx01PetroOnoV2Style'); if(old2Style)old2Style.remove();
    const old3=d.getElementById('rx01PetroOnoV3'); if(old3)old3.remove();

    const box=d.createElement('div');box.id='rx01MapOnoPng';
    const img=d.createElement('img');img.alt='Репліка Петровича';img.decoding='async';
    box.appendChild(img);
    (d.getElementById('stage')||d.getElementById('app')||d.body).appendChild(box);

    let current=null;
    function showId(id){
      const src=urlFor(id);if(!src||id===current)return;
      current=id;box.classList.remove('show');
      const reveal=()=>{box.classList.add('show')};
      img.onload=reveal;img.onerror=()=>{console.warn('Level4 PNG onomatopoeia missing:',src)};
      img.src=src;
      if(img.complete&&img.naturalWidth)requestAnimationFrame(reveal);
    }
    function showRaw(raw){const id=resolve(raw);if(id)showId(id);return id}

    [...Object.keys(MAIN),...Object.keys(AUX)].forEach(id=>{const src=urlFor(id);if(src){const pre=new Image();pre.src=src}});

    if(typeof w.setPetrovych==='function'){
      const original=w.setPetrovych;
      w.setPetrovych=function(emotion,msg){
        try{original.call(w,emotion,msg)}catch(_){ }
        showRaw(msg);
      };
    }

    const speech=d.getElementById('petrovychSpeech');
    if(speech){
      const sync=()=>showRaw(speech.textContent);
      new MutationObserver(sync).observe(speech,{childList:true,subtree:true,characterData:true});
      sync();
    }

    const toast=d.getElementById('toast');
    if(toast){
      const syncToast=()=>{
        const s=norm(toast.textContent);let id=resolve(toast.textContent);
        if(!id&&s.includes('спочатку увімкни gps'))id='p35';
        else if(!id&&(s.includes('спочатку зорієнтуй')||s.includes('виконай поточний крок')))id='p32';
        else if(!id&&s.includes('журнал')&&s.includes('недоступ'))id='p38';
        else if(!id&&(s.includes('спочатку локалізуй')||(s.includes('лінійка')&&s.includes('недоступ'))))id='p48';
        if(id)showId(id);
      };
      new MutationObserver(syncToast).observe(toast,{childList:true,subtree:true,characterData:true});
    }

    if(!current){
      let rows=[];try{rows=JSON.parse(w.localStorage.getItem('rx01_level4_our_journal')||'[]')}catch(_){ }
      showId(Array.isArray(rows)&&rows.length>=3?'p21':'p01');
    }
  }

  window.RX01_APPLY_LEVEL4_ONO=(frame,mode)=>{
    if(mode==='map')return applyMap(frame);
    if(typeof oldApply==='function')return oldApply(frame,mode);
  };
})();