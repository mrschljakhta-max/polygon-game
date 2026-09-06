(()=>{
'use strict';

const scene=document.getElementById('scene');
const mon=document.querySelector('.monitor-screen');
const desk=document.getElementById('desktopIcons');
const pc=desk?.querySelector('.desktop-icon[data-app="pc"]');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!scene||!mon||!desk||!pc||!chat||!footer)return;

let active=false;
let step=0;
let lastPoint=null;
let travelled=0;
let readyAt=0;
let startTimer=0;
let helperLock=false;
let currentTarget=null;

function nowTime(){
 return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
}

function scrollLatest(row){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const top=Math.max(0,chat.scrollHeight-chat.clientHeight);
  if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});
  else chat.scrollTop=top;
  row?.setAttribute('data-visible-latest','true');
 }));
}

function adminMessage(text){
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message';
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
 head.append(name,time);
 bubble.append(head,p);
 row.append(bubble);
 chat.appendChild(row);
 scrollLatest(row);
}

function setFooter(text){
 footer.textContent=text;
 footer.classList.add('vidlik-tutorial-footer');
}

function setHelp(html){
 if(!help)return;
 help.classList.add('vidlik-tutorial-help');
 help.innerHTML=html;
}

function clearTarget(){
 pc.classList.remove('vidlik-tutorial-target','vidlik-tutorial-double');
 document.querySelectorAll('.vidlik-tutorial-ui-target').forEach(x=>x.classList.remove('vidlik-tutorial-ui-target'));
 currentTarget=null;
}

function target(el){
 clearTarget();
 if(!el)return;
 currentTarget=el;
 el.classList.add('vidlik-tutorial-ui-target');
}

function explorer(){return document.querySelector('.os-window[data-window-id="explorer"]')}
function winButton(kind){return explorer()?.querySelector(`[data-win="${kind}"]`)||null}
function taskButton(){return document.querySelector('.os-running-button[data-task-window="explorer"]')}
function docsRow(){
 return [...(explorer()?.querySelectorAll('.os-file-item')||[])].find(x=>x.querySelector('.os-file-name b')?.textContent.trim()==='Документи')||null;
}
function backButton(){return explorer()?.querySelector('[data-act="back"]')||null}

function selectPc(){
 desk.querySelectorAll('.desktop-icon').forEach(x=>x.classList.toggle('is-selected',x===pc));
}

function reset(){
 active=false;
 step=0;
 lastPoint=null;
 travelled=0;
 readyAt=0;
 helperLock=false;
 clearTimeout(startTimer);
 clearTarget();
 footer.classList.remove('vidlik-tutorial-footer');
 help?.classList.remove('vidlik-tutorial-help');
}

function start(){
 reset();
 active=true;
 startTimer=setTimeout(()=>{
  if(!active)return;
  step=1;
  travelled=0;
  lastPoint=null;
  adminMessage('Почнемо з миші.\nПросто порухайте нею й подивіться на стрілку на моніторі.');
  setFooter('ЗАВДАННЯ 1 / 9 · ПОРУХАЙТЕ МИШЕЮ');
  setHelp('<span><kbd>МИША</kbd> рухайте курсором</span>');
 },700);
}

function completeMouse(){
 if(!active||step!==1)return;
 step=2;
 lastPoint=null;
 travelled=0;
 pc.classList.add('vidlik-tutorial-target');
 adminMessage('Добре. Це курсор.\nТепер наведіть його на «Цей ПК» і один раз натисніть ліву кнопку миші.');
 setFooter('ЗАВДАННЯ 2 / 9 · ОДИН КЛІК ПО «ЦЕЙ ПК»');
 setHelp('<span><kbd>ЛКМ</kbd> один клік · виділити об’єкт</span>');
}

function completeSingleClick(){
 if(!active||step!==2)return;
 selectPc();
 step=3;
 readyAt=performance.now()+800;
 pc.classList.add('vidlik-tutorial-double');
 adminMessage('Об’єкт виділено. Один клік лише вибирає його.\nТепер двічі швидко натисніть ліву кнопку, щоб відкрити «Цей ПК».');
 setFooter('ЗАВДАННЯ 3 / 9 · ПОДВІЙНИЙ КЛІК');
 setHelp('<span><kbd>ЛКМ ×2</kbd> подвійний клік · відкрити</span>');
}

function openPcFromTutorial(){
 if(!window.VIDLIK_OS?.openDesktopApp)return false;
 window.VIDLIK_OS.openDesktopApp('pc');
 return true;
}

