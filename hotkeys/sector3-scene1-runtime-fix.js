(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

/* Scene 01 runtime bridge.
 * 1) Keeps the monitor clock tied to the browser's actual local time.
 * 2) Restores keyboard cell navigation for the direct Excel checkpoint.
 * Loaded BEFORE sector3-story-jump.js so arrows can be handled before the
 * scene controller consumes ordinary keys.
 */

const scene=document.getElementById('scene');
const help=document.getElementById('help');
let selectedCell='F2';
let gridBound=false;

function formatClock(){
  return new Date().toLocaleTimeString('uk-UA',{
    hour:'2-digit',
    minute:'2-digit',
    hour12:false
  });
}
function syncClock(){
  const clock=document.getElementById('desktopClock');
  if(clock)clock.textContent=formatClock();
}
syncClock();
const clockTimer=setInterval(syncClock,1000);
window.addEventListener('pagehide',()=>clearInterval(clockTimer),{once:true});

function excelWindow(){
  const win=document.querySelector('.s3-direct-window');
  if(!win||win.style.display==='none'||win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return null;
  return win;
}
function cellByAddress(address){
  return excelWindow()?.querySelector(`.excel-cell[data-cell="${address}"]`)||null;
}
function visibleCell(address){
  const cell=cellByAddress(address);
  if(!cell)return null;
  const row=cell.closest('.excel-row');
  if(row&&getComputedStyle(row).display==='none')return null;
  return cell;
}
function setSelected(cell,{scroll=true}={}){
  if(!cell)return false;
  const win=excelWindow();
  if(!win)return false;
  win.querySelectorAll('.excel-cell.is-selected').forEach(el=>el.classList.remove('is-selected'));
  cell.classList.add('is-selected');
  selectedCell=cell.dataset.cell||selectedCell;
  const nameBox=win.querySelector('.excel-name-box');
  if(nameBox)nameBox.textContent=selectedCell;
  if(scroll)cell.scrollIntoView({block:'nearest',inline:'nearest'});
  return true;
}
function normalizeSelection(){
  const win=excelWindow();
  if(!win)return false;
  const current=win.querySelector('.excel-cell.is-selected')||visibleCell(selectedCell)||visibleCell('F2')||win.querySelector('.excel-cell');
  if(current)setSelected(current,{scroll:false});
  if(!gridBound){
    gridBound=true;
    win.addEventListener('click',e=>{
      const cell=e.target.closest('.excel-cell[data-cell]');
      if(cell)setSelected(cell);
    },true);
  }
  return !!current;
}
function addressParts(address){
  const m=/^([A-Z]+)(\d+)$/.exec(address||'');
  if(!m)return null;
  const col=m[1].charCodeAt(0)-65;
  const row=parseInt(m[2],10);
  return{col,row};
}
function moveSelection(dx,dy){
  if(!normalizeSelection())return;
  const p=addressParts(selectedCell);if(!p)return;
  const cols=['A','B','C','D','E','F'];
  let col=Math.max(0,Math.min(cols.length-1,p.col+dx));
  let row=Math.max(1,Math.min(19,p.row+dy));

  // Skip rows that are intentionally hidden by the story checkpoint.
  const step=dy===0?0:(dy>0?1:-1);
  let candidate=`${cols[col]}${row}`;
  let guard=0;
  while(!visibleCell(candidate)&&step&&guard++<20){
    row+=step;
    if(row<1||row>19)return;
    candidate=`${cols[col]}${row}`;
  }
  const cell=visibleCell(candidate);
  if(cell)setSelected(cell);
}
function searchIsOpen(){
  const box=excelWindow()?.querySelector('.s3-direct-search');
  return !!box&&!box.hidden;
}
function showMoveToF2Hint(){
  if(!help)return;
  help.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> перейти до <b>F2</b></span><span><kbd>ESC</kbd> пауза</span>';
}

window.addEventListener('keydown',e=>{
  if(e.repeat||e.key==='Escape')return;
  const win=excelWindow();
  if(!win)return;
  if(scene?.classList.contains('s3-scene1-focus'))return; // Поля говорить — Excel ще не активний.
  if(searchIsOpen())return; // Ctrl+F має власний ввід.

  const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  const dir=arrows[e.key];
  if(dir){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    moveSelection(dir[0],dir[1]);
    return;
  }

  // У цій сцені формула повинна вводитися саме у F2. Не дозволяємо
  // випадково набрати її в іншій клітинці — спочатку навігація стрілками.
  if(selectedCell!=='F2'&&!e.ctrlKey&&!e.metaKey&&(e.key==='Enter'||e.key==='Backspace'||e.key.length===1)){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showMoveToF2Hint();
  }
},true);

const gridPoll=setInterval(()=>{
  syncClock();
  if(normalizeSelection())clearInterval(gridPoll);
},80);
setTimeout(()=>clearInterval(gridPoll),10000);
})();
