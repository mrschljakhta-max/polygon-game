(()=>{
'use strict';
function cleanup(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 document.querySelectorAll('.vidlik-language-target,.vidlik-language-field-target').forEach(x=>x.classList.remove('vidlik-language-target','vidlik-language-field-target'));
}
window.addEventListener('vidlik:language-section-complete',cleanup);
window.addEventListener('vidlik:os-reset',cleanup);
})();
