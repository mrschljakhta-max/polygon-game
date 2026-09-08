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

// -----------------------------------------------------------------------------
// Stable system-key HUD
// -----------------------------------------------------------------------------
// Tutorial modules legitimately replace #help while tasks change. The pause router
// also owns one contextual Escape hint. Keep those two systems reconciled without
// redrawing an unchanged Escape node every 220ms.
const innerHTMLDescriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
if(innerHTMLDescriptor?.get&&innerHTMLDescriptor?.set&&!window.__VIDLIK_HELP_HTML_STABLE__){
 const nativeGet=innerHTMLDescriptor.get;
 const nativeSet=innerHTMLDescriptor.set;
 Object.defineProperty(Element.prototype,'innerHTML',{
  configurable:innerHTMLDescriptor.configurable,
  enumerable:innerHTMLDescriptor.enumerable,
  get:nativeGet,
  set(value){
   const next=String(value??'');
   if(this?.id==='vidlikEscHint'&&nativeGet.call(this)===next)return;
   return nativeSet.call(this,next);
  }
 });
 window.__VIDLIK_HELP_HTML_STABLE__=true;
}

function normalizeSystemHelp(){
 const help=document.getElementById('help');
 if(!help)return;
 const spans=[...help.querySelectorAll(':scope > span')];
 const ownedEsc=spans.find(span=>span.id==='vidlikEscHint')||null;
 const seen=new Set();

 spans.forEach(span=>{
  if(span===ownedEsc){
   span.classList.remove('vidlik-native-duplicate-hidden');
   return;
  }

  const key=(span.querySelector('kbd')?.textContent||'').trim().toUpperCase();

  // There must be only one ESC hint. When the contextual router owns ESC,
  // suppress any ESC that came from the current tutorial/prologue markup.
  if(ownedEsc&&key==='ESC'){
   span.classList.add('vidlik-native-esc-hidden');
   span.classList.remove('vidlik-native-duplicate-hidden');
   return;
  }
  span.classList.remove('vidlik-native-esc-hidden');

  // Exact duplicate hints can be introduced when two scene systems briefly overlap.
  const signature=(span.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
  if(!signature){
   span.classList.remove('vidlik-native-duplicate-hidden');
   return;
  }
  if(seen.has(signature))span.classList.add('vidlik-native-duplicate-hidden');
  else{
   seen.add(signature);
   span.classList.remove('vidlik-native-duplicate-hidden');
  }
 });
}

let helpNormalizeQueued=false;
function queueHelpNormalize(){
 if(helpNormalizeQueued)return;
 helpNormalizeQueued=true;
 queueMicrotask(()=>{
  helpNormalizeQueued=false;
  normalizeSystemHelp();
 });
}

const help=document.getElementById('help');
if(help){
 new MutationObserver(queueHelpNormalize).observe(help,{
  childList:true,
  subtree:true,
  characterData:true
 });
 queueHelpNormalize();
}

[
 'vidlik:os-ready','vidlik:pause-state','vidlik:os-reset',
 'vidlik:episode2-ready','vidlik:section2-ready',
 'vidlik:episode3-ready','vidlik:section3-ready',
 'vidlik:episode4-ready','vidlik:section4-ready',
 'vidlik:episode5-ready','vidlik:section5-ready'
].forEach(name=>window.addEventListener(name,queueHelpNormalize));

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
