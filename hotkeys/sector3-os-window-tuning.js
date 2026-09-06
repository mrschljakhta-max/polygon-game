(()=>{
'use strict';
const mon=document.querySelector('.monitor-screen');
const layer=mon?.querySelector('.os-layer');
if(!mon||!layer)return;

let maximized=false;
let minimized=false;

function runningButton(){
 return mon.querySelector('.os-running-button');
}

function syncRunningButton(){
 const btn=runningButton();
 if(!btn)return;
 btn.classList.toggle('is-minimized',minimized);
 btn.setAttribute('aria-pressed',minimized?'false':'true');
 btn.setAttribute('aria-label',minimized?'Відновити вікно':'Згорнути активне вікно');
 btn.title=minimized?'Відновити вікно':'Згорнути вікно';
}

function applyState(win){
 if(!win)return;
 win.classList.toggle('os-maximized',maximized);
 win.classList.toggle('os-minimized',minimized);
 layer.classList.toggle('os-window-minimized',minimized);

 const btn=win.querySelector('[data-win="max"]');
 if(btn){
  const label=maximized?'❐':'□';
  const aria=maximized?'Відновити розмір вікна':'Розгорнути вікно';
  const title=maximized?'Відновити розмір':'Розгорнути';
  if(btn.textContent!==label)btn.textContent=label;
  if(btn.getAttribute('aria-label')!==aria)btn.setAttribute('aria-label',aria);
  if(btn.title!==title)btn.title=title;
 }
 syncRunningButton();
}

function ensureWindowControls(){
 const win=layer.querySelector('.os-window');
 if(!win){
  maximized=false;
  minimized=false;
  layer.classList.remove('os-window-minimized');
  return;
 }
 const actions=win.querySelector('.os-window-actions');
 if(!actions)return;
 let btn=actions.querySelector('[data-win="max"]');
 if(!btn){
  btn=document.createElement('button');
  btn.type='button';
  btn.dataset.win='max';
  btn.className='os-window-max';
  const close=actions.querySelector('[data-win="close"]');
  actions.insertBefore(btn,close||null);
 }
 applyState(win);
}

function setMinimized(value){
 const win=layer.querySelector('.os-window');
 if(!win)return;
 minimized=!!value;
 applyState(win);
}

layer.addEventListener('click',e=>{
 const btn=e.target.closest('[data-win]');
 if(!btn||!layer.contains(btn))return;

 if(btn.dataset.win==='max'){
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  minimized=false;
  maximized=!maximized;
  applyState(btn.closest('.os-window'));
  return;
 }

 if(btn.dataset.win==='min'){
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  setMinimized(true);
  return;
 }

 if(btn.dataset.win==='close'){
  maximized=false;
  minimized=false;
  layer.classList.remove('os-window-minimized');
 }
},true);

mon.addEventListener('click',e=>{
 const btn=e.target.closest('.os-running-button');
 if(!btn)return;
 const win=layer.querySelector('.os-window');
 if(!win)return;
 e.preventDefault();
 e.stopPropagation();
 setMinimized(!minimized);
},true);

layer.addEventListener('dblclick',e=>{
 const titlebar=e.target.closest('.os-window-titlebar');
 if(!titlebar||e.target.closest('.os-window-actions'))return;
 e.preventDefault();
 e.stopPropagation();
 minimized=false;
 maximized=!maximized;
 applyState(titlebar.closest('.os-window'));
});

/* The OS core replaces windows as direct children of .os-layer.
   Observe only this level so internal UI updates cannot create a loop. */
const observer=new MutationObserver(records=>{
 if(!records.some(r=>r.type==='childList'&&(r.addedNodes.length||r.removedNodes.length)))return;
 maximized=false;
 minimized=false;
 layer.classList.remove('os-window-minimized');
 requestAnimationFrame(ensureWindowControls);
});
observer.observe(layer,{childList:true});

ensureWindowControls();
})();
