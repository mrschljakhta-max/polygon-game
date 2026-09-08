(()=>{
'use strict';
if(window.VIDLIK_PAUSE_ROUTER)return;

const scene=document.getElementById('scene');
const pause=document.getElementById('pause');
const help=document.getElementById('help');
const footer=document.getElementById('adminFooter');
if(!scene||!pause)return;

const HOLD_MS=900;
const nativeSetTimeout=window.setTimeout.bind(window);
let externalPaused=false;
let syntheticKey=false;
let escHeld=false;
let escHoldTimer=0;
let holdTriggered=false;
let currentEpisode=0;
let controlsOpen=false;
let storyOverride=null;
let wasFullscreen=!!document.fullscreenElement;

const EPISODES={
 1:{title:'БАЗОВЕ ЗНАЙОМСТВО З ОПЕРАЦІЙНОЮ СИСТЕМОЮ',api:'VIDLIK_TUTORIAL'},
 2:{title:'ФАЙЛИ ТА ПАПКИ',api:'VIDLIK_FILES_TUTORIAL'},
 3:{title:'РОБОТА З КЛАВІАТУРОЮ',api:'VIDLIK_KEYBOARD_TUTORIAL'},
 4:{title:'МОВА ВВЕДЕННЯ',api:'VIDLIK_LANGUAGE_TUTORIAL'},
 5:{title:'ПЕРША ТАБЛИЦЯ',api:'VIDLIK_EXCEL_STORY_TUTORIAL'}
};

function dispatchKey(key){
 syntheticKey=true;
 try{
  document.dispatchEvent(new KeyboardEvent('keydown',{key,code:key===' '?'Space':key,bubbles:true,cancelable:true}));
  document.dispatchEvent(new KeyboardEvent('keyup',{key,code:key===' '?'Space':key,bubbles:true,cancelable:true}));
 }finally{syntheticKey=false}
}
function osState(){try{return window.VIDLIK_OS?.getState?.()||null}catch(_){return null}}
function isOsReady(){return !!osState()?.enabled}
function isPaused(){return externalPaused||pause.classList.contains('visible')}
function isVisible(sel){const el=document.querySelector(sel);return !!(el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden')}

function criticalReason(){
 if(document.getElementById('vidlikPrologueTitle')||document.getElementById('vidlikAct1Title'))return'ЗАСТАВКА';
 if(scene.classList.contains('sync-active')||isVisible('.sync-layer.visible')||isVisible('.monitor-sync-overlay.visible'))return'СИНХРОНІЗАЦІЯ';
 if(isVisible('.video.visible.breaking'))return'ПЕРЕХІД КАНАЛУ';
 const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(excel?.active&&['saving'].includes(excel.phase))return'СЮЖЕТНИЙ ПЕРЕХІД';
 return'';
}
function canPause(){return !criticalReason()}

function setPausedVisual(state){
 document.documentElement.classList.toggle('vidlik-runtime-paused',state);
 menuBtn?.classList.toggle('is-open',state);
 pause.setAttribute('aria-hidden',state?'false':'true');
 if(state)updatePauseCard();
 updateEscHint();
}
function openExternalPause(){
 if(isPaused()||!canPause())return false;
 externalPaused=true;
 pause.classList.add('visible');
 setPausedVisual(true);
 window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source:'external'}}));
 return true;
}
function closeExternalPause(){
 if(!externalPaused)return false;
 externalPaused=false;
 pause.classList.remove('visible');
 setPausedVisual(false);
 window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:false,source:'external'}}));
 return true;
}

function requestPause(source='menu',force=false){
 if(isPaused())return true;
 if(!force&&!canPause())return false;
 if(!canPause())return false;

 // Before VIDLIK OS starts, Escape is owned by the prologue runtime.
 if(!isOsReady()){
  if(isVisible('.incoming.visible'))return openExternalPause();
  dispatchKey('Escape');
  if(pause.classList.contains('visible')){setPausedVisual(true);window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source}}));return true}
  return openExternalPause();
 }

 // Once the OS is active, the runtime exposes a dedicated pause-request event,
 // so a mouse click never has to consume the active application's Escape action.
 window.dispatchEvent(new CustomEvent('vidlik:pause-request',{detail:{source,force:true}}));
 nativeSetTimeout(()=>{
  if(pause.classList.contains('visible')){setPausedVisual(true);window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source}}))}
 },0);
 return true;
}
function requestResume(source='menu'){
 if(!isPaused())return true;
 if(externalPaused)return closeExternalPause();
 dispatchKey('Enter');
 nativeSetTimeout(()=>{
  if(!pause.classList.contains('visible')){setPausedVisual(false);window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:false,source}}))}
 },0);
 return true;
}

