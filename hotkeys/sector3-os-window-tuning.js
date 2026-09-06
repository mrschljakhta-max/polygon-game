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
 const restore=maximized;
 btn.textContent=restore?'❐':'□';
 btn.setAttribute('aria-label',restore?'Відновити розмір вікна':'Розгорнути вікно');
 btn.title=restore?'Відновити розмір':'Розгорнути';
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
 maximized=!maximized;
 applyState(titlebar.closest('.os-window'));
});

const observer=new MutationObserver(()=>{
 const win=layer.querySelector('.os-window');
 if(!win){
  maximized=false;
  return;
 }
 ensureMaxButton();
});
observer.observe(layer,{childList:true,subtree:true});

ensureMaxButton();
})();
