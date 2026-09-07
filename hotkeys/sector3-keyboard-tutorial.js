(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!mon||!chat||!footer)return;

const FOLDER='Сектор 3';
const ORIGINAL='Знайомство.xlsx';
const COPY='Знайомство (2).xlsx';
const DRAFT='чернетка.txt';

let active=false;
let task=0;
let phase='idle';
let helperLock=false;
let focusIndex=-1;
let internalClick=false;

function explorer(){return document.querySelector('.os-window[data-window-id="explorer"]')}
function address(){return explorer()?.querySelector('.os-address')?.textContent.trim()||''}
function rows(){return [...(explorer()?.querySelectorAll('.os-file-item')||[])]}
function row(name){return rows().find(x=>x.querySelector('.os-file-name b')?.textContent.trim()===name)||null}
function selectedRow(){return explorer()?.querySelector('.os-file-item.selected')||null}
function selectedName(){return selectedRow()?.querySelector('.os-file-name b')?.textContent.trim()||''}
function backButton(){return explorer()?.querySelector('[data-act="back"]')||null}
function newButton(){return explorer()?.querySelector('[data-act="new"]')||null}
function searchButton(){return explorer()?.querySelector('[data-act="search"]')||null}
function searchInput(){return explorer()?.querySelector('input[id^="osSearch-"]')||null}
function visibleNames(){return rows().map(x=>x.querySelector('.os-file-name b')?.textContent.trim()).filter(Boolean)}
function toastText(){return document.querySelector('.os-toast')?.textContent||''}

function nowTime(){
 return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
}
function scrollLatest(rowEl){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const top=Math.max(0,chat.scrollHeight-chat.clientHeight);
  if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});
  else chat.scrollTop=top;
  rowEl?.setAttribute('data-visible-latest','true');
 }));
}
function adminMessage(text){
 const r=document.createElement('div');
 r.className='admin-message vidlik-tutorial-message';
 const bubble=document.createElement('div');
 bubble.className='admin-bubble';
 const head=document.createElement('div');
 head.className='admin-bubble-head';
 const name=document.createElement('span');
 name.className='admin-bubble-name';
 name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');
 time.className='admin-bubble-time';
 time.textContent=nowTime();
 const p=document.createElement('p');
 p.textContent=text;
 p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}}
