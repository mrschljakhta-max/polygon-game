(()=>{
'use strict';
if(window.VIDLIK_PAUSE_FIDELITY)return;
window.VIDLIK_PAUSE_FIDELITY=true;

const defs=[
 ['vidlikPauseResume','Продовжити','Space'],
 ['vidlikPauseRestart','Почати спочатку','R'],
 ['vidlikPauseControlsBtn','Керування','K'],
 ['vidlikPauseScenes','Вийти','Q']
];

function apply(){
 const controls=document.getElementById('vidlikPauseControls');
 const scene=document.querySelector('.hotki-pause-scene');
 if(!controls||!scene)return false;

 // The legacy class brings generic compact pause styles into every child DIV.
 // Removing it lets the approved ZIP prototype styles win cleanly.
 controls.classList.remove('vidlik-pause-controls');
 controls.classList.add('hotki-controls-context');

 defs.forEach(([id,label,key])=>{
  const btn=document.getElementById(id);
  if(!btn)return;
  btn.dataset.tooltip='';
  let tip=btn.querySelector('.hotki-native-tooltip');
  if(!tip){
   tip=document.createElement('span');
   tip.className='hotki-native-tooltip';
   tip.setAttribute('aria-hidden','true');
   btn.appendChild(tip);
  }
  tip.innerHTML=`${label} <b>${key}</b>`;
 });
 return true;
}

if(!apply()){
 const observer=new MutationObserver(()=>{
  if(apply())observer.disconnect();
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),10000);
}
})();
