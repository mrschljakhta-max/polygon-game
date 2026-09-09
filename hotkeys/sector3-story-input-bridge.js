(()=>{
'use strict';
const p=new URLSearchParams(location.search);
const scene=parseInt(p.get('storyScene')||'0',10)||0;
if(scene!==1)return;

/* Direct story checkpoints must own the keyboard before any legacy tutorial
   listener gets a chance to swallow Enter / Ctrl+F / text input. The actual
   handler is attached later by sector3-story-jump.js. Until then we simply
   block non-Escape keys so no old tutorial can advance behind the curtain. */
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.code==='Escape'||e.keyCode===27)return;
  const handler=window.VIDLIK_SCENE1_INPUT;
  if(typeof handler==='function'){
    handler(e);
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
},true);
})();
