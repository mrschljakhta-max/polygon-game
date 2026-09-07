(()=>{
'use strict';
function cleanup(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 document.querySelectorAll('.vidlik-language-target,.vidlik-language-field-target').forEach(x=>x.classList.remove('vidlik-language-target','vidlik-language-field-target'));
}
function loadExcelEpisode(){
 if(!document.querySelector('link[data-vidlik-excel-story]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='sector3-excel-tutorial.css?v=20260907-1';
  link.dataset.vidlikExcelStory='true';
  document.head.appendChild(link);
 }
 if(window.VIDLIK_EXCEL_STORY_TUTORIAL||document.querySelector('script[data-vidlik-excel-story]'))return;
 const script=document.createElement('script');
 script.src='sector3-excel-tutorial.js?v=20260907-1';
 script.dataset.vidlikExcelStory='true';
 document.head.appendChild(script);
}
window.addEventListener('vidlik:language-section-complete',cleanup);
window.addEventListener('vidlik:os-reset',cleanup);
cleanup();
loadExcelEpisode();
})();
