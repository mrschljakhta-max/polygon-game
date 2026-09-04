(()=>{
'use strict';
const APP=document.getElementById('ds-app');
const CFG=window.VIDLIK_MISSION_BOARD;
if(!APP||!CFG)return;

const SHORT={1:'Основи роботи з ПК',2:'Робота з документами',3:'Електронні таблиці',4:'Презентації',5:'Цифрова комунікація',6:'Інтернет і сервіси',7:'Кібербезпека',8:'Комплексні завдання'};
const INTRO_ORDER={1:0,5:1,2:2,6:3,3:4,7:5,4:6,8:7};
const LOCK_KEY='vidlik-mission-board-locks-v2';
let selected=1,bypassClick=false,pending=false,hintTimer=null,resizeRAF=0;

function qsSector(n,hub=document){return hub.querySelector(`.mb-folder[data-sector="${n}"]`)}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function progressOf(btn){const bar=btn?.querySelector('.ds-progress i');if(!bar)return 0;const raw=bar.style.getPropertyValue('--p')||bar.style.width||'0';const n=parseFloat(raw);return Number.isFinite(n)?n:0}
function cardCfg(n){return CFG.cards?.[n]||CFG.cards?.[String(n)]}
function pngFallback(src){return /\.webp(?:\?.*)?$/i.test(src)?src.replace(/\.webp(?=\?|$)/i,'.png'):null}

function loadBoardBackground(hub){
  if(hub.dataset.bgBound)return;hub.dataset.bgBound='1';
  const candidates=[CFG.background,pngFallback(CFG.background)].filter(Boolean);let i=0;
  const probe=new Image();
  probe.onload=()=>hub.style.setProperty('--mb-board-bg',`url("${candidates[i]}")`);
  probe.onerror=()=>{i+=1;if(i<candidates.length)probe.src=candidates[i]};
  probe.src=candidates[i];
}

function installStatic(hub,grid){
  loadBoardBackground(hub);
  if(!grid.querySelector('.mb-strings'))grid.insertAdjacentHTML('afterbegin','<svg class="mb-strings" aria-hidden="true"></svg>');
  if(!hub.querySelector('.mb-keyhint'))hub.insertAdjacentHTML('beforeend','<div class="mb-keyhint"><span><kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> ОБРАТИ СЕКТОР</span><span><kbd>ENTER</kbd> <b>ВІДКРИТИ</b></span></div>');
}

function decorateButton(btn,i){
  const n=+btn.dataset.sector,cfg=cardCfg(n);if(!n||!cfg)return;
  btn.style.setProperty('--mb-x',`${cfg.x}%`);btn.style.setProperty('--mb-y',`${cfg.y}%`);btn.style.setProperty('--mb-w',`${cfg.w}%`);
  btn.style.setProperty('--intro',String(INTRO_ORDER[n]??i));
  if(btn.classList.contains('mb-folder'))return;
  btn.classList.add('mb-folder');btn.style.setProperty('--i',String(i));
  btn.insertAdjacentHTML('afterbegin',`<img class="mb-card-art" alt="${SHORT[n]||`Сектор ${n}`}" draggable="false"><span class="mb-card-fallback"><b>${String(n).padStart(2,'0')}</b><span>${SHORT[n]||`Сектор ${n}`}</span><small>IMAGE MISSING</small></span>`);
  btn.insertAdjacentHTML('beforeend','<span class="mb-status" aria-hidden="true"></span>');
  const img=btn.querySelector('.mb-card-art');
  img.addEventListener('load',()=>{btn.classList.remove('mb-missing');scheduleThreadRender()});
  img.addEventListener('error',()=>{
    const alt=pngFallback(cfg.src);
    if(alt&&img.dataset.pngTried!=='1'){img.dataset.pngTried='1';img.src=alt;return}
    btn.classList.add('mb-missing');scheduleThreadRender();
  });
  img.src=cfg.src;
  btn.addEventListener('pointerenter',()=>setConnected(n));
  btn.addEventListener('pointerleave',()=>setConnected(selected));
  btn.addEventListener('focus',()=>{if(document.body.classList.contains('mb-hub-active'))selectSector(n,false)});
}

function syncStatus(hub){
  const buttons=[...hub.querySelectorAll('.mb-folder[data-sector]')];
  let oldLocks=[];try{oldLocks=JSON.parse(localStorage.getItem(LOCK_KEY)||'[]')}catch(e){}
  const newLocks=[];
  buttons.forEach(btn=>{
    const n=+btn.dataset.sector,st=btn.querySelector('.mb-status'),p=progressOf(btn),locked=btn.disabled||btn.getAttribute('aria-disabled')==='true';
    if(locked)newLocks.push(n);
    if(oldLocks.includes(n)&&!locked&&!btn.classList.contains('mb-unlocked')){btn.classList.add('mb-unlocked');setTimeout(()=>btn.classList.remove('mb-unlocked'),900)}
    if(!st)return;
    let cls='mb-status',txt='';
    if(locked){cls+=' locked';txt='⌑'}else if(p>=99.5){cls+=' done';txt='✓'}else if(p>0){cls+=' partial';txt=`${Math.round(p)}%`}
    if(st.className!==cls)st.className=cls;setText(st,txt);
  });
  try{localStorage.setItem(LOCK_KEY,JSON.stringify(newLocks))}catch(e){}
}

function syncTutorial(hub){
  const source=hub.querySelector('.ds-module-grid>[data-tutorial]');let link=hub.querySelector('.mb-tutorial-link');if(!source)return;
  if(!link){link=document.createElement('button');link.type='button';link.className='mb-tutorial-link';link.setAttribute('data-tutorial-link','1');hub.appendChild(link)}
  const done=source.classList.contains('done')||/пройден/i.test(source.textContent);link.classList.toggle('done',done);setText(link,done?'✓ 00 · ІНСТРУКТАЖ':'00 · ІНСТРУКТАЖ');
}

/* Anchor geometry and curve formula intentionally match the approved sandbox. */
function anchorPoint(cardId,anchorName,hub){
  const card=qsSector(cardId,hub),a=CFG.anchors?.[anchorName]||{x:.5,y:.5};if(!card)return null;
  const r=card.getBoundingClientRect(),hr=hub.getBoundingClientRect();
  return{x:r.left-hr.left+r.width*a.x,y:r.top-hr.top+r.height*a.y};
}
function makeThreadPath(p1,p2){
  const dx=p2.x-p1.x;
  const curve=Math.max(24,Math.abs(dx)*.18);
  const c1={x:p1.x+curve,y:p1.y};
  const c2={x:p2.x-curve,y:p2.y};
  return`M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}
function renderThreads(){
  const hub=APP.querySelector('.mb-board');if(!hub)return;const svg=hub.querySelector('.mb-strings');if(!svg)return;
  const hr=hub.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${Math.max(1,hr.width)} ${Math.max(1,hr.height)}`);svg.innerHTML='';
  (CFG.threads||[]).forEach((t,i)=>{
    const p1=anchorPoint(t.from[0],t.from[1],hub),p2=anchorPoint(t.to[0],t.to[1],hub);if(!p1||!p2)return;
    const d=makeThreadPath(p1,p2),a=t.from[0],b=t.to[0];
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    const string=document.createElementNS('http://www.w3.org/2000/svg','path');
    string.setAttribute('class','mb-string');string.setAttribute('data-a',a);string.setAttribute('data-b',b);string.setAttribute('pathLength','1');string.setAttribute('d',d);
    const pin1=document.createElementNS('http://www.w3.org/2000/svg','circle');pin1.setAttribute('cx',p1.x);pin1.setAttribute('cy',p1.y);pin1.setAttribute('r','4');pin1.setAttribute('class','mb-thread-pin');
    const pin2=document.createElementNS('http://www.w3.org/2000/svg','circle');pin2.setAttribute('cx',p2.x);pin2.setAttribute('cy',p2.y);pin2.setAttribute('r','4');pin2.setAttribute('class','mb-thread-pin');
    g.append(string,pin1,pin2);svg.appendChild(g);
  });setConnected(selected);
}
function scheduleThreadRender(){cancelAnimationFrame(resizeRAF);resizeRAF=requestAnimationFrame(()=>requestAnimationFrame(renderThreads))}

function scheduleHint(hub){clearTimeout(hintTimer);const hint=hub.querySelector('.mb-keyhint');if(!hint)return;hint.classList.remove('show','dismissed');hintTimer=setTimeout(()=>{if(document.body.classList.contains('mb-hub-active'))hint.classList.add('show')},5200)}
function dismissHint(){clearTimeout(hintTimer);const hint=APP.querySelector('.mb-keyhint');if(hint){hint.classList.remove('show');hint.classList.add('dismissed')}}
function setConnected(n){const hub=APP.querySelector('.mb-board');if(!hub)return;hub.querySelectorAll('.mb-string').forEach(p=>p.classList.toggle('hot',+p.dataset.a===n||+p.dataset.b===n))}

/* A tiny signal dot keeps the digital layer subtle while the thread stays physical. */
function pulseConnection(a,b){
  const hub=APP.querySelector('.mb-board');if(!hub)return;const svg=hub.querySelector('.mb-strings');if(!svg)return;
  let paths=[...hub.querySelectorAll('.mb-string')].filter(p=>(+p.dataset.a===a&&+p.dataset.b===b)||(+p.dataset.a===b&&+p.dataset.b===a));
  if(!paths.length)paths=[...hub.querySelectorAll('.mb-string')].filter(p=>+p.dataset.a===b||+p.dataset.b===b).slice(0,1);
  paths.forEach((p,idx)=>{
    const d=p.getAttribute('d');if(!d)return;
    const reverse=(+p.dataset.b===a&&+p.dataset.a===b);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('class','mb-signal-dot');dot.setAttribute('r',idx===0?'2.8':'2.3');
    const motion=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');motion.setAttribute('dur','.68s');motion.setAttribute('repeatCount','1');motion.setAttribute('fill','freeze');motion.setAttribute('path',d);
    if(reverse){motion.setAttribute('keyPoints','1;0');motion.setAttribute('keyTimes','0;1');motion.setAttribute('calcMode','linear')}
    dot.appendChild(motion);svg.appendChild(dot);setTimeout(()=>dot.remove(),760);
  });
}
function selectSector(n,signal=true){
  const hub=APP.querySelector('.mb-board');if(!hub)return;const btn=qsSector(n,hub);if(!btn||btn.disabled||btn.getAttribute('aria-disabled')==='true')return;
  const prev=selected;selected=n;hub.querySelectorAll('.mb-folder').forEach(b=>b.classList.toggle('mb-selected',+b.dataset.sector===n));setConnected(n);syncStatus(hub);if(signal&&prev!==n)pulseConnection(prev,n);
}
function nextByArrow(key){const map=CFG.navigation?.[key];return +(map?.[selected]||selected)}

/* Board stays physically stable; pointer movement only shifts a faint ambient reflection. */
function setupParallax(hub){
  if(hub.dataset.parallaxBound)return;hub.dataset.parallaxBound='1';
  hub.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=hub.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;hub.style.setProperty('--mx',`${50+nx*4}%`);hub.style.setProperty('--my',`${45+ny*4}%`)});
  hub.addEventListener('pointerleave',()=>{hub.style.setProperty('--mx','50%');hub.style.setProperty('--my','45%')});
}
function activate(target){
  const hub=APP.querySelector('.mb-board');if(!hub||!target||target.disabled)return;dismissHint();hub.classList.add('mb-opening');target.classList.add('mb-opening-card');
  setTimeout(()=>{const actual=target.matches('.mb-tutorial-link')?hub.querySelector('.ds-module-grid>[data-tutorial]'):target;if(!actual)return;bypassClick=true;actual.click();bypassClick=false},340);
}

