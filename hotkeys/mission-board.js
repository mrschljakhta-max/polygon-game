(()=>{
'use strict';
const APP=document.getElementById('ds-app');
if(!APP)return;

const SHORT={
  1:'Основи роботи з ПК',
  2:'Робота з документами',
  3:'Електронні таблиці',
  4:'Презентації',
  5:'Цифрова комунікація',
  6:'Інтернет і сервіси',
  7:'Кібербезпека',
  8:'Комплексні завдання'
};
const TILTS={1:-1.2,2:.7,3:-.5,4:.8,5:.6,6:-.8,7:.5,8:-.6};
const DEPTH={1:.72,2:.56,3:.66,4:.52,5:.62,6:.48,7:.58,8:.50};
const CONNECTIONS=[
  [1,2,'M205 112 C232 96 250 135 274 118'],
  [2,3,'M456 116 C485 143 505 91 529 116'],
  [3,4,'M709 115 C739 98 755 139 780 119'],
  [1,5,'M135 229 C151 264 103 289 132 323'],
  [2,6,'M382 230 C411 264 361 292 387 326'],
  [3,7,'M633 229 C608 267 658 294 634 324'],
  [4,8,'M883 231 C905 265 862 292 884 326'],
  [5,6,'M205 426 C235 402 252 444 278 421'],
  [6,7,'M456 422 C486 450 503 399 531 425'],
  [7,8,'M708 425 C739 402 755 445 780 421'],
  [2,7,'M437 207 C501 254 550 269 601 328'],
  [3,6,'M570 207 C518 255 471 275 421 328']
];
const LOCK_KEY='vidlik-mission-board-locks-v1';
let selected=1;
let bypassClick=false;
let pending=false;
let hintTimer=null;
let boardSeen=false;

function qsSector(n,hub=document){return hub.querySelector(`.mb-folder[data-sector="${n}"]`)}
function progressOf(btn){
  const bar=btn?.querySelector('.ds-progress i');
  if(!bar)return 0;
  const raw=bar.style.getPropertyValue('--p')||bar.style.width||'0';
  const n=parseFloat(raw);
  return Number.isFinite(n)?n:0;
}
function stringsMarkup(){
  const paths=CONNECTIONS.map(([a,b,d],i)=>`<path class="mb-string" data-a="${a}" data-b="${b}" pathLength="1" d="${d}" style="--d:${(1.46+i*.075).toFixed(3)}s"></path>`).join('');
  const signals=CONNECTIONS.map(([a,b,d])=>`<path class="mb-signal" data-a="${a}" data-b="${b}" pathLength="1" d="${d}"></path>`).join('');
  return `<svg class="mb-strings" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">${paths}${signals}</svg>`;
}
function installStatic(hub,grid){
  if(!hub.querySelector('.mb-board-title')){
    hub.insertAdjacentHTML('afterbegin',`<div class="mb-board-title"><span>VIDLIK · КЛАВІАТУРНИЙ ПОЛІГОН</span><strong>Сектори</strong></div><span class="mb-rivet r1"></span><span class="mb-rivet r2"></span><span class="mb-rivet r3"></span><span class="mb-rivet r4"></span>`);
  }
  if(!grid.querySelector('.mb-strings'))grid.insertAdjacentHTML('afterbegin',stringsMarkup());
  if(!hub.querySelector('.mb-keyhint'))hub.insertAdjacentHTML('beforeend','<div class="mb-keyhint"><span><kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> ОБРАТИ СЕКТОР</span><span><kbd>ENTER</kbd> <b>ВІДКРИТИ</b></span></div>');
}
function decorateButton(btn,i){
  const n=+btn.dataset.sector;
  if(!n||btn.classList.contains('mb-folder'))return;
  btn.classList.add('mb-folder');
  btn.style.setProperty('--i',String(i));
  btn.style.setProperty('--tilt',`${TILTS[n]||0}deg`);
  btn.dataset.depth=String(DEPTH[n]||.5);
  const strong=btn.querySelector('strong');
  if(strong){btn.setAttribute('aria-label',strong.textContent.trim());strong.textContent=SHORT[n]||strong.textContent}
  btn.insertAdjacentHTML('afterbegin','<span class="mb-pin" aria-hidden="true"></span>');
  if([2,3,4,5,8].includes(n))btn.insertAdjacentHTML('beforeend','<span class="mb-tape" aria-hidden="true"></span>');
  btn.insertAdjacentHTML('beforeend','<span class="mb-status" aria-hidden="true"></span>');
  btn.addEventListener('pointerenter',()=>{setConnected(n);});
  btn.addEventListener('pointerleave',()=>{setConnected(selected);});
  btn.addEventListener('focus',()=>{if(!document.body.classList.contains('mb-hub-active'))return;selectSector(n,false)});
}
function syncStatus(hub){
  const buttons=[...hub.querySelectorAll('.mb-folder[data-sector]')];
  let oldLocks=[];try{oldLocks=JSON.parse(localStorage.getItem(LOCK_KEY)||'[]')}catch(e){}
  const newLocks=[];
  buttons.forEach(btn=>{
    const n=+btn.dataset.sector,st=btn.querySelector('.mb-status'),p=progressOf(btn),locked=btn.disabled||btn.getAttribute('aria-disabled')==='true';
    if(locked)newLocks.push(n);
    if(oldLocks.includes(n)&&!locked){btn.classList.add('mb-unlocked');setTimeout(()=>btn.classList.remove('mb-unlocked'),1000)}
    if(!st)return;
    st.className='mb-status';
    if(locked){st.classList.add('locked');st.textContent='⌑';}
    else if(n===selected){st.classList.add('active');st.textContent='АКТИВНО';}
    else if(p>=99.5){st.classList.add('done');st.textContent='✓ ВИКОНАНО';}
    else if(p>0){st.classList.add('partial');st.textContent=`${Math.round(p)}%`;}
    else st.textContent='';
  });
  try{localStorage.setItem(LOCK_KEY,JSON.stringify(newLocks))}catch(e){}
}
function syncTutorial(hub){
  const source=hub.querySelector('.ds-module-grid>[data-tutorial]');
  let link=hub.querySelector('.mb-tutorial-link');
  if(!source)return;
  if(!link){
    link=document.createElement('button');link.type='button';link.className='mb-tutorial-link';link.setAttribute('data-tutorial','1');hub.appendChild(link);
  }
  const done=source.classList.contains('done')||/пройден/i.test(source.textContent);
  link.classList.toggle('done',done);
  link.textContent=done?'✓ 00 · ІНСТРУКТАЖ ПРОЙДЕНО':'> 00 · ІНСТРУКТАЖ';
}
function enhanceHub(){
  const hub=APP.querySelector('.ds-hub');
  document.body.classList.toggle('mb-hub-active',!!hub);
  if(!hub){clearTimeout(hintTimer);return}
  const grid=hub.querySelector('.ds-module-grid');
  if(!grid)return;
  if(!hub.classList.contains('mb-board')){
    hub.classList.add('mb-board');
    grid.classList.add('mb-grid');
    installStatic(hub,grid);
    [...grid.querySelectorAll('.ds-module[data-sector]')].sort((a,b)=>+a.dataset.sector-+b.dataset.sector).forEach((b,i)=>decorateButton(b,i));
    selected=1;
    selectSector(selected,false);
    setupParallax(hub);
    scheduleHint(hub);
    boardSeen=true;
  }
  syncTutorial(hub);
  syncStatus(hub);
}
function scheduleHint(hub){
  clearTimeout(hintTimer);
  const hint=hub.querySelector('.mb-keyhint');if(!hint)return;
  hint.classList.remove('show','dismissed');
  hintTimer=setTimeout(()=>{if(document.body.classList.contains('mb-hub-active'))hint.classList.add('show')},5200);
}
function dismissHint(){
  clearTimeout(hintTimer);
  const hint=APP.querySelector('.mb-keyhint');if(hint){hint.classList.remove('show');hint.classList.add('dismissed')}
}
function setConnected(n){
  const hub=APP.querySelector('.mb-board');if(!hub)return;
  hub.querySelectorAll('.mb-string').forEach(p=>p.classList.toggle('hot',+p.dataset.a===n||+p.dataset.b===n));
}
function pulseConnection(a,b){
  const hub=APP.querySelector('.mb-board');if(!hub)return;
  const exact=[...hub.querySelectorAll('.mb-signal')].filter(p=>(+p.dataset.a===a&&+p.dataset.b===b)||(+p.dataset.a===b&&+p.dataset.b===a));
  const arr=exact.length?exact:[...hub.querySelectorAll('.mb-signal')].filter(p=>+p.dataset.a===b||+p.dataset.b===b).slice(0,2);
  arr.forEach(p=>{p.classList.remove('pulse');void p.getBoundingClientRect();p.classList.add('pulse');setTimeout(()=>p.classList.remove('pulse'),560)});
}
function selectSector(n,signal=true){
  const hub=APP.querySelector('.mb-board');if(!hub)return;
  const btn=qsSector(n,hub);if(!btn||btn.disabled)return;
  const prev=selected;selected=n;
  hub.querySelectorAll('.mb-folder').forEach(b=>b.classList.toggle('mb-selected',+b.dataset.sector===n));
  setConnected(n);syncStatus(hub);
  if(signal&&prev!==n)pulseConnection(prev,n);
}
function nextByArrow(key){
  let row=selected<=4?0:1,col=(selected-1)%4;
  if(key==='ArrowLeft')col=(col+3)%4;
  if(key==='ArrowRight')col=(col+1)%4;
  if(key==='ArrowUp')row=0;
  if(key==='ArrowDown')row=1;
  return row*4+col+1;
}
function setupParallax(hub){
  if(hub.dataset.parallaxBound)return;hub.dataset.parallaxBound='1';
  hub.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const r=hub.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
    hub.style.setProperty('--mx',`${50+nx*8}%`);hub.style.setProperty('--my',`${45+ny*8}%`);
    hub.querySelectorAll('.mb-folder').forEach(b=>{
      const d=+b.dataset.depth||.5;b.style.setProperty('--px',`${(nx*5*d).toFixed(2)}px`);b.style.setProperty('--py',`${(ny*4*d).toFixed(2)}px`);
    });
  });
  hub.addEventListener('pointerleave',()=>hub.querySelectorAll('.mb-folder').forEach(b=>{b.style.setProperty('--px','0px');b.style.setProperty('--py','0px')}));
}
function activate(target){
  const hub=APP.querySelector('.mb-board');if(!hub||!target||target.disabled)return;
  dismissHint();
  hub.classList.add('mb-opening');target.classList.add('mb-opening-card');
  setTimeout(()=>{
    bypassClick=true;
    target.click();
    bypassClick=false;
  },245);
}

/* Capture clicks first so every sector gets the same cinematic transition. */
document.addEventListener('click',e=>{
  if(bypassClick||!document.body.classList.contains('mb-hub-active'))return;
  const target=e.target.closest('.mb-board [data-sector],.mb-board .mb-tutorial-link[data-tutorial]');
  if(!target)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(target.dataset.sector)selectSector(+target.dataset.sector,false);
  activate(target);
},true);

document.addEventListener('keydown',e=>{
  if(!document.body.classList.contains('mb-hub-active'))return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();dismissHint();
    const n=nextByArrow(e.key);selectSector(n,true);
    qsSector(n,APP)?.focus({preventScroll:true});return;
  }
  if(e.key==='Enter'){
    const btn=qsSector(selected,APP);if(!btn)return;
    e.preventDefault();dismissHint();activate(btn);return;
  }
},true);

function scan(){pending=false;enhanceHub()}
const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(scan)});
observer.observe(APP,{subtree:true,childList:true});
enhanceHub();
})();
