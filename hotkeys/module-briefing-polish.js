(()=>{
'use strict';
const list=document.getElementById('mbf-levels-list');
if(!list)return;

let normalizing=false;

function normalizeNumbers(){
  if(normalizing)return;
  normalizing=true;
  try{
    list.querySelectorAll('.mbf-level').forEach(level=>{
      const n=Number(level.dataset.level||0);
      const icon=level.querySelector('.mbf-level-icon');
      if(!icon||!n)return;

      let number=icon.querySelector('.mbf-simple-number');
      if(!number){
        icon.replaceChildren();
        number=document.createElement('span');
        number.className='mbf-simple-number';
        icon.appendChild(number);
      }

      const value=String(n);
      if(number.textContent!==value)number.textContent=value;
      if(icon.classList.contains('has-digit-art'))icon.classList.remove('has-digit-art');
    });
  }finally{
    normalizing=false;
  }
}

normalizeNumbers();

/*
  renderPage() rebuilds only the direct children of the levels list.
  Watching the entire subtree caused our own text/icon edits to trigger the
  observer again, creating a tight MutationObserver loop and freezing the page.
  Observe direct list changes only and normalize once after each page rebuild.
*/
const observer=new MutationObserver(mutations=>{
  if(normalizing)return;
  if(mutations.some(m=>m.type==='childList'&&m.target===list))normalizeNumbers();
});
observer.observe(list,{childList:true});
})();
