(()=>{
'use strict';
if(window.VIDLIK_EXCEL_STORY_TUTORIAL)return;

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!mon||!chat||!footer)return;

const OS=()=>window.VIDLIK_OS;
const COLS=['A','B','C','D','E','F'];
let active=false;
let task=0;
let phase='idle';
let sheet='intro';
let win=null;
let taskBtn=null;
let minimized=false;
let maximized=false;
let selected='A1';
let editing=false;
let editBuffer='';
let searchOpen=false;
let searchBuffer='';
let row17Revealed=false;
let saved=false;
let formulaMismatch=false;
let closedCount=0;
let timer=null;
let storyTimers=[];
let lastGuide='';
let polyaActive=false;

const cells=new Map([
 ['A1',{v:'ПАРАМЕТР'}],['B1',{v:'ЗНАЧЕННЯ'}],['C1',{v:'СТАН'}],
 ['A2',{v:'Сектор'}],['B2',{v:''}],['C2',{v:'Очікує'}],
 ['A3',{v:'Оператор'}],['B3',{v:''}],['C3',{v:'Очікує'}],
 ['A4',{v:'Канал'}],['B4',{v:'12'}],['C4',{v:'Активний'}],
 ['A5',{v:'Контроль'}],['B5',{v:''}],['C5',{v:'Формула'}]
]);
const formulas=new Map();

function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(rowEl){requestAnimationFrame(()=>requestAnimationFrame(()=>{const top=Math.max(0,chat.scrollHeight-chat.clientHeight);if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});else chat.scrollTop=top;rowEl?.setAttribute('data-visible-latest','true')}))}
function message(sender,text,kind='admin'){
 const r=document.createElement('div');r.className=`admin-message vidlik-tutorial-message excel-story-message ${kind==='polya'?'is-polya':''}`;
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent=sender;
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=nowTime();
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
const adminMessage=text=>message('СИСТЕМНИЙ АДМІНІСТРАТОР',text,'admin');
const polyaMessage=text=>message('ПОЛЯ',text,'polya');
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}}
function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 7 · ${text}`)}
function guide(key,text,html){if(!active||lastGuide===key)return;lastGuide=key;(polyaActive?polyaMessage:adminMessage)(text);if(html)setHelp(html)}
function later(ms,fn){const id=setTimeout(()=>{storyTimers=storyTimers.filter(x=>x!==id);if(active)fn()},ms);storyTimers.push(id);return id}
function clearStoryTimers(){storyTimers.forEach(clearTimeout);storyTimers=[]}
function layer(){return mon.querySelector('.os-layer')}
function runningArea(){return document.getElementById('osRunningApps')}
function language(){return OS()?.language==='ENG'?'ENG':'UKR'}
function languageButton(){return document.getElementById('osLanguageButton')}
function headerEls(){return{root:document.querySelector('.admin-header'),name:document.querySelector('.admin-header-name'),online:document.querySelector('.admin-online'),status:document.querySelector('.admin-online span')}}
function setHeader(mode){
 const h=headerEls();if(!h.root)return;
 h.root.classList.remove('excel-admin-reconnect','excel-admin-offline','excel-polya-channel');
 if(mode==='admin'){if(h.name)h.name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';if(h.status)h.status.textContent='Онлайн'}
 if(mode==='reconnect'){h.root.classList.add('excel-admin-reconnect');if(h.status)h.status.textContent='Перепідключення…'}
 if(mode==='offline'){h.root.classList.add('excel-admin-offline');if(h.status)h.status.textContent='Канал закрито'}
 if(mode==='polya'){h.root.classList.add('excel-polya-channel');if(h.name)h.name.textContent='ПОЛЯ';if(h.status)h.status.textContent='захищений канал'}
}

function addrParts(addr){const m=/^([A-F])(\d+)$/.exec(addr)||['','A','1'];return{c:COLS.indexOf(m[1]),r:Math.max(1,Number(m[2]))}}
function addr(c,r){return`${COLS[Math.max(0,Math.min(COLS.length-1,c))]}${Math.max(1,r)}`}
function cellData(a){if(!cells.has(a))cells.set(a,{v:''});return cells.get(a)}
function displayValue(a){return cellData(a).v??''}
function rawValue(a){return formulas.get(a)||displayValue(a)}
function setCell(a,v,formula=''){cellData(a).v=String(v);if(formula)formulas.set(a,formula);else formulas.delete(a);updateCellDom(a);updateFormulaBar()}
function cellEl(a){return win?.querySelector(`[data-cell="${a}"]`)||null}
function updateCellDom(a){const el=cellEl(a);if(el)el.textContent=displayValue(a)}
function updateFormulaBar(){
 if(!win)return;
 const box=win.querySelector('.excel-name-box');const bar=win.querySelector('.excel-formula-value');
 if(box)box.textContent=selected;
 if(bar)bar.textContent=editing?editBuffer:rawValue(selected);
}
function clearSelection(){win?.querySelectorAll('.excel-cell.is-selected').forEach(x=>x.classList.remove('is-selected'))}
function selectCell(a,opts={}){
 selected=a;editing=false;editBuffer='';clearSelection();const el=cellEl(a);if(el){el.classList.add('is-selected');if(opts.scroll)el.scrollIntoView({block:'nearest',inline:'nearest'})}updateFormulaBar();lastGuide='';schedule(0)
}

function introRow(r){
 let html=`<div class="excel-row" data-row="${r}"><div class="excel-row-head">${r}</div>`;
 for(const c of COLS){const a=`${c}${r}`;html+=`<button type="button" class="excel-cell ${r===1?'is-header':''}" data-cell="${a}">${displayValue(a)}</button>`}
 return html+'</div>';
}
function registerValue(c,r){
 if(r===1)return({A:'КОД',B:'ІМ’Я',C:'СТАТУС',D:'ПРИМІТКА',E:'ЗАЯВЛЕНО',F:'267'})[c]||'';
 if(r===2&&c==='E')return'ФАКТИЧНО';
 if(r===2&&c==='F')return formulaMismatch?'268':'';
 if(r===17)return({A:'017',B:'ДАНИЛО ВЕРЕС',C:'НЕ ЕВАКУЙОВАНИЙ',D:'ВИКЛЮЧЕНО З ПІДСУМКУ'})[c]||'';
 if(r>19)return'';
 const id=String(r-1).padStart(3,'0');
 return({A:id,B:`ОПЕРАТОР ${id}`,C:'ЕВАКУЙОВАНИЙ',D:'—'})[c]||'';
}
function registerRow(r){
 const hidden=r===17&&!row17Revealed;
 let html=`<div class="excel-row register-row ${hidden?'is-hidden-row':''} ${r===17&&row17Revealed?'is-found-row':''}" data-row="${r}"><div class="excel-row-head">${r}</div>`;
 for(const c of COLS){const a=`${c}${r}`;const val=(a==='F2'&&formulas.has('F2'))?displayValue('F2'):registerValue(c,r);html+=`<button type="button" class="excel-cell ${r===1?'is-header':''} ${r===17&&row17Revealed?'is-found-cell':''}" data-cell="${a}">${val}</button>`}
 return html+'</div>';
}
function renderGrid(){
 if(!win)return;
 const grid=win.querySelector('.excel-grid-body');if(!grid)return;
 let html='<div class="excel-col-head-row"><div class="excel-corner"></div>'+COLS.map(c=>`<div class="excel-col-head">${c}</div>`).join('')+'</div>';
 if(sheet==='intro')for(let r=1;r<=12;r++)html+=introRow(r);
 else{for(let r=1;r<=19;r++)html+=registerRow(r);html+='<div class="excel-more-rows">⋯ 250 РЯДКІВ ДАЛІ ⋯</div>'}
 grid.innerHTML=html;
 win.classList.toggle('is-register',sheet==='register');
 win.querySelectorAll('[data-sheet]').forEach(b=>b.classList.toggle('is-active',b.dataset.sheet===sheet));
 const declared=win.querySelector('.excel-declared');if(declared){declared.hidden=sheet!=='register';declared.classList.toggle('is-mismatch',formulaMismatch)}
 clearSelection();cellEl(selected)?.classList.add('is-selected');updateFormulaBar();
}
function switchSheet(next){sheet=next;selected=next==='intro'?'A1':'F2';editing=false;editBuffer='';renderGrid();schedule(0)}

function buildWindow(){
 if(win?.isConnected)return win;
 const host=layer();if(!host)return null;
 win=document.createElement('section');
 win.className='os-window os-excel-story-window os-window-active';
 win.dataset.windowId='excel-story';
 win.innerHTML=`
  <header class="os-window-titlebar excel-titlebar">
   <strong><span class="excel-app-mark">X</span> TRAINING_SYNC_SECTOR_3.xlsx — Microsoft Excel</strong>
   <span class="os-window-actions">
    <button type="button" data-excel-win="min" title="Згорнути">—</button>
    <button type="button" data-excel-win="max" title="Розгорнути">□</button>
    <button type="button" data-excel-win="close" title="Закрити">×</button>
   </span>
  </header>
  <div class="os-window-body excel-body">
   <div class="excel-ribbon">
    <div class="excel-tabs"><b>Файл</b><span class="is-active">Основне</span><span>Вставлення</span><span>Формули</span><span>Дані</span><i class="excel-save-state">ЗБЕРЕЖЕНО</i></div>
    <div class="excel-tools"><span>Вставити</span><span>Шрифт</span><span>Вирівнювання</span><span>Число</span><span>Σ Автосума</span><strong class="excel-declared" hidden>ЗАЯВЛЕНО: 267</strong></div>
   </div>
   <div class="excel-formula-bar"><span class="excel-name-box">A1</span><span class="excel-fx">fx</span><span class="excel-formula-value"></span></div>
   <div class="excel-grid-body" role="grid" aria-label="Таблиця Excel"></div>
   <div class="excel-sheetbar"><button type="button" data-sheet="intro" class="is-active">Вступ</button><button type="button" data-sheet="register">Реєстр</button><span class="excel-sheet-spacer"></span><span>100%</span></div>
   <div class="excel-search" hidden><span>Знайти</span><strong class="excel-search-value"></strong><em>Enter — далі · Esc — закрити</em></div>
   <div class="excel-toast" hidden></div>
  </div>`;
 host.appendChild(win);createTaskButton();renderGrid();selectCell(selected);return win;
}
function createTaskButton(){
 const area=runningArea();if(!area||taskBtn?.isConnected)return;
 taskBtn=document.createElement('button');taskBtn.type='button';taskBtn.className='os-running-button is-active vidlik-excel-taskbar-button';taskBtn.textContent='Excel · Сектор 3';taskBtn.title='TRAINING_SYNC_SECTOR_3.xlsx';area.appendChild(taskBtn);
 taskBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!win?.isConnected)buildWindow();minimized=!minimized;win.classList.toggle('os-minimized',minimized);win.classList.toggle('os-window-minimized',minimized);taskBtn.classList.toggle('is-minimized',minimized);taskBtn.classList.toggle('is-active',!minimized);schedule(0)},true);
}
function toast(text,ms=1200){const t=win?.querySelector('.excel-toast');if(!t)return;t.textContent=text;t.hidden=false;setTimeout(()=>{if(t)t.hidden=true},ms)}
function ensureWindow(){
 if(!win?.isConnected){buildWindow();closedCount++;guide(`reopen-${closedCount}`,polyaActive?'Я ж сказала — не закривай файл. Я повернула його.':'Навчальний файл потрібен для вправи. Я відкрив його знову.','<span><kbd>EXCEL</kbd> файл відновлено</span>');return false}
 if(minimized){guide('minimized','Вікно Excel згорнуто. Відкрийте його з панелі задач.','<span><kbd>ЛКМ</kbd> Excel · Сектор 3</span>');return false}
 return true;
}

function begin(n,label,newPhase){task=n;phase=newPhase;lastGuide='';taskLabel(n,label);schedule(0)}
function startOmen(){setHeader('reconnect');setTimeout(()=>{if(active&&!polyaActive)setHeader('admin')},720)}
function start(){
 if(active)return;active=true;task=0;phase='boot';sheet='intro';selected='A1';editing=false;searchOpen=false;searchBuffer='';row17Revealed=false;saved=false;formulaMismatch=false;polyaActive=false;closedCount=0;lastGuide='';clearStoryTimers();
 document.querySelector('.os-language-training-window')?.remove();document.querySelector('.vidlik-language-taskbar-button')?.remove();
 buildWindow();startOmen();
 setFooter('ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ');setHelp('<span><kbd>↑ ↓ ← →</kbd> переміщення між клітинками</span>');
 later(850,()=>{adminMessage('Переходимо до Excel. Перед вами той самий файл «TRAINING_SYNC_SECTOR_3.xlsx».\nПочнемо з клітинок, введення даних і першої формули.');begin(1,'ПЕРЕЙДІТЬ ДО КЛІТИНКИ B2','navigate-b2')});
}
function reset(){
 active=false;task=0;phase='idle';clearTimeout(timer);clearStoryTimers();win?.remove();win=null;taskBtn?.remove();taskBtn=null;minimized=false;maximized=false;editing=false;searchOpen=false;polyaActive=false;setHeader('admin');
}
function schedule(ms=25){clearTimeout(timer);timer=setTimeout(reconcile,ms)}

function requireEng(key){
 if(language()==='ENG')return true;
 const btn=languageButton();btn?.classList.add('vidlik-excel-target');
 guide(`${key}-${language()}`,'Для назв функцій Excel потрібна розкладка ENG. Перемкніть мову через індикатор на панелі задач.','<span><kbd>UKR / ENG</kbd> виберіть ENG</span>');return false;
}
function clearTargets(){document.querySelectorAll('.vidlik-excel-target').forEach(x=>x.classList.remove('vidlik-excel-target'))}
function markCell(a){clearTargets();cellEl(a)?.classList.add('vidlik-excel-target')}
function normalizeFormula(s){return String(s||'').replace(/\s+/g,'').toUpperCase().replace(/,/g,';')}

function reconcile(){
 if(!active)return;clearTimeout(timer);clearTargets();if(!ensureWindow())return;
 if(task===0)return;
 if(sheet!=='intro'&&task<=5){win.querySelector('[data-sheet="intro"]')?.classList.add('vidlik-excel-target');guide('return-intro','Поверніться на аркуш «Вступ», щоб завершити навчальну частину.','<span><kbd>ЛКМ</kbd> Вступ</span>');return}

 if(task===1){
  markCell('B2');
  if(selected==='B2'){begin(2,'ВВЕДІТЬ НОМЕР СЕКТОРА','enter-sector');return}
  guide(`t1-${selected}`,'Стрілками перемістіться з поточної клітинки до B2.','<span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> → B2</span>');return;
 }
 if(task===2){
  markCell('B2');
  if(displayValue('B2')==='3'){cellData('C2').v='Готово';updateCellDom('C2');selectCell('B3');begin(3,'ВВЕДІТЬ VIDLIK І ПЕРЕЙДІТЬ TAB','operator');return}
  if(selected!=='B2'){guide('t2-return','Поверніться до B2.','<span><kbd>СТРІЛКИ</kbd> → B2</span>');return}
  guide(`t2-${editing?editBuffer:''}`,'Введіть цифру 3 і натисніть Enter.','<span><kbd>3</kbd><kbd>ENTER</kbd></span>');return;
 }
 if(task===3){
  markCell('B3');
  if(displayValue('B3').toUpperCase()==='VIDLIK'&&phase==='operator-done'){cellData('C3').v='Готово';updateCellDom('C3');begin(4,'ВВЕДІТЬ ПЕРШУ ФОРМУЛУ','first-formula');return}
  if(selected!=='B3'){guide('t3-return','Стрілками поверніться до B3.','<span><kbd>СТРІЛКИ</kbd> → B3</span>');return}
  if(!requireEng('t3-lang'))return;
  guide(`t3-${editing?editBuffer:''}`,'Введіть VIDLIK і підтвердьте клавішею Tab.','<span><kbd>VIDLIK</kbd><kbd>TAB</kbd></span>');return;
 }
 if(task===4){
  markCell('B5');
  if(displayValue('B5')==='20'){begin(5,'ЗБЕРЕЖІТЬ КНИГУ CTRL + S','save');return}
  if(selected!=='B5'){guide(`t4-nav-${selected}`,'Перейдіть до B5. Тут виконаємо першу формулу.','<span><kbd>СТРІЛКИ</kbd> → B5</span>');return}
  if(!requireEng('t4-lang'))return;
  guide(`t4-${editing?editBuffer:''}`,'Введіть =SUM(12;8) і натисніть Enter. Результат має бути 20.','<span><kbd>=SUM(12;8)</kbd><kbd>ENTER</kbd></span>');return;
 }
 if(task===5){
  guide('t5','Збережіть книгу комбінацією Ctrl + S.','<span><kbd>CTRL</kbd> + <kbd>S</kbd> зберегти</span>');return;
 }
 if(task===6){
  if(sheet!=='register'){win.querySelector('[data-sheet="register"]')?.classList.add('vidlik-excel-target');guide('t6-sheet','Відкрийте аркуш «Реєстр».','<span><kbd>ЛКМ</kbd> Реєстр</span>');return}
  markCell('F2');
  if(displayValue('F2')==='268'){begin(7,'ЗНАЙДІТЬ РЯДОК 17','find-17');return}
  if(selected!=='F2'){guide('t6-cell','Перейдіть у F2 — поле «ФАКТИЧНО».','<span><kbd>СТРІЛКИ</kbd> → F2</span>');return}
  if(!requireEng('t6-lang'))return;
  guide(`t6-${editing?editBuffer:''}`,'Порахуй непорожні імена сам. Введи =COUNTA(B2:B269) і натисни Enter.','<span><kbd>=COUNTA(B2:B269)</kbd><kbd>ENTER</kbd></span>');return;
 }
 if(task===7){
  if(!searchOpen&&!row17Revealed){guide('t7-find','Відкрий пошук у книзі комбінацією Ctrl + F.','<span><kbd>CTRL</kbd> + <kbd>F</kbd></span>');return}
  if(searchOpen&&!row17Revealed){guide(`t7-search-${searchBuffer}`,'Введи 17 і натисни Enter.','<span><kbd>17</kbd><kbd>ENTER</kbd></span>');return}
  if(row17Revealed&&searchOpen){guide('t7-close-search','Закрий пошук клавішею Esc.','<span><kbd>ESC</kbd> закрити пошук</span>');return}
 }
}

function beginEdit(initial=''){editing=true;editBuffer=initial;updateFormulaBar()}
function translatedKey(e){
 if(e.code==='Digit9'&&e.shiftKey)return'(';
 if(e.code==='Digit0'&&e.shiftKey)return')';
 if(/^Digit\d$/.test(e.code))return e.shiftKey?'':e.code.slice(-1);
 const map={KeyA:'a',KeyB:'b',KeyC:'c',KeyD:'d',KeyE:'e',KeyF:'f',KeyG:'g',KeyH:'h',KeyI:'i',KeyJ:'j',KeyK:'k',KeyL:'l',KeyM:'m',KeyN:'n',KeyO:'o',KeyP:'p',KeyQ:'q',KeyR:'r',KeyS:'s',KeyT:'t',KeyU:'u',KeyV:'v',KeyW:'w',KeyX:'x',KeyY:'y',KeyZ:'z'};
 if(map[e.code])return e.shiftKey?map[e.code].toUpperCase():map[e.code];
 if(e.code==='Equal')return e.shiftKey?'+':'=';
 if(e.code==='Semicolon')return e.shiftKey?':':';';
 if(e.code==='Comma')return e.shiftKey?'<':',';
 if(e.code==='Period')return e.shiftKey?'>':'.';
 if(e.code==='Minus')return e.shiftKey?'_':'-';
 return'';
}
function commitEdit(moveKey='Enter'){
 if(!editing)return false;
 const a=selected;const raw=editBuffer.trim();
 if(task===2&&a==='B2'){
  if(raw==='3'){setCell('B2','3');editing=false;editBuffer='';selectCell('B3');schedule(0);return true}
  toast('Очікується значення 3');editing=false;editBuffer='';updateFormulaBar();return false;
 }
 if(task===3&&a==='B3'){
  if(raw.toUpperCase()==='VIDLIK'&&moveKey==='Tab'){setCell('B3','VIDLIK');editing=false;editBuffer='';phase='operator-done';selectCell('C3');schedule(0);return true}
  toast(moveKey!=='Tab'?'Підтвердьте введення клавішею Tab':'Введіть VIDLIK');if(moveKey==='Tab'&&raw.toUpperCase()!=='VIDLIK'){editing=false;editBuffer=''}updateFormulaBar();return false;
 }
 if(task===4&&a==='B5'){
  if(normalizeFormula(raw)==='=SUM(12;8)'){setCell('B5','20',raw);editing=false;editBuffer='';selectCell('B6');toast('Результат: 20');schedule(0);return true}
  toast('Перевірте формулу =SUM(12;8)');editing=false;editBuffer='';updateFormulaBar();return false;
 }
 if(task===6&&sheet==='register'&&a==='F2'){
  if(normalizeFormula(raw)==='=COUNTA(B2:B269)'){setCell('F2','268',raw);editing=false;editBuffer='';formulaMismatch=true;renderGrid();selectCell('F2');toast('Фактично: 268',1600);polyaMessage('268.\nДобре. Тепер знайди сімнадцятий.');schedule(250);return true}
  toast('Перевір діапазон B2:B269');editing=false;editBuffer='';updateFormulaBar();return false;
 }
 if(raw)setCell(a,raw);editing=false;editBuffer='';return true;
}
function moveSelection(dc,dr){const p=addrParts(selected);selectCell(addr(p.c+dc,p.r+dr),{scroll:true})}
function openSearch(){searchOpen=true;searchBuffer='';const s=win?.querySelector('.excel-search');if(s)s.hidden=false;updateSearch();schedule(0)}
function updateSearch(){const v=win?.querySelector('.excel-search-value');if(v)v.textContent=searchBuffer||'▌'}
function closeSearch(){searchOpen=false;const s=win?.querySelector('.excel-search');if(s)s.hidden=true;searchBuffer='';if(row17Revealed)completeEpisode();else schedule(0)}
function revealRow17(){
 row17Revealed=true;renderGrid();selectCell('B17',{scroll:true});
 const row=win?.querySelector('[data-row="17"]');row?.scrollIntoView({block:'center'});
 polyaMessage('Ось він.\nНе евакуйований. І вручну виключений із підсумку.');
 later(900,()=>{polyaMessage('Закрий пошук.');schedule(0)});
}
function completeEpisode(){
 phase='complete';task=8;lastGuide='';setFooter('7 / 7 · ПЕРША ТАБЛИЦЯ · ЗАВЕРШЕНО ✓');setHelp('<span><kbd>ЗАПИС 17</kbd> знайдено</span>');
 later(420,()=>polyaMessage('Я маю тобі дещо пояснити.'));
 later(950,()=>window.dispatchEvent(new CustomEvent('vidlik:excel-section-complete',{detail:{record:17,name:'Данило Верес'}})));
}
function beginStoryTakeover(){
 if(saved)return;saved=true;phase='saving';lastGuide='';
 const save=win?.querySelector('.excel-save-state');if(save){save.textContent='ЗБЕРЕЖЕННЯ…';save.classList.add('is-saving')}
 toast('Збереження…',900);setHelp('<span><kbd>CTRL</kbd> + <kbd>S</kbd> виконано</span>');
 later(700,()=>{if(save){save.textContent='ЗБЕРЕЖЕНО';save.classList.remove('is-saving')}adminMessage('Навчальний блок завершено.\nДані збережено.');setHeader('offline');setFooter('КАНАЛ ЗАКРИТО');});
 later(1800,()=>{polyaActive=true;setHeader('polya');polyaMessage('Не закривай файл.');});
 later(2800,()=>polyaMessage('І нічого поки не натискай.'));
 later(3900,()=>polyaMessage('Ти зараз сам у кімнаті?'));
 later(5200,()=>polyaMessage('У реєстрі зверху написано, що тут 267 записів.'));
 later(6300,()=>{polyaMessage('Не вір мені.\nНе вір їм.\nПорахуй сам.');switchSheet('register');begin(6,'ПЕРЕВІРТЕ КІЛЬКІСТЬ ЗАПИСІВ','count-register')});
}

function keydown(e){
 if(!active||minimized||!win?.isConnected)return;
 const key=e.key.toLowerCase();
 if(task===5&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='s'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();beginStoryTakeover();return;
 }
 if(task===7&&!row17Revealed&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='f'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSearch();return;
 }
 if(searchOpen){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();closeSearch();return}
  if(e.key==='Backspace'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();searchBuffer=searchBuffer.slice(0,-1);updateSearch();lastGuide='';schedule(0);return}
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const q=searchBuffer.trim().toLowerCase();if(q==='17'||q.includes('данило')){revealRow17()}else{toast('Збігів не знайдено');searchBuffer='';updateSearch()}return}
  if(!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.length===1){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();searchBuffer+=e.key;updateSearch();lastGuide='';schedule(0)}
  return;
 }
 if(e.ctrlKey||e.altKey||e.metaKey)return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&!editing){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(e.key==='ArrowUp')moveSelection(0,-1);if(e.key==='ArrowDown')moveSelection(0,1);if(e.key==='ArrowLeft')moveSelection(-1,0);if(e.key==='ArrowRight')moveSelection(1,0);return;
 }
 if(e.key==='Backspace'&&editing){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();editBuffer=editBuffer.slice(0,-1);updateFormulaBar();lastGuide='';schedule(0);return}
 if((e.key==='Enter'||e.key==='Tab')&&editing){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();commitEdit(e.key);return}
 if((e.key==='Enter'||e.key==='Tab')&&!editing){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(e.key==='Enter')moveSelection(0,1);else moveSelection(1,0);return}
 if(task===2||task===3||task===4||task===6){
  if((task===3||task===4||task===6)&&language()!=='ENG'){schedule(0);return}
  const c=translatedKey(e);if(!c)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(!editing)beginEdit('');editBuffer+=c;updateFormulaBar();lastGuide='';schedule(0);return;
 }
}

function click(e){
 if(!active)return;
 const control=e.target.closest('[data-excel-win]');
 if(control&&win?.contains(control)){
  e.preventDefault();e.stopPropagation();const a=control.dataset.excelWin;
  if(a==='min'){minimized=true;win.classList.add('os-minimized','os-window-minimized');taskBtn?.classList.add('is-minimized');taskBtn?.classList.remove('is-active');schedule(0);return}
  if(a==='max'){maximized=!maximized;win.classList.toggle('os-maximized',maximized);control.textContent=maximized?'❐':'□';return}
  if(a==='close'){win.remove();win=null;taskBtn?.remove();taskBtn=null;setTimeout(()=>{if(active){buildWindow();schedule(0)}},320);return}
 }
 const sheetBtn=e.target.closest('[data-sheet]');if(sheetBtn&&win?.contains(sheetBtn)){e.preventDefault();switchSheet(sheetBtn.dataset.sheet);return}
 const cell=e.target.closest('[data-cell]');if(cell&&win?.contains(cell)){e.preventDefault();selectCell(cell.dataset.cell,{scroll:false});return}
 if(e.target.closest('#osLanguageButton,[data-lang]')){setTimeout(schedule,30)}
}

window.addEventListener('keydown',keydown,true);
mon.addEventListener('click',click,true);
window.addEventListener('vidlik:section5-ready',start);
window.addEventListener('vidlik:episode5-ready',start);
window.addEventListener('vidlik:os-reset',reset);

window.VIDLIK_EXCEL_STORY_TUTORIAL={start,reset,reconcile,get task(){return task},get phase(){return phase},get active(){return active}};
})();