function enhanceHub(){
  const hub=APP.querySelector('.ds-hub');document.body.classList.toggle('mb-hub-active',!!hub);if(!hub){clearTimeout(hintTimer);return}
  const grid=hub.querySelector('.ds-module-grid');if(!grid)return;
  if(!hub.classList.contains('mb-board')){
    hub.classList.add('mb-board');grid.classList.add('mb-grid');installStatic(hub,grid);
    [...grid.querySelectorAll('.ds-module[data-sector]')].sort((a,b)=>+a.dataset.sector-+b.dataset.sector).forEach((b,i)=>decorateButton(b,i));
    selected=1;selectSector(selected,false);setupParallax(hub);scheduleHint(hub);scheduleThreadRender();
  }else [...grid.querySelectorAll('.ds-module[data-sector]')].forEach((b,i)=>decorateButton(b,i));
  syncTutorial(hub);syncStatus(hub);scheduleThreadRender();
}

document.addEventListener('click',e=>{
  if(bypassClick||!document.body.classList.contains('mb-hub-active'))return;const target=e.target.closest('.mb-board [data-sector],.mb-board .mb-tutorial-link');if(!target)return;
  e.preventDefault();e.stopImmediatePropagation();if(target.dataset.sector)selectSector(+target.dataset.sector,false);activate(target);
},true);
document.addEventListener('keydown',e=>{
  if(!document.body.classList.contains('mb-hub-active'))return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();dismissHint();const n=nextByArrow(e.key);selectSector(n,true);qsSector(n,APP)?.focus({preventScroll:true});return}
  if(e.key==='Enter'){const btn=qsSector(selected,APP);if(!btn)return;e.preventDefault();dismissHint();activate(btn)}
},true);
window.addEventListener('resize',scheduleThreadRender,{passive:true});

function scan(){pending=false;enhanceHub()}
const observer=new MutationObserver(mutations=>{
  if(mutations.length&&mutations.every(m=>m.target instanceof Element&&m.target.closest('.mb-strings')))return;
  if(pending)return;pending=true;queueMicrotask(scan);
});
observer.observe(APP,{subtree:true,childList:true});
enhanceHub();
})();
