from pathlib import Path
import re

MAP = Path('stages/15_level4_map.html')
RX  = Path('stages/16_level4_rx.html')
GAME = Path('game.html')

map_html = MAP.read_text(encoding='utf-8')
rx_html = RX.read_text(encoding='utf-8')

def strip_block(text, begin, end):
    return re.sub(re.escape(begin)+r'[\s\S]*?'+re.escape(end), '', text)

MAP_BEGIN='<!-- LEVEL4_PETRO_ONO_V2_BEGIN -->'
MAP_END='<!-- LEVEL4_PETRO_ONO_V2_END -->'
RX_BEGIN='<!-- LEVEL4_PETRO_ONO_V2_BEGIN -->'
RX_END='<!-- LEVEL4_PETRO_ONO_V2_END -->'
map_html=strip_block(map_html, MAP_BEGIN, MAP_END)
rx_html=strip_block(rx_html, RX_BEGIN, RX_END)

shared_css = r'''
.petroOnoV2{position:absolute;z-index:9999;opacity:0;visibility:hidden;transform:translateY(10px) scale(.975) rotate(-1deg);transition:opacity .24s ease,transform .24s ease,visibility .24s;pointer-events:none;filter:drop-shadow(0 12px 22px rgba(0,0,0,.72));}
.petroOnoV2.show{opacity:1;visibility:visible;transform:translateY(0) scale(1) rotate(-1deg)}
.petroOnoV2 .onoBorder,.petroOnoV2 .onoPaper{position:absolute;inset:0;clip-path:polygon(6% 9%,93% 2%,98% 8%,93% 74%,30% 78%,19% 95%,18% 79%,4% 81%,7% 11%)}
.petroOnoV2 .onoBorder{background:#090908;transform:scale(1.018);transform-origin:center}
.petroOnoV2 .onoPaper{inset:7px;background-color:#f4edd9;background-image:radial-gradient(circle,rgba(40,38,32,.38) 0 1.2px,transparent 1.5px),radial-gradient(circle,rgba(30,28,24,.2) 0 1px,transparent 1.3px),linear-gradient(96deg,rgba(130,105,70,.035),transparent 45%,rgba(130,105,70,.045));background-size:17px 17px,31px 29px,100% 100%;background-position:0 0,8px 11px,0 0;}
.petroOnoV2 .onoText{position:relative;z-index:2;display:flex;align-items:center;min-height:100%;padding:8% 11% 13% 13%;color:#241a14;font-family:"Arial Narrow","Roboto Condensed",Impact,Arial,sans-serif;font-weight:1000;font-style:italic;text-transform:uppercase;line-height:.98;letter-spacing:-.025em;text-shadow:-2px -2px 0 #f9f0dd,2px -2px 0 #f9f0dd,-2px 2px 0 #f9f0dd,2px 2px 0 #f9f0dd,3px 4px 0 rgba(18,13,9,.18);}
.petroOnoV2[data-size="xl"] .onoText{font-size:clamp(24px,2.45vw,49px)}
.petroOnoV2[data-size="lg"] .onoText{font-size:clamp(21px,2.05vw,42px)}
.petroOnoV2[data-size="md"] .onoText{font-size:clamp(18px,1.72vw,35px)}
.petroOnoV2[data-size="sm"] .onoText{font-size:clamp(15px,1.38vw,29px);line-height:1.01}
@media(max-width:900px){.petroOnoV2 .onoText{padding:8% 10% 13% 12%}.petroOnoV2[data-size="sm"] .onoText{font-size:clamp(13px,2.05vw,21px)}}
'''

