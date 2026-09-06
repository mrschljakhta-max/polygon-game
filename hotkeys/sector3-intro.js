(()=>{
'use strict';
const A='assets/sector3-prologue/';

// Source of truth: HOTKI_Sector3_Polya_Starting_Monologue_v9_desktop_taskbar(3).html
const scenes=[
 {image:A+'polya-01.webp',duration:3600,text:'Ти мене чуєш? Добре. У мене мало часу.'},
 {image:A+'polya-02.webp',duration:4400,text:'Слухай уважно. Якщо побачиш запис 267 — не відкривай його.'},
 {image:A+'polya-03.webp',duration:2400,text:'Зачекай…'},
 {image:A+'polya-04.webp',duration:3300,text:'Тихо, Булко… Це лише ти.'},
 {image:A+'polya-05.webp',duration:5600,text:'Знайди запис 267. Не відкривай його напряму. Спочатку перевір журнал переміщень.'},
 {image:A+'polya-06.webp',duration:3600,text:'І головне — не довіряй…',breaking:true}
];

const el={
 scene:document.getElementById('scene'),
 camera:document.getElementById('camera'),
 tablet:document.getElementById('tabletScreen'),
 idle:document.getElementById('idleLayer'),
 incoming:document.getElementById('incomingLayer'),
 video:document.getElementById('videoLayer'),
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

let phase='boot',sceneIndex=-1,bootTimer=0,cameraAnim=null,paused=false,token=0;

scenes.forEach(()=>el.progress.appendChild(document.createElement('i')));
[A+'desk.webp',A+'monitor-wallpaper.webp',A+'tablet-lock.webp',A+'incoming-call.webp',...scenes.map(s=>s.image)].forEach(src=>{
 const im=new Image();im.decoding='async';im.src=src;
});

function setLayer(name){
 [el.idle,el.incoming,el.video].forEach(x=>x.classList.remove('visible'));
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

function updateClocks(){
 const d=new Date();
 if(el.clock)el.clock.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 if(el.lockTime)el.lockTime.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 if(el.lockDate){
  const s=d.toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});
  el.lockDate.textContent=s.charAt(0).toUpperCase()+s.slice(1);
 }
}

function boot(){
 clearTimeout(bootTimer);token++;paused=false;phase='boot';sceneIndex=-1;
 stopCamera();zoomOut();
 el.scene.classList.remove('ringing');
 el.video.classList.remove('breaking');
 el.pause.classList.remove('visible');
 el.subtitle.textContent='';
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
 },110);
}

function nextScene(){
 if(phase!=='call'||paused)return;
 sceneIndex++;
 if(sceneIndex>=scenes.length){endCall();return}
 renderScene(sceneIndex);
}

function endCall(){
 if(phase!=='call')return;
 phase='ended';
 // Як у вихідному v9: фінальний кадр лишається на планшеті.
 el.video.classList.remove('breaking');
 el.subtitle.style.opacity='0';
 setTimeout(()=>{el.subtitle.textContent='';el.subtitle.style.opacity='1'},180);
}

function togglePause(forceResume=false){
 if(phase!=='call')return;
 if(!paused&&!forceResume){
  paused=true;
  el.pause.classList.add('visible');
  return;
 }
 if(paused){
  paused=false;
  el.pause.classList.remove('visible');
 }
}

function onKey(e){
 const k=e.key.toLowerCase();
 if(['enter',' ','escape','r'].includes(k))e.preventDefault();
 if(k==='r'){boot();return}
 if(k==='escape'){togglePause();return}
 if(paused){if(k==='enter'||k===' ')togglePause(true);return}
 if(phase==='incoming'&&k==='enter'){acceptCall();return}
 if(phase==='call'&&k==='enter'){nextScene();return}
}

el.accept.addEventListener('click',acceptCall);
document.addEventListener('keydown',onKey);
document.addEventListener('pointerdown',()=>el.scene.focus({preventScroll:true}),{passive:true});
window.addEventListener('resize',()=>{if(phase==='zooming'||phase==='call'||phase==='ended')zoomToTablet(false)});

updateClocks();
setInterval(updateClocks,1000);
el.scene.focus({preventScroll:true});
boot();
})();
