(()=>{
'use strict';
// Legacy prologue code marks Escape as handled even on the incoming-call screen,
// although that phase has no native pause state. Give an otherwise-unused Escape
// back to the global pause router after the legacy handler has finished.
window.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||e.repeat)return;
 queueMicrotask(()=>{
  let osReady=false;
  try{osReady=!!window.VIDLIK_OS?.getState?.()?.enabled}catch(_){}
  if(osReady||window.VIDLIK_PAUSE_ROUTER?.paused)return;
  const incoming=document.querySelector('.incoming.visible');
  if(incoming)window.VIDLIK_PAUSE_ROUTER?.pause?.('escape-incoming',true);
 });
},true);

function addStyle(href,attr){
 if(document.querySelector(`link[${attr}]`))return;
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href=href;
 link.setAttribute(attr,'1');
 document.head.appendChild(link);
}
function addScript(src,attr){
 if(document.querySelector(`script[${attr}]`))return;
 const script=document.createElement('script');
 script.src=src;
 script.async=false;
 script.setAttribute(attr,'1');
 document.head.appendChild(script);
}

// Canonical pause skin from the approved ZIP prototype.
addStyle('sector3-pause-skin.css?v=20260908-1','data-hotki-pause-skin');
addScript('sector3-pause-skin.js?v=20260908-1','data-hotki-pause-skin');

// Fidelity patch: restores the approved typography/geometry, smooth left-panel
// replacement animation and window-level keyboard navigation for the pause menu.
addStyle('sector3-pause-fidelity.css?v=20260908-2','data-hotki-pause-fidelity');
addScript('sector3-pause-fidelity.js?v=20260908-2','data-hotki-pause-fidelity');
})();
