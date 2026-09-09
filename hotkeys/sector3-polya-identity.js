(()=>{
'use strict';
if(window.VIDLIK_POLYA_IDENTITY)return;

const POLYA_NAME='Поля';
const AVATAR='assets/sector3-prologue/polya-01.webp';
const params=new URLSearchParams(location.search);
const DIRECT_SCENE_1=(parseInt(params.get('storyScene')||'0',10)||0)===1;

const style=document.createElement('style');
style.id='vidlik-polya-identity-style';
style.textContent=`
.admin-header[data-polya-identity="true"] .admin-header-avatar{
  background:linear-gradient(180deg,rgba(255,92,112,.05),rgba(0,0,0,.14)),url('${AVATAR}') 50% 22%/cover no-repeat!important;
  border-color:rgba(255,92,112,.9)!important;
  box-shadow:0 0 0 1px rgba(255,92,112,.16),0 0 16px rgba(255,92,112,.2),inset 0 0 10px rgba(0,0,0,.12)!important;
}
.admin-header[data-polya-identity="true"] .admin-header-avatar::before,
.admin-header[data-polya-identity="true"] .admin-header-avatar::after{display:none!important}
.admin-header[data-polya-identity="true"] .admin-header-name{color:#ff7183!important;text-transform:none!important}
.admin-header[data-polya-identity="true"] .admin-online{color:#ff8a98!important}
.admin-header[data-polya-identity="true"] .admin-online i{background:#ff5c70!important;box-shadow:0 0 7px rgba(255,92,112,.75)!important}
.admin-message.is-polya .admin-bubble-name,.caption b[data-polya-identity="true"]{text-transform:none!important}
`;
document.head.appendChild(style);

const isPolyaLabel=text=>/^поля$/iu.test(String(text||'').trim());
let scheduled=false;

function normalizeIdentity(){
  const header=document.querySelector('.admin-header');
  if(header){
    const name=header.querySelector('.admin-header-name');
    const isPolya=header.classList.contains('excel-polya-channel')||isPolyaLabel(name?.textContent);
    if(isPolya){
      if(header.dataset.polyaIdentity!=='true')header.dataset.polyaIdentity='true';
      if(name&&name.textContent!==POLYA_NAME)name.textContent=POLYA_NAME;
    }else if(header.dataset.polyaIdentity){
      delete header.dataset.polyaIdentity;
    }
  }

  document.querySelectorAll('.admin-bubble-name').forEach(el=>{
    if(isPolyaLabel(el.textContent)&&el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME;
  });
  document.querySelectorAll('.caption b').forEach(el=>{
    if(!isPolyaLabel(el.textContent))return;
    if(el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME;
    if(el.dataset.polyaIdentity!=='true')el.dataset.polyaIdentity='true';
  });
  const footer=document.querySelector('.admin-footer');
  if(footer&&/^поля\s*·/iu.test(footer.textContent||''))footer.textContent=footer.textContent.replace(/^поля/iu,POLYA_NAME);
}

function scheduleNormalize(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;normalizeIdentity()});
}

/* Direct Scene 01 deliberately does not load the old prologue runtime, so it
   needs two tiny pieces of desktop behavior here: live local time and Excel
   arrow navigation. Keeping them isolated avoids bringing legacy tutorials
   back into the checkpoint. */
function syncDirectClock(){
  if(!DIRECT_SCENE_1)return;
  const clock=document.getElementById('desktopClock');
  if(!clock)return;
  clock.textContent=new Date().toLocaleTimeString('uk-UA',{
    hour:'2-digit',minute:'2-digit',hour12:false
  });
}
function directExcelWindow(){
  if(!DIRECT_SCENE_1)return null;
  const win=document.querySelector('.s3-direct-window');
  if(!win||win.style.display==='none'||win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return null;
  return win;
}
function directSelectCell(cell){
  const win=directExcelWindow();
  if(!win||!cell)return;
  win.querySelectorAll('.excel-cell.is-selected').forEach(el=>el.classList.remove('is-selected'));
  cell.classList.add('is-selected');
  const address=cell.dataset.cell||'';
  const box=win.querySelector('.excel-name-box');
  if(box&&address)box.textContent=address;
  cell.scrollIntoView({block:'nearest',inline:'nearest'});
}
function directMoveCell(dx,dy){
  const win=directExcelWindow();if(!win)return;
  const current=win.querySelector('.excel-cell.is-selected')||win.querySelector('[data-cell="F2"]')||win.querySelector('.excel-cell[data-cell]');
  if(!current)return;
  const m=/^([A-F])(\d+)$/.exec(current.dataset.cell||'');if(!m)return;
  const cols=['A','B','C','D','E','F'];
  let ci=cols.indexOf(m[1]);
  let row=parseInt(m[2],10);
  ci=Math.max(0,Math.min(cols.length-1,ci+dx));
  row=Math.max(1,Math.min(19,row+dy));
  const step=dy===0?0:(dy>0?1:-1);
  let guard=0;
  while(guard++<20){
    const cell=win.querySelector(`[data-cell="${cols[ci]}${row}"]`);
    const rowEl=cell?.closest('.excel-row');
    if(cell&&(!rowEl||getComputedStyle(rowEl).display!=='none')){directSelectCell(cell);return}
    if(!step)return;
    row+=step;
    if(row<1||row>19)return;
  }
}

if(DIRECT_SCENE_1){
  syncDirectClock();
  const directClockTimer=setInterval(syncDirectClock,5000);
  window.addEventListener('pagehide',()=>clearInterval(directClockTimer),{once:true});

  document.addEventListener('click',e=>{
    const cell=e.target.closest('.s3-direct-window .excel-cell[data-cell]');
    if(cell)directSelectCell(cell);
  },true);

  window.addEventListener('keydown',e=>{
    if(e.repeat||e.key==='Escape')return;
    const win=directExcelWindow();if(!win)return;
    if(document.getElementById('scene')?.classList.contains('s3-scene1-focus'))return;
    const search=win.querySelector('.s3-direct-search');
    if(search&&!search.hidden)return;
    const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const d=dirs[e.key];if(!d)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    directMoveCell(d[0],d[1]);
  },true);
}

normalizeIdentity();
/* Only DOM/text additions are observed. Class-attribute mutations are deliberately
   excluded so the normalizer can never participate in a class-mutation feedback loop. */
const observer=new MutationObserver(scheduleNormalize);
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
window.addEventListener('vidlik:os-reset',scheduleNormalize);
window.VIDLIK_POLYA_IDENTITY={normalize:normalizeIdentity,name:POLYA_NAME,avatar:AVATAR};
})();