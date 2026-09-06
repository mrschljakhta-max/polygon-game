(()=>{
'use strict';
const mon=document.querySelector('.monitor-screen');
const layer=mon?.querySelector('.os-layer');
if(!mon||!layer)return;

let maximized=false;

function applyState(win){
 if(!win)return;
 win.classList.toggle('os-maximized',maximized);
 const btn=win.querySelector('[data-win="max"]');
 if(!btn)return;
 const label=maximized?'❐':'□';
 const aria=maximized?'Відновити розмір вікна':'Розгорнути вікно';
 const title=maximized?'Відновити розмір':'Розгорнути';
 if(btn.textContent!==label)btn.textContent=label;
 if(btn.getAttribute('aria-label')!==aria)btn.setAttribute('aria-label',aria);
 if(btn.title!==title)btn.title=title;
}

function ensureMaxButton(){
 const win=layer.querySelector('.os-window');
 if(!win){
  maximized=false;
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

layer.addEventListener('click',e=>{
 const btn=e.target.closest('[data-win]');
 if(!btn||!layer.contains(btn))return;

 if(btn.dataset.win==='max'){
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  maximized=!maximized;
  applyState(btn.closest('.os-window'));
  return;
 }

 if(btn.dataset.win==='close'||btn.dataset.win==='min'){
  maximized=false;
 }
},true);

layer.addEventListener('dblclick',e=>{
 const titlebar=e.target.closest('.os-window-titlebar');
 if(!titlebar||e.target.closest('.os-window-actions'))return;
 e.preventDefault();
 e.stopPropagation();
 maximized=!maximized;
 applyState(titlebar.closest('.os-window'));
});

/* Windows are replaced as direct children of .os-layer by the OS core.
   Observe only that level so button-label changes cannot retrigger us. */
const observer=new MutationObserver(records=>{
 if(!records.some(r=>r.type==='childList'&&(r.addedNodes.length||r.removedNodes.length)))return;
 requestAnimationFrame(ensureMaxButton);
});
observer.observe(layer,{childList:true});

ensureMaxButton();
})();
