(()=>{
'use strict';
if(window.VIDLIK_TRANSITIONS)return;

const runtime=()=>window.VIDLIK_RUNTIME||null;
const PROLOGUE_BG='assets/sector3-prologue/prologue-title-bg.png';
const PROLOGUE_TITLE_HTML='ЗАБОРОНЕНИЙ<span class="second">ДЗВІНОК</span>';
const PROLOGUE_SUBTITLE='Початок історії. Один дзвінок — і звичний світ більше не виглядає таким, як раніше.';

/* -------------------------------------------------------------------------- */
/* Prologue presentation                                                       */
/* -------------------------------------------------------------------------- */
let prologueBgRequested=false;
function syncPrologue(){
 const root=document.getElementById('vidlikPrologueTitle');
 if(!root)return false;
 const title=root.querySelector('.vpt-title');
 const subtitle=root.querySelector('.vpt-subtitle');
 const bg=root.querySelector('.vpt-bg');
 if(title&&title.innerHTML!==PROLOGUE_TITLE_HTML)title.innerHTML=PROLOGUE_TITLE_HTML;
 if(subtitle&&subtitle.textContent!==PROLOGUE_SUBTITLE)subtitle.textContent=PROLOGUE_SUBTITLE;
 if(bg){
  bg.style.setProperty('background-image',`url("${PROLOGUE_BG}")`,'important');
  bg.style.setProperty('background-size','cover','important');
  bg.style.setProperty('background-position','center center','important');
  bg.style.setProperty('background-repeat','no-repeat','important');
  if(!prologueBgRequested){
   prologueBgRequested=true;
   bg.style.opacity='0';
   bg.style.transition='opacity 1.25s ease';
   const image=new Image();
   image.decoding='async';
   image.onload=()=>{
    bg.style.opacity='1';
    root.classList.add('vpt-external-bg-ready');
   };
   image.onerror=()=>{
    bg.style.opacity='1';
    root.classList.add('vpt-external-bg-error');
    console.error('[VIDLIK transitions] Не вдалося завантажити фон прологу:',PROLOGUE_BG);
   };
   image.src=PROLOGUE_BG;
  }
 }
 return !!(title||subtitle||bg);
}
const prologueObserver=new MutationObserver(()=>{
 if(syncPrologue()&&document.getElementById('vidlikPrologueTitle'))return;
});
prologueObserver.observe(document.documentElement,{childList:true,subtree:true});
syncPrologue();

/* -------------------------------------------------------------------------- */
/* Act title bridge                                                            */
/* -------------------------------------------------------------------------- */
let act1Real=null;
let act1Promise=null;
const act1Proxy={
 show(options={}){
  ensureAct1().then(api=>{
   if(!api?.show)throw new Error('Act I title API unavailable');
   api.show(options);
  }).catch(err=>{
   console.error('[VIDLIK transitions]',err);
   try{options.beforeReveal?.()}catch(_){}
   try{options.onComplete?.()}catch(_){}
  });
  return true;
 },
 get active(){return !!act1Real?.active},
 background:'assets/sector3-prologue/act1-title-bg.png'
};
async function ensureAct1(){
 if(act1Real?.show)return act1Real;
 if(act1Promise)return act1Promise;
 act1Promise=(async()=>{
  const loader=runtime()?.load;
  if(typeof loader!=='function')throw new Error('VIDLIK runtime loader unavailable');
  if(window.VIDLIK_ACT1_TITLE===act1Proxy)delete window.VIDLIK_ACT1_TITLE;
  await loader('sector3-act1-title.js?v=20260907-1');
  act1Real=window.VIDLIK_ACT1_TITLE||null;
  if(!act1Real?.show)throw new Error('Не вдалося ініціалізувати титул Акту I');
  return act1Real;
 })().catch(err=>{
  if(!act1Real)window.VIDLIK_ACT1_TITLE=act1Proxy;
  act1Promise=null;
  throw err;
 });
 return act1Promise;
}
if(!window.VIDLIK_ACT1_TITLE)window.VIDLIK_ACT1_TITLE=act1Proxy;

/* -------------------------------------------------------------------------- */
/* Episode transitions                                                         */
/* -------------------------------------------------------------------------- */
let overlay=null;
let phase='idle';
let locked=false;
let current=null;

const episodes=Object.freeze({
 episode1:Object.freeze({
  count:'9 / 9',complete:'Базове знайомство<br>з операційною системою',nextKicker:'Епізод 2',nextTitle:'Файли та папки',
  subtitle:'Створення · перейменування · копіювання · переміщення · видалення',footer:'ЕПІЗОД 2 · ФАЙЛИ ТА ПАПКИ',
  help:'<span><kbd>ЕПІЗОД 2</kbd> файли та папки</span>',event:'vidlik:episode2-ready',legacyEvent:'vidlik:section2-ready'
 }),
 episode2:Object.freeze({
  count:'11 / 11',complete:'Файли та папки',nextKicker:'Епізод 3',nextTitle:'Робота з клавіатурою',
  subtitle:'Навігація · Enter · Tab · Ctrl-комбінації · пошук',footer:'ЕПІЗОД 3 · РОБОТА З КЛАВІАТУРОЮ',
  help:'<span><kbd>ЕПІЗОД 3</kbd> робота з клавіатурою</span>',event:'vidlik:episode3-ready',legacyEvent:'vidlik:section3-ready'
 }),
 episode3:Object.freeze({
  count:'11 / 11',complete:'Робота з клавіатурою',nextKicker:'Епізод 4',nextTitle:'Мова введення',
  subtitle:'UKR · ENG · символи · розкладка · введення тексту',footer:'ЕПІЗОД 4 · МОВА ВВЕДЕННЯ',
  help:'<span><kbd>ЕПІЗОД 4</kbd> мова введення</span>',event:'vidlik:episode4-ready',legacyEvent:'vidlik:section4-ready'
 }),
 episode4:Object.freeze({
  count:'7 / 7',complete:'Мова введення',nextKicker:'Епізод 5',nextTitle:'Перша таблиця',
  subtitle:'Клітинки · рядки · стовпці · введення даних · перша формула',footer:'ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ',
  help:'<span><kbd>ЕПІЗОД 5</kbd> перша таблиця Excel</span>',event:'vidlik:episode5-ready',legacyEvent:'vidlik:section5-ready'
 })
});

function buildEpisode(cfg){
 const root=document.createElement('section');
 root.className='vidlik-section-transition vidlik-episode-transition';
 root.setAttribute('aria-label','Перехід між епізодами');
 root.innerHTML=`
  <div class="vidlik-section-corner tl">VIDLIK OS / TRAINING ENVIRONMENT</div>
  <div class="vidlik-section-corner br">SECTOR 3<br>OPERATOR TRAINING</div>
  <div class="vidlik-section-scan"></div>
  <div class="vidlik-section-panel vidlik-section-complete is-active" data-section-panel="complete">
   <div class="vidlik-section-content"><div class="vidlik-section-counter">${cfg.count}</div><h2 class="vidlik-section-title">${cfg.complete}</h2><div class="vidlik-section-rule"></div><div class="vidlik-section-done">Епізод завершено ✓</div></div>
  </div>
  <div class="vidlik-section-panel vidlik-section-next" data-section-panel="next">
   <div class="vidlik-section-content"><div class="vidlik-section-kicker">${cfg.nextKicker}</div><h2 class="vidlik-section-title">${cfg.nextTitle}</h2><div class="vidlik-section-rule"></div><div class="vidlik-section-subtitle">${cfg.subtitle}</div></div>
  </div>
  <div class="vidlik-section-enter"><kbd>ENTER</kbd><span>продовжити</span></div>`;
 return root;
}
function showEpisode(which='episode1'){
 if(overlay)return false;
 current=episodes[which];
 if(!current)return false;
 overlay=buildEpisode(current);
 document.body.appendChild(overlay);
 document.body.classList.add('vidlik-section-transition-active','vidlik-episode-transition-active');
 phase='complete';locked=false;
 return true;
}
function switchEpisode(){
 if(!overlay||locked||phase!=='complete')return;
 locked=true;phase='switching';
 const first=overlay.querySelector('[data-section-panel="complete"]');
 const next=overlay.querySelector('[data-section-panel="next"]');
 const prompt=overlay.querySelector('.vidlik-section-enter');
 if(prompt)prompt.style.opacity='0';
 overlay.classList.add('is-switching');
 first?.classList.remove('is-active');first?.classList.add('is-out');
 setTimeout(()=>{
  first?.classList.remove('is-out');next?.classList.add('is-active');
  if(prompt)prompt.style.opacity='';
  overlay?.classList.remove('is-switching');phase='next';locked=false;
 },520);
}
function finishEpisode(){
 if(!overlay||locked||phase!=='next'||!current)return;
 locked=true;phase='leaving';
 const cfg=current;
 overlay.classList.add('is-leaving','is-switching');
 const prompt=overlay.querySelector('.vidlik-section-enter');if(prompt)prompt.style.opacity='0';
 setTimeout(()=>{
  overlay?.remove();overlay=null;current=null;
  document.body.classList.remove('vidlik-section-transition-active','vidlik-episode-transition-active');
  phase='idle';locked=false;
  const footer=document.getElementById('adminFooter');
  if(footer){footer.textContent=cfg.footer;footer.classList.add('vidlik-tutorial-footer')}
  const help=document.getElementById('help');
  if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=cfg.help}
  window.dispatchEvent(new CustomEvent(cfg.event));
  if(cfg.legacyEvent)window.dispatchEvent(new CustomEvent(cfg.legacyEvent));
 },700);
}
function hideEpisode(){
 overlay?.remove();overlay=null;current=null;phase='idle';locked=false;
 document.body.classList.remove('vidlik-section-transition-active','vidlik-episode-transition-active');
}
function episodeKey(e){
 if(!overlay)return;
 e.stopImmediatePropagation();e.stopPropagation();
 if(e.key!=='Enter')return;
 e.preventDefault();if(locked)return;
 if(phase==='complete')switchEpisode();else if(phase==='next')finishEpisode();
}
function bridgeCompletion(legacyEvent,canonicalEvent,episodeKey){
 window.addEventListener(legacyEvent,()=>{
  window.dispatchEvent(new CustomEvent(canonicalEvent));
  showEpisode(episodeKey);
 });
}
window.addEventListener('keydown',episodeKey,true);
bridgeCompletion('vidlik:tutorial-basic-window-block-complete','vidlik:episode1-complete','episode1');
bridgeCompletion('vidlik:files-section-complete','vidlik:episode2-complete','episode2');
bridgeCompletion('vidlik:keyboard-section-complete','vidlik:episode3-complete','episode3');
bridgeCompletion('vidlik:language-section-complete','vidlik:episode4-complete','episode4');
window.addEventListener('vidlik:os-reset',hideEpisode);

const episodeApi={show:showEpisode,finish:finishEpisode,hide:hideEpisode,get phase(){return phase}};
window.VIDLIK_TRANSITIONS={
 syncPrologue,
 ensureAct1,
 showAct1:options=>act1Proxy.show(options),
 episodes,
 episode:episodeApi
};
window.VIDLIK_EPISODE_TRANSITION=episodeApi;
window.VIDLIK_SECTION_TRANSITION=episodeApi;
})();