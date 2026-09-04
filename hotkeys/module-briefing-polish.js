(()=>{
'use strict';
const list=document.getElementById('mbf-levels-list');
if(!list)return;

function normalizeNumbers(){
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
    number.textContent=String(n);
    icon.classList.remove('has-digit-art');
  });
}

normalizeNumbers();
const observer=new MutationObserver(()=>normalizeNumbers());
observer.observe(list,{childList:true,subtree:true});
})();
