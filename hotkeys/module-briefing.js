(()=>{
'use strict';
const DATA=window.VIDLIK_MODULE_BRIEFINGS||{};
const qs=new URLSearchParams(location.search);
const sector=Math.min(8,Math.max(1,parseInt(qs.get('sector')||'1',10)||1));
const cfg=DATA[sector];
const screen=document.getElementById('mbf-screen');
if(!cfg||!screen){location.href='desktop-sectors.html?v=14';return}

const STORE='vidlik-hotkeys-desktop-sectors-v1';
let profile={};try{profile=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){}
const completed=sector===1?0:(Array.isArray(profile[sector])?profile[sector].length:0);
const pct=Math.max(0,Math.min(100,Math.round(completed/10*100)));

screen.style.backgroundImage='url("/hotkeys/assets/backgrounds/sectors-board.webp")';
const art=document.getElementById('mbf-art');
art.src=cfg.image;
art.alt=`Сектор ${String(sector).padStart(2,'0')} — ${cfg.title}`;
art.onload=()=>screen.classList.add('mbf-art-ready');
art.onerror=()=>{
  screen.classList.add('mbf-art-missing');
  art.removeAttribute('src');
  art.alt='';
};
document.getElementById('mbf-kicker').textContent=`VIDLIK · СЕКТОР ${String(sector).padStart(2,'0')}`;
document.getElementById('mbf-title').textContent=cfg.title;
document.getElementById('mbf-summary').textContent=cfg.summary;
document.getElementById('mbf-progress').textContent=sector===1?'—':`${pct}%`;
document.getElementById('mbf-levels').textContent='10 РІВНІВ';
document.getElementById('mbf-action-label').textContent=pct>0?'ПРОДОВЖИТИ':'РОЗПОЧАТИ';
const topics=document.getElementById('mbf-topics');
(cfg.topics||[]).slice(0,5).forEach((text,i)=>{const li=document.createElement('li');li.textContent=`${String(i+1).padStart(2,'0')} · ${text}`;topics.appendChild(li)});

let leaving=false;
function goBack(){if(leaving)return;leaving=true;screen.classList.add('mbf-leaving');setTimeout(()=>location.href='desktop-sectors.html?v=14',360)}
function goForward(){if(leaving)return;leaving=true;screen.classList.add('mbf-leaving');const target=cfg.target||(sector===1?'sector1.html?v=1':`desktop-sectors.html?directSector=${sector}&v=14`);setTimeout(()=>location.href=target,360)}

document.getElementById('mbf-back').addEventListener('click',goBack);
screen.addEventListener('click',e=>{if(e.target.closest('#mbf-back'))return;goForward()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();goBack();return}
  if(e.key==='Enter'){e.preventDefault();goForward()}
});
})();