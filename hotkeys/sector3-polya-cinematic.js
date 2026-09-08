(()=>{
'use strict';
if(window.VIDLIK_POLYA_CINEMATIC)return;

const scene=document.getElementById('scene');
const chat=document.getElementById('adminChat');
const help=document.getElementById('help');
const footer=document.getElementById('adminFooter');
const header=document.querySelector('.admin-header');
if(!scene||!chat||!help||!footer||!header)return;

let active=false;
let step=-1;
let waitingForTask=false;
let suppressLegacy=false;
let releaseTimer=0;
let hintHTML='';
let footerText='';
let restoringUi=false;

const LINES=[
 'Не закривай файл.',
 'І нічого поки не натискай.',
 'Ти зараз сам у кімнаті?',
 'У реєстрі зверху написано, що тут 267 записів.',
 'Не вір мені.\nНе вір їм.\nПорахуй сам.',
 'Перейди в клітинку F2. Введи формулу =COUNTA(B2:B269) і натисни Enter.\nCOUNTA рахує непорожні клітинки. Тут ми рахуємо всі заповнені імена у стовпці B.'
];

const style=document.createElement('style');
style.id='vidlik-polya-cinematic-style';
style.textContent=`
/* Keep the camera exactly where the rest of Sector 3 positioned it. Only the
   tablet changes geometry, so entering the dialogue cannot shove the scene. */
.scene .tablet-screen{
 transition:left .72s cubic-bezier(.2,.76,.22,1),top .72s cubic-bezier(.2,.76,.22,1),width .72s cubic-bezier(.2,.76,.22,1),height .72s cubic-bezier(.2,.76,.22,1),box-shadow .32s ease!important;
}
.scene.s3-polya-cinematic .tablet-screen{
 left:36.35%!important;top:7.8%!important;width:27.3%!important;height:84.4%!important;z-index:120!important;
 box-shadow:0 0 0 1px rgba(85,231,212,.55),0 0 48px rgba(85,231,212,.22),0 28px 90px rgba(0,0,0,.55),inset 0 0 18px rgba(85,231,212,.08)!important
}
.scene.s3-polya-cinematic::after{
 content:'';position:absolute;inset:0;z-index:36;pointer-events:none;
 background:radial-gradient(circle at 50% 50%,transparent 28%,rgba(0,0,0,.16) 62%,rgba(0,0,0,.42));
 opacity:1;transition:opacity .32s ease
}
.scene.s3-polya-cinematic .monitor-screen{filter:brightness(.62) saturate(.78);transition:filter .35s ease}
.scene.s3-polya-cinematic .keys{z-index:520!important}
.scene.s3-polya-cinematic .pause{z-index:900!important}
.admin-message.s3-polya-cinematic-owned .admin-bubble{box-shadow:0 0 22px rgba(255,76,98,.08)}
`;
document.head.appendChild(style);

function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(row){requestAnimationFrame(()=>requestAnimationFrame(()=>{chat.scrollTop=Math.max(0,chat.scrollHeight-chat.clientHeight);row?.setAttribute('data-visible-latest','true')}))}
function addOwnedMessage(text){
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-polya-cinematic-owned';
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent='ПОЛЯ';
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=nowTime();
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);row.appendChild(bubble);chat.appendChild(row);scrollLatest(row);
}
function applyLockedUi(){
 if(!active||restoringUi)return;
 restoringUi=true;
 queueMicrotask(()=>{
  try{
   if(active&&hintHTML&&help.innerHTML!==hintHTML)help.innerHTML=hintHTML;
   if(active&&footerText&&footer.textContent!==footerText)footer.textContent=footerText;
  }finally{restoringUi=false}
 });
}
function setHint(extra=''){
 hintHTML=`<span><kbd>ENTER</kbd> ${extra||'наступне повідомлення'}</span><span><kbd>ESC</kbd> пауза</span>`;
 if(help.innerHTML!==hintHTML)help.innerHTML=hintHTML;
}
function setFooter(text){footerText=text;if(footer.textContent!==text)footer.textContent=text}
function showNext(){
 if(!active)return;
 if(step<LINES.length-1){
  step++;
  addOwnedMessage(LINES[step]);
  if(step===LINES.length-1){setHint('повернутись до Excel');setFooter('ПОЛЯ · ПЕРЕВІРКА РЕЄСТРУ')}
  else setHint();
  return;
 }
 finishWhenReady();
}
function removeStoryCurtain(){
 const curtain=document.getElementById('s3StoryJumpCurtain');
 if(curtain){curtain.classList.add('is-leaving');setTimeout(()=>curtain.remove(),320)}
 document.documentElement.classList.remove('s3-story-jump-preparing');
}
function purgeLegacyChat(){
 for(const row of [...chat.querySelectorAll('.admin-message')]){
  if(!row.classList.contains('s3-polya-cinematic-owned'))row.remove();
 }
}
function begin(){
 if(active)return;
 active=true;step=-1;waitingForTask=false;suppressLegacy=true;
 clearTimeout(releaseTimer);
 chat.innerHTML='';
 scene.classList.add('s3-polya-cinematic');
 setFooter('ПОЛЯ · ЗАХИЩЕНИЙ КАНАЛ');
 setHint();
 removeStoryCurtain();
 /* Legacy save callbacks can still land during this same second. Strip them
    before the first player-visible line so Scene 01 truly starts with Polya. */
 setTimeout(()=>{if(active){purgeLegacyChat();if(step<0)showNext()}},650);
}
function finishWhenReady(){
 if(!active||waitingForTask)return;
 waitingForTask=true;
 const wait=()=>{
  const t=window.VIDLIK_EXCEL_STORY_TUTORIAL;
  if(!active)return;
  if(t?.active&&t.task===6){finish();return}
  setTimeout(wait,80);
 };
 wait();
}
function finish(){
 if(!active)return;
 active=false;waitingForTask=false;
 scene.classList.remove('s3-polya-cinematic');
 footerText='';hintHTML='';
 footer.textContent='ЗАВДАННЯ 6 / 7 · ПЕРЕВІРТЕ КІЛЬКІСТЬ ЗАПИСІВ';
 help.innerHTML='<span><kbd>F2</kbd> поле «ФАКТИЧНО»</span><span><kbd>=COUNTA(B2:B269)</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>';
 releaseTimer=setTimeout(()=>{suppressLegacy=false},1200);
}

const legacyObserver=new MutationObserver(records=>{
 if(!active&&!suppressLegacy)return;
 for(const r of records)for(const n of r.addedNodes){
  if(!(n instanceof Element))continue;
  const rows=[];
  if(n.matches?.('.admin-message'))rows.push(n);
  n.querySelectorAll?.('.admin-message').forEach(x=>rows.push(x));
  for(const row of rows){
   if(row.classList.contains('s3-polya-cinematic-owned'))continue;
   row.remove();
  }
 }
});
legacyObserver.observe(chat,{childList:true,subtree:true});

/* Excel's legacy reconciler continues running underneath the cinematic and can
   rewrite the bottom help/footer as soon as task 6 becomes active. Keep those
   surfaces owned by the dialogue until the player explicitly leaves it. */
const helpObserver=new MutationObserver(applyLockedUi);
helpObserver.observe(help,{childList:true,subtree:true,characterData:true});
const footerObserver=new MutationObserver(applyLockedUi);
footerObserver.observe(footer,{childList:true,subtree:true,characterData:true});

const headerObserver=new MutationObserver(()=>{
 if(header.classList.contains('excel-polya-channel')&&!active){
  const t=window.VIDLIK_EXCEL_STORY_TUTORIAL;
  if(t?.active&&t.phase==='saving')begin();
 }
});
headerObserver.observe(header,{attributes:true,attributeFilter:['class']});

window.addEventListener('keydown',e=>{
 if(!active||e.repeat)return;
 if(e.key==='Escape')return;
 if(e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showNext();return;
 }
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
},true);

window.addEventListener('vidlik:os-reset',()=>{
 active=false;waitingForTask=false;suppressLegacy=false;footerText='';hintHTML='';clearTimeout(releaseTimer);scene.classList.remove('s3-polya-cinematic');removeStoryCurtain();
});

window.VIDLIK_POLYA_CINEMATIC={begin,showNext,finish,get active(){return active},get step(){return step}};
})();