function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 11 · ${text}`)}
function helper(text){if(helperLock)return;helperLock=true;adminMessage(text);setTimeout(()=>helperLock=false,1200)}
function later(fn,ms=70){setTimeout(()=>{if(active)fn()},ms)}
function stop(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}

function clearFocus(){
 document.querySelectorAll('.os-keyboard-focus,.os-keyboard-target').forEach(x=>x.classList.remove('os-keyboard-focus','os-keyboard-target'));
 focusIndex=-1;
}
function keyboardFocusables(){return [backButton(),newButton(),searchButton()].filter(Boolean)}
function setKeyboardFocus(index){
 const a=keyboardFocusables();
 if(!a.length)return null;
 document.querySelectorAll('.os-keyboard-focus').forEach(x=>x.classList.remove('os-keyboard-focus'));
 focusIndex=Math.max(0,Math.min(a.length-1,index));
 const el=a[focusIndex];el.classList.add('os-keyboard-focus');return el;
}
function markRow(name){
 document.querySelectorAll('.os-keyboard-target').forEach(x=>x.classList.remove('os-keyboard-target'));
 row(name)?.classList.add('os-keyboard-target');
}
function clickInternal(el){
 if(!el)return;
 internalClick=true;
 try{el.click()}finally{internalClick=false}
}

function fs(){return window.VIDLIK_OS?.getFileSystem?.()||null}
function findFolder(n,name){
 if(!n)return null;
 if(n.type==='folder'&&n.name===name)return n;
 for(const x of n.children||[]){const q=findFolder(x,name);if(q)return q}
 return null;
}
function sectorFs(){return findFolder(fs(),FOLDER)}
function sectorHas(name){return !!sectorFs()?.children?.some(x=>x.name===name)}

function beginTask1(){
 task=1;phase='arrows';clearFocus();
 adminMessage('Тепер спробуємо керувати Провідником без миші.\nНатискайте ↓, доки не буде вибрано папку «Сектор 3». Якщо потрібно повернутися — використайте ↑.');
 taskLabel(1,'ВИБЕРІТЬ ПАПКУ СТРІЛКАМИ');
 setHelp('<span><kbd>↑</kbd><kbd>↓</kbd> переміщення між об’єктами</span>');
}
function beginTask2(){
 task=2;phase='enter-open';markRow(FOLDER);
 adminMessage('Папку вибрано. Подвійний клік нам уже не потрібен.\nНатисніть Enter, щоб відкрити «Сектор 3».');
 taskLabel(2,'ВІДКРИЙТЕ ПАПКУ КЛАВІШЕЮ ENTER');
 setHelp('<span><kbd>ENTER</kbd> відкрити вибраний об’єкт</span>');
}
function beginTask3(){
 task=3;phase='tab-forward';clearFocus();
 adminMessage('Клавіша Tab переміщує фокус між елементами інтерфейсу.\nНатисніть Tab двічі й простежте за бірюзовою рамкою.');
 taskLabel(3,'ПЕРЕМІЩУЙТЕ ФОКУС КЛАВІШЕЮ TAB');
 setHelp('<span><kbd>TAB</kbd> наступний елемент</span>');
}
function beginTask4(){
 task=4;phase='tab-back';
 adminMessage('Добре. Тепер повернемо фокус назад.\nЗатисніть Shift і натисніть Tab.');
 taskLabel(4,'ПОВЕРНІТЬ ФОКУС SHIFT + TAB');
 setHelp('<span><kbd>SHIFT</kbd> + <kbd>TAB</kbd> попередній елемент</span>');
}
function beginTask5(){
 task=5;phase='delete-select';clearFocus();
 adminMessage('Тепер видалимо тренувальну чернетку клавіатурою.\nСтрілками виберіть «чернетка.txt».');
 taskLabel(5,'ВИДАЛІТЬ ФАЙЛ КЛАВІШЕЮ DELETE');
 setHelp('<span><kbd>↑</kbd><kbd>↓</kbd> вибрати «чернетка.txt»</span>');
}
function task5Delete(){
 phase='delete-key';markRow(DRAFT);
 adminMessage('Файл вибрано. Натисніть Delete.\nВін потрапить до Кошика, а не буде знищений назавжди.');
 setHelp('<span><kbd>DELETE</kbd> перемістити до Кошика</span>');
}
function beginTask6(){
 task=6;phase='copy-select';
 adminMessage('Тепер зробимо копію файлу.\nСтрілками виберіть «Знайомство.xlsx».');
 taskLabel(6,'СКОПІЮЙТЕ ФАЙЛ CTRL + C');
 setHelp('<span><kbd>↑</kbd><kbd>↓</kbd> вибрати «Знайомство.xlsx»</span>');
}
function task6Copy(){
 phase='copy-key';markRow(ORIGINAL);
 adminMessage('Файл вибрано. Затисніть Ctrl і натисніть C.\nОригінал залишиться на місці, а система запам’ятає копію.');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>C</kbd> копіювати</span>');
}
function beginTask7(){
 task=7;phase='paste-key';
 adminMessage('Копія вже в буфері VIDLIK.\nНатисніть Ctrl+V, щоб вставити її в цю саму папку.');
 taskLabel(7,'ВСТАВТЕ КОПІЮ CTRL + V');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>V</kbd> вставити</span>');
}
function beginTask8(){
 task=8;phase='cut-select';clearFocus();
 adminMessage('Тепер перемістимо створену копію.\nСтрілками виберіть «Знайомство (2).xlsx».');
 taskLabel(8,'ПЕРЕМІСТІТЬ ФАЙЛ CTRL + X / CTRL + V');
 setHelp('<span><kbd>↑</kbd><kbd>↓</kbd> вибрати копію</span>');
}
function task8Cut(){
 phase='cut-key';markRow(COPY);
 adminMessage('Натисніть Ctrl+X. Файл стане напівпрозорим — це означає, що він підготовлений до переміщення.');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>X</kbd> вирізати</span>');
}
function task8Back(){
 phase='move-tab';clearFocus();
 adminMessage('Тепер повернемося до «Документів» без миші.\nНатисніть Tab — фокус перейде на кнопку ←.');
 setHelp('<span><kbd>TAB</kbd> вибрати кнопку ←</span>');
}
function task8EnterBack(){
 phase='move-enter';
 adminMessage('Кнопка «Назад» у фокусі. Натисніть Enter.');
 setHelp('<span><kbd>ENTER</kbd> активувати кнопку ←</span>');
}
function task8Paste(){
 phase='move-paste';clearFocus();
 adminMessage('Ми повернулися до «Документів».\nНатисніть Ctrl+V — вирізаний файл буде переміщено сюди.');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>V</kbd> завершити переміщення</span>');
}
function beginTask9(){
 task=9;phase='undo';
 adminMessage('Уявімо, що це була помилка.\nНатисніть Ctrl+Z, щоб скасувати останню дію.');
 taskLabel(9,'СКАСУЙТЕ ДІЮ CTRL + Z');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>Z</kbd> скасувати</span>');
}
function beginTask10(){
 task=10;phase='select-all';
 adminMessage('У папці багато об’єктів. Не потрібно вибирати кожен окремо.\nНатисніть Ctrl+A, щоб виділити все.');
 taskLabel(10,'ВИДІЛІТЬ УСІ ОБ’ЄКТИ CTRL + A');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>A</kbd> виділити все</span>');
}
function beginTask11(){
 task=11;phase='search-shortcut';
 adminMessage('Остання навичка цього розділу — швидкий пошук.\nНатисніть Ctrl+F.');
 taskLabel(11,'ЗНАЙДІТЬ ОБ’ЄКТ CTRL + F');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>F</kbd> пошук</span>');
}
function task11Input(){
 phase='search-input';
 const i=searchInput();if(i)i.classList.add('vidlik-tutorial-ui-target','os-inline-keyboard-search');
 adminMessage('Поле пошуку активне. Введіть «Звіти» і натисніть Enter.');
 setHelp('<span><kbd>ТЕКСТ</kbd> Звіти · <kbd>ENTER</kbd> знайти</span>');
}
function finish(){
 active=false;task=12;phase='complete';clearFocus();
 adminMessage('Готово. Ви навчилися керувати файлами з клавіатури: переміщатися, відкривати, видаляти, копіювати, вставляти, вирізати, скасовувати дії, виділяти все та шукати.');
 setFooter('11 / 11 · РОБОТА З КЛАВІАТУРОЮ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> розділ «Робота з клавіатурою» завершено</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:keyboard-section-complete')),450);
}

function start(){
 if(active)return;
 active=true;task=0;phase='starting';clearFocus();
 window.VIDLIK_OS?.openDesktopApp?.('docs');
 later(beginTask1,180);
}
function reset(){active=false;task=0;phase='idle';helperLock=false;clearFocus()}

window.addEventListener('keydown',e=>{
 if(!active)return;
 const key=e.key.toLowerCase();

 if(phase==='arrows'){
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   later(()=>{if(selectedName()===FOLDER)beginTask2()},35);
   return;
  }
 }

 if(phase==='enter-open'&&e.key==='Enter'){
  later(()=>{if(address().includes(FOLDER))beginTask3()},70);
  return;
 }

 if(phase==='tab-forward'&&e.key==='Tab'&&!e.shiftKey){
  stop(e);
  const next=focusIndex<0?0:Math.min(focusIndex+1,keyboardFocusables().length-1);
  setKeyboardFocus(next);
  if(focusIndex>=1)later(beginTask4,110);
  return;
 }

 if(phase==='tab-back'&&e.key==='Tab'&&e.shiftKey){
  stop(e);
  setKeyboardFocus(Math.max(0,focusIndex-1));
  later(beginTask5,130);
  return;
 }

 if(phase==='delete-select'){
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   later(()=>{if(selectedName()===DRAFT)task5Delete()},35);
   return;
  }
 }
 if(phase==='delete-key'&&e.key==='Delete'){
  later(()=>{if(!row(DRAFT))beginTask6()},70);
  return;
 }

 if(phase==='copy-select'){
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   later(()=>{if(selectedName()===ORIGINAL)task6Copy()},35);
   return;
  }
 }
 if(phase==='copy-key'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='c'){
  later(()=>{if(toastText().includes('Скопійовано'))beginTask7();else beginTask7()},55);
  return;
 }

 if(phase==='paste-key'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='v'){
  later(()=>{if(row(COPY))beginTask8()},90);
  return;
 }

 if(phase==='cut-select'){
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   later(()=>{if(selectedName()===COPY)task8Cut()},35);
   return;
  }
 }
 if(phase==='cut-key'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='x'){
  later(task8Back,70);
  return;
 }
 if(phase==='move-tab'&&e.key==='Tab'&&!e.shiftKey){
  stop(e);setKeyboardFocus(0);later(task8EnterBack,90);return;
 }
 if(phase==='move-enter'&&e.key==='Enter'){
  stop(e);
  clickInternal(backButton());
  later(()=>{if(address().endsWith('Документи'))task8Paste()},70);
  return;
 }
 if(phase==='move-paste'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='v'){
  later(()=>{if(row(COPY))beginTask9()},95);
  return;
 }

 if(phase==='undo'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='z'){
  later(()=>{if(!row(COPY)&&sectorHas(COPY))beginTask10()},110);
  return;
 }

 if(phase==='select-all'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='a'){
  later(()=>{
   const all=rows(),sel=explorer()?.querySelectorAll('.os-file-item.selected')||[];
   if(all.length>1&&sel.length===all.length)beginTask11();
  },55);
  return;
 }

 if(phase==='search-shortcut'&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='f'){
  later(()=>{if(searchInput())task11Input()},70);
  return;
 }
 if(phase==='search-input'){
  if(e.key==='Enter'){
   later(()=>{if(visibleNames().some(n=>n==='Звіти'))finish()},100);
  }
  return;
 }

 if(e.key==='Escape'){stop(e);helper('Пауза поки не потрібна. Завершіть поточне завдання клавіатурою.');return}
 if(['Tab','Enter','Delete'].includes(e.key)||e.ctrlKey){
  stop(e);helper('Зараз використайте саме комбінацію, яку показано внизу екрана.');
 }
},true);

mon.addEventListener('pointerdown',e=>{
 if(!active||internalClick)return;
 stop(e);
 helper('У цьому розділі працюємо клавіатурою. Мишу поки не використовуємо.');
},true);
mon.addEventListener('click',e=>{
 if(!active||internalClick)return;
 if(e.isTrusted)stop(e);
},true);
mon.addEventListener('contextmenu',e=>{if(active&&!internalClick)stop(e)},true);

window.addEventListener('vidlik:section3-ready',start);
window.addEventListener('vidlik:os-reset',reset);
window.VIDLIK_KEYBOARD_TUTORIAL={start,reset,get task(){return task},get phase(){return phase},get active(){return active}};
})();