function completeDoubleClick(){
 if(!active||step!==3)return;
 if(!openPcFromTutorial())return;
 setTimeout(()=>{
  const w=explorer();
  if(!active||step!==3||!w)return;
  step=4;
  clearTarget();
  const max=winButton('max');
  target(max);
  adminMessage('Чудово. Ви відкрили «Цей ПК». Це вікно Провідника.\nУ правому верхньому куті є кнопки керування вікном. Натисніть □, щоб розгорнути його на всю робочу область.');
  setFooter('ЗАВДАННЯ 4 / 9 · РОЗГОРНІТЬ ВІКНО');
  setHelp('<span><kbd>□</kbd> розгорнути вікно</span>');
 },160);
}

function afterMaximize(){
 const w=explorer();
 if(!active||step!==4||!w?.classList.contains('os-maximized'))return;
 step=5;
 target(winButton('max'));
 adminMessage('Вікно розгорнуто. Так зручніше працювати, коли потрібно більше місця.\nТепер натисніть ❐ на тому самому місці, щоб повернути звичайний розмір.');
 setFooter('ЗАВДАННЯ 5 / 9 · ПОВЕРНІТЬ РОЗМІР ВІКНА');
 setHelp('<span><kbd>❐</kbd> відновити розмір</span>');
}

function afterRestoreSize(){
 const w=explorer();
 if(!active||step!==5||!w||w.classList.contains('os-maximized'))return;
 step=6;
 target(winButton('min'));
 adminMessage('Добре. Тепер згорнемо вікно.\nНатисніть —. Вікно зникне з екрана, але програма залишиться відкритою на панелі задач унизу.');
 setFooter('ЗАВДАННЯ 6 / 9 · ЗГОРНІТЬ ВІКНО');
 setHelp('<span><kbd>—</kbd> згорнути</span>');
}

function afterMinimize(){
 const w=explorer();
 if(!active||step!==6||!w?.classList.contains('os-minimized'))return;
 step=7;
 const tb=taskButton();
 target(tb);
 adminMessage('Провідник не закрито — він лише згорнутий.\nНа панелі задач унизу залишилася його кнопка «Цей ПК». Натисніть її, щоб повернути вікно.');
 setFooter('ЗАВДАННЯ 7 / 9 · ПОВЕРНІТЬ ВІКНО З ПАНЕЛІ ЗАДАЧ');
 setHelp('<span><kbd>ЛКМ</kbd> кнопка «Цей ПК» на панелі задач</span>');
}

function afterTaskRestore(){
 const w=explorer();
 if(!active||step!==7||!w||w.classList.contains('os-minimized'))return;
 step=8;
 setTimeout(()=>{
  const row=docsRow();
  target(row);
  adminMessage('Перед вами вміст «Цей ПК». Папки допомагають зберігати файли впорядковано.\nЗнайдіть «Документи» у списку й відкрийте цю папку подвійним кліком.');
  setFooter('ЗАВДАННЯ 8 / 9 · ВІДКРИЙТЕ ПАПКУ «ДОКУМЕНТИ»');
  setHelp('<span><kbd>ЛКМ ×2</kbd> відкрити папку «Документи»</span>');
 },100);
}

function afterDocsOpen(){
 const w=explorer();
 if(!active||step!==8||!w)return;
 const address=w.querySelector('.os-address')?.textContent||'';
 if(!address.includes('Документи'))return;
 step=9;
 setTimeout(()=>{
  const back=backButton();
  target(back);
  adminMessage('Ви зайшли всередину папки «Документи».\nЩоб повернутися туди, звідки прийшли, натисніть стрілку ← у верхній частині Провідника.');
  setFooter('ЗАВДАННЯ 9 / 9 · ПОВЕРНІТЬСЯ НАЗАД');
  setHelp('<span><kbd>←</kbd> кнопка «Назад» у Провіднику</span>');
 },100);
}

function finishBlock(){
 if(!active||step!==9)return;
 const w=explorer();
 const address=w?.querySelector('.os-address')?.textContent||'';
 if(!w||address.trim()!=='Цей ПК')return;
 step=10;
 active=false;
 clearTarget();
 adminMessage('Чудово. Тепер ви вмієте відкривати об’єкти, керувати вікном, користуватися панеллю задач, заходити в папку та повертатися назад.');
 setFooter('9 / 9 · БАЗОВЕ ЗНАЙОМСТВО З РОБОЧОЮ СТАНЦІЄЮ ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> базовий блок виконано</span>');
 window.dispatchEvent(new CustomEvent('vidlik:tutorial-basic-window-block-complete'));
}

