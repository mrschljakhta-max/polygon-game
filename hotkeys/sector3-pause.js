(()=>{
'use strict';
if(window.VIDLIK_PAUSE)return;

const scene=document.getElementById('scene');
const pause=document.getElementById('pause');
const help=document.getElementById('help');
const footer=document.getElementById('adminFooter');
if(!scene||!pause)return;

const HOLD_MS=900;
const nativeSetTimeout=window.setTimeout.bind(window);

const EPISODES={
 1:{title:'БАЗОВЕ ЗНАЙОМСТВО З ОПЕРАЦІЙНОЮ СИСТЕМОЮ',api:'VIDLIK_TUTORIAL'},
 2:{title:'ФАЙЛИ ТА ПАПКИ',api:'VIDLIK_FILES_TUTORIAL'},
 3:{title:'РОБОТА З КЛАВІАТУРОЮ',api:'VIDLIK_KEYBOARD_TUTORIAL'},
 4:{title:'МОВА ВВЕДЕННЯ',api:'VIDLIK_LANGUAGE_TUTORIAL'},
 5:{title:'ПЕРША ТАБЛИЦЯ',api:'VIDLIK_EXCEL_STORY_TUTORIAL'}
};
const ACTIONS={
 restart:{id:'vidlikPauseRestart',index:1,label:'ПОЧАТИ СПОЧАТКУ?',normal:'Почати спочатку',key:'R'},
 exit:{id:'vidlikPauseScenes',index:3,label:'ВИЙТИ З ЕПІЗОДУ?',normal:'Вийти',key:'Q'}
};

let externalPaused=false;
let syntheticKey=false;
let escHeld=false;
let escHoldTimer=0;
let holdTriggered=false;
let currentEpisode=0;
let controlsOpen=false;
let storyOverride=null;
let wasFullscreen=!!document.fullscreenElement;
let selectedIndex=0;
let selectedControlIndex=0;
let navMode='main';
let armed=null;
let helpNormalizeQueued=false;

function escapeHtml(v){
 return String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 }[m]));
}
function dispatchKey(key){
 syntheticKey=true;
 try{
  const code=key===' '?'Space':key;
  document.dispatchEvent(new KeyboardEvent('keydown',{key,code,bubbles:true,cancelable:true}));
  document.dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true,cancelable:true}));
 }finally{syntheticKey=false}
}
function osState(){try{return window.VIDLIK_OS?.getState?.()||null}catch(_){return null}}
function isOsReady(){return !!osState()?.enabled}
function isPaused(){return externalPaused||pause.classList.contains('visible')}
function isVisible(sel){
 const el=document.querySelector(sel);
 if(!el||el.hidden)return false;
 const s=getComputedStyle(el);
 return s.display!=='none'&&s.visibility!=='hidden';
}
function criticalReason(){
 if(document.getElementById('vidlikPrologueTitle')||document.getElementById('vidlikAct1Title'))return'ЗАСТАВКА';
 if(scene.classList.contains('sync-active')||isVisible('.sync-layer.visible')||isVisible('.monitor-sync-overlay.visible'))return'СИНХРОНІЗАЦІЯ';
 if(isVisible('.video.visible.breaking'))return'ПЕРЕХІД КАНАЛУ';
 const excel=window.VIDLIK_EXCEL_STORY_TUTORIAL;
 if(excel?.active&&['saving'].includes(excel.phase))return'СЮЖЕТНИЙ ПЕРЕХІД';
 return'';
}
function canPause(){return !criticalReason()}

