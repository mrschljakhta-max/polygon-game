(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
const app=document.querySelector('.app');
if(app)app.style.visibility='visible';

let cancelled=false;
let ready=false;

function removeTitleLayers(){
 document.getElementById('vidlikPrologueTitle')?.remove();
 document.getElementById('vidlikAct1Title')?.remove();
 document.querySelector('.a1-desktop-reveal')?.remove();
 document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
}
removeTitleLayers();
const titleObserver=new MutationObserver(removeTitleLayers);
titleObserver.observe(document.body,{childList:true,subtree:true});

function returnToScenes(){cancelled=true;location.href='module-briefing.html?sector=3&from=story'}
function escapeDuringPrep(e){
 if(ready||e.key!=='Escape')return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();returnToScenes();
}
window.addEventListener('keydown',escapeDuringPrep,true);

function showOperationalLayer(){
 ['idleLayer','incomingLayer','videoLayer','syncLayer'].forEach(id=>document.getElementById(id)?.classList.remove('visible'));
 document.getElementById('adminLayer')?.classList.add('visible');
 document.querySelector('.monitor-sync-overlay')?.classList.remove('visible');
 document.querySelector('.sync-flash-layer')?.classList.remove('visible');
}
function installCurtain(){
 if(document.getElementById('s3StoryJumpCurtain'))return;
 const style=document.createElement('style');
 style.id='s3-story-jump-curtain-style';
 style.textContent=`#s3StoryJumpCurtain{position:absolute;inset:0;z-index:850;background:#030607 url('assets/sector3-prologue/desk.webp') center/cover no-repeat;opacity:1;transition:opacity .32s ease;pointer-events:auto}#s3StoryJumpCurtain.is-leaving{opacity:0;pointer-events:none}`;
 document.head.appendChild(style);
 const curtain=document.createElement('div');curtain.id='s3StoryJumpCurtain';document.getElementById('scene')?.appendChild(curtain);
}
function removeCurtain(){const c=document.getElementById('s3StoryJumpCurtain');if(!c)return;c.classList.add('is-leaving');setTimeout(()=>c.remove(),360)}
installCurtain();

function fire(key,code,extra={}){const init={key,code,bubbles:true,cancelable:true,...extra};window.dispatchEvent(new KeyboardEvent('keydown',init));window.dispatchEvent(new KeyboardEvent('keyup',init))}
function clickCell(addr){document.querySelector(`.os-excel-story-window [data-cell="${addr}"]`)?.click()}
function charSpec(ch){if(/[A-Z]/.test(ch))return{key:ch,code:`Key${ch}`,shiftKey:true};if(/[a-z]/.test(ch))return{key:ch,code:`Key${ch.toUpperCase()}`};if(/[0-9]/.test(ch))return{key:ch,code:`Digit${ch}`};if(ch==='=')return{key:'=',code:'Equal'};if(ch==='(')return{key:'(',code:'Digit9',shiftKey:true};if(ch===')')return{key:')',code:'Digit0',shiftKey:true};if(ch===';')return{key:';',code:'Semicolon'};return{key:ch,code:''}}
function typeText(text,done){let i=0;const next=()=>{if(cancelled)return;if(i>=text.length){done?.();return}const s=charSpec(text[i++]);fire(s.key,s.code,s);setTimeout(next,3)};next()}
function waitFor(test,then,timeout=12000){const start=performance.now();const tick=()=>{if(cancelled)return;let ok=false;try{ok=!!test()}catch(_){}if(ok){then();return}if(performance.now()-start>timeout){console.warn('[VIDLIK] Scene 01 checkpoint timeout');removeCurtain();ready=true;window.removeEventListener('keydown',escapeDuringPrep,true);return}setTimeout(tick,30)};tick()}
function clearChat(){const c=document.getElementById('adminChat');if(c)c.innerHTML=''}
function forcePolya(){
 if(cancelled)return;
 clearChat();
 const start=()=>{
  const p=window.VIDLIK_POLYA_CINEMATIC;
  if(!p){setTimeout(start,40);return}
  try{p.begin()}catch(err){console.error('[VIDLIK Polya begin]',err)}
  removeCurtain();ready=true;titleObserver.disconnect();window.removeEventListener('keydown',escapeDuringPrep,true);
 };
 start();
}

function runCheckpoint(OS,excel){
 waitFor(()=>excel.active&&excel.task===1,()=>{
  clickCell('B2');
  waitFor(()=>excel.task===2,()=>{
   clickCell('B2');fire('3','Digit3');setTimeout(()=>fire('Enter','Enter'),20);
   waitFor(()=>excel.task===3,()=>{
    try{OS.setLanguage('ENG')}catch(_){}
    clickCell('B3');typeText('VIDLIK',()=>setTimeout(()=>fire('Tab','Tab'),20));
    waitFor(()=>excel.task===4,()=>{
     clickCell('B5');typeText('=SUM(12;8)',()=>setTimeout(()=>fire('Enter','Enter'),20));
     waitFor(()=>excel.task===5,()=>{
      clearChat();fire('s','KeyS',{ctrlKey:true});
      setTimeout(forcePolya,1050);
     });
    });
   });
  });
 });
}
function boot(){
 if(cancelled)return;
 const OS=window.VIDLIK_OS;const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(!OS||!excel){setTimeout(boot,35);return}
 showOperationalLayer();try{OS.enable()}catch(_){}try{excel.start()}catch(_){}runCheckpoint(OS,excel);
}
boot();
})();