map_block = MAP_BEGIN + r'''
<style id="level4PetroOnoV2Style">
#toast,.toast,#petrovychSpeech,.petrovychSpeech{display:none!important}
.instructorCard{padding-bottom:6px!important}
.instructorCard #petrovychSpeech{display:none!important}
#petroOnoV2{left:20%;bottom:2.5%;width:min(43vw,690px);aspect-ratio:1.5/1;}
''' + shared_css + r'''
</style>
<div id="petroOnoV2" class="petroOnoV2" data-size="md" aria-live="polite">
  <div class="onoBorder"></div><div class="onoPaper"></div><div id="petroOnoV2Text" class="onoText"></div>
</div>
<script id="level4PetroOnoV2Script">
(()=>{
  const box=document.getElementById('petroOnoV2'), textEl=document.getElementById('petroOnoV2Text');
  if(!box||!textEl)return;
  const P={
    p01:'Почнемо з карти. Для початку розберись із масштабом. Натисни «+», потім «−».',
    p02:'Добре. А тепер віддали карту назад.',
    p03:'От і все. Тепер карта повернута — приведи її до нормального положення. Натисни «ПІВНІЧ».',
    p04:'Добре. Північ угорі. Тепер увімкни GPS і визнач, де знаходимось ми.',
    p05:'Є. Наша позиція визначена. Тепер подивимось, що вже зробили сусіди. Відкрий МІСІЮ.',
    p06:'Пост «БРАВО» передав три результати пеленгування. Нанеси всі три на карту.',
    p07:'Перший є. Дивись, як напрямок лягає від позиції «БРАВО».',
    p08:'Другий нанесено. Уже бачимо сектор, де варто шукати.',
    p09:'Добре. Усі три пеленги «БРАВО» нанесені. Бери приймач. Натискай «НАЗАД» — переходимо до RX-01.',
    p21:'Пеленги БРАВО залишилися на карті. Тепер додамо наші. Відкрий ЖУРНАЛ.',
    p22:'Це наші результати. Проклацай усі три записи.',
    p23:'Є перший перетин.',p24:'Другий.',
    p25:'Оце вже робота. Три джерела локалізовано. Тепер визначимо відстань до кожного.',
    p26:'Лінійка активна. По черзі обери цілі A, B і C.',
    p27:'Замір прийнято. Залишилось цілей: 2.',p28:'Замір прийнято. Залишилось цілей: 1.',
    p29:'Усі три відстані є. Тепер звіт.',p30:'Відстані до всіх цілей заміряні. Формуй звіт на штаб.',
    p31:'Звіт пішов. Рівень виконано.',
    p32:'Спершу зорієнтуй карту. Без цього далі не йдемо.',p33:'Тисни GPS. Нехай планшет спочатку знайде нас.',
    p34:'Без GPS не поспішай. Спочатку визнач нашу позицію.',p35:'Спочатку визнач нашу позицію через GPS.',
    p36:'Я ж казав: спочатку північ.',p37:'Спочатку збери власні пеленги на RX-01.',
    p38:'Наш журнал поки недоступний. Спочатку збери власні пеленги на RX-01.',
    p39:'Тут можеш вмикати й вимикати потрібні шари карти.',p40:'Тут можеш прибрати зайве з карти, якщо заважає.',
    p41:'Тепер нанось наші пеленги. Шукай точки перетину.',p42:'Позицію маємо. Тепер працюємо з даними БРАВО.',
    p43:'Добре. Дані БРАВО на карті. Тепер нам потрібні власні пеленги.',p44:'Добре. Пеленги БРАВО нанесені. Тепер потрібні наші власні.',
    p45:'Ось дані екіпажу БРАВО. Нанось пеленги на карту по одному.',p46:'Ось пеленги екіпажу БРАВО. Нанось їх по одному.',
    p47:'Є. Нашу точку визначено. Відкривай місію БРАВО.',p48:'Оце вже робота. Джерела локалізовано — тепер бери лінійку.',
    p49:'Оце вже робота. Три джерела локалізовано — тепер бери лінійку.'
  };
  const norm=s=>(s||'').toLowerCase().replace(/[“”«»]/g,'').replace(/\s+/g,' ').trim();
  function resolve(raw){
    const s=norm(raw);
    if(!s)return '';
    if(s.includes('почнемо з карти'))return P.p01;
    if(s.includes('а тепер віддали'))return P.p02;
    if(s.includes('тепер карта повернута'))return P.p03;
    if(s.includes('північ угорі'))return P.p04;
    if(s.includes('наша позиція визначена'))return P.p05;
    if(s.includes('нашy точку визначено')||s.includes('нашу точку визначено'))return P.p47;
    if(s.includes('пост браво')&&s.includes('три результати'))return P.p06;
    if(s.includes('перший є')&&s.includes('напрямок'))return P.p07;
    if(s.includes('другий нанесено'))return P.p08;
    if(s.includes('усі три пеленги')&&s.includes('браво'))return P.p09;
    if(s.includes('пеленги браво залишилися'))return P.p21;
    if(s.includes('це наші результати'))return P.p22;
    if(s.includes('перший перетин'))return P.p23;
    if(s==='другий.'||s==='другий')return P.p24;
    if(s.includes('три джерела локалізовано')&&s.includes('визначимо відстань'))return P.p25;
    if(s.includes('лінійка активна'))return P.p26;
    if(s.includes('залишилось цілей: 2'))return P.p27;
    if(s.includes('залишилось цілей: 1'))return P.p28;
    if(s.includes('усі три відстані є'))return P.p29;
    if(s.includes('відстані до всіх цілей заміряні'))return P.p30;
    if(s.includes('звіт пішов'))return P.p31;
    if(s.includes('спершу зорієнтуй'))return P.p32;
    if(s.includes('тисни gps'))return P.p33;
    if(s.includes('без gps'))return P.p34;
    if(s.includes('спочатку визнач нашу позицію через gps'))return P.p35;
    if(s.includes('спочатку північ'))return P.p36;
    if(s.includes('спочатку збери власні пеленги'))return P.p37;
    if(s.includes('наш журнал')&&s.includes('недоступ'))return P.p38;
    if(s.includes('вмикати й вимикати')&&s.includes('шари'))return P.p39;
    if(s.includes('прибрати зайве'))return P.p40;
    if(s.includes('нанось наші пеленги'))return P.p41;
    if(s.includes('позицію маємо'))return P.p42;
    if(s.includes('дані браво на карті'))return P.p43;
    if(s.includes('пеленги браво нанесені'))return P.p44;
    if(s.includes('ось дані екіпажу браво'))return P.p45;
    if(s.includes('ось пеленги екіпажу браво'))return P.p46;
    if(s.includes('джерела локалізовано')&&s.includes('бери лінійку'))return P.p48;
    return raw;
  }
  function show(raw){
    const t=resolve(raw);if(!t)return;
    textEl.textContent=t;
    const n=t.length;box.dataset.size=n<35?'xl':n<65?'lg':n<105?'md':'sm';
    box.classList.add('show');
  }
  window.rxPetroOnoV2Show=show;
  window.setPetrovych=function(emotion,msg){show(msg);return undefined};
  const toast=document.getElementById('toast');
  if(toast){new MutationObserver(()=>{const s=norm(toast.textContent);if(s.includes('виконай поточний крок'))show(P.p32);else if(s.includes('спочатку увімкни gps'))show(P.p35);else if(s.includes('спочатку зорієнтуй'))show(P.p32);else if(s.includes('спочатку локалізуй'))show(P.p48);}).observe(toast,{childList:true,subtree:true,characterData:true})}
  const journal=(()=>{try{return JSON.parse(localStorage.getItem('rx01_level4_our_journal')||'[]')}catch(_){return []}})();
  show(Array.isArray(journal)&&journal.length>=3?P.p21:P.p01);
})();
</script>
''' + MAP_END

