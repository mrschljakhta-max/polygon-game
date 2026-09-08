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

// Load the canonical Sector 3 pause-menu skin. The heavy PNG background is not
// bundled in the repository by ChatGPT; it is expected at the documented path.
if(!document.querySelector('link[data-hotki-pause-skin]')){
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href='sector3-pause-skin.css?v=20260908-1';
 link.dataset.hotkiPauseSkin='1';
 document.head.appendChild(link);
}
if(!document.querySelector('script[data-hotki-pause-skin]')){
 const script=document.createElement('script');
 script.src='sector3-pause-skin.js?v=20260908-1';
 script.async=false;
 script.dataset.hotkiPauseSkin='1';
 document.head.appendChild(script);
}
})();
