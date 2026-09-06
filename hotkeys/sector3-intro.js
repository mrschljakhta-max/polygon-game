(()=>{
'use strict';
const A='assets/sector3-prologue/';
const scenes=[
 {image:A+'polya-01.webp',duration:3600,text:'Привіт. Я Поля Верес. Сьогодні я твоя наставниця у третьому секторі.'},
 {image:A+'polya-02.webp',duration:4200,text:'Почнемо спокійно. Спочатку синхронізуємо навчальні матеріали, а потім відкриємо Excel.'},
 {image:A+'polya-03.webp',duration:3900,text:'Працюємо без миші: навігація клавішами, чіткі дії й жодної метушні.'},
 {image:A+'polya-04.webp',duration:3200,text:'Зачекай... Булочко, тихо. Це наш новий оператор.'},
 {image:A+'polya-05.webp',duration:4900,text:'Це Булочка. Вона перевіряє нових співробітників. Якщо не загарчала — перший етап ти пройшов.'},
 {image:A+'polya-06.webp',duration:2500,text:'Добре. Я вже надіслала стартовий файл. Далі працюємо в Excel.',breaking:true}
];
const el={
 scene:document.getElementById('scene'),camera:document.getElementById('camera'),tablet:document.getElementById('tabletScreen'),
 idle:document.getElementById('idleLayer'),incoming:document.getElementById('incomingLayer'),video:document.getElementById('videoLayer'),thread:document.getElementById('threadLayer'),
 frame:document.getElementById('polyaFrame'),subtitle:document.getElementById('subtitle'),count:document.getElementById('sceneCount'),progress:document.getElementById('callProgress'),
 accept:document.getElementById('acceptBtn'),objective:document.getElementById('objective'),pause:document.getElementById('pause'),excel:document.getElementById('excelWindow'),
 icons:[...document.querySelectorAll('.desktop-icon')],clock:document.getElementById('desktopClock'),lockTime:document.getElementById('lockTime'),lockDate:document.getElementById('lockDate')
};
let phase='idle',sceneIndex=-1,sceneTimer=0,bootTimer=0,cameraAnim=null,paused=false,selected=0,remaining=0,deadline=0;
scenes.forEach(()=>el.progress.appendChild(document.createElement('i')));
[A+'desk.webp',A+'monitor-wallpaper.webp',A+'tablet-lock.webp',A+'incoming-call.webp',...scenes.map(s=>s.image)].forEach(src=>{const im=new Image();im.decoding='async';im.src=src});
function setLayer(name){[el.idle,el.incoming,el.video,el.thread].forEach(x=>x.classList.remove('visible'));el[name].classList.add('visible')}
function objective(html){el.objective.innerHTML=html}
function updateProgress(i){[...el.progress.children].forEach((n,j)=>n.className=j<i?'done':j===i?'current':'')}
function clearSceneTimer(){clearTimeout(sceneTimer);sceneTimer=0;remaining=0;deadline=0}
function scheduleScene(ms){clearSceneTimer();remaining=ms;deadline=performance.now()+ms;sceneTimer=setTimeout(nextScene,ms)}
function tabletZoom(){
 const s=el.scene.getBoundingClientRect(),t=el.tablet.getBoundingClientRect();
 const targetH=s.height*.88,scale=targetH/t.height,cx=(t.left-s.left)+t.width/2,cy=(t.top-s.top)+t.height/2;
 return{scale,tx:s.width/2-cx*scale,ty:s.height/2-cy*scale};
}
function stopCamera(){if(cameraAnim){try{cameraAnim.cancel()}catch(_){}cameraAnim=null}}
function zoomToTablet(animate=true){
 const z=tabletZoom(),fin=`translate3d(${z.tx}px,${z.ty}px,0) scale(${z.scale})`;
 stopCamera();
 if(!animate||!el.camera.animate){el.camera.style.transform=fin;return}
 const m=.34,mid=`translate3d(${z.tx*m}px,${z.ty*m}px,0) scale(${1+(z.scale-1)*m})`;
 cameraAnim=el.camera.animate([
  {transform:'translate3d(0,0,0) scale(1)',offset:0},
  {transform:mid,offset:.38},
  {transform:fin,offset:1}
 ],{duration:2200,easing:'cubic-bezier(.20,.72,.18,1)',fill:'forwards'});
 cameraAnim.onfinish=()=>{el.camera.style.transform=fin;stopCamera()};
}
function zoomOut(){
 stopCamera();
 const start=getComputedStyle(el.camera).transform;
 cameraAnim=el.camera.animate([{transform:start==='none'?'translate3d(0,0,0) scale(1)':start},{transform:'translate3d(0,0,0) scale(1)'}],{duration:1750,easing:'cubic-bezier(.22,.68,.22,1)',fill:'forwards'});
 cameraAnim.onfinish=()=>{el.camera.style.transform='translate3d(0,0,0) scale(1)';stopCamera()};
}
function updateClocks(){
 const d=new Date();
 if(el.clock)el.clock.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
 if(el.lockTime)el.lockTime.textContent=d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
 if(el.lockDate){const s=d.toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});el.lockDate.textContent=s.charAt(0).toUpperCase()+s.slice(1)}
}
function refreshIcons(){el.icons.forEach((n,i)=>n.classList.toggle('is-selected',i===selected))}
function boot(){
 clearTimeout(bootTimer);clearSceneTimer();stopCamera();
 phase='idle';sceneIndex=-1;paused=false;selected=0;el.scene.classList.remove('ringing');el.video.classList.remove('breaking');el.pause.classList.remove('visible');el.excel.classList.remove('visible');el.excel.setAttribute('aria-hidden','true');el.camera.style.transform='translate3d(0,0,0) scale(1)';
 setLayer('idle');updateProgress(-1);refreshIcons();objective('Очікування. Через кілька секунд на планшет надійде виклик від Полі.');
 bootTimer=setTimeout(startIncoming,2400);
}
function startIncoming(){phase='incoming';setLayer('incoming');el.scene.classList.add('ringing');objective('На планшет надходить виклик від Полі. <strong>Натисніть Enter</strong>, щоб прийняти дзвінок.')}
function acceptCall(){
 if(phase!=='incoming')return;
 phase='zooming';el.scene.classList.remove('ringing');objective('Канал прийнято. Плавно наближаємо планшет…');
 requestAnimationFrame(()=>zoomToTablet(true));
 setTimeout(()=>{if(phase!=='zooming')return;phase='call';setLayer('video');sceneIndex=-1;nextScene()},1850);
}
function renderScene(i){
 const s=scenes[i];el.frame.style.opacity='0';el.video.classList.toggle('breaking',!!s.breaking);
 setTimeout(()=>{if(phase!=='call'||sceneIndex!==i)return;el.frame.src=s.image;el.frame.onload=()=>{el.frame.style.opacity='1'};el.subtitle.textContent=s.text;el.count.textContent=`${String(i+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;updateProgress(i);objective('Відеозв’язок із Полею активний. <strong>Enter</strong> або <strong>Space</strong> — наступна репліка.')},90);
 scheduleScene(s.duration);
}
function nextScene(){
 if(phase!=='call'||paused)return;
 clearSceneTimer();sceneIndex++;
 if(sceneIndex>=scenes.length){endCall();return}
 renderScene(sceneIndex);
}
function endCall(){
 clearSceneTimer();phase='thread';el.video.classList.remove('breaking');setLayer('thread');objective('Поля надіслала стартовий файл. Повертаємось до робочого столу…');
 setTimeout(()=>{zoomOut();setTimeout(()=>{phase='desktop';objective('На моніторі виберіть <strong>Microsoft Excel</strong> клавішами <strong>Tab</strong> або <strong>↑ ↓</strong>, потім натисніть <strong>Enter</strong>.')},700)},500);
}
function moveSelection(delta){selected=(selected+delta+el.icons.length)%el.icons.length;refreshIcons()}
function openSelected(){
 const node=el.icons[selected];
 if(node.dataset.app!=='excel'){node.classList.remove('is-wrong');void node.offsetWidth;node.classList.add('is-wrong');objective('Потрібно відкрити саме <strong>Microsoft Excel</strong>. Продовжуйте клавіатурою.');return}
 phase='complete';el.excel.classList.add('visible');el.excel.setAttribute('aria-hidden','false');objective('<strong>Microsoft Excel відкрито.</strong> Урок «Знайомство» готовий перейти до першого практичного завдання.')
}
function togglePause(){
 if(!['call','desktop'].includes(phase))return;
 if(!paused){paused=true;el.pause.classList.add('visible');if(sceneTimer){remaining=Math.max(0,deadline-performance.now());clearTimeout(sceneTimer);sceneTimer=0}}
 else{paused=false;el.pause.classList.remove('visible');if(phase==='call'&&remaining>0){deadline=performance.now()+remaining;sceneTimer=setTimeout(nextScene,remaining)}}
}
function onKey(e){
 const k=e.key;
 if(['Enter',' ','Tab','ArrowUp','ArrowDown','Escape','r','R'].includes(k))e.preventDefault();
 if(k==='r'||k==='R'){boot();return}
 if(k==='Escape'){togglePause();return}
 if(paused){if(k==='Enter')togglePause();return}
 if(phase==='incoming'&&k==='Enter'){acceptCall();return}
 if(phase==='call'&&(k==='Enter'||k===' ')){nextScene();return}
 if(phase==='desktop'){
  if(k==='Tab'||k==='ArrowDown')moveSelection(1);
  else if(k==='ArrowUp')moveSelection(-1);
  else if(k==='Enter')openSelected();
 }
}
el.accept.addEventListener('click',acceptCall);
el.icons.forEach((n,i)=>n.addEventListener('click',()=>{if(phase!=='desktop')return;selected=i;refreshIcons();openSelected()}));
document.addEventListener('keydown',onKey);
document.addEventListener('pointerdown',()=>el.scene.focus({preventScroll:true}),{passive:true});
window.addEventListener('resize',()=>{if(['zooming','call','thread'].includes(phase))zoomToTablet(false)});
updateClocks();setInterval(updateClocks,1000);el.scene.focus({preventScroll:true});boot();
})();
