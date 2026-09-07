(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
if(!mon)return;

const cutIds=new Set();

function selectedIds(){
 return [...mon.querySelectorAll('.os-window[data-window-id="explorer"] .os-file-item.selected[data-id]')]
  .map(x=>x.dataset.id)
  .filter(Boolean);
}

function applyCutState(){
 mon.querySelectorAll('.os-file-item[data-id]').forEach(row=>{
  row.classList.toggle('os-file-cut-pending',cutIds.has(row.dataset.id));
 });
}

function rememberCut(){
 cutIds.clear();
 selectedIds().forEach(id=>cutIds.add(id));
 requestAnimationFrame(applyCutState);
}

function clearCut(){
 if(!cutIds.size)return;
 cutIds.clear();
 requestAnimationFrame(applyCutState);
}

/* Capture menu actions before the OS consumes them. */
mon.addEventListener('click',e=>{
 const action=e.target.closest('[data-menu]')?.dataset.menu;
 if(!action)return;
 if(action==='cut'){
  rememberCut();
  return;
 }
 if(action==='copy'){
  clearCut();
  return;
 }
 if(action==='paste'){
  setTimeout(clearCut,70);
 }
},true);

/* Keep the same visual behavior when keyboard shortcuts are introduced later. */
document.addEventListener('keydown',e=>{
 if(!(e.ctrlKey&&!e.altKey&&!e.metaKey))return;
 const key=e.key.toLowerCase();
 if(key==='x')rememberCut();
 else if(key==='c')clearCut();
 else if(key==='v'&&cutIds.size)setTimeout(clearCut,90);
},true);

/* Explorer rerenders rows during navigation; reapply cut state to matching ids. */
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.type==='childList'&&(r.addedNodes.length||r.removedNodes.length))){
  requestAnimationFrame(applyCutState);
 }
});
observer.observe(mon,{childList:true,subtree:true});

window.addEventListener('vidlik:os-reset',clearCut);
applyCutState();
})();
