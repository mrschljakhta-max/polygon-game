(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if((parseInt(params.get('storyScene')||'0',10)||0)!==1)return;
if(window.VIDLIK_DIRECT_LANGUAGE_INPUT)return;

/*
 * Direct Scene 01 uses a simulated VIDLIK OS language selector.
 * Browser KeyboardEvent.key still follows the user's real OS layout, so when
 * VIDLIK says ENG but Windows is physically on UKR, formulas used to arrive as
 * Cyrillic gibberish. Translate by physical KeyboardEvent.code instead.
 */

const EN={};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>EN['Key'+c]=[c.toLowerCase(),c]);
Object.assign(EN,{
 Digit1:['1','!'],Digit2:['2','@'],Digit3:['3','#'],Digit4:['4','$'],Digit5:['5','%'],
 Digit6:['6','^'],Digit7:['7','&'],Digit8:['8','*'],Digit9:['9','('],Digit0:['0',')'],
 Minus:['-','_'],Equal:['=','+'],BracketLeft:['[','{'],BracketRight:[']','}'],
 Backslash:['\\','|'],Semicolon:[';',':'],Quote:["'",'"'],Comma:[',','<'],
 Period:['.','>'],Slash:['/','?'],Backquote:['`','~'],Space:[' ',' ']
});

const UA={
 KeyQ:['й','Й'],KeyW:['ц','Ц'],KeyE:['у','У'],KeyR:['к','К'],KeyT:['е','Е'],KeyY:['н','Н'],
 KeyU:['г','Г'],KeyI:['ш','Ш'],KeyO:['щ','Щ'],KeyP:['з','З'],BracketLeft:['х','Х'],BracketRight:['ї','Ї'],
 KeyA:['ф','Ф'],KeyS:['і','І'],KeyD:['в','В'],KeyF:['а','А'],KeyG:['п','П'],KeyH:['р','Р'],
 KeyJ:['о','О'],KeyK:['л','Л'],KeyL:['д','Д'],Semicolon:['ж','Ж'],Quote:['є','Є'],
 KeyZ:['я','Я'],KeyX:['ч','Ч'],KeyC:['с','С'],KeyV:['м','М'],KeyB:['и','И'],KeyN:['т','Т'],
 KeyM:['ь','Ь'],Comma:['б','Б'],Period:['ю','Ю'],Backquote:['ґ','Ґ'],
 Digit1:['1','!'],Digit2:['2','"'],Digit3:['3','№'],Digit4:['4',';'],Digit5:['5','%'],
 Digit6:['6',':'],Digit7:['7','?'],Digit8:['8','*'],Digit9:['9','('],Digit0:['0',')'],
 Minus:['-','_'],Equal:['=','+'],Slash:['.','/'],Backslash:['\\','/'],Space:[' ',' ']
};

function currentLanguage(){
  try{return window.VIDLIK_OS?.language==='ENG'?'ENG':'UKR'}catch(_){return'UKR'}
}
function virtualChar(e){
  const map=currentLanguage()==='ENG'?EN:UA;
  const pair=map[e.code];
  if(!pair)return'';
  return pair[e.shiftKey?1:0]||'';
}
function shouldTranslate(e){
  if(e.__vidlikVirtualLayout||e.repeat||e.isComposing)return false;
  if(e.ctrlKey||e.metaKey||e.altKey)return false;
  if(e.key==='Escape'||e.key==='Enter'||e.key==='Backspace'||e.key.startsWith('Arrow'))return false;
  if(!(e.key.length===1||e.code==='Space'))return false;
  // Only take ownership once the direct Excel checkpoint exists and is active.
  const win=document.querySelector('.s3-direct-window');
  if(!win||win.style.display==='none'||win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return false;
  // While Polya is in the canonical close-up, printable keys are intentionally ignored.
  if(document.getElementById('scene')?.classList.contains('s3-scene1-focus'))return false;
  return true;
}

window.addEventListener('keydown',e=>{
  if(!shouldTranslate(e))return;
  const ch=virtualChar(e);
  if(!ch||ch===e.key)return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const synthetic=new KeyboardEvent('keydown',{
    key:ch,
    code:e.code,
    location:e.location,
    ctrlKey:false,
    shiftKey:e.shiftKey,
    altKey:false,
    metaKey:false,
    repeat:false,
    bubbles:true,
    cancelable:true,
    composed:true
  });
  try{Object.defineProperty(synthetic,'__vidlikVirtualLayout',{value:true})}catch(_){}
  window.dispatchEvent(synthetic);
},true);

window.VIDLIK_DIRECT_LANGUAGE_INPUT={
  translate:virtualChar,
  get language(){return currentLanguage()}
};
})();
