(()=>{
'use strict';
if(window.VIDLIK_PAUSE_FIDELITY)return;
window.VIDLIK_PAUSE_FIDELITY=true;

const defs=[
 ['vidlikPauseResume','Продовжити','Space'],
 ['vidlikPauseRestart','Почати спочатку','R'],
 ['vidlikPauseControlsBtn','Керування','K'],
 ['vidlikPauseScenes','Вийти','Q']
];

function apply(){
 const controls=document.getElementById('vidlikPauseControls');
 const scene=document.querySelector('.hotki-pause-scene');
 if(!controls||!scene)return false;

 // The legacy class brings generic compact pause styles into every child DIV.
 // Removing it lets the approved ZIP prototype styles win cleanly.
 controls.classList.remove('vidlik-pause-controls');
 controls.classList.add('hotki-controls-context');

 defs.forEach(([id,label,key])=>{
  const btn=document.getElementById(id);
  if(!btn)return;
  btn.dataset.tooltip='';
  let tip=btn.querySelector('.hotki-native-tooltip');
  if(!tip){
   tip=document.createElement('span');
   tip.className='hotki-native-tooltip';
   tip.setAttribute('aria-hidden','true');
   btn.appendChild(tip);
  }
  tip.innerHTML=`${label} <b>${key}</b>`;
 });
 return true;
}

if(!apply()){
 const observer=new MutationObserver(()=>{
  if(apply())observer.disconnect();
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),10000);
}

/*
 * Keyboard bridge.
 *
 * The game has several document-level keyboard systems (VIDLIK OS, tutorial
 * modules, Excel).  The approved pause prototype used a window-level handler,
 * so its arrows always won while the pause screen was open.  Keep that same
 * priority here and stop the event before the underlying training interface
 * can consume it.
 */
function pauseElements(){
 const pause=document.getElementById('pause');
 const card=pause?.querySelector('.hotki-pause-scene');
 const controls=document.getElementById('vidlikPauseControls');
 const buttons=[
  document.getElementById('vidlikPauseResume'),
  document.getElementById('vidlikPauseRestart'),
  document.getElementById('vidlikPauseControlsBtn'),
  document.getElementById('vidlikPauseScenes')
 ].filter(Boolean);
 return{pause,card,controls,buttons};
}
function isPauseOpen(pause,card){return !!(pause?.classList.contains('visible')&&card)}
function currentButtonIndex(buttons){
 let i=buttons.findIndex(b=>b.classList.contains('kbd-selected'));
 if(i<0)i=buttons.findIndex(b=>b===document.activeElement);
 return i<0?0:i;
}
function selectButton(buttons,index,focus=true){
 if(!buttons.length)return;
 const n=(index+buttons.length)%buttons.length;
 buttons.forEach((b,i)=>{
  const on=i===n;
  b.classList.toggle('kbd-selected',on);
  b.setAttribute('aria-current',on?'true':'false');
 });
 if(focus)buttons[n]?.focus?.({preventScroll:true});
}
function controlKeys(controls){return controls?[...controls.querySelectorAll('.hotki-control-line:not(.is-info) .hotki-control-key')]:[]}
function subnavActive(controls){return !!controls?.querySelector('.kbd-sub-selected')||controls?.classList.contains('hotki-subnav-active')}
function clearSubnav(controls){
 controls?.classList.remove('hotki-subnav-active');
 controls?.querySelectorAll('.kbd-sub-selected,.kbd-sub-row').forEach(el=>el.classList.remove('kbd-sub-selected','kbd-sub-row'));
}
function selectControl(controls,index){
 const keys=controlKeys(controls);if(!keys.length)return;
 const n=(index+keys.length)%keys.length;
 controls.classList.add('hotki-subnav-active');
 keys.forEach((key,i)=>{
  const on=i===n;
  key.classList.toggle('kbd-sub-selected',on);
  key.setAttribute('aria-current',on?'true':'false');
  key.closest('.hotki-control-line')?.classList.toggle('kbd-sub-row',on);
 });
 document.querySelectorAll('.hotki-pause-scene .hotki-action').forEach(b=>b.classList.remove('kbd-selected'));
}
function currentControlIndex(controls){
 const keys=controlKeys(controls);
 const i=keys.findIndex(k=>k.classList.contains('kbd-sub-selected'));
 return i<0?0:i;
}
function swallow(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}

window.addEventListener('keydown',e=>{
 const {pause,card,controls,buttons}=pauseElements();
 if(!isPauseOpen(pause,card))return;

 const confirm=card.querySelector('.hotki-pause-confirm:not([hidden])');
 if(confirm){
  if(e.key==='Escape'){
   const cancel=confirm.querySelector('[data-confirm="cancel"]');
   if(cancel){swallow(e);cancel.click()}
  }else if(e.key==='Enter'){
   const ok=confirm.querySelector('[data-confirm="ok"]');
   if(ok){swallow(e);ok.click()}
  }
  return;
 }

 // Escape remains owned by the global contextual Escape router.
 if(e.key==='Escape')return;

 const key=String(e.key||'').toLowerCase();
 const inControls=subnavActive(controls);
 const mainIndex=currentButtonIndex(buttons);

 if(e.key==='ArrowDown'){
  swallow(e);
  if(inControls)selectControl(controls,currentControlIndex(controls)+1);
  else selectButton(buttons,mainIndex+1,true);
  return;
 }
 if(e.key==='ArrowUp'){
  swallow(e);
  if(inControls)selectControl(controls,currentControlIndex(controls)-1);
  else selectButton(buttons,mainIndex-1,true);
  return;
 }
 if(e.key==='ArrowRight'){
  swallow(e);
  if(inControls){clearSubnav(controls);selectButton(buttons,2,true)}
  return;
 }
 if(e.key==='ArrowLeft'){
  if(inControls){swallow(e);return}
  if(mainIndex===2&&controls){
   swallow(e);
   const tool=buttons[2];
   if(controls.hidden)tool?.click();
   requestAnimationFrame(()=>requestAnimationFrame(()=>selectControl(controls,0)));
  }
  return;
 }
 if(e.key==='Enter'){
  swallow(e);
  if(!inControls)buttons[mainIndex]?.click();
  return;
 }
 if(e.code==='Space'){
  swallow(e);
  document.getElementById('vidlikPauseResume')?.click();
  return;
 }
 if(key==='r'){
  swallow(e);
  document.getElementById('vidlikPauseRestart')?.click();
  return;
 }
 if(key==='k'){
  swallow(e);
  clearSubnav(controls);
  document.getElementById('vidlikPauseControlsBtn')?.click();
  selectButton(buttons,2,false);
  return;
 }
 if(key==='q'){
  swallow(e);
  document.getElementById('vidlikPauseScenes')?.click();
 }
},true);
})();