function currentEpisodeData(){
 for(let n=5;n>=1;n--){
  const d=EPISODES[n],api=window[d.api];
  if(api?.active)return{n,...d,api};
 }
 if(currentEpisode&&EPISODES[currentEpisode])return{n:currentEpisode,...EPISODES[currentEpisode],api:window[EPISODES[currentEpisode].api]};
 return null;
}
function prologueStage(){
 if(isVisible('.incoming.visible'))return'ВХІДНИЙ ДЗВІНОК';
 if(isVisible('.video.visible'))return'ДЗВІНОК ПОЛІ';
 if(isVisible('.admin-layer.visible'))return'СИСТЕМНИЙ КАНАЛ';
 if(isVisible('.sync-layer.visible'))return'СИНХРОНІЗАЦІЯ';
 return'ЗАБОРОНЕНИЙ ДЗВІНОК';
}
function storyMeta(){
 if(storyOverride)return storyOverride;
 const ep=currentEpisodeData();
 if(ep||isOsReady()){
  const n=ep?.n||Math.max(1,currentEpisode||1);
  const title=ep?.title||EPISODES[n]?.title||'РОБОЧА СТАНЦІЯ';
  return{
   act:'АКТ I · ЗНАЙОМСТВО',
   scene:'СЦЕНА 01 · ІНША ВЕРСІЯ',
   episode:`ЕПІЗОД ${String(n).padStart(2,'0')} · ${title}`,
   task:taskText(ep?.api)
  };
 }
 return{act:'ПРОЛОГ',scene:'ЗАБОРОНЕНИЙ ДЗВІНОК',episode:prologueStage(),task:taskText(null)};
}
function taskText(api){
 const f=(footer?.textContent||'').trim().replace(/\s+/g,' ');
 if(/ЗАВДАННЯ/i.test(f))return f;
 const t=Number(api?.task??api?.step??0);
 if(t>0)return`ЗАВДАННЯ ${t}`;
 if(f&&f.length<120)return f;
 return'ПОТОЧНИЙ ЕТАП';
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

pause.innerHTML=`<section class="vidlik-pause-card" role="dialog" aria-modal="true" aria-labelledby="vidlikPauseTitle">
 <div class="vidlik-pause-eyebrow"><span>VIDLIK · СЕКТОР 03</span><span>МЕНЮ</span></div>
 <h2 id="vidlikPauseTitle">ПРИЗУПИНЕНО</h2>
 <div class="vidlik-pause-hierarchy">
  <div class="vidlik-pause-story-row"><span>АКТ</span><strong id="vidlikPauseAct">—</strong></div>
  <div class="vidlik-pause-story-row"><span>СЦЕНА</span><strong id="vidlikPauseScene">—</strong></div>
  <div class="vidlik-pause-story-row"><span>ЕПІЗОД</span><strong id="vidlikPauseEpisode">—</strong></div>
 </div>
 <div class="vidlik-pause-task"><span>ПОТОЧНЕ ЗАВДАННЯ</span><strong id="vidlikPauseTask">—</strong></div>
 <button class="vidlik-pause-primary" id="vidlikPauseResume" type="button">▶ ПРОДОВЖИТИ</button>
 <div class="vidlik-pause-actions">
  <button id="vidlikPauseRestart" type="button">↻ Почати епізод спочатку</button>
  <button id="vidlikPauseScenes" type="button">▤ Повернутися до сцен</button>
  <button id="vidlikPauseSector" class="is-danger" type="button">⌂ Вийти до сектора</button>
  <button id="vidlikPauseControlsBtn" type="button" aria-expanded="false">⌨ Керування</button>
 </div>
 <div class="vidlik-pause-controls" id="vidlikPauseControls" hidden>
  <div><kbd>ESC</kbd><span>контекстна дія в VIDLIK OS; якщо дії немає — пауза</span></div>
  <div><kbd>УТРИМУВАТИ ESC</kbd><span>примусово відкрити паузу</span></div>
  <div><span class="pause-menu-key"><i class="vidlik-menu-icon"></i></span><span>відкрити меню мишкою в будь-який вільний момент</span></div>
  <div><kbd>ENTER</kbd><span>підтвердити дію / продовжити</span></div>
 </div>
 <div class="vidlik-pause-footer"><span><kbd>ESC</kbd> повернутися до гри</span><span>Прогрес поточного епізоду зберігається</span></div>
</section>`;

function updatePauseCard(){
 const m=storyMeta();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
 set('vidlikPauseAct',m.act);set('vidlikPauseScene',m.scene);set('vidlikPauseEpisode',m.episode);set('vidlikPauseTask',m.task);
}

const menuBtn=document.createElement('button');
menuBtn.id='vidlikMenuButton';menuBtn.className='vidlik-menu-button';menuBtn.type='button';menuBtn.title='Меню / пауза';menuBtn.setAttribute('aria-label','Відкрити меню паузи');menuBtn.innerHTML='<span class="vidlik-menu-icon" aria-hidden="true"></span>';
scene.appendChild(menuBtn);
menuBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();isPaused()?requestResume('menu-button'):requestPause('menu-button',true)});