rx_block = RX_BEGIN + r'''
<style id="level4PetroOnoV2Style">
#rxOno,#petroBox,#toast,.toast{display:none!important}
#petroOnoV2{left:16%;top:7.5%;width:min(35vw,620px);aspect-ratio:1.5/1;}
''' + shared_css + r'''
</style>
<div id="petroOnoV2" class="petroOnoV2" data-size="lg" aria-live="polite">
  <div class="onoBorder"></div><div class="onoPaper"></div><div id="petroOnoV2Text" class="onoText"></div>
</div>
<script id="level4PetroOnoV2Script">
(()=>{
  const box=document.getElementById('petroOnoV2'), textEl=document.getElementById('petroOnoV2Text');if(!box||!textEl)return;
  const P={p10:'Введи значення.',p11:'Тепер шукай максимум.',p12:'Поруч. Дотягни сигнал.',p13:'Є щось. Дивись на шкалу.',p14:'Ні. Це не максимум.',p15:'Оце воно.',p16:'Наступне значення.',p17:'Останнє значення.',p18:'Ну добре. Напрямок уже ловиш.',p19:'А тепер я тобі навіть напрямок не скажу.',p20:'Дані зібрані. Повертайся на карту.'};
  const norm=s=>(s||'').toLowerCase().replace(/\s+/g,' ').trim();
  function resolve(raw){const s=norm(raw);if(!s)return '';if(s.includes('дані зібрані'))return P.p20;if(s.includes('а тепер я тобі навіть напрямок'))return P.p19;if(s.includes('ну добре')&&s.includes('напрямок'))return P.p18;if(s.includes('останн'))return P.p17;if(s.includes('наступн')||s.includes('перший є')||s.includes('два.'))return P.p16;if(s.includes('оце воно'))return P.p15;if(s.includes('поруч'))return P.p12;if(s.includes('є щось'))return P.p13;if(s.includes('не максимум'))return P.p14;if(s.includes('шукай максимум'))return P.p11;if(s.includes('введи')||s.includes('частоти у тебе є')||s.includes('дивись на коло'))return P.p10;return raw}
  function show(raw){const t=resolve(raw);if(!t)return;textEl.textContent=t;const n=t.length;box.dataset.size=n<24?'xl':n<45?'lg':n<75?'md':'sm';box.classList.add('show')}
  window.rxPetroOnoV2Show=show;
  const petroText=document.getElementById('petroText');
  if(petroText){new MutationObserver(()=>show(petroText.textContent)).observe(petroText,{childList:true,subtree:true,characterData:true});show(petroText.textContent||P.p10)}else show(P.p10);
})();
</script>
''' + RX_END

map_html=map_html.replace('</body>', map_block+'\n</body>')
rx_html=rx_html.replace('</body>', rx_block+'\n</body>')
MAP.write_text(map_html,encoding='utf-8')
RX.write_text(rx_html,encoding='utf-8')

game=GAME.read_text(encoding='utf-8')
game=re.sub(r"stages/15_level4_map\.html(?:\?v=[^']*)?", "stages/15_level4_map.html?v=20260826-onom-v2", game)
game=re.sub(r"stages/16_level4_rx\.html(?:\?v=[^']*)?", "stages/16_level4_rx.html?v=20260826-onom-v2", game)
GAME.write_text(game,encoding='utf-8')
