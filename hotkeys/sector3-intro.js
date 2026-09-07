(()=>{
'use strict';
const A='assets/sector3-prologue/';

const scenes=[
 {image:A+'polya-01.webp',duration:3600,text:'Ти мене чуєш? Добре. У мене мало часу.'},
 {image:A+'polya-02.webp',duration:4400,text:'Слухай уважно. Якщо побачиш запис 267 — не відкривай його.'},
 {image:A+'polya-03.webp',duration:2400,text:'Зачекай…'},
 {image:A+'polya-04.webp',duration:3300,text:'Тихо, Булко… Це лише ти.'},
 {image:A+'polya-05.webp',duration:5600,text:'Знайди запис 267. Не відкривай його напряму. Спочатку перевір журнал переміщень.'},
 {image:A+'polya-06.webp',duration:3600,text:'І головне — не довіряй…',breaking:true}
];

const adminLines=[
 'Вітаю. Я — системний адміністратор навчального середовища VIDLIK.',
 'У Секторі 3 ви працюєте як стажер.',
 'Ваше завдання — навчитися працювати з робочим середовищем і Microsoft Excel.',
 'Я даватиму практичні завдання та короткі пояснення. Ви виконуватимете їх на комп’ютері.',
 'Працюємо переважно клавіатурою. Почнемо з базових дій.',
 'Перед початком роботи необхідно синхронізувати планшет із вашою робочою станцією.'
];

const el={
 scene:document.getElementById('scene'),
 camera:document.getElementById('camera'),
 tablet:document.getElementById('tabletScreen'),
 idle:document.getElementById('idleLayer'),
 incoming:document.getElementById('incomingLayer'),
 video:document.getElementById('videoLayer'),
 admin:document.getElementById('adminLayer'),
 sync:document.getElementById('syncLayer'),
 syncShell:document.getElementById('syncShell'),
 syncStage:document.getElementById('syncStage'),
 syncPercent:document.getElementById('syncPercent'),
 syncBar:document.getElementById('syncBar'),
 monitorSyncOverlay:document.getElementById('monitorSyncOverlay'),
 monitorSyncStatus:document.getElementById('monitorSyncStatus'),
 monitorSyncBar:document.getElementById('monitorSyncBar'),
 monitorSyncPercent:document.getElementById('monitorSyncPercent'),
 adminChat:document.getElementById('adminChat'),
 adminFooter:document.getElementById('adminFooter'),
 frame:document.getElementById('polyaFrame'),
 subtitle:document.getElementById('subtitle'),
 count:document.getElementById('sceneCount'),
 progress:document.getElementById('callProgress'),
 accept:document.getElementById('acceptBtn'),
 pause:document.getElementById('pause'),
 clock:document.getElementById('desktopClock'),
 lockTime:document.getElementById('lockTime'),
 lockDate:document.getElementById('lockDate')
};

let phase='boot',sceneIndex=-1,adminIndex=-1,bootTimer=0,takeoverTimer=0,syncTimer=0,syncRaf=0,cameraAnim=null,paused=false,token=0;

scenes.forEach(()=>el.progress.appendChild(document.createElement('i')));
[
 A+'desk.webp',
 A+'monitor-wallpaper.webp',
 A+'tablet-lock.webp',
 A+'incoming-call.webp',
 A+'sync-monitor-bg.webp',
 A+'sync-tablet-bg.webp',
 ...scenes.map(s=>s.image)
].forEach(src=>{
 const im=new Image();im.decoding='async';im.src=src;
});

function setLayer(name){
 [el.idle,el.incoming,el.video,el.admin,el.sync].forEach(x=>x.classList.remove('visible'));
 el[name].classList.add('visible');
}

function updateProgress(index){
 [...el.progress.children].forEach((dot,i)=>dot.className=i<index?'done':i===index?'current':'');
}

function tabletZoom(){
 const s=el.scene.getBoundingClientRect(),t=el.tablet.getBoundingClientRect();
 const targetH=s.height*.88;
 const scale=targetH/t.height;
 const cx=(t.left-s.left)+t.width/2;
 const cy=(t.top-s.top)+t.height/2;
 return{scale,tx:s.width/2-cx*scale,ty:s.height/2-cy*scale};
}

function stopCamera(){
 if(cameraAnim){try{cameraAnim.cancel()}catch(_){}cameraAnim=null}
}

function zoomToTablet(animate=true){
 const z=tabletZoom();
 const fin=`translate3d(${z.tx}px,${z.ty}px,0) scale(${z.scale})`;
 stopCamera();
 if(!animate||!el.camera.animate){el.camera.style.transform=fin;return}
 const m=.34;
 const mid=`translate3d(${z.tx*m}px,${z.ty*m}px,0) scale(${1+(z.scale-1)*m})`;
 cameraAnim=el.camera.animate([
  {transform:'translate3d(0,0,0) scale(1)',offset:0},
  {transform:mid,offset:.38},
  {transform:fin,offset:1}
 ],{duration:2200,easing:'cubic-bezier(.20,.72,.18,1)',fill:'forwards'});
 cameraAnim.onfinish=()=>{el.camera.style.transform=fin;stopCamera()};
}

function zoomOut(){
 stopCamera();
 el.camera.style.transform='translate3d(0,0,0) scale(1)';
}

function zoomOutForSync(){
 const fin='translate3d(0,0,0) scale(1)';
 stopCamera();
 if(!el.camera.animate){el.camera.style.transform=fin;return}
 const current=getComputedStyle(el.camera).transform;
 cameraAnim=el.camera.animate([
  {transform:current==='none'?el.camera.style.transform||fin:current},
  {transform:fin}
 ],{duration:480,easing:'cubic-bezier(.22,.72,.18,1)',fill:'forwards'});
 cameraAnim.onfinish=()=>{el.camera.style.transform=fin;stopCamera()};
}

function updateClocks(){
 const d=new Date();
 if(el.clock)el.clock.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 if(el.lockTime)el.lockTime.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 if(el.lockDate){
  const s=d.toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});
  el.lockDate.textContent=s.charAt(0).toUpperCase()+s.slice(1);
 }
}

