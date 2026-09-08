(()=>{
'use strict';
if(window.VIDLIK_PAUSE_INPUT_V2)return;
window.VIDLIK_PAUSE_INPUT_V2=true;

const ACTIONS={
 restart:{id:'vidlikPauseRestart',index:1,label:'ПОЧАТИ СПОЧАТКУ?',normal:'Почати спочатку',key:'R'},
 exit:{id:'vidlikPauseScenes',index:3,label:'ВИЙТИ З ЕПІЗОДУ?',normal:'Вийти',key:'Q'}
};
const API_BY_EPISODE={
 1:'VIDLIK_TUTORIAL',
 2:'VIDLIK_FILES_TUTORIAL',
 3:'VIDLIK_KEYBOARD_TUTORIAL',
 4:'VIDLIK_LANGUAGE_TUTORIAL',
 5:'VIDLIK_EXCEL_STORY_TUTORIAL'
};
let armed=null;
let subIndex=0;

function pause(){return document.getElementById('pause')}
function card(){return pause()?.querySelector('.hotki-pause-scene')}
function controls(){return document.getElementById('vidlikPauseControls')}
function buttons(){return[
 document.getElementById('vidlikPauseResume'),
 document.getElementById('vidlikPauseRestart'),
 document.getElementById('vidlikPauseControlsBtn'),
 document.getElementById('vidlikPauseScenes')
].filter(Boolean)}
function isOpen(){return !!(pause()?.classList.contains('visible')&&card())}
function swallow(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
function currentIndex(bs=buttons()){
 let i=bs.findIndex(b=>b.classList.contains('kbd-selected'));
 if(i<0)i=bs.findIndex(b=>b===document.activeElement);
 return i<0?0:i;
}
function selectMain(index,focus=true){
 const bs=buttons();if(!bs.length)return;
 const n=(index+bs.length)%bs.length;
 bs.forEach((b,i)=>{
  const on=i===n;
  b.classList.toggle('kbd-selected',on);
  b.setAttribute('aria-current',on?'true':'false');
 });
 if(focus)bs[n]?.focus?.({preventScroll:true});
}
function keys(){return controls()?[...controls().querySelectorAll('.hotki-control-line:not(.is-info) .hotki-control-key')]:[]}
function clearSubnav(){
 const c=controls();
 c?.classList.remove('hotki-subnav-active');
 c?.querySelectorAll('.kbd-sub-selected,.kbd-sub-row').forEach(el=>el.classList.remove('kbd-sub-selected','kbd-sub-row'));
}
function selectSub(index){
 const c=controls(),ks=keys();if(!c||!ks.length)return;
 subIndex=(index+ks.length)%ks.length;
 c.classList.add('hotki-subnav-active');
 ks.forEach((k,i)=>{
  const on=i===subIndex;
  k.classList.toggle('kbd-sub-selected',on);
  k.closest('.hotki-control-line')?.classList.toggle('kbd-sub-row',on);
 });
 buttons().forEach(b=>b.classList.remove('kbd-selected'));
}
function controlsVisible(){const c=controls();return !!(c&&!c.hidden)}
function controlsSubnav(){const c=controls();return !!c?.classList.contains('hotki-subnav-active')}

function tipFor(btn){
 if(!btn)return null;
 let tip=btn.querySelector('.hotki-native-tooltip');
 if(!tip){
  tip=document.createElement('span');
  tip.className='hotki-native-tooltip';
  tip.setAttribute('aria-hidden','true');
  btn.appendChild(tip);
 }
 return tip;
}
function restoreTip(name){
 const a=ACTIONS[name],btn=document.getElementById(a.id),tip=tipFor(btn);if(!tip)return;
 tip.classList.remove('is-confirm');
 tip.innerHTML=`${a.normal} <b>${a.key}</b>`;
 btn?.classList.remove('hotki-confirm-armed');
}
function cancelArmed(){
 if(!armed)return false;
 const old=armed;armed=null;restoreTip(old);return true;
}
function arm(name){
 const a=ACTIONS[name];if(!a)return;
 if(armed&&armed!==name)cancelArmed();
 armed=name;
 const btn=document.getElementById(a.id),tip=tipFor(btn);
 selectMain(a.index,true);
 btn?.classList.add('hotki-confirm-armed');
 if(tip){
  tip.classList.add('is-confirm');
  tip.innerHTML=`${a.label} <b>ENTER</b><small> · підтвердити</small>`;
 }
}
function selectedAction(){
 const i=currentIndex();
 if(i===1)return'restart';
 if(i===3)return'exit';
 return'';
}

function episodeNumber(){
 const n=Number(window.VIDLIK_PAUSE_ROUTER?.episode||0);
 if(n)return n;
 for(let i=5;i>=1;i--){const api=window[API_BY_EPISODE[i]];if(api?.active)return i}
 return 0;
}
function doRestart(){
 cancelArmed();
 const n=episodeNumber();
 const api=n?window[API_BY_EPISODE[n]]:null;
 window.VIDLIK_PAUSE_ROUTER?.resume?.('inline-restart');
 setTimeout(()=>{
  if(!n){location.reload();return}
  try{
   if(n===1){
    window.dispatchEvent(new CustomEvent('vidlik:os-reset'));
    setTimeout(()=>{window.VIDLIK_OS?.enable?.();window.VIDLIK_TUTORIAL?.restart?.()},70);
    return;
   }
   if(typeof api?.reset==='function')api.reset();
   setTimeout(()=>{if(typeof api?.start==='function')api.start()},70);
  }catch(_){location.reload()}
 },80);
}
async function doExit(){
 cancelArmed();
 try{if(document.fullscreenElement)await document.exitFullscreen()}catch(_){}
 location.href='module-briefing.html?sector=3&from=pause';
}
function confirmArmed(){
 const a=armed;if(!a)return false;
 if(a==='restart')doRestart();else if(a==='exit')doExit();
 return true;
}

function closeControlsToIcons(){
 const c=controls(),tool=document.getElementById('vidlikPauseControlsBtn');
 clearSubnav();
 if(c&&!c.hidden)tool?.click();
 selectMain(2,true);
}
function openControlsFromIcons(){
 cancelArmed();
 const c=controls(),tool=document.getElementById('vidlikPauseControlsBtn');
 selectMain(2,false);
 if(c?.hidden)tool?.click();
 requestAnimationFrame(()=>requestAnimationFrame(()=>selectSub(0)));
}
function resetPauseView(){
 cancelArmed();
 clearSubnav();
 const c=controls(),tool=document.getElementById('vidlikPauseControlsBtn');
 if(c&&!c.hidden)tool?.click();
}

/*
 * The prologue runtime owns a native Escape handler on document, while the global
 * pause router listens on window/capture. On the Polya call this could leave the
 * real Escape between two handlers and nothing visible would happen. This bridge
 * is loaded before the router, so a real Escape during interactive prologue phases
 * is routed through the canonical pause API exactly once. Synthetic Escape events
 * generated by the router are ignored here and still reach the prologue runtime,
 * preserving its internal paused state.
 */
window.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||e.repeat||!e.isTrusted||isOpen())return;
 const router=window.VIDLIK_PAUSE_ROUTER;
 if(!router||router.paused)return;
 let osReady=false;
 try{osReady=!!window.VIDLIK_OS?.getState?.()?.enabled}catch(_){}
 if(osReady)return;
 const interactive=document.querySelector('.incoming.visible,.video.visible,.admin-layer.visible');
 const blocked=document.querySelector('.sync-layer.visible,.monitor-sync-overlay.visible,.video.visible.breaking');
 if(!interactive||blocked)return;
 swallow(e);
 router.pause('escape-prologue-bridge',true);
},true);

