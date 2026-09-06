(()=>{
'use strict';

const scene=document.getElementById('scene');
const desk=document.getElementById('desktopIcons');
const pc=desk?.querySelector('.desktop-icon[data-app="pc"]');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!scene||!desk||!pc||!chat||!footer)return;

let active=false;
let step=0;
let lastPoint=null;
let travelled=0;
let readyAt=0;
let startTimer=0;
let helperLock=false;

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
}

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
  setFooter('ЗАВДАННЯ 1 / 3 · ПОРУХАЙТЕ МИШЕЮ');
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
 setFooter('ЗАВДАННЯ 2 / 3 · ОДИН КЛІК ПО «ЦЕЙ ПК»');
 setHelp('<span><kbd>ЛКМ</kbd> один клік · виділити об’єкт</span>');
}

function completeSingleClick(){
 if(!active||step!==2)return;
 selectPc();
 step=3;
 readyAt=performance.now()+800;
 pc.classList.add('vidlik-tutorial-double');
 adminMessage('Об’єкт виділено. Один клік лише вибирає його.\nТепер двічі швидко натисніть ліву кнопку, щоб відкрити «Цей ПК».');
 setFooter('ЗАВДАННЯ 3 / 3 · ПОДВІЙНИЙ КЛІК');
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
  if(!active||step!==3)return;
  const explorer=document.querySelector('.os-window[data-window-id="explorer"]');
  if(!explorer)return;
  step=4;
  clearTarget();
  adminMessage('Чудово. Ви відкрили «Цей ПК».\nЦе вікно Провідника. Перші три кроки виконано.');
  setFooter('3 / 3 · ВИКОНАНО ✓');
  setHelp('<span><kbd>ГОТОВО</kbd> перші три завдання виконано</span>');
  window.dispatchEvent(new CustomEvent('vidlik:tutorial-first-three-complete'));
 },140);
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

/* During these three steps the tutorial owns desktop clicks completely.
   The normal VIDLIK OS desktop handler never receives them. */
desk.addEventListener('click',e=>{
 if(!active||step>=4)return;
 const target=e.target.closest('.desktop-icon');
 if(!target)return;

 stop(e);

 if(step===0||step===1){
  if(step===1)helper('Поки нічого не натискайте. Спочатку просто порухайте мишею.');
  return;
 }

 if(step===2){
  if(target!==pc){
   helper('Зараз працюємо з «Цей ПК». Наведіть курсор саме на цей значок.');
   return;
  }
  if(e.detail!==1){
   helper('Спочатку лише один клік. Він потрібен, щоб вибрати об’єкт.');
   return;
  }
  completeSingleClick();
  return;
 }

 if(step===3){
  if(target!==pc){
   helper('Відкриваємо «Цей ПК». Двічі натисніть саме на його значок.');
   return;
  }
  selectPc();
  if(performance.now()<readyAt)return;
  if(e.detail===2)completeDoubleClick();
 }
},true);

desk.addEventListener('dblclick',e=>{
 if(!active||step!==3)return;
 const target=e.target.closest('.desktop-icon');
 if(target!==pc)return;
 stop(e);
 if(performance.now()<readyAt)return;
 completeDoubleClick();
},true);

desk.addEventListener('contextmenu',e=>{
 if(!active||step>=4)return;
 const target=e.target.closest('.desktop-icon');
 if(!target)return;
 stop(e);
 if(step===0||step===1){
  if(step===1)helper('Поки нічого не натискайте. Спочатку просто порухайте мишею.');
  return;
 }
 helper('Це права кнопка миші. Вона відкриває додаткові дії. Зараз використайте ліву кнопку.');
},true);

window.addEventListener('vidlik:os-ready',start);
window.addEventListener('vidlik:os-reset',reset);

window.VIDLIK_TUTORIAL={
 get step(){return step},
 get active(){return active},
 restart:start
};
})();