function setSyncProgress(pct){
 el.syncBar.style.width=pct+'%';
 el.monitorSyncBar.style.width=pct+'%';
 el.syncPercent.textContent=pct+'%';
 el.monitorSyncPercent.textContent=pct+'%';
}

function resetSyncUi(){
 cancelAnimationFrame(syncRaf);syncRaf=0;
 clearTimeout(syncTimer);syncTimer=0;
 el.syncShell.classList.remove('sync-complete');
 el.monitorSyncOverlay.classList.remove('visible','complete');
 el.scene.classList.remove('sync-active','sync-flash');
 setSyncProgress(0);
 el.syncStage.textContent='СИНХРОНІЗАЦІЯ';
 el.monitorSyncStatus.textContent='СИНХРОНІЗАЦІЯ';
}

function boot(){
 window.dispatchEvent(new CustomEvent('vidlik:os-reset'));
 clearTimeout(bootTimer);clearTimeout(takeoverTimer);token++;paused=false;phase='boot';sceneIndex=-1;adminIndex=-1;
 stopCamera();zoomOut();resetSyncUi();
 el.scene.classList.remove('ringing','system-takeover');
 el.video.classList.remove('breaking');
 el.admin.classList.remove('entering');
 el.pause.classList.remove('visible');
 el.subtitle.textContent='';
 el.adminChat.replaceChildren();
 el.adminChat.scrollTop=0;
 el.adminFooter.textContent='ENTER · ПРОДОВЖИТИ';
 el.frame.src=scenes[0].image;
 el.frame.style.opacity='1';
 setLayer('idle');
 updateProgress(-1);
 bootTimer=setTimeout(showIncoming,2300);
}

function showIncoming(){
 phase='incoming';
 setLayer('incoming');
 el.scene.classList.add('ringing');
}

function acceptCall(){
 if(phase!=='incoming')return;
 clearTimeout(bootTimer);
 phase='zooming';
 el.scene.classList.remove('ringing');
 requestAnimationFrame(()=>zoomToTablet(true));
 setTimeout(()=>{
  if(phase!=='zooming')return;
  phase='call';
  setLayer('video');
  sceneIndex=-1;
  nextScene();
 },1850);
}

