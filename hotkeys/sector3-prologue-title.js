(()=>{
'use strict';

if(document.getElementById('vidlikPrologueTitle'))return;

const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EXIT_MS=reduced?0:2300;
let locked=false;

const root=document.createElement('section');
root.id='vidlikPrologueTitle';
root.className='vidlik-prologue-title';
root.setAttribute('aria-label','Пролог — Стартовий дзвінок');
root.innerHTML=`
 <div class="vpt-bg" aria-hidden="true"></div>
 <div class="vpt-shade" aria-hidden="true"></div>
 <div class="vpt-grain" aria-hidden="true"></div>
 <div class="vpt-frame" aria-hidden="true"></div>
 <div class="vpt-curtain" aria-hidden="true"></div>
 <div class="vpt-brand">
   <img class="vpt-brand-emblem" src="assets/sector3-prologue/vidlik-emblem.webp" alt="Герб «Відлік»">
 </div>
 <aside class="vpt-side-index" aria-hidden="true">
   <span>01 / 01</span><div class="line"></div><div class="dot"></div><div class="line"></div>
 </aside>
 <main class="vpt-hero">
   <p class="vpt-eyebrow">ПРОЛОГ</p>
   <h1 class="vpt-title">СТАРТОВИЙ<span class="second">ДЗВІНОК</span></h1>
   <div class="vpt-divider"></div>
   <p class="vpt-subtitle">Початок історії. Один сигнал — і звичний світ більше не виглядає таким, як раніше.</p>
   <button class="vpt-continue" id="vptContinue" type="button" aria-label="Продовжити — Enter">
     <span class="vpt-command-prompt">&gt;</span>
     <span class="vpt-continue-label">Продовжити</span>
     <span class="vpt-command-cursor" aria-hidden="true"></span>
   </button>
 </main>
 <div class="vpt-meta"><span class="orange"></span><b>ВІДЛІК</b><br>СЕКТОР 3 / ПРОЛОГ</div>`;

document.body.appendChild(root);
document.body.classList.add('vidlik-prologue-title-active');

const button=root.querySelector('#vptContinue');

function restartUnderlyingPrologue(){
 const evt=new KeyboardEvent('keydown',{
  key:'r',code:'KeyR',bubbles:true,cancelable:true
 });
 window.dispatchEvent(evt);
 const scene=document.getElementById('scene');
 try{scene?.focus({preventScroll:true})}catch(_){scene?.focus?.()}
}

function proceed(){
 if(locked)return;
 locked=true;
 root.classList.add('is-leaving');
 button?.setAttribute('disabled','');
 setTimeout(()=>{
  window.removeEventListener('keydown',captureKey,true);
  root.remove();
  document.body.classList.remove('vidlik-prologue-title-active');
  restartUnderlyingPrologue();
  window.dispatchEvent(new CustomEvent('hotki:prologue-title-complete'));
 },EXIT_MS);
}

function captureKey(e){
 if(!root.isConnected)return;
 e.stopPropagation();
 e.stopImmediatePropagation();
 if(e.key==='Enter'||e.key===' '){
  e.preventDefault();
  proceed();
  return;
 }
 if(e.key==='Escape'||e.key==='r'||e.key==='R')e.preventDefault();
}

button?.addEventListener('click',proceed);
window.addEventListener('keydown',captureKey,true);

window.VIDLIK_PROLOGUE_TITLE={
 proceed,
 get active(){return root.isConnected&&!locked}
};
})();