// This listener is loaded BEFORE the global Escape router, so pending confirmation
// can own the first Escape. A second Escape then falls through and resumes the game.
window.addEventListener('keydown',e=>{
 if(!isOpen())return;
 const key=String(e.key||'').toLowerCase();

 if(e.key==='Escape'){
  if(armed){swallow(e);cancelArmed()}
  return;
 }

 if(e.key==='ArrowRight'){
  if(controlsVisible()){
   swallow(e);cancelArmed();closeControlsToIcons();return;
  }
  swallow(e);return;
 }
 if(e.key==='ArrowLeft'){
  if(controlsVisible()){
   swallow(e);return;
  }
  if(currentIndex()===2){swallow(e);openControlsFromIcons();return}
  swallow(e);return;
 }
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  swallow(e);
  cancelArmed();
  if(controlsVisible()&&controlsSubnav()){
   selectSub(subIndex+(e.key==='ArrowDown'?1:-1));
  }else{
   selectMain(currentIndex()+(e.key==='ArrowDown'?1:-1),true);
  }
  return;
 }
 if(e.key==='Enter'){
  swallow(e);
  if(armed){confirmArmed();return}
  if(controlsVisible()&&controlsSubnav())return;
  const a=selectedAction();
  if(a){arm(a);return}
  buttons()[currentIndex()]?.click();
  return;
 }
 if(e.code==='Space'){
  swallow(e);cancelArmed();document.getElementById('vidlikPauseResume')?.click();return;
 }
 if(key==='r'){
  swallow(e);arm('restart');return;
 }
 if(key==='q'){
  swallow(e);arm('exit');return;
 }
 if(key==='k'){
  swallow(e);cancelArmed();
  if(controlsVisible())closeControlsToIcons();else openControlsFromIcons();
  return;
 }
},true);

