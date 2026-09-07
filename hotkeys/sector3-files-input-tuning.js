(()=>{
'use strict';
let tunedFor=null;

function tune(){
 const t=window.VIDLIK_FILES_TUTORIAL;
 if(!t?.active||t.phase!=='rename-input')return;
 const input=document.querySelector('.os-window[data-window-id="explorer"] .os-inline-input');
 if(!input||tunedFor===input)return;
 const dot=input.value.lastIndexOf('.');
 if(dot>0){input.focus();input.setSelectionRange(0,dot)}
 const chat=document.getElementById('adminChat');
 const last=chat?.querySelector('.admin-message:last-child .admin-bubble p');
 if(last)last.textContent='Введіть будь-яку зрозумілу нову назву й натисніть Enter. Наприклад: «Знайомство». Розширення .xlsx залиште без змін.';
 const help=document.getElementById('help');
 if(help)help.innerHTML='<span><kbd>ТЕКСТ</kbd> нова назва · <kbd>ENTER</kbd></span>';
 tunedFor=input;
}

const observer=new MutationObserver(()=>requestAnimationFrame(tune));
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('vidlik:section2-ready',()=>{tunedFor=null});
window.addEventListener('vidlik:os-reset',()=>{tunedFor=null});
})();
