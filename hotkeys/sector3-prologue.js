(()=>{
'use strict';
if(window.__VIDLIK_PROLOGUE_TITLE_MOUNTED)return;
window.__VIDLIK_PROLOGUE_TITLE_MOUNTED=true;

const BG='assets/sector3-prologue/prologue-title-bg.png';
const EMBLEM='assets/sector3-prologue/vidlik-emblem.webp';
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EXIT_FADE_MS=reduced?0:2300;
const DESKTOP_REVEAL_MS=reduced?0:1800;
let locked=false;

const style=document.createElement('style');
style.id='vidlik-prologue-title-style';
style.textContent=`
#vidlikPrologueTitle{--bg:#061114;--text:#f4f7f8;--muted:rgba(228,239,241,.64);--accent:#63f2ea;--accent2:#f2a15f;--index-axis:65px;position:fixed;inset:0;z-index:100000;background:var(--bg);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);overflow:hidden;isolation:isolate}
#vidlikPrologueTitle *{box-sizing:border-box}
#vidlikPrologueTitle .vpt-bg{position:absolute;inset:-2%;z-index:0;background-image:url('${BG}');background-size:cover;background-position:center center;background-repeat:no-repeat;transform:scale(1.025);animation:vpt-drift 14s ease-out forwards}
#vidlikPrologueTitle .vpt-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(1,7,9,.36) 0%,rgba(1,7,9,.14) 36%,transparent 62%),linear-gradient(180deg,rgba(0,0,0,.08),transparent 46%,rgba(0,0,0,.34));pointer-events:none}
#vidlikPrologueTitle .vpt-grain{position:absolute;inset:0;z-index:10;pointer-events:none;opacity:.045;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.18) 0 1px,transparent 1px 4px);mix-blend-mode:soft-light}
#vidlikPrologueTitle .vpt-frame{position:absolute;inset:24px;z-index:20;border:1px solid rgba(173,232,235,.10);pointer-events:none;opacity:.55}
#vidlikPrologueTitle .vpt-curtain{position:absolute;inset:0;z-index:100;background:#000;opacity:1;pointer-events:none;transition:opacity 2.25s cubic-bezier(.4,0,.2,1);animation:vpt-reveal 3.4s cubic-bezier(.45,0,.2,1) .15s forwards}
#vidlikPrologueTitle .vpt-brand{position:absolute;z-index:12;top:37px;left:var(--index-axis);width:48px;height:52px;display:grid;place-items:center;transform:translateX(-50%);animation:vpt-fade .9s .2s both}
#vidlikPrologueTitle .vpt-emblem{display:block;width:auto;height:44px;max-width:48px;object-fit:contain;opacity:.9;filter:drop-shadow(0 0 12px rgba(39,217,230,.2))}
#vidlikPrologueTitle .vpt-side{position:absolute;z-index:12;left:var(--index-axis);top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:13px;opacity:.58}
#vidlikPrologueTitle .vpt-side .line{width:1px;height:132px;background:linear-gradient(transparent,rgba(99,242,234,.7),transparent)}
#vidlikPrologueTitle .vpt-side .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 13px rgba(99,242,234,.75)}
#vidlikPrologueTitle .vpt-side span{font-size:10px;letter-spacing:.24em;color:rgba(226,242,244,.62);writing-mode:vertical-rl}
#vidlikPrologueTitle .vpt-hero{position:absolute;z-index:12;left:11.5vw;top:50%;transform:translateY(-50%);width:min(650px,43vw);padding:20px 0 70px}
#vidlikPrologueTitle .vpt-eyebrow{margin:0 0 24px;font-size:clamp(13px,1.05vw,17px);font-weight:700;letter-spacing:.48em;text-transform:uppercase;color:var(--accent);animation:vpt-rise .8s .25s both}
#vidlikPrologueTitle .vpt-title{margin:0;font-size:clamp(52px,5.5vw,104px);line-height:.91;font-weight:850;letter-spacing:.055em;text-transform:uppercase;text-wrap:balance;text-shadow:0 10px 38px rgba(0,0,0,.52);animation:vpt-rise .95s .42s both}
#vidlikPrologueTitle .vpt-title .second{display:block;color:rgba(247,250,250,.95)}
#vidlikPrologueTitle .vpt-divider{width:112px;height:1px;margin:29px 0 26px;background:linear-gradient(90deg,var(--accent),rgba(99,242,234,0));box-shadow:0 0 18px rgba(99,242,234,.22);animation:vpt-grow .9s .68s both;transform-origin:left}
#vidlikPrologueTitle .vpt-subtitle{margin:0 0 34px;max-width:520px;color:var(--muted);font-size:clamp(14px,1.1vw,19px);line-height:1.75;letter-spacing:.095em;text-transform:uppercase;animation:vpt-rise .85s .68s both}
#vidlikPrologueTitle .vpt-continue{display:inline-flex;align-items:center;min-height:41px;padding:9px 0;border:0;background:transparent;box-shadow:none;font-family:Consolas,'Courier New',monospace;cursor:pointer;user-select:none;animation:vpt-rise .8s .86s both}
#vidlikPrologueTitle .vpt-prompt{margin-right:11px;color:var(--accent);font-size:17px;line-height:1;text-shadow:0 0 12px rgba(99,242,234,.42)}
#vidlikPrologueTitle .vpt-label{font-size:14px;line-height:1;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,249,250,.92);transition:color .22s ease,text-shadow .22s ease}
#vidlikPrologueTitle .vpt-cursor{display:inline-block;width:8px;height:17px;margin-left:7px;background:var(--accent);box-shadow:0 0 12px rgba(99,242,234,.48);animation:vpt-cursor 1s steps(1,end) infinite}
#vidlikPrologueTitle .vpt-continue:hover .vpt-label{color:#fff;text-shadow:0 0 13px rgba(99,242,234,.24)}
#vidlikPrologueTitle .vpt-continue:focus-visible{outline:none}
#vidlikPrologueTitle .vpt-continue:focus-visible .vpt-label{text-decoration:underline;text-decoration-color:rgba(99,242,234,.7);text-underline-offset:7px}
#vidlikPrologueTitle .vpt-meta{position:absolute;z-index:12;right:58px;bottom:44px;text-align:right;font-size:10px;line-height:1.75;letter-spacing:.28em;text-transform:uppercase;color:rgba(226,240,241,.48);animation:vpt-fade .9s 1s both}
#vidlikPrologueTitle .vpt-meta b{color:rgba(226,244,245,.82);font-weight:600}
#vidlikPrologueTitle .vpt-orange{display:inline-block;width:28px;height:1px;background:var(--accent2);vertical-align:middle;margin-right:10px;box-shadow:0 0 12px rgba(242,161,95,.34)}
#vidlikPrologueTitle.vpt-leaving .vpt-hero,#vidlikPrologueTitle.vpt-leaving .vpt-brand,#vidlikPrologueTitle.vpt-leaving .vpt-meta,#vidlikPrologueTitle.vpt-leaving .vpt-side{transition:2s ease;opacity:0;filter:blur(5px)}
#vidlikPrologueTitle.vpt-leaving .vpt-bg{transition:2.25s ease;transform:scale(1.045);filter:brightness(.2)}
#vidlikPrologueTitle.vpt-leaving .vpt-curtain{animation:none;opacity:1}
#vidlikPrologueTitle.vpt-desktop-reveal{opacity:0;transition:opacity 1.8s cubic-bezier(.4,0,.2,1)}
@keyframes vpt-drift{to{transform:scale(1)}} @keyframes vpt-fade{from{opacity:0}to{opacity:1}} @keyframes vpt-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} @keyframes vpt-grow{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}} @keyframes vpt-cursor{0%,48%{opacity:1}49%,100%{opacity:0}} @keyframes vpt-reveal{0%,10%{opacity:1}100%{opacity:0}}
@media(max-width:900px){#vidlikPrologueTitle .vpt-hero{left:9vw;width:66vw}#vidlikPrologueTitle .vpt-title{font-size:clamp(48px,9vw,86px)}#vidlikPrologueTitle .vpt-subtitle{max-width:70vw}#vidlikPrologueTitle .vpt-side{display:none}#vidlikPrologueTitle .vpt-brand{left:24px;top:22px;width:44px;height:48px;transform:none}#vidlikPrologueTitle .vpt-emblem{height:40px}#vidlikPrologueTitle .vpt-meta{right:28px;bottom:26px}#vidlikPrologueTitle .vpt-frame{inset:12px}}
@media(max-width:600px){#vidlikPrologueTitle .vpt-hero{left:7vw;top:54%;width:84vw}#vidlikPrologueTitle .vpt-title{font-size:clamp(44px,13vw,66px)}#vidlikPrologueTitle .vpt-subtitle{font-size:12px;line-height:1.6}#vidlikPrologueTitle .vpt-meta{display:none}}
@media(prefers-reduced-motion:reduce){#vidlikPrologueTitle *{animation:none!important;transition:none!important}#vidlikPrologueTitle .vpt-bg{transform:scale(1)}#vidlikPrologueTitle .vpt-curtain{opacity:0}#vidlikPrologueTitle.vpt-leaving .vpt-curtain{opacity:1}}
`;
document.head.appendChild(style);

const root=document.createElement('section');
root.id='vidlikPrologueTitle';
root.setAttribute('aria-label','Пролог — Заборонений дзвінок');
root.innerHTML=`
  <div class="vpt-bg" aria-hidden="true"></div>
  <div class="vpt-shade" aria-hidden="true"></div>
  <div class="vpt-grain" aria-hidden="true"></div>
  <div class="vpt-frame" aria-hidden="true"></div>
  <div class="vpt-curtain" aria-hidden="true"></div>
  <div class="vpt-brand"><img class="vpt-emblem" src="${EMBLEM}" alt="Герб «Відлік»"></div>
  <aside class="vpt-side" aria-hidden="true"><span>01 / 01</span><div class="line"></div><div class="dot"></div><div class="line"></div></aside>
  <main class="vpt-hero">
    <p class="vpt-eyebrow">ПРОЛОГ</p>
    <h1 class="vpt-title">ЗАБОРОНЕНИЙ<span class="second">ДЗВІНОК</span></h1>
    <div class="vpt-divider"></div>
    <p class="vpt-subtitle">Початок історії. Один дзвінок — і звичний світ більше не виглядає таким, як раніше.</p>
    <button class="vpt-continue" id="vidlikPrologueContinue" type="button" aria-label="Продовжити — натисніть Enter">
      <span class="vpt-prompt" aria-hidden="true">&gt;</span><span class="vpt-label">Продовжити</span><span class="vpt-cursor" aria-hidden="true"></span>
    </button>
  </main>
  <div class="vpt-meta"><span class="vpt-orange"></span><b>ВІДЛІК</b><br>СЕКТОР 3 / ПРОЛОГ</div>`;
document.body.appendChild(root);

async function requestStoryStart(){
 const router=window.VIDLIK_STORY_ROUTER;
 if(!router?.continuePrologue)throw new Error('Story Router недоступний');
 await router.continuePrologue();
}
function completeStoryHandoff(){
 window.VIDLIK_STORY_ROUTER?.completePrologueTransition?.();
 window.dispatchEvent(new CustomEvent('hotki:prologue-continue'));
 window.dispatchEvent(new CustomEvent('vidlik:prologue-title-complete'));
}
function proceed(e){
 if(e){e.preventDefault?.();e.stopPropagation?.();}
 if(locked)return;
 locked=true;
 root.classList.add('vpt-leaving');
 window.dispatchEvent(new CustomEvent('hotki:prologue-title-exit'));
 setTimeout(async()=>{
   try{await requestStoryStart()}
   catch(err){console.error('[VIDLIK prologue]',err)}
   requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('vpt-desktop-reveal')));
   setTimeout(()=>{
     root.remove();style.remove();
     completeStoryHandoff();
   },DESKTOP_REVEAL_MS);
 },EXIT_FADE_MS);
}
root.querySelector('#vidlikPrologueContinue')?.addEventListener('click',proceed);
window.addEventListener('keydown',e=>{
 if(!root.isConnected||locked)return;
 if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();proceed();}
},true);
setTimeout(()=>root.querySelector('#vidlikPrologueContinue')?.focus({preventScroll:true}),900);
})();