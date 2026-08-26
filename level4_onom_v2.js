(()=>{
  const PHRASES={
    p01:'Почнемо з карти. Для початку розберись із масштабом. Натисни «+», потім «−».',
    p02:'Добре. А тепер віддали карту назад.',
    p03:'От і все. Тепер карта повернута — приведи її до нормального положення. Натисни «ПІВНІЧ».',
    p04:'Добре. Північ угорі. Тепер увімкни GPS і визнач, де знаходимось ми.',
    p05:'Є. Наша позиція визначена. Тепер подивимось, що вже зробили сусіди. Відкрий МІСІЮ.',
    p06:'Пост «БРАВО» передав три результати пеленгування. Нанеси всі три на карту.',
    p07:'Перший є. Дивись, як напрямок лягає від позиції «БРАВО».',
    p08:'Другий нанесено. Уже бачимо сектор, де варто шукати.',
    p09:'Добре. Усі три пеленги «БРАВО» нанесені. Бери приймач. Натискай «НАЗАД» — переходимо до RX-01.',
    p10:'Введи значення.',p11:'Тепер шукай максимум.',p12:'Поруч. Дотягни сигнал.',p13:'Є щось. Дивись на шкалу.',p14:'Ні. Це не максимум.',p15:'Оце воно.',p16:'Наступне значення.',p17:'Останнє значення.',p18:'Ну добре. Напрямок уже ловиш.',p19:'А тепер я тобі навіть напрямок не скажу.',p20:'Дані зібрані. Повертайся на карту.',
    p21:'Пеленги БРАВО залишилися на карті. Тепер додамо наші. Відкрий ЖУРНАЛ.',
    p22:'Це наші результати. Проклацай усі три записи.',p23:'Є перший перетин.',p24:'Другий.',
    p25:'Оце вже робота. Три джерела локалізовано. Тепер визначимо відстань до кожного.',
    p26:'Лінійка активна. По черзі обери цілі A, B і C.',p27:'Замір прийнято. Залишилось цілей: 2.',p28:'Замір прийнято. Залишилось цілей: 1.',p29:'Усі три відстані є. Тепер звіт.',p30:'Відстані до всіх цілей заміряні. Формуй звіт на штаб.',p31:'Звіт пішов. Рівень виконано.',
    p32:'Спершу зорієнтуй карту. Без цього далі не йдемо.',p33:'Тисни GPS. Нехай планшет спочатку знайде нас.',p34:'Без GPS не поспішай. Спочатку визнач нашу позицію.',p35:'Спочатку визнач нашу позицію через GPS.',p36:'Я ж казав: спочатку північ.',p37:'Спочатку збери власні пеленги на RX-01.',p38:'Наш журнал поки недоступний. Спочатку збери власні пеленги на RX-01.',p39:'Тут можеш вмикати й вимикати потрібні шари карти.',p40:'Тут можеш прибрати зайве з карти, якщо заважає.',p41:'Тепер нанось наші пеленги. Шукай точки перетину.',p42:'Позицію маємо. Тепер працюємо з даними БРАВО.',p43:'Добре. Дані БРАВО на карті. Тепер нам потрібні власні пеленги.',p44:'Добре. Пеленги БРАВО нанесені. Тепер потрібні наші власні.',p45:'Ось дані екіпажу БРАВО. Нанось пеленги на карту по одному.',p46:'Ось пеленги екіпажу БРАВО. Нанось їх по одному.',p47:'Є. Нашу точку визначено. Відкривай місію БРАВО.',p48:'Оце вже робота. Джерела локалізовано — тепер бери лінійку.',p49:'Оце вже робота. Три джерела локалізовано — тепер бери лінійку.'
  };
  const norm=s=>(s||'').toLowerCase().replace(/[“”«»]/g,'').replace(/\s+/g,' ').trim();
  const style=`
    #rx01PetroOnoV2{position:absolute;z-index:99999;opacity:0;visibility:hidden;transform:translateY(10px) scale(.975) rotate(-1deg);transition:opacity .24s ease,transform .24s ease,visibility .24s;pointer-events:none;filter:drop-shadow(0 12px 22px rgba(0,0,0,.72));aspect-ratio:1.5/1}
    #rx01PetroOnoV2.show{opacity:1;visibility:visible;transform:translateY(0) scale(1) rotate(-1deg)}
    #rx01PetroOnoV2 .onoBorder,#rx01PetroOnoV2 .onoPaper{position:absolute;inset:0;clip-path:polygon(6% 9%,93% 2%,98% 8%,93% 74%,30% 78%,19% 95%,18% 79%,4% 81%,7% 11%)}
    #rx01PetroOnoV2 .onoBorder{background:#080807;transform:scale(1.018);transform-origin:center}
    #rx01PetroOnoV2 .onoPaper{inset:7px;background-color:#f4edd9;background-image:radial-gradient(circle,rgba(40,38,32,.36) 0 1.25px,transparent 1.55px),radial-gradient(circle,rgba(30,28,24,.19) 0 1px,transparent 1.3px),linear-gradient(96deg,rgba(130,105,70,.035),transparent 45%,rgba(130,105,70,.045));background-size:17px 17px,31px 29px,100% 100%;background-position:0 0,8px 11px,0 0}
    #rx01PetroOnoV2 .onoText{position:relative;z-index:2;display:flex;align-items:center;min-height:100%;padding:8% 11% 13% 13%;color:#241a14;font-family:'Arial Narrow','Roboto Condensed',Impact,Arial,sans-serif;font-weight:1000;font-style:italic;text-transform:uppercase;line-height:.98;letter-spacing:-.025em;text-shadow:-2px -2px 0 #f9f0dd,2px -2px 0 #f9f0dd,-2px 2px 0 #f9f0dd,2px 2px 0 #f9f0dd,3px 4px 0 rgba(18,13,9,.18)}
    #rx01PetroOnoV2[data-size='xl'] .onoText{font-size:clamp(24px,2.45vw,49px)}
    #rx01PetroOnoV2[data-size='lg'] .onoText{font-size:clamp(21px,2.05vw,42px)}
    #rx01PetroOnoV2[data-size='md'] .onoText{font-size:clamp(18px,1.72vw,35px)}
    #rx01PetroOnoV2[data-size='sm'] .onoText{font-size:clamp(15px,1.38vw,29px);line-height:1.01}
  `;
  function makeBubble(doc,mode){
    let box=doc.getElementById('rx01PetroOnoV2');if(box)return box;
    const st=doc.createElement('style');st.id='rx01PetroOnoV2Style';st.textContent=style+(mode==='map'?`#toast,.toast,#petrovychSpeech,.petrovychSpeech{display:none!important}#rx01PetroOnoV2{left:20%;bottom:2.5%;width:min(43vw,690px)}.instructorCard #petrovychSpeech{display:none!important}`:`#rxOno,#petroBox,#toast,.toast,.speech{display:none!important}#rx01PetroOnoV2{left:16%;top:7.5%;width:min(35vw,620px)}`);
    doc.head.appendChild(st);
    box=doc.createElement('div');box.id='rx01PetroOnoV2';box.dataset.size='md';box.innerHTML='<div class="onoBorder"></div><div class="onoPaper"></div><div class="onoText"></div>';
    (doc.getElementById('stage')||doc.getElementById('app')||doc.body).appendChild(box);return box;
  }
  function show(box,text){if(!text)return;const el=box.querySelector('.onoText');el.textContent=text;const n=text.length;box.dataset.size=n<28?'xl':n<55?'lg':n<100?'md':'sm';box.classList.add('show')}
  function mapResolve(raw){const s=norm(raw);if(!s)return '';
    if(s.includes('почнемо з карти'))return PHRASES.p01;if(s.includes('а тепер віддали'))return PHRASES.p02;
    if(s.includes('масштаб потрібен')||s.includes('карта повернута'))return PHRASES.p03;
    if(s.includes('північ угорі'))return PHRASES.p04;if(s.includes('наша позиція визначена'))return PHRASES.p05;
    if((s.includes('ось їхні дані')||s.includes('пост браво'))&&s.includes('пеленг'))return PHRASES.p06;
    if(s.includes('перший є')&&s.includes('напрямок'))return PHRASES.p07;if(s.includes('другий нанесено'))return PHRASES.p08;
    if((s.includes('усі три пеленги')&&s.includes('браво'))||s.includes('бери приймач'))return PHRASES.p09;
    if(s.includes('пеленги браво залишилися'))return PHRASES.p21;if(s.includes('це наші результати'))return PHRASES.p22;
    if(s.includes('перший перетин'))return PHRASES.p23;if(s==='другий.'||s==='другий')return PHRASES.p24;
    if(s.includes('три джерела локалізовано')&&s.includes('відстан'))return PHRASES.p25;
    if(s.includes('лінійка активна')||s.includes('увімкни лінійку')||s.includes('виміряй відстань'))return PHRASES.p26;
    if(s.includes('1/3')||s.includes('залишилось цілей: 2'))return PHRASES.p27;if(s.includes('2/3')||s.includes('залишилось цілей: 1'))return PHRASES.p28;
    if(s.includes('всі відстані є')||s.includes('усі три відстані є'))return PHRASES.p29;
    if((s.includes('формуй звіт')||s.includes('частоти є'))&&s.includes('відстан'))return PHRASES.p30;
    if(s.includes('от тепер усе')||s.includes('звіт пішов'))return PHRASES.p31;
    if(s.includes('спершу зорієнтуй'))return PHRASES.p32;if(s.includes('тисни gps'))return PHRASES.p33;if(s.includes('без gps'))return PHRASES.p34;
    if(s.includes('спочатку визнач нашу позицію'))return PHRASES.p35;if(s.includes('спочатку північ'))return PHRASES.p36;
    if(s.includes('спочатку збери власні'))return PHRASES.p37;if(s.includes('наш журнал')&&s.includes('недоступ'))return PHRASES.p38;
    if(s.includes('вмикати й вимикати')&&s.includes('шари'))return PHRASES.p39;if(s.includes('прибрати зайве'))return PHRASES.p40;
    if(s.includes('нанось наші пеленги'))return PHRASES.p41;if(s.includes('позицію маємо'))return PHRASES.p42;
    if(s.includes('дані браво на карті'))return PHRASES.p43;if(s.includes('пеленги браво нанесені'))return PHRASES.p44;
    if(s.includes('ось дані екіпажу браво'))return PHRASES.p45;if(s.includes('ось пеленги екіпажу браво'))return PHRASES.p46;
    if(s.includes('нашу точку визначено'))return PHRASES.p47;if(s.includes('джерела локалізовано')&&s.includes('лінійку'))return PHRASES.p49;
    return raw;
  }
  function rxResolve(raw){const s=norm(raw);if(!s)return '';
    if(s.includes('дані зібрані')||s.includes('три частоти підтверджені'))return PHRASES.p20;
    if(s.includes('а тепер я тобі навіть напрямок'))return PHRASES.p19;if(s.includes('ну добре')&&s.includes('напрямок'))return PHRASES.p18;
    if(s.includes('залишився останній')||s.includes('останнє значення'))return PHRASES.p17;
    if(s.includes('перший є')||s.includes('наступне значення'))return PHRASES.p16;if(s.includes('оце воно'))return PHRASES.p15;
    if(s.includes('поруч'))return PHRASES.p12;if(s.includes('є щось'))return PHRASES.p13;if(s.includes('не максимум'))return PHRASES.p14;
    if(s.includes('шукай максимум'))return PHRASES.p11;if(s.includes('перевір частоту')||s.includes('введи')||s.includes('частоти у тебе є')||s.includes('дивись на коло'))return PHRASES.p10;
    return raw;
  }
  window.RX01_APPLY_LEVEL4_ONO=(frame,mode)=>{
    try{
      const w=frame.contentWindow,d=frame.contentDocument;if(!w||!d||d.documentElement.dataset.rxOnoV2==='1')return;
      d.documentElement.dataset.rxOnoV2='1';const box=makeBubble(d,mode);
      if(mode==='map'){
        const original=w.setPetrovych;
        w.setPetrovych=function(emotion,msg){try{if(typeof original==='function')original.call(w,emotion,msg)}catch(_){}show(box,mapResolve(msg));};
        const speech=d.getElementById('petrovychSpeech');
        const initial=speech&&speech.textContent.trim();
        if(initial)show(box,mapResolve(initial));else{let rows=[];try{rows=JSON.parse(w.localStorage.getItem('rx01_level4_our_journal')||'[]')}catch(_){}show(box,Array.isArray(rows)&&rows.length>=3?PHRASES.p21:PHRASES.p01)}
        const toast=d.getElementById('toast');if(toast)new MutationObserver(()=>{const s=norm(toast.textContent);if(s.includes('спочатку увімкни gps'))show(box,PHRASES.p35);else if(s.includes('спочатку зорієнтуй')||s.includes('виконай поточний крок'))show(box,PHRASES.p32);else if(s.includes('спочатку локалізуй'))show(box,PHRASES.p48)}).observe(toast,{childList:true,subtree:true,characterData:true});
      }else{
        const petro=d.getElementById('petroText');if(petro){const sync=()=>show(box,rxResolve(petro.textContent));new MutationObserver(sync).observe(petro,{childList:true,subtree:true,characterData:true});sync()}else show(box,PHRASES.p10);
      }
    }catch(err){console.warn('Level4 Ono V2:',err)}
  };
})();
