(()=>{
'use strict';

let overlay=null;
let phase='idle';
let locked=false;
let current=null;

const transitions={
 section1:{
  count:'9 / 9',
  complete:'Базове знайомство<br>з операційною системою',
  nextKicker:'Розділ 2',
  nextTitle:'Файли та папки',
  subtitle:'Створення · перейменування · копіювання · переміщення · видалення',
  footer:'РОЗДІЛ 2 · ФАЙЛИ ТА ПАПКИ',
  help:'<span><kbd>РОЗДІЛ 2</kbd> файли та папки</span>',
  event:'vidlik:section2-ready'
 },
 section2:{
  count:'11 / 11',
  complete:'Файли та папки',
  nextKicker:'Розділ 3',
  nextTitle:'Робота з клавіатурою',
  subtitle:'Навігація · Enter · Tab · Ctrl-комбінації · пошук',
  footer:'РОЗДІЛ 3 · РОБОТА З КЛАВІАТУРОЮ',
  help:'<span><kbd>РОЗДІЛ 3</kbd> робота з клавіатурою</span>',
  event:'vidlik:section3-ready'
 },
 section3:{
  count:'11 / 11',
  complete:'Робота з клавіатурою',
  nextKicker:'Розділ 4',
  nextTitle:'Мова введення',
  subtitle:'UKR · ENG · символи · розкладка · введення тексту',
  footer:'РОЗДІЛ 4 · МОВА ВВЕДЕННЯ',
  help:'<span><kbd>РОЗДІЛ 4</kbd> мова введення</span>',
  event:'vidlik:section4-ready'
 }
};

function build(cfg){
 const root=document.createElement('section');
 root.className='vidlik-section-transition';
 root.setAttribute('aria-label','Перехід між навчальними розділами');
 root.innerHTML=`
  <div class="vidlik-section-corner tl">VIDLIK OS / TRAINING ENVIRONMENT</div>
  <div class="vidlik-section-corner br">SECTOR 3<br>OPERATOR TRAINING</div>
  <div class="vidlik-section-scan"></div>

  <div class="vidlik-section-panel vidlik-section-complete is-active" data-section-panel="complete">
   <div class="vidlik-section-content">
    <div class="vidlik-section-counter">${cfg.count}</div>
    <h2 class="vidlik-section-title">${cfg.complete}</h2>
    <div class="vidlik-section-rule"></div>
    <div class="vidlik-section-done">Завершено ✓</div>
   </div>
  </div>

  <div class="vidlik-section-panel vidlik-section-next" data-section-panel="next">
   <div class="vidlik-section-content">
    <div class="vidlik-section-kicker">${cfg.nextKicker}</div>
    <h2 class="vidlik-section-title">${cfg.nextTitle}</h2>
    <div class="vidlik-section-rule"></div>
    <div class="vidlik-section-subtitle">${cfg.subtitle}</div>
   </div>
  </div>

  <div class="vidlik-section-enter"><kbd>ENTER</kbd><span>продовжити</span></div>`;
 return root;
}

function show(which='section1'){
 if(overlay)return;
 current=transitions[which];
 if(!current)return;
 overlay=build(current);
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
 if(!overlay||locked||phase!=='next'||!current)return;
 locked=true;
 phase='leaving';
 const cfg=current;
 overlay.classList.add('is-leaving','is-switching');
 const prompt=overlay.querySelector('.vidlik-section-enter');
 if(prompt)prompt.style.opacity='0';
 setTimeout(()=>{
  overlay?.remove();
  overlay=null;
  current=null;
  document.body.classList.remove('vidlik-section-transition-active');
  phase='idle';
  locked=false;

  const footer=document.getElementById('adminFooter');
  if(footer){footer.textContent=cfg.footer;footer.classList.add('vidlik-tutorial-footer')}
  const help=document.getElementById('help');
  if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=cfg.help}
  window.dispatchEvent(new CustomEvent(cfg.event));
 },700);
}

function hideImmediate(){
 if(overlay)overlay.remove();
 overlay=null;
 current=null;
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
window.addEventListener('vidlik:tutorial-basic-window-block-complete',()=>show('section1'));
window.addEventListener('vidlik:files-section-complete',()=>show('section2'));
window.addEventListener('vidlik:keyboard-section-complete',()=>show('section3'));
window.addEventListener('vidlik:os-reset',hideImmediate);

window.VIDLIK_SECTION_TRANSITION={show,finish,get phase(){return phase}};
})();
