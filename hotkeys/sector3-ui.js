(()=>{
'use strict';
if(window.VIDLIK_UI)return;

const help=document.getElementById('help');
if(!help)return;

const nativeHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
let scheduled=false;
let syncing=false;

function visible(sel){
 const el=document.querySelector(sel);
 if(!el||el.hidden)return false;
 const s=getComputedStyle(el);
 return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';
}
function osState(){try{return window.VIDLIK_OS?.getState?.()||null}catch(_){return null}}
function escContext(){
 if(document.querySelector('.pause.visible'))return{label:'ПРОДОВЖИТИ',hold:false};
 if(visible('.excel-search:not([hidden])'))return{label:'ЗАКРИТИ ПОШУК',hold:true};
 if(document.querySelector('.editing'))return{label:'СКАСУВАТИ ВВЕДЕННЯ',hold:true};
 if(visible('.os-dialog-wrap'))return{label:'ЗАКРИТИ ВІКНО',hold:true};
 if(visible('.os-context-menu:not([hidden])')||visible('.os-start-menu:not([hidden])')||visible('#osLanguageMenu:not([hidden])'))return{label:'ЗАКРИТИ МЕНЮ',hold:true};
 const state=osState();
 const active=state?.windows?.find(w=>w.id===state.activeWindowId&&!w.minimized);
 if(active)return{label:'ЗГОРНУТИ ВІКНО',hold:true};
 return{label:'ПАУЗА',hold:false};
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function protectInnerHTML(el,onWrite){
 if(!el||el.__vidlikStableInnerHTML)return;
 try{
  Object.defineProperty(el,'__vidlikStableInnerHTML',{value:true,configurable:true});
  Object.defineProperty(el,'innerHTML',{
   configurable:true,
   get(){return nativeHTML.get.call(this)},
   set(value){
    const next=String(value??'');
    if(nativeHTML.get.call(this)===next)return;
    nativeHTML.set.call(this,next);
    onWrite?.();
   }
  });
 }catch(_){}
}
function scheduleSync(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;sync()});
}
function sync(){
 if(syncing)return;
 syncing=true;
 try{
  let own=help.querySelector(':scope > #vidlikEscHint');
  if(!own){own=document.createElement('span');own.id='vidlikEscHint';help.appendChild(own)}
  protectInnerHTML(own,scheduleSync);
  for(const span of [...help.querySelectorAll(':scope > span')]){
   if(span===own)continue;
   const first=span.querySelector('kbd');
   span.classList.toggle('vidlik-native-esc-hidden',!!first&&/^ESC$/i.test((first.textContent||'').trim()));
  }
  const seen=new Set();
  for(const span of [...help.querySelectorAll(':scope > span')]){
   if(span===own||span.classList.contains('vidlik-native-esc-hidden'))continue;
   const key=(span.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(!key)continue;
   if(seen.has(key))span.classList.add('vidlik-native-duplicate-hidden');
   else{seen.add(key);span.classList.remove('vidlik-native-duplicate-hidden')}
  }
  const c=escContext();
  const html=`<kbd>ESC</kbd> ${escapeHtml(c.label)}${c.hold?'<em>· утримувати — пауза</em>':''}`;
  if(own.innerHTML!==html)own.innerHTML=html;
 }finally{syncing=false}
}

function cleanupLanguageUi(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 document.querySelectorAll('.vidlik-language-target,.vidlik-language-field-target').forEach(x=>x.classList.remove('vidlik-language-target','vidlik-language-field-target'));
}
function installExcelChatDedupe(){
 const chat=document.getElementById('adminChat');
 if(!chat||chat.dataset.excelDedupe==='1')return;
 chat.dataset.excelDedupe='1';
 new MutationObserver(records=>{
  for(const record of records){
   for(const node of record.addedNodes){
    if(!(node instanceof HTMLElement)||!node.classList.contains('excel-story-message'))continue;
    const prev=node.previousElementSibling;
    if(!prev?.classList.contains('excel-story-message'))continue;
    const sender=node.querySelector('.admin-bubble-name')?.textContent||'';
    const text=node.querySelector('p')?.textContent||'';
    const prevSender=prev.querySelector('.admin-bubble-name')?.textContent||'';
    const prevText=prev.querySelector('p')?.textContent||'';
    if(sender===prevSender&&text===prevText)node.remove();
   }
  }
 }).observe(chat,{childList:true});
}

protectInnerHTML(help,scheduleSync);
const observer=new MutationObserver(scheduleSync);
observer.observe(help,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
['vidlik:pause-state','vidlik:episode2-ready','vidlik:episode3-ready','vidlik:episode4-ready','vidlik:episode5-ready','vidlik:os-ready','vidlik:os-reset'].forEach(name=>window.addEventListener(name,scheduleSync));
window.addEventListener('vidlik:language-section-complete',cleanupLanguageUi);
window.addEventListener('vidlik:os-reset',cleanupLanguageUi);
window.addEventListener('keydown',scheduleSync,true);
window.addEventListener('pointerup',scheduleSync,true);

cleanupLanguageUi();
installExcelChatDedupe();
sync();

window.VIDLIK_UI={sync,cleanupLanguageUi};
// Compatibility alias for code written before the UI cleanup.
window.VIDLIK_HUD_STABILITY=window.VIDLIK_UI;
})();
