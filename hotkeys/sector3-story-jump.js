(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

/*
 * Developer/story navigation checkpoint for Scene 01.
 * The old implementation advanced Excel on fixed millisecond timers. After the
 * Excel onboarding became richer, those timers raced the tutorial state and a
 * direct jump could visibly land in task 1/2 with half-entered data. This version
 * waits for the actual tutorial task before performing each prerequisite action.
 */
document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
const app=document.querySelector('.app');
if(app)app.style.visibility='visible';

let ready=false;
let mutationObserver=null;
let cancelled=false;

function removeTitleLayers(){
 document.getElementById('vidlikPrologueTitle')?.remove();
 document.getElementById('vidlikAct1Title')?.remove();
 document.querySelector('.a1-desktop-reveal')?.remove();
 document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
}
removeTitleLayers();
mutationObserver=new MutationObserver(removeTitleLayers);
mutationObserver.observe(document.body,{childList:true,subtree:true});

function returnToScenes(){
 cancelled=true;
 location.href='module-briefing.html?sector=3&from=story';
}
function escapeDuringJump(e){
 if(ready||e.key!=='Escape')return;
 e.preventDefault();
 e.stopPropagation();
 e.stopImmediatePropagation();
 returnToScenes();
}
window.addEventListener('keydown',escapeDuringJump,true);

function showOperationalLayer(){
 ['idleLayer','incomingLayer','videoLayer','syncLayer'].forEach(id=>document.getElementById(id)?.classList.remove('visible'));
 document.getElementById('adminLayer')?.classList.add('visible');
 document.querySelector('.monitor-sync-overlay')?.classList.remove('visible');
 document.querySelector('.sync-flash-layer')?.classList.remove('visible');
}

function fire(key,code,extra={}){
 const init={key,code,bubbles:true,cancelable:true,...extra};
 window.dispatchEvent(new KeyboardEvent('keydown',init));
 window.dispatchEvent(new KeyboardEvent('keyup',init));
}
function clickCell(addr){document.querySelector(`.os-excel-story-window [data-cell="${addr}"]`)?.click()}
function charSpec(ch){
 if(/[A-Z]/.test(ch))return{key:ch,code:`Key${ch}`,shiftKey:true};
 if(/[a-z]/.test(ch))return{key:ch,code:`Key${ch.toUpperCase()}`};
 if(/[0-9]/.test(ch))return{key:ch,code:`Digit${ch}`};
 if(ch==='=')return{key:'=',code:'Equal'};
 if(ch==='(')return{key:'(',code:'Digit9',shiftKey:true};
 if(ch===')')return{key:')',code:'Digit0',shiftKey:true};
 if(ch===';')return{key:';',code:'Semicolon'};
 return{key:ch,code:''};
}
function typeText(text,step=24,done){
 let i=0;
 const next=()=>{
  if(cancelled)return;
  if(i>=text.length){done?.();return}
  const s=charSpec(text[i++]);
  fire(s.key,s.code,s);
  setTimeout(next,step);
 };
 next();
}
function setPrepHint(text){
 const help=document.getElementById('help');
 if(help)help.innerHTML=`<span><kbd>СЦЕНА 01</kbd> ${text}</span>`;
}
function clearTutorialChat(){
 const chat=document.getElementById('adminChat');
 if(chat)chat.innerHTML='';
}

function waitFor(test,then,{timeout=12000,interval=45,label='контрольної точки'}={}){
 const started=performance.now();
 const tick=()=>{
  if(cancelled)return;
  let ok=false;
  try{ok=!!test()}catch(_){}
  if(ok){then();return}
  if(performance.now()-started>=timeout){
   console.warn(`[VIDLIK] Не вдалося підготувати ${label}`);
   setPrepHint(`не вдалося підготувати ${label} · ESC — назад`);
   return;
  }
  setTimeout(tick,interval);
 };
 tick();
}

function handEscapeToGame(){
 if(ready)return;
 ready=true;
 window.removeEventListener('keydown',escapeDuringJump,true);
}
function finishJump(){
 handEscapeToGame();
 mutationObserver?.disconnect();
 const help=document.getElementById('help');
 if(help&&/СЦЕНА 01|підготов/i.test(help.textContent||''))help.innerHTML='<span><kbd>EXCEL</kbd> продовжуйте за підказкою</span>';
}

function runCheckpoint(OS,excel){
 setPrepHint('підготовка контрольної точки… · ESC — назад');

 // 1. Wait until the tutorial really asks for B2, then select it.
 waitFor(()=>excel.active&&excel.task===1,()=>{
  clickCell('B2');

  // 2. Only after task 2 is active, enter the sector number.
  waitFor(()=>excel.task===2,()=>{
   clickCell('B2');
   fire('3','Digit3');
   setTimeout(()=>fire('Enter','Enter'),70);

   // 3. Operator name. Language is switched through the OS API first.
   waitFor(()=>excel.task===3,()=>{
    try{OS.setLanguage('ENG')}catch(_){}
    clickCell('B3');
    typeText('VIDLIK',26,()=>setTimeout(()=>fire('Tab','Tab'),70));

    // 4. First formula.
    waitFor(()=>excel.task===4,()=>{
     try{OS.setLanguage('ENG')}catch(_){}
     clickCell('B5');
     typeText('=SUM(12;8)',24,()=>setTimeout(()=>fire('Enter','Enter'),80));

     // 5. Save. From here the actual Scene 01 takeover owns the screen.
     waitFor(()=>excel.task===5,()=>{
      clearTutorialChat();
      handEscapeToGame();
      fire('s','KeyS',{ctrlKey:true});

      // The story takeover itself deliberately has pauses. Finish only when
      // Polya has moved the player to the 267 → 268 investigation task.
      waitFor(()=>excel.task===6,()=>{
       finishJump();
      },{timeout:15000,label:'сцену «Інша версія»'});
     },{label:'збереження Excel'});
    },{label:'першу формулу'});
   },{label:'введення оператора'});
  },{label:'номер сектора'});
 },{label:'Excel · B2'});
}

function boot(){
 if(cancelled)return;
 const OS=window.VIDLIK_OS;
 const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(!OS||!excel){setTimeout(boot,40);return}

 showOperationalLayer();
 try{OS.enable()}catch(_){}
 try{excel.start()}catch(_){}
 runCheckpoint(OS,excel);
}

boot();
})();
