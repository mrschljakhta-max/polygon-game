(()=>{
'use strict';

/*
 * Browser KeyboardEvent.key follows the active keyboard layout, while
 * KeyboardEvent.code follows the physical key. HOTKI teaches familiar
 * Ctrl-shortcuts, so they must work on UKR and ENG layouts alike.
 */
function latinShortcutKey(e){
 if(!e.ctrlKey||e.altKey||e.metaKey)return'';
 const m=/^Key([A-Z])$/.exec(e.code||'');
 return m?m[1].toLowerCase():'';
}

window.addEventListener('keydown',e=>{
 const key=latinShortcutKey(e);
 if(!key)return;
 if(String(e.key||'').toLowerCase()===key)return;

 // Stop the layout-dependent event (for example Ctrl+С in UKR layout)
 // and re-emit the same physical shortcut with a canonical Latin key.
 e.preventDefault();
 e.stopPropagation();
 e.stopImmediatePropagation();

 const normalized=new KeyboardEvent('keydown',{
  key,
  code:e.code,
  ctrlKey:true,
  shiftKey:e.shiftKey,
  altKey:false,
  metaKey:false,
  repeat:e.repeat,
  bubbles:true,
  cancelable:true
 });
 document.dispatchEvent(normalized);
},true);

/*
 * Files tutorial task 6 accepts both Ctrl+C and the context-menu command.
 * Some browser/event-order combinations execute the context-menu copy but
 * leave the tutorial one step behind. Re-emit the canonical shortcut after
 * the real menu action as a state-sync pulse. The task guard makes this a
 * no-op everywhere else.
 */
window.addEventListener('click',e=>{
 const copy=e.target?.closest?.('[data-menu="copy"]');
 if(!copy)return;
 const tutorial=window.VIDLIK_FILES_TUTORIAL;
 if(!tutorial?.active||tutorial.task!==6)return;

 setTimeout(()=>{
  const current=window.VIDLIK_FILES_TUTORIAL;
  if(!current?.active||current.task!==6)return;
  document.dispatchEvent(new KeyboardEvent('keydown',{
   key:'c',
   code:'KeyC',
   ctrlKey:true,
   bubbles:true,
   cancelable:true
  }));
 },90);
},true);
})();
