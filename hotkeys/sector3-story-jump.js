(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

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

function installCurtain(){
 if(document.getElementById('s3StoryJumpCurtain'))return;
 document.documentElement.classList.add('s3-story-jump-preparing');
 const style=document.createElement('style');
 style.id='s3-story-jump-curtain-style';
 style.textContent=`
 #s3StoryJumpCurtain{position:absolute;inset:0;z-index:850;background:#030607 url('assets/sector3-prologue/desk.webp') center/cover no-repeat;opacity:1;transition:opacity .30s ease;pointer-events:auto}
 #s3StoryJumpCurtain::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.10)}
 #s3StoryJumpCurtain.is-leaving{opacity:0;pointer-events:none}
 `;
 document.head.appendChild(style);
 const curtain=document.createElement('div');curtain.id='s3StoryJumpCurtain';document.getElementById('scene')?.appendChild(curtain);
}
installCurtain();

function returnToScenes(){cancelled=true;location.href='module-briefing.html?sector=3&from=story'}
function escapeDuringJump(e){
 if(ready||e.key!=='Escape')return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();returnToScenes();
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
 window.dispatchEvent(new KeyboardEvent('keydown',init));window.dispatchEvent(new KeyboardEvent('keyup',init));
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
function typeText(text,step=2,done){
 let i=0;const next=()=>{if(cancelled)return;if(i>=text.length){done?.();return}const s=charSpec(text[i++]);fire(s.key,s.code,s);setTimeout(next,step)};next();
}
function clearTutorialChat(){const chat=document.getElementById('adminChat');if(chat)chat.innerHTML=''}
function waitFor(test,then,{timeout=12000,interval=25,label='контрольної точки'}={}){
 const started=performance.now();
 const tick=()=>{
  if(cancelled)return;let ok=false;try{ok=!!test()}catch(_){}
  if(ok){then();return}
  if(performance.now()-started>=timeout){console.warn(`[VIDLIK] Не вдалося підготувати ${label}`);return}
  setTimeout(tick,interval);
 };
 tick();
}
function handEscapeToGame(){if(ready)return;ready=true;window.removeEventListener('keydown',escapeDuringJump,true)}
function finishJump(){handEscapeToGame();mutationObserver?.disconnect()}

function ensurePolyaModule(done){
 if(window.VIDLIK_POLYA_CINEMATIC){done();return}
 const existing=document.querySelector('script[data-s3-polya-cinematic]');
 if(existing){existing.addEventListener('load',done,{once:true});return}
 const s=document.createElement('script');s.src='sector3-polya-cinematic.js?v=20260908-3';s.dataset.s3PolyaCinematic='1';s.onload=done;document.head.appendChild(s);
}

function runCheckpoint(OS,excel){
 waitFor(()=>excel.active&&excel.task===1,()=>{
  clickCell('B2');
  waitFor(()=>excel.task===2,()=>{
   clickCell('B2');fire('3','Digit3');setTimeout(()=>fire('Enter','Enter'),10);
   waitFor(()=>excel.task===3,()=>{
    try{OS.setLanguage('ENG')}catch(_){}
    clickCell('B3');typeText('VIDLIK',2,()=>setTimeout(()=>fire('Tab','Tab'),10));
    waitFor(()=>excel.task===4,()=>{
     try{OS.setLanguage('ENG')}catch(_){}
     clickCell('B5');typeText('=SUM(12;8)',2,()=>setTimeout(()=>fire('Enter','Enter'),10));
     waitFor(()=>excel.task===5,()=>{
      clearTutorialChat();
      fire('s','KeyS',{ctrlKey:true});
      waitFor(()=>window.VIDLIK_POLYA_CINEMATIC?.active===true,()=>{
       handEscapeToGame();finishJump();
      },{timeout:10000,label:'перехоплення каналу Полею'});
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
 if(!OS||!excel){setTimeout(boot,30);return}
 showOperationalLayer();
 try{OS.enable()}catch(_){}
 try{excel.start()}catch(_){}
 runCheckpoint(OS,excel);
}

ensurePolyaModule(boot);
})();
