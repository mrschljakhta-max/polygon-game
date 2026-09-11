(()=>{
'use strict';
if(window.VIDLIK_UI)return;

/*
 * Canonical Sector 3 UI helpers.
 *
 * IMPORTANT: #help / ESC hint ownership belongs to sector3-pause.js.
 * The former UI implementation also observed and rewrote #help, while the pause
 * controller did the same. Their MutationObservers could continuously trigger
 * one another and starve the browser event loop. Keep this module focused on
 * non-pause UI cleanup only.
 */

function sync(){
 // Compatibility hook. ESC/help synchronization is intentionally owned by
 // VIDLIK_PAUSE; do not mutate #help from here.
 return true;
}

function cleanupLanguageUi(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 document.querySelectorAll('.vidlik-language-target,.vidlik-language-field-target').forEach(x=>{
  x.classList.remove('vidlik-language-target','vidlik-language-field-target');
 });
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

window.addEventListener('vidlik:language-section-complete',cleanupLanguageUi);
window.addEventListener('vidlik:os-reset',cleanupLanguageUi);

cleanupLanguageUi();
installExcelChatDedupe();

window.VIDLIK_UI={sync,cleanupLanguageUi};
// Compatibility alias for code written before the UI cleanup.
window.VIDLIK_HUD_STABILITY=window.VIDLIK_UI;
})();
