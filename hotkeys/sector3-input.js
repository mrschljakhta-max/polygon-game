(()=>{
'use strict';
if(window.VIDLIK_INPUT)return;

const storyScene=parseInt(new URLSearchParams(location.search).get('storyScene')||'0',10)||0;
const help=document.getElementById('help');
const monitor=document.querySelector('.monitor-screen');
let tunedRenameInput=null;
let explorerRaf=0;

/* Physical Ctrl-shortcuts work the same on UKR and ENG layouts. */
function latinShortcutKey(e){
 if(!e.ctrlKey||e.altKey||e.metaKey)return'';
 const m=/^Key([A-Z])$/.exec(e.code||'');
 return m?m[1].toLowerCase():'';
}

window.addEventListener('keydown',e=>{
 const key=latinShortcutKey(e);
 if(!key||String(e.key||'').toLowerCase()===key)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 document.dispatchEvent(new KeyboardEvent('keydown',{
  key,code:e.code,ctrlKey:true,shiftKey:e.shiftKey,altKey:false,metaKey:false,
  repeat:e.repeat,bubbles:true,cancelable:true
 }));
},true);

/* Files tutorial: context-menu Copy also advances the Ctrl+C task reliably. */
window.addEventListener('click',e=>{
 const copy=e.target?.closest?.('[data-menu="copy"]');
 if(!copy)return;
 const tutorial=window.VIDLIK_FILES_TUTORIAL;
 if(!tutorial?.active||tutorial.task!==6)return;
 setTimeout(()=>{
  const current=window.VIDLIK_FILES_TUTORIAL;
  if(!current?.active||current.task!==6)return;
  document.dispatchEvent(new KeyboardEvent('keydown',{
   key:'c',code:'KeyC',ctrlKey:true,bubbles:true,cancelable:true
  }));
 },90);
},true);

/* Safe-key policy: browser-reserved F2 is never advertised as a training action. */
function removeUnsafeFunctionKeyHints(){
 if(!help)return;
 for(const node of [...help.querySelectorAll('span')]){
  if(/\bF2\b/i.test(node.textContent||''))node.remove();
 }
}
['vidlik:os-ready','vidlik:section2-ready','vidlik:section3-ready','vidlik:section4-ready']
 .forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(removeUnsafeFunctionKeyHints)));

/* Files tutorial: preserve .xlsx while selecting only the rename stem. */
function tuneRenameInput(){
 const t=window.VIDLIK_FILES_TUTORIAL;
 if(!t?.active||t.phase!=='rename-input')return;
 const input=document.querySelector('.os-window[data-window-id="explorer"] .os-inline-input');
 if(!input||tunedRenameInput===input)return;
 const dot=input.value.lastIndexOf('.');
 if(dot>0){input.focus();input.setSelectionRange(0,dot)}
 const chat=document.getElementById('adminChat');
 const last=chat?.querySelector('.admin-message:last-child .admin-bubble p');
 if(last)last.textContent='Введіть назву «Знайомство» і натисніть Enter. Розширення .xlsx залишиться без змін.';
 if(help)help.innerHTML='<span><kbd>ТЕКСТ</kbd> Знайомство · <kbd>ENTER</kbd></span>';
 tunedRenameInput=input;
}
window.addEventListener('vidlik:section2-ready',()=>{tunedRenameInput=null});
window.addEventListener('vidlik:os-reset',()=>{tunedRenameInput=null;cancelAnimationFrame(explorerRaf)});

/* Explorer keyboard polish: keep the keyboard-selected row in view. */
function explorerWindow(){
 if(!monitor)return null;
 const win=monitor.querySelector('.os-window[data-window-id="explorer"]');
 if(!win||win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return null;
 return win;
}
function keepSelectedVisible(){
 explorerRaf=0;
 const win=explorerWindow();
 if(!win)return;
 const pane=win.querySelector('.os-file-pane');
 const row=win.querySelector('.os-file-item.selected');
 if(!pane||!row)return;
 const head=win.querySelector('.os-file-head');
 const pr=pane.getBoundingClientRect(),rr=row.getBoundingClientRect(),hr=head?.getBoundingClientRect();
 const top=Math.max(pr.top,(hr?.bottom||pr.top))+3,bottom=pr.bottom-3;
 if(rr.top<top)pane.scrollTop-=top-rr.top;
 else if(rr.bottom>bottom)pane.scrollTop+=rr.bottom-bottom;
}
function scheduleExplorerVisibility(){
 cancelAnimationFrame(explorerRaf);
 explorerRaf=requestAnimationFrame(()=>requestAnimationFrame(keepSelectedVisible));
}
function selectExplorerSearchText(){
 requestAnimationFrame(()=>{
  const input=explorerWindow()?.querySelector('.os-search-row.visible input[id^="osSearch-"]');
  if(!input)return;
  input.focus();
  try{input.select()}catch(_){}
 });
}
window.addEventListener('keydown',e=>{
 const state=window.VIDLIK_OS?.getState?.();
 if(state?.activeWindowId!=='explorer')return;
 if(e.ctrlKey&&!e.altKey&&!e.metaKey&&e.code==='KeyF'){
  selectExplorerSearchText();
  return;
 }
 if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))scheduleExplorerVisibility();
},false);