function currentEpisodeData(){
 for(let n=5;n>=1;n--){
  const d=EPISODES[n],api=window[d.api];
  if(api?.active)return{n,...d,api};
 }
 if(currentEpisode&&EPISODES[currentEpisode]){
  return{n:currentEpisode,...EPISODES[currentEpisode],api:window[EPISODES[currentEpisode].api]};
 }
 return null;
}
function prologueStage(){
 if(isVisible('.incoming.visible'))return'ВХІДНИЙ ДЗВІНОК';
 if(isVisible('.video.visible'))return'ДЗВІНОК ПОЛІ';
 if(isVisible('.admin-layer.visible'))return'СИСТЕМНИЙ КАНАЛ';
 if(isVisible('.sync-layer.visible'))return'СИНХРОНІЗАЦІЯ';
 return'ЗАБОРОНЕНИЙ ДЗВІНОК';
}
function taskText(api){
 const f=(footer?.textContent||'').trim().replace(/\s+/g,' ');
 if(/ЗАВДАННЯ/i.test(f))return f;
 const t=Number(api?.task??api?.step??0);
 if(t>0)return`ЗАВДАННЯ ${t}`;
 if(f&&f.length<120)return f;
 return'ПОТОЧНИЙ ЕТАП';
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
 <div class="vidlik-pause-controls" id="vidlikPauseControls" hidden></div>
 <div class="vidlik-pause-footer"><span><kbd>ESC</kbd> повернутися до гри</span><span>Прогрес поточного епізоду зберігається</span></div>
</section>`;

const card=pause.querySelector('.vidlik-pause-card');
const source={
 act:document.getElementById('vidlikPauseAct'),
 scene:document.getElementById('vidlikPauseScene'),
 episode:document.getElementById('vidlikPauseEpisode'),
 task:document.getElementById('vidlikPauseTask')
};
const resume=document.getElementById('vidlikPauseResume');
const restart=document.getElementById('vidlikPauseRestart');
const controlsBtn=document.getElementById('vidlikPauseControlsBtn');
const scenes=document.getElementById('vidlikPauseScenes');
const sector=document.getElementById('vidlikPauseSector');
const controls=document.getElementById('vidlikPauseControls');

pause.classList.add('hotki-pause-v2');
card.classList.add('hotki-pause-scene');

function entry(key,label,value,extra=''){
 return `<div class="hotki-context-entry ${extra}" data-context-entry="${key}">
  <div class="hotki-context-kicker"><span data-context-label="${key}">${label}</span><span class="hotki-context-signal" aria-hidden="true"></span></div>
  <div class="hotki-context-value" data-context-value="${key}">${value}</div>
 </div>`;
}
const context=document.createElement('section');
context.id='hotkiPauseContext';
context.className='hotki-pause-context';
context.setAttribute('aria-label','Поточний контекст гри');
context.innerHTML=[
 entry('act','АКТ I','ЗНАЙОМСТВО'),
 entry('scene','СЦЕНА 01','ІНША ВЕРСІЯ'),
 entry('episode','ЕПІЗОД 01','БАЗОВЕ ЗНАЙОМСТВО З ОПЕРАЦІЙНОЮ СИСТЕМОЮ','is-compact'),
 entry('task','ПОТОЧНЕ ЗАВДАННЯ','ПОТОЧНИЙ ЕТАП','is-task')
].join('');
card.prepend(context);

controls.className='hotki-controls-context';
controls.setAttribute('aria-label','Керування');
controls.innerHTML=`
 <div class="hotki-controls-heading">КЕРУВАННЯ</div>
 <div class="hotki-control-line is-info"><span class="hotki-control-label">Переміщення по меню</span><span class="hotki-control-key">↑ ↓</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Обрати кнопку</span><span class="hotki-control-key">Enter</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Продовжити гру</span><span class="hotki-control-key">Space</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Закрити паузу</span><span class="hotki-control-key">Esc</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Почати епізод спочатку</span><span class="hotki-control-key">R</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Відкрити керування</span><span class="hotki-control-key">K</span></div>
 <div class="hotki-control-line"><span class="hotki-control-label">Вийти з епізоду</span><span class="hotki-control-key">Q</span></div>`;

const buttons=[resume,restart,controlsBtn,scenes].filter(Boolean);
[
 [resume,'hotki-action hotki-play','Продовжити гру','Продовжити','Space'],
 [restart,'hotki-action hotki-reload','Почати епізод спочатку','Почати спочатку','R'],
 [controlsBtn,'hotki-action hotki-tool','Керування','Керування','K'],
 [scenes,'hotki-action hotki-exit','Вийти з епізоду','Вийти','Q']
].forEach(([button,cls,label,tip,key])=>{
 if(!button)return;
 button.className=cls;
 button.setAttribute('aria-label',label);
 button.dataset.tooltip='';
 button.removeAttribute('title');
 const tooltip=document.createElement('span');
 tooltip.className='hotki-native-tooltip';
 tooltip.setAttribute('aria-hidden','true');
 tooltip.innerHTML=`${tip} <b>${key}</b>`;
 button.appendChild(tooltip);
});
if(sector){sector.hidden=true;sector.setAttribute('aria-hidden','true')}

const menuBtn=document.createElement('button');
menuBtn.id='vidlikMenuButton';
menuBtn.className='vidlik-menu-button';
menuBtn.type='button';
menuBtn.title='Меню / пауза';
menuBtn.setAttribute('aria-label','Відкрити меню паузи');
menuBtn.innerHTML='<span class="vidlik-menu-icon" aria-hidden="true"></span>';
scene.appendChild(menuBtn);

function text(el){return String(el?.textContent||'').trim().replace(/\s+/g,' ')}
function splitDot(value,fallbackLabel){
 const parts=String(value||'').split('·').map(x=>x.trim()).filter(Boolean);
 if(parts.length>1)return{label:parts.shift(),value:parts.join(' · ')};
 return{label:fallbackLabel,value:parts[0]||'—'};
}
function setField(key,label,value){
 const l=context.querySelector(`[data-context-label="${key}"]`);
 const v=context.querySelector(`[data-context-value="${key}"]`);
 if(l)l.textContent=label;
 if(v)v.textContent=value;
}
function syncContext(){
 const actRaw=text(source.act),sceneRaw=text(source.scene),episodeRaw=text(source.episode),taskRaw=text(source.task);
 if(actRaw==='ПРОЛОГ'){
  setField('act','ПРОЛОГ',sceneRaw||'ЗАБОРОНЕНИЙ ДЗВІНОК');
  setField('scene','ЕТАП',episodeRaw||'ЗАБОРОНЕНИЙ ДЗВІНОК');
  setField('episode','СЕКТОР 03','VIDLIK · ЗАБОРОНЕНИЙ ДЗВІНОК');
 }else{
  const a=splitDot(actRaw,'АКТ I');
  const s=splitDot(sceneRaw,'СЦЕНА 01');
  const e=splitDot(episodeRaw,'ЕПІЗОД 01');
  setField('act',a.label,a.value);
  setField('scene',s.label,s.value);
  setField('episode',e.label,e.value);
 }
 setField('task','ПОТОЧНЕ ЗАВДАННЯ',taskRaw||'ПОТОЧНИЙ ЕТАП');
}
function updatePauseCard(){
 const m=storyMeta();
 source.act.textContent=m.act;
 source.scene.textContent=m.scene;
 source.episode.textContent=m.episode;
 source.task.textContent=m.task;
 syncContext();
}
function controlKeys(){return [...controls.querySelectorAll('.hotki-control-line:not(.is-info) .hotki-control-key')]}
function clearControlSelection(){
 navMode='main';
 controls.classList.remove('hotki-subnav-active');
 controls.querySelectorAll('.kbd-sub-selected,.kbd-sub-row').forEach(el=>el.classList.remove('kbd-sub-selected','kbd-sub-row'));
}
function selectButton(index,focus=false){
 if(!buttons.length)return;
 selectedIndex=(index+buttons.length)%buttons.length;
 buttons.forEach((b,i)=>{
  const on=i===selectedIndex;
  b.classList.toggle('kbd-selected',on);
  b.setAttribute('aria-current',on?'true':'false');
 });
 if(focus)buttons[selectedIndex]?.focus?.({preventScroll:true});
}
function selectControl(index){
 const keys=controlKeys();if(!keys.length)return;
 navMode='controls';
 selectedControlIndex=(index+keys.length)%keys.length;
 controls.classList.add('hotki-subnav-active');
 keys.forEach((key,i)=>{
  const on=i===selectedControlIndex;
  key.classList.toggle('kbd-sub-selected',on);
  key.closest('.hotki-control-line')?.classList.toggle('kbd-sub-row',on);
 });
 buttons.forEach(b=>b.classList.remove('kbd-selected'));
}
function setControlsOpen(open,focus=false){
 controlsOpen=!!open;
 controls.hidden=!controlsOpen;
 controlsBtn?.setAttribute('aria-expanded',controlsOpen?'true':'false');
 card.classList.toggle('hotki-controls-open',controlsOpen);
 if(controlsOpen){
  if(focus)requestAnimationFrame(()=>requestAnimationFrame(()=>selectControl(0)));
 }else{
  clearControlSelection();
  selectButton(2,focus);
 }
}
function playEnter(){
 card.classList.remove('hotki-entering');void card.offsetWidth;card.classList.add('hotki-entering');
 nativeSetTimeout(()=>card.classList.remove('hotki-entering'),420);
}
function syncPauseUi(){
 updatePauseCard();setControlsOpen(false,false);selectButton(0,false);playEnter();
}
function tipFor(name){
 const a=ACTIONS[name];
 return document.getElementById(a?.id)?.querySelector('.hotki-native-tooltip')||null;
}
function restoreTip(name){
 const a=ACTIONS[name],btn=document.getElementById(a?.id),tip=tipFor(name);
 if(!a||!btn||!tip)return;
 tip.classList.remove('is-confirm');
 tip.innerHTML=`${a.normal} <b>${a.key}</b>`;
 btn.classList.remove('hotki-confirm-armed');
}
function cancelArmed(){
 if(!armed)return false;
 const old=armed;armed=null;restoreTip(old);return true;
}
function arm(name){
 const a=ACTIONS[name];if(!a)return;
 if(armed&&armed!==name)cancelArmed();
 armed=name;
 const btn=document.getElementById(a.id),tip=tipFor(name);
 selectButton(a.index,true);
 btn?.classList.add('hotki-confirm-armed');
 if(tip){
  tip.classList.add('is-confirm');
  tip.innerHTML=`${a.label} <b>ENTER</b><small> · підтвердити</small>`;
 }
}
function selectedAction(){
 if(selectedIndex===ACTIONS.restart.index)return'restart';
 if(selectedIndex===ACTIONS.exit.index)return'exit';
 return'';
}

function setPausedVisual(state){
 document.documentElement.classList.toggle('vidlik-runtime-paused',state);
 menuBtn.classList.toggle('is-open',state);
 pause.setAttribute('aria-hidden',state?'false':'true');
 if(state)syncPauseUi();
 else{cancelArmed();setControlsOpen(false,false)}
 queueHelpNormalize();
}
function openExternalPause(){
 if(isPaused()||!canPause())return false;
 externalPaused=true;pause.classList.add('visible');setPausedVisual(true);
 window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source:'external'}}));
 return true;
}
function closeExternalPause(){
 if(!externalPaused)return false;
 externalPaused=false;pause.classList.remove('visible');setPausedVisual(false);
 window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:false,source:'external'}}));
 return true;
}
function requestPause(sourceName='menu',force=false){
 if(isPaused())return true;
 if(!force&&!canPause())return false;
 if(!canPause())return false;
 if(!isOsReady()){
  if(isVisible('.incoming.visible'))return openExternalPause();
  dispatchKey('Escape');
  if(pause.classList.contains('visible')){
   setPausedVisual(true);
   window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source:sourceName}}));
   return true;
  }
  return openExternalPause();
 }
 window.dispatchEvent(new CustomEvent('vidlik:pause-request',{detail:{source:sourceName,force:true}}));
 nativeSetTimeout(()=>{
  if(pause.classList.contains('visible')){
   setPausedVisual(true);
   window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:true,source:sourceName}}));
  }
 },0);
 return true;
}
function requestResume(sourceName='menu'){
 if(!isPaused())return true;
 cancelArmed();
 if(externalPaused)return closeExternalPause();
 dispatchKey('Enter');
 nativeSetTimeout(()=>{
  if(!pause.classList.contains('visible')){
   setPausedVisual(false);
   window.dispatchEvent(new CustomEvent('vidlik:pause-state',{detail:{paused:false,source:sourceName}}));
  }
 },0);
 return true;
}
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
function normalizeSystemHelp(){
 if(!help)return;
 const spans=[...help.querySelectorAll(':scope > span')];
 let own=spans.find(span=>span.id==='vidlikEscHint')||null;
 spans.forEach(span=>{
  if(span===own)return;
  const k=(span.querySelector('kbd')?.textContent||'').trim().toUpperCase();
  if(own&&k==='ESC')span.classList.add('vidlik-native-esc-hidden');
  else span.classList.remove('vidlik-native-esc-hidden');
 });
 if(!own||own.parentElement!==help){own=document.createElement('span');own.id='vidlikEscHint';help.appendChild(own)}
 const c=activeEscapeContext();
 const next=`<kbd>ESC</kbd> ${escapeHtml(c.label)}${c.hold?'<em>· утримувати — пауза</em>':''}`;
 if(own.innerHTML!==next)own.innerHTML=next;
 menuBtn.disabled=!!criticalReason();
 menuBtn.title=menuBtn.disabled?`Меню недоступне: ${criticalReason().toLowerCase()}`:'Меню / пауза';
}
function queueHelpNormalize(){
 if(helpNormalizeQueued)return;
 helpNormalizeQueued=true;
 queueMicrotask(()=>{helpNormalizeQueued=false;normalizeSystemHelp()});
}
function clearEscHold(){
 escHeld=false;holdTriggered=false;
 if(escHoldTimer){clearTimeout(escHoldTimer);escHoldTimer=0}
}
function swallow(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
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
 clearEscHold();cancelArmed();
 try{if(document.fullscreenElement)await document.exitFullscreen()}catch(_){}
 location.href=url;
}
function confirmArmed(){
 const action=armed;if(!action)return false;
 armed=null;
 if(action==='restart')restartEpisode();
 else if(action==='exit')leaveTo('module-briefing.html?sector=3&from=pause');
 return true;
}
function handlePauseKey(e){
 if(!isPaused())return false;
 const key=String(e.key||'').toLowerCase();
 if(e.key==='Escape'){
  swallow(e);
  if(armed){cancelArmed();return true}
  requestResume('escape');return true;
 }
 if(e.code==='Space'){swallow(e);requestResume('space');return true}
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  swallow(e);cancelArmed();
  const delta=e.key==='ArrowDown'?1:-1;
  if(navMode==='controls')selectControl(selectedControlIndex+delta);
  else selectButton(selectedIndex+delta,true);
  return true;
 }
 if(e.key==='ArrowLeft'){
  swallow(e);cancelArmed();
  if(navMode!=='controls'&&selectedIndex===2)setControlsOpen(true,true);
  return true;
 }
 if(e.key==='ArrowRight'){
  swallow(e);cancelArmed();
  if(navMode==='controls')setControlsOpen(false,true);
  return true;
 }
 if(e.key==='Enter'){
  swallow(e);
  if(armed){confirmArmed();return true}
  if(navMode==='controls')return true;
  const action=selectedAction();
  if(action){arm(action);return true}
  buttons[selectedIndex]?.click();return true;
 }
 if(key==='r'){swallow(e);arm('restart');return true}
 if(key==='q'){swallow(e);arm('exit');return true}
 if(key==='k'){
  swallow(e);cancelArmed();setControlsOpen(!controlsOpen,false);
  if(controlsOpen)requestAnimationFrame(()=>requestAnimationFrame(()=>selectControl(0)));
  return true;
 }
 if(externalPaused){swallow(e);return true}
 return false;
}

window.addEventListener('keydown',e=>{
 if(syntheticKey)return;
 if(handlePauseKey(e))return;
 if(e.key!=='Escape')return;
 if(!isOsReady()&&isVisible('.incoming.visible')){
  swallow(e);clearEscHold();requestPause('escape-incoming',true);return;
 }
 const c=activeEscapeContext();
 if(c.kind==='blocked'){
  swallow(e);clearEscHold();return;
 }
 if(e.repeat)return;
 escHeld=true;holdTriggered=false;
 if(escHoldTimer)clearTimeout(escHoldTimer);
 escHoldTimer=nativeSetTimeout(()=>{
  escHoldTimer=0;
  if(!escHeld||isPaused()||!canPause())return;
  holdTriggered=true;requestPause('escape-hold',true);
 },HOLD_MS);
 queueMicrotask(()=>{
  if(!escHeld||holdTriggered||isPaused()||e.defaultPrevented)return;
  const after=activeEscapeContext();
  if(after.kind==='pause')requestPause('escape-fallback',false);
 });
},true);
window.addEventListener('keyup',e=>{if(e.key==='Escape')clearEscHold()},true);
window.addEventListener('blur',clearEscHold);

menuBtn.addEventListener('click',e=>{
 e.preventDefault();e.stopPropagation();
 isPaused()?requestResume('menu-button'):requestPause('menu-button',true);
});
resume.addEventListener('click',()=>requestResume('resume-button'));
sector?.addEventListener('click',()=>leaveTo('desktop-sectors.html?v=14'));
controlsBtn.addEventListener('click',()=>{
 cancelArmed();setControlsOpen(!controlsOpen,false);
 if(controlsOpen)requestAnimationFrame(()=>requestAnimationFrame(()=>selectControl(0)));
});
buttons.forEach((b,i)=>{
 b.addEventListener('pointerenter',()=>{cancelArmed();clearControlSelection();selectButton(i,false)});
 b.addEventListener('focus',()=>{if(navMode==='main')selectButton(i,false)});
});
pause.addEventListener('click',e=>{
 const b=e.target.closest?.('#vidlikPauseRestart,#vidlikPauseScenes');
 if(!b||!isPaused())return;
 swallow(e);
 const action=b===restart?'restart':'exit';
 if(armed===action)confirmArmed();else arm(action);
},true);
pause.addEventListener('pointerover',e=>{
 if(!armed)return;
 const b=e.target.closest?.('.hotki-pause-scene .hotki-action');
 if(!b)return;
 const current=document.getElementById(ACTIONS[armed].id);
 if(b!==current)cancelArmed();
},true);

const pauseObserver=new MutationObserver(mutations=>{
 let classChanged=false,contentChanged=false;
 for(const m of mutations){
  if(m.target===pause&&m.type==='attributes'&&m.attributeName==='class')classChanged=true;
  if([source.act,source.scene,source.episode,source.task].includes(m.target)||
     [source.act,source.scene,source.episode,source.task].includes(m.target?.parentElement))contentChanged=true;
 }
 if(classChanged)setPausedVisual(pause.classList.contains('visible')||externalPaused);
 if(contentChanged)syncContext();
});
pauseObserver.observe(pause,{attributes:true,subtree:true,childList:true,characterData:true,attributeFilter:['class','hidden']});
if(help)new MutationObserver(queueHelpNormalize).observe(help,{childList:true,subtree:true,characterData:true});

[
 ['vidlik:os-ready',1],['vidlik:episode2-ready',2],['vidlik:section2-ready',2],
 ['vidlik:episode3-ready',3],['vidlik:section3-ready',3],
 ['vidlik:episode4-ready',4],['vidlik:section4-ready',4],
 ['vidlik:episode5-ready',5],['vidlik:section5-ready',5]
].forEach(([name,n])=>window.addEventListener(name,()=>{
 currentEpisode=n;queueHelpNormalize();if(isPaused())updatePauseCard();
}));
window.addEventListener('vidlik:os-reset',()=>{
 currentEpisode=0;queueHelpNormalize();if(isPaused())updatePauseCard();
});
window.addEventListener('vidlik:pause-state',e=>{
 if(e.detail?.paused)syncPauseUi();
 else{cancelArmed();setControlsOpen(false,false)}
});

document.addEventListener('fullscreenchange',()=>{
 const now=!!document.fullscreenElement;
 if(wasFullscreen&&!now&&!isPaused()&&canPause())nativeSetTimeout(()=>requestPause('fullscreen-exit',true),0);
 wasFullscreen=now;
});

window.VIDLIK_PAUSE={
 pause:requestPause,resume:requestResume,
 setStory(meta){storyOverride=meta?{...meta}:null;if(isPaused())updatePauseCard()},
 clearStory(){storyOverride=null;if(isPaused())updatePauseCard()},
 get paused(){return isPaused()},get canPause(){return canPause()},
 get escapeContext(){return activeEscapeContext()},get episode(){return episodeNumber()}
};
window.VIDLIK_PAUSE_ROUTER=window.VIDLIK_PAUSE;

pause.setAttribute('aria-hidden','true');
syncContext();
selectButton(0,false);
queueHelpNormalize();
})();