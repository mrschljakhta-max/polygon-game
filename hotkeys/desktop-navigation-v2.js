(()=>{
'use strict';
const TUTORIAL_KEY='vidlik-hotkeys-tutorial-complete-v1';

function style(){
  if(document.getElementById('vidlik-nav-v2-style')) return;
  const s=document.createElement('style');
  s.id='vidlik-nav-v2-style';
  s.textContent=`
    .ds-hub-tools{display:flex;align-items:center;gap:14px}
    .ds-tutorial-entry{border:0;background:transparent;color:#a9fff6;cursor:pointer;padding:.5em .25em;font:800 clamp(8px,.64vw,12px)/1.2 Consolas,monospace;letter-spacing:.08em;white-space:nowrap;position:relative}
    .ds-tutorial-entry::before{content:'> ';color:#52e2d5}.ds-tutorial-entry::after{content:'';position:absolute;left:0;right:100%;bottom:0;height:1px;background:#52e2d5;transition:right .22s ease;box-shadow:0 0 8px #52e2d555}
    .ds-tutorial-entry:hover::after{right:0}.ds-tutorial-entry.done{color:#7eaaa5}.ds-tutorial-entry.done::before{content:'✓ ';color:#64e8dc}
  `;
  document.head.appendChild(s);
}

function injectTutorial(){
  style();
  const head=document.querySelector('.ds-hub-head');
  if(!head || head.querySelector('[data-tutorial]')) return;
  const done=localStorage.getItem(TUTORIAL_KEY)==='1';
  const oldBack=head.querySelector('#ds-sector1');
  const tools=document.createElement('div');
  tools.className='ds-hub-tools';
  const b=document.createElement('button');
  b.type='button';
  b.className='ds-tutorial-entry'+(done?' done':'');
  b.setAttribute('data-tutorial','1');
  b.textContent=done?'00 · ІНСТРУКТАЖ ПРОЙДЕНО':'00 · ПРОЙТИ ІНСТРУКТАЖ';
  tools.appendChild(b);
  if(oldBack){oldBack.remove();tools.appendChild(oldBack)}
  head.appendChild(tools);
}

document.addEventListener('click',e=>{
  const tutorial=e.target.closest('[data-tutorial]');
  if(tutorial){
    e.preventDefault();e.stopImmediatePropagation();
    location.href='tutorial.html?v=1';
    return;
  }
  const sector1=e.target.closest('[data-sector="1"],#ds-sector1');
  if(sector1){
    e.preventDefault();e.stopImmediatePropagation();
    location.href='sector1.html?v=1';
  }
},true);

new MutationObserver(injectTutorial).observe(document.documentElement,{subtree:true,childList:true});
injectTutorial();
})();