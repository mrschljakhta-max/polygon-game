(()=>{
'use strict';
if(window.__VIDLIK_PROLOGUE_TITLE_MOUNTED)return;
window.__VIDLIK_PROLOGUE_TITLE_MOUNTED=true;

const BG=window.__VPT_BG||'';
const EMBLEM='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';
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EXIT_FADE_MS=reduced?0:2300;
let locked=false;
let introLoaded=false;

const style=document.createElement('style');
style.id='vidlik-prologue-title-style';
style.textContent=`
#vidlikPrologueTitle{--bg:#061114;--text:#f4f7f8;--muted:rgba(228,239,241,.64);--accent:#63f2ea;--accent2:#f2a15f;--index-axis:65px;position:fixed;inset:0;z-index:100000;background:var(--bg);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);overflow:hidden;isolation:isolate}
#vidlikPrologueTitle *{box-sizing:border-box}
#vidlikPrologueTitle .vpt-bg{position:absolute;inset:-2%;z-index:-5;background-image:url('data:image/webp;base64,${BG}');background-size:cover;background-position:center center;background-repeat:no-repeat;transform:scale(1.025);animation:vpt-drift 14s ease-out forwards}
#vidlikPrologueTitle .vpt-shade{position:absolute;inset:0;z-index:-4;background:linear-gradient(90deg,rgba(1,7,9,.36) 0%,rgba(1,7,9,.14) 36%,transparent 62%),linear-gradient(180deg,rgba(0,0,0,.08),transparent 46%,rgba(0,0,0,.34));pointer-events:none}
#vidlikPrologueTitle .vpt-grain{position:absolute;inset:0;z-index:10;pointer-events:none;opacity:.045;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.18) 0 1px,transparent 1px 4px);mix-blend-mode:soft-light}
#vidlikPrologueTitle .vpt-frame{position:absolute;inset:24px;border:1px solid rgba(173,232,235,.10);pointer-events:none;opacity:.55}
#vidlikPrologueTitle .vpt-curtain{position:absolute;inset:0;z-index:100;background:#000;opacity:1;pointer-events:none;transition:opacity 2.25s cubic-bezier(.4,0,.2,1);animation:vpt-reveal 3.4s cubic-bezier(.45,0,.2,1) .15s forwards}
#vidlikPrologueTitle .vpt-brand{position:absolute;top:37px;left:var(--index-axis);width:48px;height:52px;display:grid;place-items:center;transform:translateX(-50%);animation:vpt-fade .9s .2s both}
#vidlikPrologueTitle .vpt-emblem{display:block;width:auto;height:44px;max-width:48px;object-fit:contain;opacity:.9;filter:drop-shadow(0 0 12px rgba(39,217,230,.2))}
#vidlikPrologueTitle .vpt-side{position:absolute;left:var(--index-axis);top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:13px;opacity:.58}
#vidlikPrologueTitle .vpt-side .line{width:1px;height:132px;background:linear-gradient(transparent,rgba(99,242,234,.7),transparent)}
#vidlikPrologueTitle .vpt-side .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 13px rgba(99,242,234,.75)}
#vidlikPrologueTitle .vpt-side span{font-size:10px;letter-spacing:.24em;color:rgba(226,242,244,.62);writing-mode:vertical-rl}
#vidlikPrologueTitle .vpt-hero{position:absolute;left:11.5vw;top:50%;transform:translateY(-50%);width:min(650px,43vw);padding:20px 0 70px}
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
#vidlikPrologueTitle .vpt-meta{position:absolute;right:58px;bottom:44px;text-align:right;font-size:10px;line-height:1.75;letter-spacing:.28em;text-transform:uppercase;color:rgba(226,240,241,.48);animation:vpt-fade .9s 1s both}
#vidlikPrologueTitle .vpt-meta b{color:rgba(226,244,245,.82);font-weight:600}
#vidlikPrologueTitle .vpt-orange{display:inline-block;width:28px;height:1px;background:var(--accent2);vertical-align:middle;margin-right:10px;box-shadow:0 0 12px rgba(242,161,95,.34)}
#vidlikPrologueTitle.vpt-leaving .vpt-hero,#vidlikPrologueTitle.vpt-leaving .vpt-brand,#vidlikPrologueTitle.vpt-leaving .vpt-meta,#vidlikPrologueTitle.vpt-leaving .vpt-side{transition:2s ease;opacity:0;filter:blur(5px)}
#vidlikPrologueTitle.vpt-leaving .vpt-bg{transition:2.25s ease;transform:scale(1.045);filter:brightness(.2)}
#vidlikPrologueTitle.vpt-leaving .vpt-curtain{animation:none;opacity:1}
@keyframes vpt-drift{to{transform:scale(1)}} @keyframes vpt-fade{from{opacity:0}to{opacity:1}} @keyframes vpt-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} @keyframes vpt-grow{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}} @keyframes vpt-cursor{0%,48%{opacity:1}49%,100%{opacity:0}} @keyframes vpt-reveal{0%,10%{opacity:1}100%{opacity:0}}
@media(max-width:900px){#vidlikPrologueTitle .vpt-hero{left:9vw;width:66vw}#vidlikPrologueTitle .vpt-title{font-size:clamp(48px,9vw,86px)}#vidlikPrologueTitle .vpt-subtitle{max-width:70vw}#vidlikPrologueTitle .vpt-side{display:none}#vidlikPrologueTitle .vpt-brand{left:24px;top:22px;width:44px;height:48px;transform:none}#vidlikPrologueTitle .vpt-emblem{height:40px}#vidlikPrologueTitle .vpt-meta{right:28px;bottom:26px}#vidlikPrologueTitle .vpt-frame{inset:12px}}
@media(max-width:600px){#vidlikPrologueTitle .vpt-hero{left:7vw;top:54%;width:84vw}#vidlikPrologueTitle .vpt-title{font-size:clamp(44px,13vw,66px)}#vidlikPrologueTitle .vpt-subtitle{font-size:12px;line-height:1.6}#vidlikPrologueTitle .vpt-meta{display:none}}
@media(prefers-reduced-motion:reduce){#vidlikPrologueTitle *{animation:none!important;transition:none!important}#vidlikPrologueTitle .vpt-bg{transform:scale(1)}#vidlikPrologueTitle .vpt-curtain{opacity:0}#vidlikPrologueTitle.vpt-leaving .vpt-curtain{opacity:1}}
`;
document.head.appendChild(style);

const root=document.createElement('section');
root.id='vidlikPrologueTitle';
root.setAttribute('aria-label','Пролог — Стартовий дзвінок');
root.innerHTML=`
  <div class="vpt-bg" aria-hidden="true"></div>
  <div class="vpt-shade" aria-hidden="true"></div>
  <div class="vpt-grain" aria-hidden="true"></div>
  <div class="vpt-frame" aria-hidden="true"></div>
  <div class="vpt-curtain" aria-hidden="true"></div>
  <div class="vpt-brand"><img class="vpt-emblem" src="data:image/webp;base64,${EMBLEM}" alt="Герб «Відлік»"></div>
  <aside class="vpt-side" aria-hidden="true"><span>01 / 01</span><div class="line"></div><div class="dot"></div><div class="line"></div></aside>
  <main class="vpt-hero">
    <p class="vpt-eyebrow">ПРОЛОГ</p>
    <h1 class="vpt-title">СТАРТОВИЙ<span class="second">ДЗВІНОК</span></h1>
    <div class="vpt-divider"></div>
    <p class="vpt-subtitle">Початок історії. Один сигнал — і звичний світ більше не виглядає таким, як раніше.</p>
    <button class="vpt-continue" id="vidlikPrologueContinue" type="button" aria-label="Продовжити — натисніть Enter">
      <span class="vpt-prompt" aria-hidden="true">&gt;</span><span class="vpt-label">Продовжити</span><span class="vpt-cursor" aria-hidden="true"></span>
    </button>
  </main>
  <div class="vpt-meta"><span class="vpt-orange"></span><b>ВІДЛІК</b><br>СЕКТОР 3 / ПРОЛОГ</div>`;
document.body.appendChild(root);

function loadIntro(){
 if(introLoaded)return; introLoaded=true;
 document.body.classList.remove('prologue-title-pending');
 const s=document.createElement('script');
 s.src='sector3-intro.js?v=20260907-prologue1';
 s.dataset.vidlikDynamicIntro='1';
 document.body.appendChild(s);
}
function proceed(e){
 if(e){e.preventDefault?.();e.stopPropagation?.();}
 if(locked)return; locked=true;
 root.classList.add('vpt-leaving');
 window.dispatchEvent(new CustomEvent('hotki:prologue-title-exit'));
 setTimeout(()=>{
   root.remove();style.remove();
   window.dispatchEvent(new CustomEvent('hotki:prologue-continue'));
   window.dispatchEvent(new CustomEvent('vidlik:prologue-title-complete'));
   loadIntro();
 },EXIT_FADE_MS);
}
root.querySelector('#vidlikPrologueContinue')?.addEventListener('click',proceed);
window.addEventListener('keydown',e=>{
 if(!root.isConnected||locked)return;
 if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();proceed();}
},true);
setTimeout(()=>root.querySelector('#vidlikPrologueContinue')?.focus({preventScroll:true}),900);
})();