function activeEscapeContext(){
 const critical=criticalReason();
 if(critical)return{kind:'blocked',label:critical,hold:false};
 if(isPaused())return{kind:'resume',label:'ПРОДОВЖИТИ',hold:false};
 if(isVisible('.excel-search:not([hidden])'))return{kind:'app',label:'ЗАКРИТИ ПОШУК',hold:true};
 if(document.querySelector('.editing'))return{kind:'app',label:'СКАСУВАТИ ВВЕДЕННЯ',hold:true};
 if(isVisible('.os-dialog-wrap'))return{kind:'app',label:'ЗАКРИТИ ВІКНО',hold:true};
 if(isVisible('.os-context-menu:not([hidden])')||isVisible('.os-start-menu:not([hidden])')||isVisible('#osLanguageMenu:not([hidden])'))return{kind:'app',label:'ЗАКРИТИ МЕНЮ',hold:true};
 const state=osState();
 const active=state?.windows?.find(w=>w.id===state.activeWindowId&&!w.minimized);
 if(active)return{kind:'app',label:'ЗГОРНУТИ ВІКНО',hold:true};
 return{kind:'pause',label:'ПАУЗА',hold:false};
}
function updateEscHint(){
 if(!help)return;
 [...help.querySelectorAll(':scope > span')].forEach(span=>{
  if(span.id==='vidlikEscHint')return;
  const k=span.querySelector('kbd');
  if(k&&/^ESC$/i.test((k.textContent||'').trim()))span.classList.add('vidlik-native-esc-hidden');
 });
 let own=document.getElementById('vidlikEscHint');
 if(!own||own.parentElement!==help){
  own=document.createElement('span');own.id='vidlikEscHint';help.appendChild(own);
 }
 const c=activeEscapeContext();
 own.innerHTML=`<kbd>ESC</kbd> ${escapeHtml(c.label)}${c.hold?'<em>· утримувати — пауза</em>':''}`;
 menuBtn.disabled=!!criticalReason();
 menuBtn.title=menuBtn.disabled?`Меню недоступне: ${criticalReason().toLowerCase()}`:'Меню / пауза';
}

function clearEscHold(){escHeld=false;holdTriggered=false;if(escHoldTimer){clearTimeout(escHoldTimer);escHoldTimer=0}}
window.addEventListener('keydown',e=>{
 if(syntheticKey||e.key!=='Escape')return;
 if(isPaused()){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();clearEscHold();requestResume('escape');return;
 }
 const c=activeEscapeContext();
 if(c.kind==='blocked'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();clearEscHold();return;
 }
 if(e.repeat)return;
 escHeld=true;holdTriggered=false;
 if(escHoldTimer)clearTimeout(escHoldTimer);
 escHoldTimer=nativeSetTimeout(()=>{
  escHoldTimer=0;
  if(!escHeld||isPaused()||!canPause())return;
  holdTriggered=true;
  requestPause('escape-hold',true);
 },HOLD_MS);

 // Let VIDLIK OS / Excel / the prologue consume a normal Escape first.
 // Only an entirely unused Escape falls back to game pause.
 queueMicrotask(()=>{
  if(!escHeld||holdTriggered||isPaused()||e.defaultPrevented)return;
  const after=activeEscapeContext();
  if(after.kind==='pause')requestPause('escape-fallback',false);
 });
},true);
window.addEventListener('keyup',e=>{if(e.key==='Escape')clearEscHold()},true);
window.addEventListener('blur',clearEscHold);

