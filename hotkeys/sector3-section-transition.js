(()=>{
'use strict';

let overlay=null;
let phase='idle';
let locked=false;

function build(){
 const root=document.createElement('section');
 root.className='vidlik-section-transition';
 root.setAttribute('aria-label','Перехід між навчальними розділами');
 root.innerHTML=`
  <div class="vidlik-section-corner tl">VIDLIK OS / TRAINING ENVIRONMENT</div>
  <div class="vidlik-section-corner br">SECTOR 3<br>OPERATOR TRAINING</div>
  <div class="vidlik-section-scan"></div>

  <div class="vidlik-section-panel vidlik-section-complete is-active" data-section-panel="complete">
   <div class="vidlik-section-content">
    <div class="vidlik-section-counter">9 / 9</div>
    <h2 class="vidlik-section-title">Базове знайомство<br>з операційною системою</h2>
    <div class="vidlik-section-rule"></div>
    <div class="vidlik-section-done">Завершено ✓</div>
   </div>
  </div>

  <div class="vidlik-section-panel vidlik-section-next" data-section-panel="next">
   <div class="vidlik-section-content">
    <div class="vidlik-section-kicker">Розділ 2</div>
    <h2 class="vidlik-section-title">Файли та папки</h2>
    <div class="vidlik-section-rule"></div>
    <div class="vidlik-section-subtitle">Створення · перейменування · копіювання · переміщення · видалення</div>
   </div>
  </div>

  <div class="vidlik-section-enter"><kbd>ENTER</kbd><span>продовжити</span></div>`;
 return root;
}

function show(){
 if(overlay)return;
 overlay=build();
 document.body.appendChild(overlay);
 document.body.classList.add('vidlik-section-transition-active');
 phase='complete';
 locked=false;
}

function switchToNext(){
 if(!overlay||locked||phase!=='complete')return;
 locked=true;
 phase='switching';
 const first=overlay.querySelector('[data-section-panel="complete"]');
 const next=overlay.querySelector('[data-section-panel="next"]');
 const prompt=overlay.querySelector('.vidlik-section-enter');
 prompt.style.opacity='0';
 overlay.classList.add('is-switching');
 first.classList.remove('is-active');
 first.classList.add('is-out');
 setTimeout(()=>{
  first.classList.remove('is-out');
  next.classList.add('is-active');
  prompt.style.opacity='';
  overlay.classList.remove('is-switching');
  phase='next';
  locked=false;
 },520);
}

function finish(){
 if(!overlay||locked||phase!=='next')return;
 locked=true;
 phase='leaving';
 overlay.classList.add('is-leaving','is-switching');
 const prompt=overlay.querySelector('.vidlik-section-enter');
 if(prompt)prompt.style.opacity='0';
 setTimeout(()=>{
  overlay?.remove();
  overlay=null;
  document.body.classList.remove('vidlik-section-transition-active');
  phase='idle';
  locked=false;

  const footer=document.getElementById('adminFooter');
  if(footer){
   footer.textContent='РОЗДІЛ 2 · ФАЙЛИ ТА ПАПКИ';
   footer.classList.add('vidlik-tutorial-footer');
  }
  const help=document.getElementById('help');
  if(help){
   help.classList.add('vidlik-tutorial-help');
   help.innerHTML='<span><kbd>РОЗДІЛ 2</kbd> файли та папки</span>';
  }
  window.dispatchEvent(new CustomEvent('vidlik:section2-ready'));
 },700);
}

function hideImmediate(){
 if(overlay)overlay.remove();
 overlay=null;
 phase='idle';
 locked=false;
 document.body.classList.remove('vidlik-section-transition-active');
}

function key(e){
 if(!overlay)return;
 e.stopImmediatePropagation();
 e.stopPropagation();
 if(e.key!=='Enter')return;
 e.preventDefault();
 if(locked)return;
 if(phase==='complete')switchToNext();
 else if(phase==='next')finish();
}

window.addEventListener('keydown',key,true);
window.addEventListener('vidlik:tutorial-basic-window-block-complete',show);
window.addEventListener('vidlik:os-reset',hideImmediate);

window.VIDLIK_SECTION_TRANSITION={show,finish,get phase(){return phase}};
})();
