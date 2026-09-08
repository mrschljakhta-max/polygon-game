(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

/*
 * Developer/story navigation checkpoint for Scene 01.
 * No title card is rendered here: the player should land in the actual
 * workstation, not in an extra loading/title screen.
 */
document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
const app=document.querySelector('.app');
if(app)app.style.visibility='visible';

let ready=false;
let mutationObserver=null;

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
function typeText(text,step=14){
 [...text].forEach((ch,i)=>setTimeout(()=>{const s=charSpec(ch);fire(s.key,s.code,s)},i*step));
 return text.length*step;
}
function setPrepHint(text){
 const help=document.getElementById('help');
 if(help)help.innerHTML=`<span><kbd>СЦЕНА 01</kbd> ${text}</span>`;
}

function finishJump(){
 ready=true;
 mutationObserver?.disconnect();
 window.removeEventListener('keydown',escapeDuringJump,true);
 const help=document.getElementById('help');
 if(help&&/СЦЕНА 01/.test(help.textContent||''))help.innerHTML='<span><kbd>EXCEL</kbd> продовжуйте за підказкою</span>';
}

function boot(){
 const OS=window.VIDLIK_OS;
 const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(!OS||!excel){setTimeout(boot,40);return}

 showOperationalLayer();
 setPrepHint('підготовка контрольної точки… · ESC — назад');
 try{OS.enable()}catch(_){ }
 try{excel.start()}catch(_){ }

 /* Complete only the introductory Excel steps invisibly in the live workstation. */
 setTimeout(()=>{
  clickCell('B2');
  setTimeout(()=>{fire('3','Digit3');fire('Enter','Enter')},70);
 },700);

 setTimeout(()=>{
  try{OS.setLanguage('ENG')}catch(_){ }
  clickCell('B3');
  const wait=typeText('VIDLIK');
  setTimeout(()=>fire('Tab','Tab'),wait+35);
 },930);

 setTimeout(()=>{
  clickCell('B5');
  const wait=typeText('=SUM(12;8)');
  setTimeout(()=>fire('Enter','Enter'),wait+45);
 },1260);

 setTimeout(()=>fire('s','KeyS',{ctrlKey:true}),1640);

 setTimeout(()=>{
  const chat=document.getElementById('adminChat');
  if(chat)chat.innerHTML='';
  finishJump();
 },2780);
}

boot();
})();