function helper(text){
 if(helperLock)return;
 helperLock=true;
 adminMessage(text);
 setTimeout(()=>{helperLock=false},1300);
}

function stop(e){
 e.preventDefault();
 e.stopPropagation();
 e.stopImmediatePropagation();
}

scene.addEventListener('pointermove',e=>{
 if(!active||step!==1||e.pointerType==='touch')return;
 if(!lastPoint){lastPoint={x:e.clientX,y:e.clientY};return}
 const dx=e.clientX-lastPoint.x,dy=e.clientY-lastPoint.y;
 travelled+=Math.hypot(dx,dy);
 lastPoint={x:e.clientX,y:e.clientY};
 if(travelled>=140)completeMouse();
},{passive:true});

/* Steps 1–3: tutorial fully owns desktop interaction. */
desk.addEventListener('click',e=>{
 if(!active||step>=4)return;
 const clicked=e.target.closest('.desktop-icon');
 if(!clicked)return;
 stop(e);
 if(step===0||step===1){
  if(step===1)helper('Поки нічого не натискайте. Спочатку просто порухайте мишею.');
  return;
 }
 if(step===2){
  if(clicked!==pc){helper('Зараз працюємо з «Цей ПК». Наведіть курсор саме на цей значок.');return}
  if(e.detail!==1){helper('Спочатку лише один клік. Він потрібен, щоб вибрати об’єкт.');return}
  completeSingleClick();
  return;
 }
 if(step===3){
  if(clicked!==pc){helper('Відкриваємо «Цей ПК». Двічі натисніть саме на його значок.');return}
  selectPc();
  if(performance.now()<readyAt)return;
  if(e.detail===2)completeDoubleClick();
 }
},true);

desk.addEventListener('dblclick',e=>{
 if(!active||step!==3)return;
 const clicked=e.target.closest('.desktop-icon');
 if(clicked!==pc)return;
 stop(e);
 if(performance.now()<readyAt)return;
 completeDoubleClick();
},true);

desk.addEventListener('contextmenu',e=>{
 if(!active||step>=4)return;
 const clicked=e.target.closest('.desktop-icon');
 if(!clicked)return;
 stop(e);
 if(step<=1){if(step===1)helper('Поки нічого не натискайте. Спочатку просто порухайте мишею.');return}
 helper('Це права кнопка миші. Вона відкриває додаткові дії. Зараз використайте ліву кнопку.');
},true);

/* Steps 4–9: allow only the requested monitor action, then verify the OS result. */
mon.addEventListener('click',e=>{
 if(!active||step<4||step>9)return;
 const w=explorer();
 if(!w)return;

 if(step===4||step===5){
  const max=e.target.closest('[data-win="max"]');
  if(!max||!w.contains(max)){
   if(e.target.closest('.monitor-screen')){stop(e);helper('Зараз використайте підсвічену кнопку керування вікном.')}
   return;
  }
  setTimeout(step===4?afterMaximize:afterRestoreSize,40);
  return;
 }

 if(step===6){
  const min=e.target.closest('[data-win="min"]');
  if(!min||!w.contains(min)){
   stop(e);helper('Зараз потрібно саме згорнути Провідник кнопкою —.');return;
  }
  setTimeout(afterMinimize,50);
  return;
 }

 if(step===7){
  const tb=e.target.closest('[data-task-window="explorer"]');
  if(!tb){stop(e);helper('Знайдіть кнопку «Цей ПК» на панелі задач унизу монітора.');return}
  setTimeout(afterTaskRestore,50);
  return;
 }

 if(step===8){
  const row=e.target.closest('.os-file-item');
  const wanted=docsRow();
  if(row!==wanted){
   stop(e);helper('Зараз відкриваємо саме папку «Документи».');return;
  }
  if(e.detail===2)setTimeout(afterDocsOpen,70);
  return;
 }

 if(step===9){
  const back=e.target.closest('[data-act="back"]');
  if(!back||!w.contains(back)){
   stop(e);helper('Натисніть стрілку ← у верхній частині вікна Провідника.');return;
  }
  setTimeout(finishBlock,70);
 }
},true);

window.addEventListener('vidlik:os-ready',start);
window.addEventListener('vidlik:os-reset',reset);

window.VIDLIK_TUTORIAL={
 get step(){return step},
 get active(){return active},
 restart:start
};
})();