// While the external pause is used for the incoming-call state, it must own all input.
window.addEventListener('keydown',e=>{
 if(!externalPaused||syntheticKey)return;
 if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();requestResume('keyboard');return}
 e.preventDefault();e.stopImmediatePropagation();
},true);

function episodeNumber(){return currentEpisodeData()?.n||currentEpisode||0}
function restartEpisode(){
 const ep=currentEpisodeData();
 requestResume('restart');
 nativeSetTimeout(()=>{
  if(!ep){location.reload();return}
  try{
   if(ep.n===1){
    window.dispatchEvent(new CustomEvent('vidlik:os-reset'));
    nativeSetTimeout(()=>{window.VIDLIK_OS?.enable?.();window.VIDLIK_TUTORIAL?.restart?.()},70);
    return;
   }
   if(typeof ep.api?.reset==='function')ep.api.reset();
   nativeSetTimeout(()=>{if(typeof ep.api?.start==='function')ep.api.start()},70);
  }catch(_){location.reload()}
 },80);
}
async function leaveTo(url){
 clearEscHold();
 try{if(document.fullscreenElement)await document.exitFullscreen()}catch(_){}
 location.href=url;
}

document.getElementById('vidlikPauseResume')?.addEventListener('click',()=>requestResume('resume-button'));
document.getElementById('vidlikPauseRestart')?.addEventListener('click',restartEpisode);
document.getElementById('vidlikPauseScenes')?.addEventListener('click',()=>leaveTo('module-briefing.html?sector=3&from=pause'));
document.getElementById('vidlikPauseSector')?.addEventListener('click',()=>leaveTo('desktop-sectors.html?v=14'));
document.getElementById('vidlikPauseControlsBtn')?.addEventListener('click',()=>{
 controlsOpen=!controlsOpen;
 const p=document.getElementById('vidlikPauseControls'),b=document.getElementById('vidlikPauseControlsBtn');
 if(p)p.hidden=!controlsOpen;if(b)b.setAttribute('aria-expanded',controlsOpen?'true':'false');
});

new MutationObserver(()=>{
 const p=pause.classList.contains('visible')||externalPaused;
 setPausedVisual(p);
}).observe(pause,{attributes:true,attributeFilter:['class']});

window.addEventListener('vidlik:os-ready',()=>{currentEpisode=1;updateEscHint()});
window.addEventListener('vidlik:episode2-ready',()=>{currentEpisode=2;updateEscHint()});
window.addEventListener('vidlik:section2-ready',()=>{currentEpisode=2;updateEscHint()});
window.addEventListener('vidlik:episode3-ready',()=>{currentEpisode=3;updateEscHint()});
window.addEventListener('vidlik:section3-ready',()=>{currentEpisode=3;updateEscHint()});
window.addEventListener('vidlik:episode4-ready',()=>{currentEpisode=4;updateEscHint()});
window.addEventListener('vidlik:section4-ready',()=>{currentEpisode=4;updateEscHint()});
window.addEventListener('vidlik:episode5-ready',()=>{currentEpisode=5;updateEscHint()});
window.addEventListener('vidlik:section5-ready',()=>{currentEpisode=5;updateEscHint()});
window.addEventListener('vidlik:os-reset',()=>{currentEpisode=0;updateEscHint()});

// Browsers can reserve Escape for exiting Fullscreen. If that happens, opening the
// game menu on fullscreen exit keeps the control predictable even when keydown is swallowed.
document.addEventListener('fullscreenchange',()=>{
 const now=!!document.fullscreenElement;
 if(wasFullscreen&&!now&&!isPaused()&&canPause())nativeSetTimeout(()=>requestPause('fullscreen-exit',true),0);
 wasFullscreen=now;
});

// Tutorial modules replace #help often, so keep the owned Escape hint alive without
// rewriting their other instructions.
setInterval(()=>{updateEscHint();if(isPaused())updatePauseCard()},220);
updateEscHint();
pause.setAttribute('aria-hidden','true');

window.VIDLIK_PAUSE_ROUTER={
 pause:requestPause,resume:requestResume,
 setStory(meta){storyOverride=meta?{...meta}:null;if(isPaused())updatePauseCard()},
 clearStory(){storyOverride=null;if(isPaused())updatePauseCard()},
 get paused(){return isPaused()},get canPause(){return canPause()},get escapeContext(){return activeEscapeContext()},get episode(){return episodeNumber()}
};
})();
