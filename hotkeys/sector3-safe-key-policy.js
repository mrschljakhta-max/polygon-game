(()=>{
'use strict';

const help=document.getElementById('help');
if(!help)return;

function removeUnsafeFunctionKeyHints(){
 for(const node of [...help.querySelectorAll('span')]){
  if(/\bF2\b/i.test(node.textContent||''))node.remove();
 }
}

window.addEventListener('vidlik:os-ready',()=>requestAnimationFrame(removeUnsafeFunctionKeyHints));
window.addEventListener('vidlik:section2-ready',removeUnsafeFunctionKeyHints);
window.addEventListener('vidlik:section3-ready',removeUnsafeFunctionKeyHints);
window.addEventListener('vidlik:section4-ready',removeUnsafeFunctionKeyHints);

const observer=new MutationObserver(()=>removeUnsafeFunctionKeyHints());
observer.observe(help,{childList:true,subtree:true,characterData:true});

removeUnsafeFunctionKeyHints();
})();
