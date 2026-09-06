(()=>{
'use strict';
let tuned=false;

function tune(){
 if(tuned)return;
 const t=window.VIDLIK_FILES_TUTORIAL;
 if(!t||t.phase!=='rename-input')return;
 const input=document.querySelector('.os-window[data-window-id="explorer"] .os-inline-input');
 if(!input)return;
 const dot=input.value.lastIndexOf('.');
 if(dot>0){
  input.focus();
  input.setSelectionRange(0,dot);
 }
 const chat=document.getElementById('adminChat');
 const last=chat?.querySelector('.admin-message:last-child .admin-bubble p');
 if(last)last.textContent='Введіть нову назву: «Знайомство» і натисніть Enter. Розширення .xlsx залишиться автоматично.';
 const help=document.getElementById('help');
 if(help)help.innerHTML='<span><kbd>ТЕКСТ</kbd> Знайомство · <kbd>ENTER</kbd></span>';
 tuned=true;
}

const observer=new MutationObserver(()=>requestAnimationFrame(tune));
observer.observe(document.body,{childList:true,subtree:true});

const mon=document.querySelector('.monitor-screen');
mon?.addEventListener('click',e=>{
 const t=window.VIDLIK_FILES_TUTORIAL;
 if(!t?.active||t.phase!=='select-training'||e.detail<2)return;
 const row=e.target.closest('.os-file-item');
 if(!row)return;
 e.preventDefault();
 e.stopPropagation();
 e.stopImmediatePropagation();
},true);

window.addEventListener('vidlik:section2-ready',()=>{tuned=false});
window.addEventListener('vidlik:os-reset',()=>{tuned=false});
})();