function renderScene(index){
 const s=scenes[index];
 const t=++token;
 el.subtitle.style.opacity='0';
 el.frame.style.opacity='0';
 el.video.classList.toggle('breaking',!!s.breaking);
 clearTimeout(takeoverTimer);
 setTimeout(()=>{
  if(t!==token||phase!=='call'||sceneIndex!==index)return;
  el.frame.src=s.image;
  el.frame.alt=index<3?'Поля під час таємного відеодзвінка':'Поля і Булка під час таємного відеодзвінка';
  el.frame.onload=()=>{el.frame.style.opacity='1'};
  if(el.frame.complete)el.frame.style.opacity='1';
  el.subtitle.textContent=s.text;
  el.subtitle.style.opacity='1';
  el.count.textContent=`${String(index+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;
  updateProgress(index);
  if(s.breaking){
   takeoverTimer=setTimeout(()=>{
    if(phase==='call'&&sceneIndex===index&&!paused)startAdminTakeover();
   },2300);
  }
 },110);
}

function nextScene(){
 if(phase!=='call'||paused)return;
 if(sceneIndex===scenes.length-1){startAdminTakeover();return}
 sceneIndex++;
 renderScene(sceneIndex);
}

function startAdminTakeover(){
 if(phase!=='call'&&phase!=='ended')return;
 clearTimeout(takeoverTimer);
 phase='admin-transition';
 token++;
 el.scene.classList.add('system-takeover');
 el.video.classList.add('breaking');
 el.subtitle.style.opacity='0';
 setTimeout(()=>{
  if(phase!=='admin-transition')return;
  setLayer('admin');
  el.scene.classList.remove('system-takeover');
  el.video.classList.remove('breaking');
  el.admin.classList.add('entering');
  el.adminChat.replaceChildren();
  el.adminChat.scrollTop=0;
  phase='admin';
  adminIndex=-1;
  nextAdminLine();
  setTimeout(()=>el.admin.classList.remove('entering'),650);
 },520);
}

function adminTime(){
 return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
}

function scrollAdminToLatest(row,instant=false){
 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
   if(!el.adminChat)return;
   const top=Math.max(0,el.adminChat.scrollHeight-el.adminChat.clientHeight);
   if(instant){el.adminChat.scrollTop=top}
   else if(typeof el.adminChat.scrollTo==='function')el.adminChat.scrollTo({top,behavior:'smooth'});
   else el.adminChat.scrollTop=top;
   if(row)row.setAttribute('data-visible-latest','true');
  });
 });
}

function appendAdminMessage(text){
 const row=document.createElement('div');
 row.className='admin-message';
 const avatar=document.createElement('div');
 avatar.className='admin-msg-avatar';
 avatar.setAttribute('aria-hidden','true');
 const bubble=document.createElement('div');
 bubble.className='admin-bubble';
 const head=document.createElement('div');
 head.className='admin-bubble-head';
 const name=document.createElement('span');
 name.className='admin-bubble-name';
 name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');
 time.className='admin-bubble-time';
 time.textContent=adminTime();
 const p=document.createElement('p');
 p.textContent=text;
 p.style.whiteSpace='pre-line';
 head.append(name,time);
 bubble.append(head,p);
 row.append(avatar,bubble);
 el.adminChat.appendChild(row);
 scrollAdminToLatest(row);
}

function renderAdminLine(index){
 const t=++token;
 setTimeout(()=>{
  if(t!==token||phase!=='admin'||adminIndex!==index)return;
  appendAdminMessage(adminLines[index]);
  const isLast=index===adminLines.length-1;
  el.adminFooter.textContent=isLast?'ENTER · СИНХРОНІЗУВАТИ':'ENTER · ПРОДОВЖИТИ';
 },80);
}

function nextAdminLine(){
 if(phase!=='admin'||paused)return;
 if(adminIndex>=adminLines.length-1){startDeviceSync();return}
 adminIndex++;
 renderAdminLine(adminIndex);
}

function startDeviceSync(){
 if(phase!=='admin')return;
 clearTimeout(syncTimer);
 resetSyncUi();
 phase='sync-transition';
 el.adminFooter.textContent='';
 el.scene.classList.add('sync-active','sync-flash');
 zoomOutForSync();

 syncTimer=setTimeout(()=>{
  if(phase!=='sync-transition')return;
  setLayer('sync');
  el.monitorSyncOverlay.classList.add('visible');
 },170);

 setTimeout(()=>{
  if(phase!=='sync-transition')return;
  phase='sync';
  const started=performance.now();
  const duration=3800;
  const tick=now=>{
   if(phase!=='sync')return;
   const raw=Math.min(1,(now-started)/duration);
   const eased=1-Math.pow(1-raw,2.2);
   const pct=Math.min(100,Math.round(eased*100));
   setSyncProgress(pct);
   if(raw<1){syncRaf=requestAnimationFrame(tick);return}
   finishDeviceSync();
  };
  syncRaf=requestAnimationFrame(tick);
 },360);

 setTimeout(()=>el.scene.classList.remove('sync-flash'),560);
}

function prepareActOneWorkstation(){
 el.monitorSyncOverlay.classList.remove('visible','complete');
 setLayer('admin');
 phase='post-sync';
 el.scene.classList.remove('sync-active','sync-flash');
 appendAdminMessage('Синхронізацію завершено.\nРобоча станція готова.\nПочинаємо перший епізод.');
 el.adminFooter.textContent='РОБОЧА СТАНЦІЯ · ГОТОВА';
}

function completeActOneTitle(){
 window.dispatchEvent(new CustomEvent('vidlik:os-ready'));
}

function launchActOneTitle(){
 const start=()=>{
  if(!window.VIDLIK_ACT1_TITLE?.show){
   prepareActOneWorkstation();
   completeActOneTitle();
   return;
  }
  window.VIDLIK_ACT1_TITLE.show({
   beforeReveal:prepareActOneWorkstation,
   onComplete:completeActOneTitle
  });
 };

 if(window.VIDLIK_ACT1_TITLE?.show){start();return}
 const previous=document.querySelector('script[data-vidlik-act1-title]');
 if(previous){
  previous.addEventListener('load',start,{once:true});
  previous.addEventListener('error',()=>{prepareActOneWorkstation();completeActOneTitle()},{once:true});
  return;
 }
 const script=document.createElement('script');
 script.src='sector3-act1-title.js?v=20260907-1';
 script.dataset.vidlikAct1Title='true';
 script.onload=start;
 script.onerror=()=>{prepareActOneWorkstation();completeActOneTitle()};
 document.head.appendChild(script);
}

function finishDeviceSync(){
 if(phase!=='sync')return;
 setSyncProgress(100);
 el.syncStage.textContent='СИНХРОНІЗОВАНО ✓';
 el.monitorSyncStatus.textContent='СИНХРОНІЗОВАНО ✓';
 el.syncShell.classList.add('sync-complete');
 el.monitorSyncOverlay.classList.add('complete');

 syncTimer=setTimeout(()=>{
  if(phase!=='sync')return;
  phase='act1-title';
  window.dispatchEvent(new CustomEvent('vidlik:prologue-complete',{detail:{title:'Стартовий дзвінок'}}));
  launchActOneTitle();
 },900);
}

function togglePause(forceResume=false){
 if(!['call','admin','post-sync'].includes(phase))return;
 if(!paused&&!forceResume){paused=true;el.pause.classList.add('visible');return}
 if(paused){paused=false;el.pause.classList.remove('visible')}
}

function onKey(e){
 const k=e.key.toLowerCase();
 if(phase==='act1-title')return;
 if(phase==='post-sync'){
  if(paused&&(k==='enter'||k===' ')){e.preventDefault();togglePause(true)}
  return;
 }
 if(['enter',' ','escape','r'].includes(k))e.preventDefault();
 if(k==='r'){boot();return}
 if(k==='escape'){togglePause();return}
 if(paused){if(k==='enter'||k===' ')togglePause(true);return}
 if(phase==='incoming'&&k==='enter'){acceptCall();return}
 if(phase==='call'&&k==='enter'){nextScene();return}
 if(phase==='admin'&&k==='enter'){nextAdminLine();return}
}

el.accept.addEventListener('click',acceptCall);
document.addEventListener('keydown',onKey);
document.addEventListener('pointerdown',e=>{
 if(e.target.closest?.('.os-ui'))return;
 el.scene.focus({preventScroll:true});
},{passive:true});
window.addEventListener('vidlik:pause-request',()=>{if(phase==='post-sync')togglePause()});
window.addEventListener('resize',()=>{
 if(['zooming','call','admin-transition','admin'].includes(phase))zoomToTablet(false);
 if(phase==='admin')scrollAdminToLatest(null,true);
});

updateClocks();
setInterval(updateClocks,1000);
el.scene.focus({preventScroll:true});
boot();
})();
