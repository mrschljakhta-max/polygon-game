(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(parseInt(params.get('sector')||'0',10)!==3)return;

function selectedScene(){
  const row=document.querySelector('.mbf-level.is-selected');
  const id=parseInt(row?.dataset?.scene||'-1',10);
  return Number.isFinite(id)?id:-1;
}
function freshTarget(id){
  const stamp=Date.now();
  if(id===0)return `/hotkeys/sector3-intro.html?v=20260909-4&from=briefing&_=${stamp}`;
  if(id===1)return `/hotkeys/sector3-intro.html?v=20260909-4&storyScene=1&from=briefing&_=${stamp}`;
  return '';
}
function go(id){
  const target=freshTarget(id);if(!target)return false;
  try{sessionStorage.setItem('vidlik-sector3-story-selection-v2',JSON.stringify({scene:id}))}catch(_){}
  location.href=target;
  return true;
}

/* Registered before sector3-briefing-override.js so Enter/click navigation for
   available scenes always gets a fresh checkpoint URL instead of a cached HTML
   document that can still point at an old story controller. */
window.addEventListener('keydown',e=>{
  if(e.repeat||e.key!=='Enter')return;
  const id=selectedScene();
  if(id!==0&&id!==1)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  go(id);
},true);

document.addEventListener('click',e=>{
  const row=e.target.closest?.('.mbf-level');
  const summary=e.target.closest?.('.mbf-summary');
  let id=-1;
  if(row)id=parseInt(row.dataset.scene||'-1',10);
  else if(summary)id=selectedScene();
  if(id!==0&&id!==1)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  go(id);
},true);
})();