/* Direct-story virtual layout: printable keys follow VIDLIK OS language. */
const EN={};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>EN['Key'+c]=[c.toLowerCase(),c]);
Object.assign(EN,{
 Digit1:['1','!'],Digit2:['2','@'],Digit3:['3','#'],Digit4:['4','$'],Digit5:['5','%'],
 Digit6:['6','^'],Digit7:['7','&'],Digit8:['8','*'],Digit9:['9','('],Digit0:['0',')'],
 Minus:['-','_'],Equal:['=','+'],BracketLeft:['[','{'],BracketRight:[']','}'],
 Backslash:['\\','|'],Semicolon:[';',':'],Quote:["'",'"'],Comma:[',','<'],Period:['.','>'],Slash:['/','?'],Backquote:['`','~'],Space:[' ',' ']
});
const UA={
 KeyQ:['й','Й'],KeyW:['ц','Ц'],KeyE:['у','У'],KeyR:['к','К'],KeyT:['е','Е'],KeyY:['н','Н'],KeyU:['г','Г'],KeyI:['ш','Ш'],KeyO:['щ','Щ'],KeyP:['з','З'],BracketLeft:['х','Х'],BracketRight:['ї','Ї'],
 KeyA:['ф','Ф'],KeyS:['і','І'],KeyD:['в','В'],KeyF:['а','А'],KeyG:['п','П'],KeyH:['р','Р'],KeyJ:['о','О'],KeyK:['л','Л'],KeyL:['д','Д'],Semicolon:['ж','Ж'],Quote:['є','Є'],
 KeyZ:['я','Я'],KeyX:['ч','Ч'],KeyC:['с','С'],KeyV:['м','М'],KeyB:['и','И'],KeyN:['т','Т'],KeyM:['ь','Ь'],Comma:['б','Б'],Period:['ю','Ю'],Backquote:['ґ','Ґ'],
 Digit1:['1','!'],Digit2:['2','"'],Digit3:['3','№'],Digit4:['4',';'],Digit5:['5','%'],Digit6:['6',':'],Digit7:['7','?'],Digit8:['8','*'],Digit9:['9','('],Digit0:['0',')'],
 Minus:['-','_'],Equal:['=','+'],Slash:['.','/'],Backslash:['\\','/'],Space:[' ',' ']
};
function currentLanguage(){
 try{return window.VIDLIK_OS?.language==='ENG'?'ENG':'UKR'}catch(_){return'UKR'}
}
function virtualChar(e){
 const pair=(currentLanguage()==='ENG'?EN:UA)[e.code];
 return pair?(pair[e.shiftKey?1:0]||''):'';
}
function directWindowActive(){
 const win=document.querySelector('.s3-direct-window');
 return !!win&&win.style.display!=='none'&&!win.classList.contains('os-minimized')&&!win.classList.contains('os-window-minimized');
}
function shouldTranslate(e){
 if(storyScene!==1||e.__vidlikVirtualLayout||e.repeat||e.isComposing)return false;
 if(e.ctrlKey||e.metaKey||e.altKey)return false;
 if(e.key==='Escape'||e.key==='Enter'||e.key==='Backspace'||e.key.startsWith('Arrow'))return false;
 if(!(e.key.length===1||e.code==='Space')||!directWindowActive())return false;
 return !document.getElementById('scene')?.classList.contains('s3-scene1-focus');
}
window.addEventListener('keydown',e=>{
 if(!shouldTranslate(e))return;
 const ch=virtualChar(e);
 if(!ch||ch===e.key)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const synthetic=new KeyboardEvent('keydown',{
  key:ch,code:e.code,location:e.location,ctrlKey:false,shiftKey:e.shiftKey,
  altKey:false,metaKey:false,repeat:false,bubbles:true,cancelable:true,composed:true
 });
 try{Object.defineProperty(synthetic,'__vidlikVirtualLayout',{value:true})}catch(_){}
 window.dispatchEvent(synthetic);
},true);

const bodyObserver=new MutationObserver(records=>{
 removeUnsafeFunctionKeyHints();
 tuneRenameInput();
 if(monitor&&records.some(r=>r.type==='childList'&&r.target.closest?.('.os-file-list')))scheduleExplorerVisibility();
});
bodyObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
removeUnsafeFunctionKeyHints();
tuneRenameInput();

window.VIDLIK_INPUT={
 latinShortcutKey,translate:virtualChar,
 get language(){return currentLanguage()},
 get directLayout(){return storyScene===1}
};
// Compatibility for code written before the input consolidation.
window.VIDLIK_DIRECT_LANGUAGE_INPUT={
 translate:virtualChar,
 get language(){return currentLanguage()},
 get scene2Phase(){return window.VIDLIK_DIRECT_SCENE2?.phase||'waiting'}
};
})();