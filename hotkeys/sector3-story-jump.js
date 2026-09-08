(()=>{
'use strict';
const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

const JUMP_LABEL='СЦЕНА 01 · ІНША ВЕРСІЯ';
const overlay=document.createElement('div');
overlay.id='vidlikStoryJump';
overlay.innerHTML=`<div><span>VIDLIK · СЕКТОР 03</span><strong>${JUMP_LABEL}</strong><i></i><small>ПІДГОТОВКА КОНТРОЛЬНОЇ ТОЧКИ</small></div>`;
const style=document.createElement('style');
style.textContent=`
#vidlikStoryJump{position:fixed;inset:0;z-index:120000;display:grid;place-items:center;background:#02090b;color:#e8f5f4;font-family:Inter,"Segoe UI",Arial,sans-serif;opacity:1;transition:opacity .65s ease}
#vidlikStoryJump.is-out{opacity:0;pointer-events:none}
#vidlikStoryJump>div{width:min(620px,78vw);text-align:center}
#vidlikStoryJump span{display:block;margin-bottom:18px;color:#62d9d0;font:800 clamp(10px,.72vw,13px)/1.1 Consolas,monospace;letter-spacing:.18em}
#vidlikStoryJump strong{display:block;font:800 clamp(25px,2.15vw,42px)/1.05 "Arial Narrow","Segoe UI",Arial,sans-serif;letter-spacing:.04em}
#vidlikStoryJump i{display:block;width:min(320px,50vw);height:1px;margin:24px auto 18px;background:linear-gradient(90deg,transparent,#56d7cf,transparent);box-shadow:0 0 14px rgba(86,215,207,.28)}
#vidlikStoryJump small{display:block;color:#7d9e9b;font:700 clamp(8px,.55vw,11px)/1 Consolas,monospace;letter-spacing:.12em}
`;
document.head.appendChild(style);
document.body.appendChild(overlay);

document.body.classList.remove('prologue-title-pending');
const app=document.querySelector('.app');
if(app)app.style.visibility='visible';

let mutationObserver=null;
function removeTitleLayers(){
 document.getElementById('vidlikPrologueTitle')?.remove();
 document.getElementById('vidlikAct1Title')?.remove();
 document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
}
removeTitleLayers();
mutationObserver=new MutationObserver(removeTitleLayers);
mutationObserver.observe(document.body,{childList:true,subtree:true});

function showOperationalLayer(){
 ['idleLayer','incomingLayer','videoLayer','syncLayer'].forEach(id=>document.getElementById(id)?.classList.remove('visible'));
 document.getElementById('adminLayer')?.classList.add('visible');
 document.querySelector('.monitor-sync-overlay')?.classList.remove('visible');
 document.querySelector('.sync-flash-layer')?.classList.remove('visible');
}

function fire(key,code,extra={}){
 const ev=new KeyboardEvent('keydown',{key,code,bubbles:true,cancelable:true,...extra});
 window.dispatchEvent(ev);
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
function typeText(text,step=18){
 [...text].forEach((ch,i)=>setTimeout(()=>{const s=charSpec(ch);fire(s.key,s.code,s)},i*step));
 return text.length*step;
}

function boot(){
 const OS=window.VIDLIK_OS;
 const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(!OS||!excel){setTimeout(boot,50);return}
 showOperationalLayer();
 try{OS.enable()}catch(_){ }
 try{excel.start()}catch(_){ }

 // Complete only the introductory Excel steps behind the transition curtain.
 // This lands the developer at the exact takeover point where Scene 01 begins.
 setTimeout(()=>{
  clickCell('B2');
  setTimeout(()=>{fire('3','Digit3');fire('Enter','Enter')},90);
 },980);

 setTimeout(()=>{
  try{OS.setLanguage('ENG')}catch(_){ }
  clickCell('B3');
  const wait=typeText('VIDLIK',16);
  setTimeout(()=>fire('Tab','Tab'),wait+45);
 },1240);

 setTimeout(()=>{
  clickCell('B5');
  const wait=typeText('=SUM(12;8)',15);
  setTimeout(()=>fire('Enter','Enter'),wait+55);
 },1580);

 setTimeout(()=>fire('s','KeyS',{ctrlKey:true}),1980);

 // Remove training chatter just before Polya takes the channel, then reveal the scene.
 setTimeout(()=>{
  const chat=document.getElementById('adminChat');
  if(chat)chat.innerHTML='';
  overlay.classList.add('is-out');
  setTimeout(()=>overlay.remove(),700);
  mutationObserver?.disconnect();
 },3380);
}

boot();
})();