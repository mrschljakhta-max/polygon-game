(()=>{
'use strict';
if(window.VIDLIK_ACT1_TITLE)return;

const BG='assets/sector3-prologue/act1-title-bg.png';
const EMBLEM='assets/sector3-prologue/vidlik-emblem.webp';
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EXIT_FADE_MS=reduced?0:2300;
const DESKTOP_REVEAL_MS=reduced?0:1800;
let active=false;
let locked=false;

const css=`
body.vidlik-act1-title-active{overflow:hidden}
#vidlikAct1Title{--a1-bg:#03080b;--a1-text:#f3f5f6;--a1-muted:rgba(222,232,236,.60);--a1-red:#ff263f;--a1-red-soft:rgba(255,38,63,.24);position:fixed;inset:0;z-index:90000;overflow:hidden;background:var(--a1-bg);color:var(--a1-text);font-family:"Segoe UI Variable Display","Segoe UI",Arial,sans-serif;isolation:isolate}
#vidlikAct1Title *{box-sizing:border-box}
#vidlikAct1Title .a1-bg{position:absolute;inset:-2%;z-index:0;background:var(--a1-bg) url('${BG}') center center/cover no-repeat;opacity:0;transform:scale(1.045);animation:a1-background-in 1.9s cubic-bezier(.16,.78,.23,1) .08s forwards}
#vidlikAct1Title .a1-shade{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 73% 40%,transparent 0 19%,rgba(0,5,8,.10) 48%,rgba(0,3,5,.48) 100%),linear-gradient(90deg,rgba(0,5,8,.28) 0%,rgba(0,5,8,.12) 35%,transparent 57%),linear-gradient(180deg,rgba(0,0,0,.18),transparent 34%,rgba(0,0,0,.34))}
#vidlikAct1Title .a1-laser{position:absolute;top:33.55%;left:31%;right:0;z-index:2;height:1px;pointer-events:none;opacity:0;background:linear-gradient(90deg,transparent,rgba(255,27,51,.42) 28%,rgba(255,63,78,.90) 54%,transparent 92%);filter:drop-shadow(0 0 7px var(--a1-red));transform-origin:right center;animation:a1-laser-in 1.15s cubic-bezier(.16,.8,.25,1) .72s both}
#vidlikAct1Title .a1-grain{position:absolute;inset:0;z-index:12;pointer-events:none;opacity:.042;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.18) 0 1px,transparent 1px 4px);mix-blend-mode:soft-light}
#vidlikAct1Title .a1-frame{position:absolute;inset:24px;z-index:11;pointer-events:none;border:1px solid rgba(181,224,232,.10);opacity:0;animation:a1-fade-in .9s ease .55s forwards}
#vidlikAct1Title .a1-frame:before,#vidlikAct1Title .a1-frame:after{content:"";position:absolute;width:62px;height:1px;background:linear-gradient(90deg,var(--a1-red),transparent);box-shadow:0 0 12px rgba(255,38,63,.24)}
#vidlikAct1Title .a1-frame:before{top:-1px;left:-1px}#vidlikAct1Title .a1-frame:after{right:-1px;bottom:-1px;transform:rotate(180deg)}
#vidlikAct1Title .a1-brand{position:absolute;top:34px;left:48px;z-index:14;width:32px;height:50px;display:grid;place-items:center;opacity:0;animation:a1-fade-in .85s ease .42s forwards}
#vidlikAct1Title .a1-emblem{display:block;width:auto;height:46px;max-width:32px;object-fit:contain;opacity:.96;filter:drop-shadow(0 0 12px rgba(255,38,63,.28))}
#vidlikAct1Title .a1-rail{position:absolute;left:64px;top:50%;z-index:14;display:flex;flex-direction:column;align-items:center;gap:12px;opacity:0;transform:translateY(-50%);animation:a1-rail-in .8s ease .68s forwards}
#vidlikAct1Title .a1-rail-line{width:1px;height:128px;background:linear-gradient(transparent,rgba(145,218,232,.46),transparent)}
#vidlikAct1Title .a1-rail-dot{width:5px;height:5px;border-radius:50%;background:var(--a1-red);box-shadow:0 0 11px rgba(255,38,63,.86)}
#vidlikAct1Title .a1-rail-label{color:rgba(220,237,240,.48);font:600 9px/1 "Cascadia Code",Consolas,monospace;letter-spacing:.22em;writing-mode:vertical-rl}
#vidlikAct1Title .a1-hero{position:absolute;left:10.7vw;top:50%;z-index:10;width:min(680px,43vw);padding:8px 0 22px;transform:translateY(-50%)}
#vidlikAct1Title .a1-act-line{display:flex;align-items:center;gap:16px;width:min(470px,100%);margin:0 0 23px;opacity:0;animation:a1-rise-in .72s cubic-bezier(.2,.8,.2,1) .48s forwards}
#vidlikAct1Title .a1-act-label{flex:0 0 auto;color:var(--a1-red);font:700 clamp(12px,.92vw,16px)/1 "Cascadia Code",Consolas,monospace;letter-spacing:.42em;text-transform:uppercase;text-shadow:0 0 18px var(--a1-red-soft)}
#vidlikAct1Title .a1-act-rule{height:1px;flex:1;background:linear-gradient(90deg,rgba(255,38,63,.72),transparent);transform:scaleX(0);transform-origin:left;animation:a1-rule-in .9s cubic-bezier(.16,.8,.2,1) .92s forwards}
#vidlikAct1Title .a1-title{margin:0;width:max-content;max-width:100%;color:rgba(247,249,250,.97);font-size:clamp(48px,4.2vw,82px);font-weight:760;line-height:.96;letter-spacing:.045em;text-transform:uppercase;text-shadow:0 12px 42px rgba(0,0,0,.62);opacity:0;clip-path:inset(0 100% 0 0);animation:a1-title-in 1.05s cubic-bezier(.16,.8,.2,1) .67s forwards}
#vidlikAct1Title .a1-quote{color:rgba(255,38,63,.76);font-weight:350;text-shadow:0 0 22px rgba(255,38,63,.22)}
#vidlikAct1Title .a1-divider{width:116px;height:1px;margin:31px 0 25px;background:linear-gradient(90deg,var(--a1-red),rgba(255,38,63,0));box-shadow:0 0 15px rgba(255,38,63,.18);transform:scaleX(0);transform-origin:left;animation:a1-rule-in .78s cubic-bezier(.16,.8,.2,1) 1.08s forwards}
#vidlikAct1Title .a1-subtitle{max-width:520px;margin:0 0 35px;color:var(--a1-muted);font-size:clamp(13px,1vw,18px);font-weight:500;line-height:1.75;letter-spacing:.09em;text-transform:uppercase;opacity:0;animation:a1-rise-in .82s cubic-bezier(.2,.8,.2,1) 1.04s forwards}
#vidlikAct1Title .a1-terminal{appearance:none;display:inline-flex;align-items:center;min-height:42px;padding:0;border:0;background:transparent;color:rgba(241,246,247,.87);cursor:pointer;font:500 13px/1 "Cascadia Code",Consolas,monospace;letter-spacing:.08em;opacity:0;animation:a1-rise-in .78s cubic-bezier(.2,.8,.2,1) 1.31s forwards}
#vidlikAct1Title .a1-prompt{margin-right:10px;color:var(--a1-red);font-weight:800;text-shadow:0 0 12px rgba(255,38,63,.42)}
#vidlikAct1Title .a1-command{transition:color .2s ease}#vidlikAct1Title .a1-cursor{width:8px;height:16px;margin-left:5px;background:var(--a1-red);box-shadow:0 0 10px rgba(255,38,63,.54);animation:a1-cursor-blink .88s steps(1,end) infinite}
#vidlikAct1Title .a1-terminal:hover .a1-command,#vidlikAct1Title .a1-terminal:focus-visible .a1-command{color:#fff}#vidlikAct1Title .a1-terminal:focus-visible{outline:1px solid rgba(255,38,63,.72);outline-offset:10px}
#vidlikAct1Title .a1-meta{position:absolute;right:54px;bottom:42px;z-index:14;color:rgba(218,235,238,.42);font:500 9px/1.8 "Cascadia Code",Consolas,monospace;letter-spacing:.26em;text-align:right;text-transform:uppercase;opacity:0;animation:a1-fade-in .9s ease 1.35s forwards}
#vidlikAct1Title .a1-meta b{color:rgba(231,242,244,.76);font-weight:700}#vidlikAct1Title .a1-meta-line{display:inline-block;width:28px;height:1px;margin-right:10px;vertical-align:middle;background:var(--a1-red);box-shadow:0 0 10px rgba(255,38,63,.30)}
#vidlikAct1Title .a1-curtain{position:absolute;inset:0;z-index:100;background:#010305;opacity:1;pointer-events:none;animation:a1-curtain-reveal 3.4s cubic-bezier(.45,0,.2,1) .12s forwards;transition:opacity ${EXIT_FADE_MS}ms cubic-bezier(.4,0,.2,1)}
#vidlikAct1Title.is-leaving .a1-curtain{animation:none;opacity:1}
#vidlikAct1Title.is-leaving .a1-hero,#vidlikAct1Title.is-leaving .a1-brand,#vidlikAct1Title.is-leaving .a1-rail,#vidlikAct1Title.is-leaving .a1-meta{opacity:0!important;filter:blur(5px);transition:opacity 1.45s ease,filter 1.65s ease,transform 1.7s ease}
#vidlikAct1Title.is-leaving .a1-hero{transform:translateY(-50%) translateX(-8px)}#vidlikAct1Title.is-leaving .a1-brand,#vidlikAct1Title.is-leaving .a1-meta{transform:translateX(-8px)}
#vidlikAct1Title.is-leaving .a1-bg{transition:transform ${EXIT_FADE_MS}ms ease,filter ${EXIT_FADE_MS}ms ease;transform:scale(1.035);filter:brightness(.35) saturate(.82)}
.a1-desktop-reveal{position:fixed;inset:0;z-index:89999;background:#010305;opacity:1;pointer-events:none;transition:opacity ${DESKTOP_REVEAL_MS}ms cubic-bezier(.4,0,.2,1)}
.a1-desktop-reveal.is-revealing{opacity:0}
@keyframes a1-background-in{from{opacity:0;transform:scale(1.045);filter:brightness(.60)}to{opacity:1;transform:scale(1);filter:brightness(1)}}
@keyframes a1-laser-in{0%{opacity:0;transform:scaleX(.06)}46%{opacity:.94}100%{opacity:.22;transform:scaleX(1)}}
@keyframes a1-fade-in{to{opacity:1}}@keyframes a1-rail-in{from{opacity:0;transform:translateY(-48%)}to{opacity:.62;transform:translateY(-50%)}}@keyframes a1-rise-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes a1-title-in{from{opacity:0;clip-path:inset(0 100% 0 0);transform:translateX(-9px)}to{opacity:1;clip-path:inset(0 0 0 0);transform:translateX(0)}}@keyframes a1-rule-in{to{transform:scaleX(1)}}@keyframes a1-cursor-blink{0%,46%{opacity:1}47%,100%{opacity:0}}@keyframes a1-curtain-reveal{0%,24%{opacity:1}100%{opacity:0}}
@media(max-width:1050px){#vidlikAct1Title .a1-hero{left:10vw;width:52vw}#vidlikAct1Title .a1-title{font-size:clamp(47px,5.7vw,72px)}#vidlikAct1Title .a1-shade{background:linear-gradient(90deg,rgba(0,5,8,.48),rgba(0,5,8,.18) 58%,transparent 78%),linear-gradient(180deg,rgba(0,0,0,.12),transparent 42%,rgba(0,0,0,.42))}}
@media(max-width:760px){#vidlikAct1Title .a1-bg{background-position:66% center}#vidlikAct1Title .a1-shade{background:linear-gradient(0deg,rgba(1,5,8,.90) 0%,rgba(1,5,8,.58) 48%,rgba(1,5,8,.08) 100%),linear-gradient(90deg,rgba(0,4,7,.35),transparent)}#vidlikAct1Title .a1-frame{inset:12px}#vidlikAct1Title .a1-brand{top:24px;left:28px;width:28px}#vidlikAct1Title .a1-emblem{height:42px;max-width:28px}#vidlikAct1Title .a1-rail{display:none}#vidlikAct1Title .a1-hero{left:7vw;top:auto;bottom:8.5vh;width:86vw;padding:0;transform:none}#vidlikAct1Title .a1-act-line{margin-bottom:17px}#vidlikAct1Title .a1-title{font-size:clamp(36px,10.2vw,60px);letter-spacing:.025em}#vidlikAct1Title .a1-divider{margin:23px 0 20px}#vidlikAct1Title .a1-subtitle{max-width:82vw;margin-bottom:25px;font-size:11px}#vidlikAct1Title .a1-meta{display:none}#vidlikAct1Title.is-leaving .a1-hero{transform:translateX(-8px)}}
@media(max-height:650px) and (min-width:761px){#vidlikAct1Title .a1-hero{top:53%}#vidlikAct1Title .a1-act-line{margin-bottom:17px}#vidlikAct1Title .a1-divider{margin:22px 0 18px}#vidlikAct1Title .a1-subtitle{margin-bottom:23px;line-height:1.55}}
@media(prefers-reduced-motion:reduce){#vidlikAct1Title *{animation:none!important;transition:none!important}#vidlikAct1Title .a1-bg,#vidlikAct1Title .a1-frame,#vidlikAct1Title .a1-brand,#vidlikAct1Title .a1-rail,#vidlikAct1Title .a1-act-line,#vidlikAct1Title .a1-title,#vidlikAct1Title .a1-subtitle,#vidlikAct1Title .a1-terminal,#vidlikAct1Title .a1-meta{opacity:1}#vidlikAct1Title .a1-act-rule,#vidlikAct1Title .a1-divider{transform:scaleX(1)}#vidlikAct1Title .a1-title{clip-path:none}#vidlikAct1Title .a1-curtain{opacity:0}.a1-desktop-reveal{transition:none}}
`;

function ensureStyle(){
 if(document.getElementById('vidlik-act1-title-style'))return;
 const style=document.createElement('style');
 style.id='vidlik-act1-title-style';
 style.textContent=css;
 document.head.appendChild(style);
}

function build(){
 const root=document.createElement('section');
 root.id='vidlikAct1Title';
 root.setAttribute('role','dialog');
 root.setAttribute('aria-label','Акт I — Знайомство');
 root.innerHTML=`
  <div class="a1-bg" aria-hidden="true"></div>
  <div class="a1-shade" aria-hidden="true"></div>
  <div class="a1-laser" aria-hidden="true"></div>
  <div class="a1-grain" aria-hidden="true"></div>
  <div class="a1-frame" aria-hidden="true"></div>
  <div class="a1-brand"><img class="a1-emblem" src="${EMBLEM}" alt="Герб Відлік"></div>
  <aside class="a1-rail" aria-hidden="true"><span class="a1-rail-label">АКТ / 01</span><span class="a1-rail-line"></span><span class="a1-rail-dot"></span><span class="a1-rail-line"></span></aside>
  <main class="a1-hero">
   <div class="a1-act-line"><span class="a1-act-label">АКТ I</span><span class="a1-act-rule" aria-hidden="true"></span></div>
   <h1 class="a1-title"><span class="a1-quote">«</span>ЗНАЙОМСТВО<span class="a1-quote">»</span></h1>
   <div class="a1-divider" aria-hidden="true"></div>
   <p class="a1-subtitle">Перший контакт. Перша довіра.<br>Початок спільної роботи.</p>
   <button class="a1-terminal" type="button" data-a1-continue aria-label="Продовжити"><span class="a1-prompt" aria-hidden="true">&gt;</span><span class="a1-command">продовжити</span><span class="a1-cursor" aria-hidden="true"></span></button>
  </main>
  <div class="a1-meta"><span class="a1-meta-line"></span><b>ВІДЛІК</b><br>СЕКТОР 3 / АКТ I</div>
  <div class="a1-curtain" aria-hidden="true"></div>`;
 return root;
}

function show(options={}){
 if(active)return false;
 active=true;locked=false;ensureStyle();
 const root=build();
 document.body.classList.add('vidlik-act1-title-active');
 document.body.appendChild(root);

 const button=root.querySelector('[data-a1-continue]');
 const proceed=()=>{
  if(locked)return;
  locked=true;
  root.classList.add('is-leaving');
  window.dispatchEvent(new CustomEvent('vidlik:act1-title-leaving',{detail:{act:1,title:'Знайомство'}}));

  setTimeout(()=>{
   const reveal=document.createElement('div');
   reveal.className='a1-desktop-reveal';
   document.body.appendChild(reveal);
   try{options.beforeReveal?.()}catch(err){console.error(err)}
   root.remove();
   document.body.classList.remove('vidlik-act1-title-active');
   requestAnimationFrame(()=>requestAnimationFrame(()=>reveal.classList.add('is-revealing')));
   setTimeout(()=>{
    reveal.remove();active=false;locked=false;
    window.dispatchEvent(new CustomEvent('vidlik:act1-title-complete',{detail:{act:1,title:'Знайомство'}}));
    try{options.onComplete?.()}catch(err){console.error(err)}
   },DESKTOP_REVEAL_MS+80);
  },EXIT_FADE_MS);
 };

 button.addEventListener('click',proceed);
 const onKey=e=>{
  if(!active||e.key!=='Enter'||e.repeat)return;
  e.preventDefault();e.stopImmediatePropagation();proceed();
 };
 document.addEventListener('keydown',onKey,true);
 const cleanup=()=>document.removeEventListener('keydown',onKey,true);
 root.addEventListener('remove',cleanup,{once:true});
 setTimeout(()=>button?.focus({preventScroll:true}),900);
 return true;
}

window.VIDLIK_ACT1_TITLE={show,get active(){return active},background:BG};
})();
