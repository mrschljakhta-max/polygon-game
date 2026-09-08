(()=>{
'use strict';
if(window.VIDLIK_PAUSE_SKIN)return;
window.VIDLIK_PAUSE_SKIN=true;

const pause=document.getElementById('pause');
const card=pause?.querySelector('.vidlik-pause-card');
if(!pause||!card)return;

pause.classList.add('hotki-pause-v2');
card.classList.add('hotki-pause-scene');

const source={
 act:document.getElementById('vidlikPauseAct'),
 scene:document.getElementById('vidlikPauseScene'),
 episode:document.getElementById('vidlikPauseEpisode'),
 task:document.getElementById('vidlikPauseTask')
};

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

const controls=document.getElementById('vidlikPauseControls');
if(controls){
 controls.classList.add('hotki-controls-context');
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
}

const resume=document.getElementById('vidlikPauseResume');
const restart=document.getElementById('vidlikPauseRestart');
const controlsBtn=document.getElementById('vidlikPauseControlsBtn');
const scenes=document.getElementById('vidlikPauseScenes');
const sector=document.getElementById('vidlikPauseSector');
const buttons=[resume,restart,controlsBtn,scenes].filter(Boolean);

const actionDefs=[
 [resume,'hotki-action hotki-play','Продовжити гру','Продовжити · Space'],
 [restart,'hotki-action hotki-reload','Почати епізод спочатку','Почати спочатку · R'],
 [controlsBtn,'hotki-action hotki-tool','Керування','Керування · K'],
 [scenes,'hotki-action hotki-exit','Вийти з епізоду','Вийти · Q']
];
actionDefs.forEach(([button,cls,label,tip])=>{
 if(!button)return;
 button.className=cls;
 button.setAttribute('aria-label',label);
 button.dataset.tooltip=tip;
 button.removeAttribute('title');
});
if(sector){sector.hidden=true;sector.setAttribute('aria-hidden','true')}

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

function syncControlsState(){
 const open=!!controls&&!controls.hidden;
 card.classList.toggle('hotki-controls-open',open);
 if(!open)clearControlSelection();
}

let selectedIndex=0;
let navMode='main';
let selectedControlIndex=0;
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
function controlKeys(){return controls?[...controls.querySelectorAll('.hotki-control-line:not(.is-info) .hotki-control-key')]:[]}
function clearControlSelection(){
 navMode='main';
 controls?.classList.remove('hotki-subnav-active');
 controls?.querySelectorAll('.kbd-sub-selected,.kbd-sub-row').forEach(el=>el.classList.remove('kbd-sub-selected','kbd-sub-row'));
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
function enterControlsNav(){
 if(!controls||selectedIndex!==2)return;
 if(controls.hidden){controlsBtn?.click();requestAnimationFrame(()=>{syncControlsState();selectControl(0)})}
 else selectControl(0);
}
function returnMain(){clearControlSelection();selectButton(2,true)}

buttons.forEach((b,i)=>{
 b.addEventListener('pointerenter',()=>{clearControlSelection();selectButton(i,false)});
 b.addEventListener('focus',()=>{if(navMode==='main')selectButton(i,false)});
});

const confirmLayer=document.createElement('section');
confirmLayer.className='hotki-pause-confirm';
confirmLayer.hidden=true;
confirmLayer.innerHTML=`<div class="hotki-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="hotkiConfirmTitle">
 <div class="hotki-confirm-kicker">VIDLIK · ПІДТВЕРДЖЕННЯ</div>
 <h3 id="hotkiConfirmTitle">ПІДТВЕРДИТИ ДІЮ?</h3>
 <p id="hotkiConfirmText">—</p>
 <div class="hotki-confirm-actions"><button type="button" data-confirm="cancel">СКАСУВАТИ</button><button type="button" data-confirm="ok">ПІДТВЕРДИТИ</button></div>
</div>`;
card.append(confirmLayer);
let pendingButton=null;
let bypassAction=false;
function openConfirm(button){
 pendingButton=button;
 const isRestart=button===restart;
 confirmLayer.querySelector('#hotkiConfirmTitle').textContent=isRestart?'ПОЧАТИ ЕПІЗОД СПОЧАТКУ?':'ВИЙТИ З ЕПІЗОДУ?';
 confirmLayer.querySelector('#hotkiConfirmText').textContent=isRestart?'Поточний епізод буде перезапущено з першого завдання.':'Ви повернетеся до екрана сцен Сектора 3.';
 confirmLayer.hidden=false;
 card.classList.add('hotki-confirm-open');
 confirmLayer.querySelector('[data-confirm="cancel"]')?.focus?.({preventScroll:true});
}
function closeConfirm(){confirmLayer.hidden=true;card.classList.remove('hotki-confirm-open');pendingButton=null;selectButton(selectedIndex,true)}
function confirmAction(){
 const target=pendingButton;if(!target)return closeConfirm();
 confirmLayer.hidden=true;card.classList.remove('hotki-confirm-open');pendingButton=null;
 const oldConfirm=window.confirm;
 bypassAction=true;
 window.confirm=()=>true;
 try{target.click()}finally{
  window.confirm=oldConfirm;
  bypassAction=false;
 }
}
confirmLayer.addEventListener('click',e=>{
 const a=e.target.closest('[data-confirm]');if(!a)return;
 if(a.dataset.confirm==='ok')confirmAction();else closeConfirm();
});

pause.addEventListener('click',e=>{
 const b=e.target.closest('#vidlikPauseRestart,#vidlikPauseScenes');
 if(!b||bypassAction||!pause.classList.contains('visible'))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 openConfirm(b);
},true);

function playEnter(){
 card.classList.remove('hotki-entering');void card.offsetWidth;card.classList.add('hotki-entering');
 setTimeout(()=>card.classList.remove('hotki-entering'),420);
}

const observer=new MutationObserver(mutations=>{
 let needContext=false,needControls=false,opened=false;
 for(const m of mutations){
  if(m.target===pause&&m.type==='attributes'&&m.attributeName==='class')opened=pause.classList.contains('visible');
  if([source.act,source.scene,source.episode,source.task].includes(m.target)||[source.act,source.scene,source.episode,source.task].includes(m.target?.parentElement))needContext=true;
  if(m.target===controls&&m.type==='attributes'&&m.attributeName==='hidden')needControls=true;
 }
 if(needContext||opened)syncContext();
 if(needControls||opened)syncControlsState();
 if(opened){selectButton(0,false);playEnter()}
});
observer.observe(pause,{attributes:true,subtree:true,childList:true,characterData:true,attributeFilter:['class','hidden']});

window.addEventListener('vidlik:pause-state',e=>{
 if(e.detail?.paused){syncContext();syncControlsState();selectButton(0,false);playEnter()}
});

// Keyboard navigation from the supplied pause-menu prototype.
document.addEventListener('keydown',e=>{
 if(!pause.classList.contains('visible'))return;
 if(!confirmLayer.hidden){
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();confirmAction()}
  return;
 }
 const key=e.key.toLowerCase();
 if(navMode==='controls'){
  if(e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();selectControl(selectedControlIndex+1);return}
  if(e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();selectControl(selectedControlIndex-1);return}
  if(e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();returnMain();return}
  if(e.key==='ArrowLeft'||e.key==='Enter'){e.preventDefault();e.stopPropagation();return}
 }
 if(e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();selectButton(selectedIndex+1,true);return}
 if(e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();selectButton(selectedIndex-1,true);return}
 if(e.key==='ArrowLeft'&&selectedIndex===2){e.preventDefault();e.stopPropagation();enterControlsNav();return}
 if(e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();return}
 if(e.key==='Enter'){e.preventDefault();e.stopPropagation();buttons[selectedIndex]?.click();return}
 if(e.code==='Space'){e.preventDefault();e.stopPropagation();resume?.click();return}
 if(key==='r'){e.preventDefault();e.stopPropagation();restart?.click();return}
 if(key==='k'){e.preventDefault();e.stopPropagation();controlsBtn?.click();return}
 if(key==='q'){e.preventDefault();e.stopPropagation();scenes?.click();return}
 // Escape stays owned by the global Escape Router.
},true);

syncContext();
syncControlsState();
selectButton(0,false);
})();
