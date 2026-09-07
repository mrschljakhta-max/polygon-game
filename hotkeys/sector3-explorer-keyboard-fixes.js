(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
if(!mon)return;

let raf=0;

function explorerWindow(){
 const win=mon.querySelector('.os-window[data-window-id="explorer"]');
 if(!win||win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return null;
 return win;
}

function keepSelectedVisible(){
 raf=0;
 const win=explorerWindow();
 if(!win)return;
 const pane=win.querySelector('.os-file-pane');
 const row=win.querySelector('.os-file-item.selected');
 if(!pane||!row)return;
 const head=win.querySelector('.os-file-head');
 const pr=pane.getBoundingClientRect();
 const rr=row.getBoundingClientRect();
 const hr=head?.getBoundingClientRect();
 const top=Math.max(pr.top,(hr?.bottom||pr.top))+3;
 const bottom=pr.bottom-3;
 if(rr.top<top)pane.scrollTop-=top-rr.top;
 else if(rr.bottom>bottom)pane.scrollTop+=rr.bottom-bottom;
}

function schedule(){
 cancelAnimationFrame(raf);
 raf=requestAnimationFrame(()=>requestAnimationFrame(keepSelectedVisible));
}

function selectSearchText(){
 requestAnimationFrame(()=>{
  const input=explorerWindow()?.querySelector('.os-search-row.visible input[id^="osSearch-"]');
  if(!input)return;
  input.focus();
  try{input.select()}catch{}
 });
}

window.addEventListener('keydown',e=>{
 const state=window.VIDLIK_OS?.getState?.();
 if(state?.activeWindowId!=='explorer')return;
 if(e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.toLowerCase()==='f'){
  selectSearchText();
  return;
 }
 if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))return;
 schedule();
},false);

const observer=new MutationObserver(records=>{
 if(!records.some(r=>r.type==='childList'&&r.target.closest?.('.os-file-list')))return;
 schedule();
});
observer.observe(mon,{subtree:true,childList:true});

window.addEventListener('vidlik:os-reset',()=>cancelAnimationFrame(raf));
})();
