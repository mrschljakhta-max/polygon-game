(()=>{
'use strict';
const DATA=window.VIDLIK_MODULE_BRIEFINGS||{};
const LAYOUTS=window.VIDLIK_MODULE_LAYOUTS||{};
const qs=new URLSearchParams(location.search);
const sector=Math.min(8,Math.max(1,parseInt(qs.get('sector')||'1',10)||1));
const cfg=DATA[sector],layout=LAYOUTS[sector];
const screen=document.getElementById('mbf-screen');
if(!cfg||!layout||!screen){location.href='desktop-sectors.html?v=14';return}
screen.classList.add('mbf-v3',`mbf-sector-${sector}`);

const levels=Array.isArray(cfg.levels)?cfg.levels.slice(0,10):[];
while(levels.length<10)levels.push(`Рівень ${String(levels.length+1).padStart(2,'0')}`);
function readCompleted(){
  if(sector===1){try{const p=JSON.parse(localStorage.getItem('vidlik-hotkeys-profile-v2')||'{}')||{};return Array.isArray(p.completed)?p.completed.map(Number).filter(n=>n>=1&&n<=10):[]}catch(e){return[]}}
  try{const p=JSON.parse(localStorage.getItem('vidlik-hotkeys-desktop-sectors-v1')||'{}')||{};return Array.isArray(p[sector])?p[sector].map(Number).filter(n=>n>=1&&n<=10):[]}catch(e){return[]}
}
const completedSet=new Set(readCompleted()),completed=Math.min(10,completedSet.size),pct=Math.round(completed/10*100);
const firstOpenIndex=levels.findIndex((_,i)=>!completedSet.has(i+1)),nextLevel=firstOpenIndex>=0?firstOpenIndex+1:10;
let page=nextLevel>5?1:0,leaving=false,pageTimer=0;

screen.style.backgroundImage='url("/hotkeys/assets/backgrounds/sectors-board.webp")';
const shell=document.querySelector('.mbf-shell'),art=document.getElementById('mbf-art'),stamp=document.getElementById('mbf-stamp');
const f=layout.folder;
shell.style.setProperty('--folder-x',`${f.xPct}%`);
shell.style.setProperty('--folder-y',`${f.yPct}%`);
shell.style.setProperty('--folder-w',`${f.widthPct}%`);
shell.style.setProperty('--folder-aspect',`${f.sourceW||f.actualW||1951}/${f.sourceH||f.actualH||806}`);
art.setAttribute('aria-label',`Сектор ${String(sector).padStart(2,'0')} — ${cfg.title}`);

function setBox(el,r){
  if(!el||!r)return;
  const angle=`${Number(r.angleDeg)||0}deg`;
  el.style.left=r.xPct+'%';
  el.style.top=r.yPct+'%';
  el.style.width=r.widthPct+'%';
  el.style.height=r.heightPct+'%';
  el.style.setProperty('--mbf-rotate',angle);
  el.style.transform=`rotate(var(--mbf-rotate))`;
  el.style.zIndex=String(r.z||1);
}
setBox(document.querySelector('.mbf-title'),layout.title);
setBox(document.getElementById('mbf-page-toggle'),layout.pageToggle);
setBox(document.querySelector('.mbf-summary'),layout.summary);
setBox(document.querySelector('.mbf-progress-wrap'),layout.progress);
setBox(document.querySelector('.mbf-stat'),layout.stat);
setBox(stamp,layout.stamp);

function loadArt(path){
  return new Promise(resolve=>{
    if(!path){resolve(false);return}
    const img=new Image();
    img.onload=()=>{
      if(img.naturalWidth>0&&img.naturalHeight>0){
        shell.style.setProperty('--folder-aspect',`${img.naturalWidth}/${img.naturalHeight}`);
        shell.dataset.naturalWidth=String(img.naturalWidth);
        shell.dataset.naturalHeight=String(img.naturalHeight);
      }
      art.style.backgroundImage=`url("${path}")`;
      resolve(true);
    };
    img.onerror=()=>resolve(false);
    img.src=path;
  });
}
(async()=>{
  const ok=await loadArt(cfg.image);
  screen.classList.add(ok?'mbf-art-ready':'mbf-art-missing');
})();
if(stamp&&cfg.stamp&&completed===10){
  stamp.src=cfg.stamp;
  stamp.addEventListener('error',()=>{stamp.style.display='none'},{once:true});
  screen.classList.add('mbf-complete');
}

document.getElementById('mbf-kicker').textContent=`VIDLIK · СЕКТОР ${String(sector).padStart(2,'0')}`;
document.getElementById('mbf-title').textContent=cfg.title;
document.getElementById('mbf-progress').textContent=`${pct}%`;
document.getElementById('mbf-levels').textContent=`${completed} / 10`;
document.getElementById('mbf-progress-fill').style.width=`${pct}%`;
document.getElementById('mbf-action-label').textContent=completed>0?'ПРОДОВЖИТИ':'РОЗПОЧАТИ';

const list=document.getElementById('mbf-levels-list'),pageHeading=document.getElementById('mbf-page-heading'),summaryEl=document.getElementById('mbf-summary'),pageLabel=document.getElementById('mbf-page-label'),prevBtn=document.getElementById('mbf-prev-page'),nextBtn=document.getElementById('mbf-next-page'),pageToggle=document.getElementById('mbf-page-toggle');
function levelState(n){if(completedSet.has(n))return'done';if(n===nextLevel)return'current';if(n===1||completedSet.has(n-1))return'open';return'locked'}
function digitIcon(n){
  const icon=document.createElement('span');icon.className='mbf-level-icon';
  const fallback=document.createElement('span');fallback.className='mbf-number-fallback';fallback.textContent=String(n).padStart(2,'0');icon.appendChild(fallback);
  if(!cfg.numberIconsBase)return icon;
  const digits=String(n).padStart(2,'0').split('');let loaded=0,failed=false;const imgs=[];
  digits.forEach(d=>{const img=document.createElement('img');img.className='mbf-digit';img.alt='';img.src=`${cfg.numberIconsBase}number-${d}-small.svg`;img.onload=()=>{loaded++;if(!failed&&loaded===digits.length)icon.classList.add('has-digit-art')};img.onerror=()=>{failed=true;imgs.forEach(x=>x.remove());icon.classList.remove('has-digit-art')};imgs.push(img);icon.appendChild(img)});
  return icon;
}
function updateSummary(){
  if(completed===10){pageHeading.textContent='МОДУЛЬ ЗАВЕРШЕНО';summaryEl.textContent=cfg.summary;return}
  pageHeading.textContent=`ПОТОЧНИЙ РІВЕНЬ ${String(nextLevel).padStart(2,'0')}`;
  const custom=Array.isArray(cfg.levelSummaries)?cfg.levelSummaries[nextLevel-1]:'';
  summaryEl.textContent=custom||cfg.summary;
}
function renderPage(){
  const start=page*5;list.innerHTML='';
  levels.slice(start,start+5).forEach((title,i)=>{
    const n=start+i+1,state=levelState(n),li=document.createElement('li');li.className=`mbf-level is-${state}`;li.dataset.level=String(n);
    const icon=digitIcon(n),text=document.createElement('span'),check=document.createElement('span');
    text.className='mbf-level-text';text.textContent=title;check.className='mbf-level-check';
    setBox(icon,layout.numberSlots[i]);setBox(text,layout.textSlots[i]);setBox(check,layout.checkSlots[i]);
    li.append(icon,text,check);list.appendChild(li);
  });
  pageLabel.textContent=`${page+1} / 2`;prevBtn.disabled=page===0;nextBtn.disabled=page===1;
  if(pageToggle){
    if(page===0){
      pageToggle.innerHTML='<span class="mbf-page-toggle-label">ДАЛІ →</span><span class="mbf-page-toggle-range">06–10</span>';
      pageToggle.setAttribute('aria-label','Далі, рівні 06–10');
    }else{
      pageToggle.innerHTML='<span class="mbf-page-toggle-label">← НАЗАД</span><span class="mbf-page-toggle-range">01–05</span>';
      pageToggle.setAttribute('aria-label','Назад, рівні 01–05');
    }
  }
  updateSummary();
}
function changePage(next){
  next=Math.max(0,Math.min(1,next));if(next===page)return;
  clearTimeout(pageTimer);const direction=next>page?-8:8;
  list.style.setProperty('--page-shift',`${direction}px`);list.classList.add('is-changing');
  pageTimer=setTimeout(()=>{page=next;renderPage();requestAnimationFrame(()=>list.classList.remove('is-changing'))},110);
}
renderPage();
function goBack(){if(leaving)return;leaving=true;screen.classList.add('mbf-leaving');setTimeout(()=>location.href='desktop-sectors.html?v=14',360)}
function goForward(){if(leaving)return;leaving=true;screen.classList.add('mbf-leaving');const target=cfg.target||(sector===1?'sector1.html?v=1':`desktop-sectors.html?directSector=${sector}&v=14`);setTimeout(()=>location.href=target,360)}
document.getElementById('mbf-back').addEventListener('click',e=>{e.stopPropagation();goBack()});
prevBtn.addEventListener('click',e=>{e.stopPropagation();changePage(0)});
nextBtn.addEventListener('click',e=>{e.stopPropagation();changePage(1)});
if(pageToggle)pageToggle.addEventListener('click',e=>{e.stopPropagation();changePage(page===0?1:0)});
screen.addEventListener('click',e=>{if(e.target.closest('#mbf-back,.mbf-page-nav,#mbf-page-toggle'))return;goForward()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();goBack();return}
  if(e.key==='ArrowLeft'){e.preventDefault();changePage(page-1);return}
  if(e.key==='ArrowRight'){e.preventDefault();changePage(page+1);return}
  if(e.key==='PageUp'){e.preventDefault();changePage(0);return}
  if(e.key==='PageDown'){e.preventDefault();changePage(1);return}
  if(e.key==='Enter'){e.preventDefault();goForward()}
});
})();