(()=>{
'use strict';
const DATA=window.VIDLIK_MODULE_BRIEFINGS||{};
const qs=new URLSearchParams(location.search);
const sector=Math.min(8,Math.max(1,parseInt(qs.get('sector')||'1',10)||1));
const cfg=DATA[sector];
const screen=document.getElementById('mbf-screen');
if(!cfg||!screen){location.href='desktop-sectors.html?v=14';return}

const isV2=sector===1;
if(isV2) screen.classList.add('mbf-v2');

const levels=Array.isArray(cfg.levels)?cfg.levels.slice(0,10):[];
while(levels.length<10) levels.push(`Рівень ${String(levels.length+1).padStart(2,'0')}`);

function readCompleted(){
  if(sector===1){
    try{
      const p=JSON.parse(localStorage.getItem('vidlik-hotkeys-profile-v2')||'{}')||{};
      return Array.isArray(p.completed)?p.completed.map(Number).filter(n=>n>=1&&n<=10):[];
    }catch(e){return[]}
  }
  try{
    const p=JSON.parse(localStorage.getItem('vidlik-hotkeys-desktop-sectors-v1')||'{}')||{};
    return Array.isArray(p[sector])?p[sector].map(Number).filter(n=>n>=1&&n<=10):[];
  }catch(e){return[]}
}

const completedSet=new Set(readCompleted());
const completed=Math.min(10,completedSet.size);
const pct=Math.round(completed/10*100);
const firstOpenIndex=levels.findIndex((_,i)=>!completedSet.has(i+1));
const nextLevel=firstOpenIndex>=0?firstOpenIndex+1:10;
let page=nextLevel>5?1:0;
let leaving=false;
let pageTimer=0;

screen.style.backgroundImage='url("/hotkeys/assets/backgrounds/sectors-board.webp")';
const art=document.getElementById('mbf-art');
const stamp=document.getElementById('mbf-stamp');
art.setAttribute('aria-label',`Сектор ${String(sector).padStart(2,'0')} — ${cfg.title}`);

function loadArt(path){
  return new Promise(resolve=>{
    if(!path){resolve(false);return}
    const img=new Image();
    img.onload=()=>{
      art.style.backgroundImage=`url("${path}")`;
      art.style.backgroundSize='100% 100%';
      art.style.backgroundPosition='center';
      resolve(true);
    };
    img.onerror=()=>resolve(false);
    img.src=path;
  });
}
function useSprite(){
  return new Promise(resolve=>{
    const sprite='/hotkeys/assets/module-briefings/module-briefings.webp';
    const img=new Image();
    img.onload=()=>{
      art.style.backgroundImage=`url("${sprite}")`;
      art.style.backgroundSize='100% 800%';
      art.style.backgroundPosition=`center ${((sector-1)/7*100).toFixed(4)}%`;
      resolve(true);
    };
    img.onerror=()=>resolve(false);
    img.src=sprite;
  });
}
(async()=>{
  let ok=await loadArt(cfg.image);
  if(!ok&&cfg.fallbackImage) ok=await loadArt(cfg.fallbackImage);
  if(!ok&&!isV2) ok=await useSprite();
  screen.classList.add(ok?'mbf-art-ready':'mbf-art-missing');
})();

if(stamp&&isV2&&cfg.stamp&&completed===10){
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

const list=document.getElementById('mbf-levels-list');
const pageHeading=document.getElementById('mbf-page-heading');
const summaryEl=document.getElementById('mbf-summary');
const pageLabel=document.getElementById('mbf-page-label');
const prevBtn=document.getElementById('mbf-prev-page');
const nextBtn=document.getElementById('mbf-next-page');
const pageToggle=document.getElementById('mbf-page-toggle');

function levelState(levelNumber){
  if(completedSet.has(levelNumber)) return 'done';
  if(levelNumber===nextLevel) return 'current';
  if(levelNumber===1||completedSet.has(levelNumber-1)) return 'open';
  return 'locked';
}

function digitIcon(levelNumber){
  const icon=document.createElement('span');
  icon.className='mbf-level-icon';

  const fallback=document.createElement('span');
  fallback.className='mbf-number-fallback';
  fallback.textContent=String(levelNumber).padStart(2,'0');
  icon.appendChild(fallback);

  if(!isV2||!cfg.numberIconsBase) return icon;

  const digits=String(levelNumber).padStart(2,'0').split('');
  let loaded=0;
  let failed=false;
  const imgs=[];
  digits.forEach(d=>{
    const img=document.createElement('img');
    img.className='mbf-digit';
    img.alt='';
    img.src=`${cfg.numberIconsBase}number-${d}-small.svg`;
    img.onload=()=>{
      loaded+=1;
      if(!failed&&loaded===digits.length) icon.classList.add('has-digit-art');
    };
    img.onerror=()=>{
      failed=true;
      imgs.forEach(x=>x.remove());
      icon.classList.remove('has-digit-art');
    };
    imgs.push(img);
    icon.appendChild(img);
  });
  return icon;
}

function updateSummary(){
  if(!isV2){
    summaryEl.textContent=cfg.summary;
    return;
  }
  if(completed===10){
    pageHeading.textContent='МОДУЛЬ ЗАВЕРШЕНО';
    summaryEl.textContent=cfg.summary;
    return;
  }
  pageHeading.textContent=`ПОТОЧНИЙ РІВЕНЬ ${String(nextLevel).padStart(2,'0')}`;
  const custom=Array.isArray(cfg.levelSummaries)?cfg.levelSummaries[nextLevel-1]:'';
  summaryEl.textContent=custom||cfg.summary;
}

function renderPage(){
  const start=page*5;
  list.innerHTML='';

  levels.slice(start,start+5).forEach((title,i)=>{
    const levelNumber=start+i+1;
    const state=levelState(levelNumber);
    const li=document.createElement('li');
    li.className=`mbf-level is-${state}`;
    li.dataset.level=String(levelNumber);

    const icon=digitIcon(levelNumber);
    const text=document.createElement('span');
    text.className='mbf-level-text';
    text.textContent=title;

    li.append(icon,text);
    list.appendChild(li);
  });

  const a=String(start+1).padStart(2,'0');
  const b=String(start+5).padStart(2,'0');
  if(!isV2) pageHeading.textContent=`РІВНІ ${a}–${b}`;
  pageLabel.textContent=`${page+1} / 2`;
  prevBtn.disabled=page===0;
  nextBtn.disabled=page===1;
  prevBtn.setAttribute('aria-label','Показати рівні 1–5');
  nextBtn.setAttribute('aria-label','Показати рівні 6–10');
  if(pageToggle){
    pageToggle.textContent=page===0?'ДАЛІ 06–10 →':'← НАЗАД 01–05';
    pageToggle.setAttribute('aria-label',page===0?'Показати рівні 6–10':'Показати рівні 1–5');
  }
  updateSummary();
}

function changePage(next){
  next=Math.max(0,Math.min(1,next));
  if(next===page)return;
  clearTimeout(pageTimer);
  const direction=next>page?-8:8;
  list.style.setProperty('--page-shift',`${direction}px`);
  list.classList.add('is-changing');
  pageTimer=setTimeout(()=>{
    page=next;
    renderPage();
    requestAnimationFrame(()=>list.classList.remove('is-changing'));
  },110);
}

renderPage();

function goBack(){
  if(leaving)return;
  leaving=true;
  screen.classList.add('mbf-leaving');
  setTimeout(()=>location.href='desktop-sectors.html?v=14',360);
}
function goForward(){
  if(leaving)return;
  leaving=true;
  screen.classList.add('mbf-leaving');
  const target=cfg.target||(sector===1?'sector1.html?v=1':`desktop-sectors.html?directSector=${sector}&v=14`);
  setTimeout(()=>location.href=target,360);
}

document.getElementById('mbf-back').addEventListener('click',e=>{e.stopPropagation();goBack()});
prevBtn.addEventListener('click',e=>{e.stopPropagation();changePage(0)});
nextBtn.addEventListener('click',e=>{e.stopPropagation();changePage(1)});
if(pageToggle) pageToggle.addEventListener('click',e=>{e.stopPropagation();changePage(page===0?1:0)});

screen.addEventListener('click',e=>{
  if(e.target.closest('#mbf-back,.mbf-page-nav,#mbf-page-toggle'))return;
  goForward();
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();goBack();return}
  if(e.key==='ArrowLeft'){e.preventDefault();changePage(page-1);return}
  if(e.key==='ArrowRight'){e.preventDefault();changePage(page+1);return}
  if(e.key==='PageUp'){e.preventDefault();changePage(0);return}
  if(e.key==='PageDown'){e.preventDefault();changePage(1);return}
  if(e.key==='Enter'){e.preventDefault();goForward()}
});
})();