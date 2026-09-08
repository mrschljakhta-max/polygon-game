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
})();
