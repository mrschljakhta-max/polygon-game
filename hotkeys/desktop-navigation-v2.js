(()=>{
'use strict';
const TUTORIAL_KEY='vidlik-hotkeys-tutorial-complete-v1';

function style(){
  if(document.getElementById('vidlik-nav-v2-style')) return;
  const s=document.createElement('style');
  s.id='vidlik-nav-v2-style';
  s.textContent=`
    .ds-tutorial-card{position:relative;border-color:rgba(122,255,239,.48)!important;background:linear-gradient(145deg,rgba(8,43,39,.94),rgba(3,22,20,.91))!important}
    .ds-tutorial-card::after{content:'СТАРТ';position:absolute;right:8%;top:8%;font-size:clamp(7px,.52vw,10px);font-weight:800;letter-spacing:.12em;color:#8ffff1}
    .ds-tutorial-card .ds-num{color:#8ffff1!important}
    .ds-tutorial-card.done::after{content:'✓ ПРОЙДЕНО'}
  `;
  document.head.appendChild(s);
}

function injectTutorial(){
  style();
  const grid=document.querySelector('.ds-module-grid');
  if(!grid || grid.querySelector('[data-tutorial]')) return;
  const done=localStorage.getItem(TUTORIAL_KEY)==='1';
  const b=document.createElement('button');
  b.className='ds-module ds-tutorial-card'+(done?' done':'');
  b.setAttribute('data-tutorial','1');
  b.innerHTML=`<span class="ds-num">00</span><strong>Інструктаж</strong><small>Знайомство з інтерфейсом, підказками та механікою натискання комбінацій.</small><div class="ds-progress"><i style="--p:${done?100:0}%"></i></div>`;
  grid.prepend(b);
}

document.addEventListener('click',e=>{
  const tutorial=e.target.closest('[data-tutorial]');
  if(tutorial){
    e.preventDefault(); e.stopImmediatePropagation();
    location.href='tutorial.html?v=1';
    return;
  }
  const sector1=e.target.closest('[data-sector="1"],#ds-sector1');
  if(sector1){
    e.preventDefault(); e.stopImmediatePropagation();
    location.href='sector1.html?v=1';
  }
},true);

new MutationObserver(injectTutorial).observe(document.documentElement,{subtree:true,childList:true});
injectTutorial();
})();