// Mouse follows the same no-modal confirmation model.
window.addEventListener('click',e=>{
 if(!isOpen())return;
 const restart=e.target.closest?.('#vidlikPauseRestart');
 const exit=e.target.closest?.('#vidlikPauseScenes');
 if(!restart&&!exit)return;
 swallow(e);
 const name=restart?'restart':'exit';
 if(armed===name)confirmArmed();else arm(name);
},true);

window.addEventListener('pointerover',e=>{
 if(!isOpen()||!armed)return;
 const b=e.target.closest?.('.hotki-pause-scene .hotki-action');
 if(!b)return;
 const current=document.getElementById(ACTIONS[armed].id);
 if(b!==current)cancelArmed();
},true);

window.addEventListener('vidlik:pause-state',e=>{
 if(!e.detail?.paused){resetPauseView();return}
 resetPauseView();selectMain(0,false);
});

// CSS for the inline confirmation tooltip. No dialog/card is shown.
const style=document.createElement('style');
style.dataset.hotkiPauseInlineConfirm='1';
style.textContent=`
.hotki-pause-scene .hotki-pause-confirm{display:none!important}
.hotki-pause-scene .hotki-action.hotki-confirm-armed{filter:brightness(1.18) drop-shadow(0 0 .72rem rgba(255,154,82,.52))!important}
.hotki-pause-scene .hotki-native-tooltip.is-confirm{
 opacity:1!important;transform:translateX(0)!important;
 border-color:rgba(255,174,112,.42)!important;
 background:rgba(7,17,20,.90)!important;
 color:#f3fbfc!important;
 box-shadow:0 9px 30px rgba(0,0,0,.28),0 0 20px rgba(255,154,82,.08)!important;
}
.hotki-pause-scene .hotki-native-tooltip.is-confirm b{color:#ffad6d!important;margin-left:.55rem!important}
.hotki-pause-scene .hotki-native-tooltip.is-confirm small{color:#a8cfd3!important;font:600 .86em/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;letter-spacing:.04em!important;text-transform:none!important}
`;
document.head.appendChild(style);

window.VIDLIK_PAUSE_INLINE_CANCEL=()=>cancelArmed();
})();