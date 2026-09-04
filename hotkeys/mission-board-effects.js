(()=>{
'use strict';
const APP=document.getElementById('ds-app');
if(!APP)return;

let scanRAF=0,shadowRAF=0,boardObserver=null;

function focusOpeningCard(board){
  const card=board.querySelector('.mb-opening-card');
  if(!card)return;
  const br=board.getBoundingClientRect(),r=card.getBoundingClientRect();
  const x=((r.left+r.width/2-br.left)/Math.max(1,br.width))*100;
  const y=((r.top+r.height/2-br.top)/Math.max(1,br.height))*100;
  board.style.setProperty('--mb-focus-x',`${x.toFixed(2)}%`);
  board.style.setProperty('--mb-focus-y',`${y.toFixed(2)}%`);
}

/* Shadow-only parallax: dossier positions and approved thread geometry never move. */
function bindShadowParallax(board){
  if(board.dataset.mbShadowBound)return;
  board.dataset.mbShadowBound='1';
  board.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    cancelAnimationFrame(shadowRAF);
    shadowRAF=requestAnimationFrame(()=>{
      const r=board.getBoundingClientRect();
      const nx=(e.clientX-r.left)/Math.max(1,r.width)-.5;
      const ny=(e.clientY-r.top)/Math.max(1,r.height)-.5;
      const sx=-nx*5.2;
      const sy=15-ny*3.6;
      board.querySelectorAll('.mb-folder').forEach((card,i)=>{
        const depth=.90+(i%4)*.025;
        card.style.setProperty('--mb-shadow-x',`${(sx*depth).toFixed(2)}px`);
        card.style.setProperty('--mb-shadow-y',`${(sy*depth).toFixed(2)}px`);
      });
    });
  },{passive:true});
  board.addEventListener('pointerleave',()=>{
    board.querySelectorAll('.mb-folder').forEach(card=>{
      card.style.setProperty('--mb-shadow-x','0px');
      card.style.setProperty('--mb-shadow-y','15px');
    });
  },{passive:true});
}

function bindOpeningObserver(board){
  if(board.dataset.mbOpeningObserver==='1')return;
  board.dataset.mbOpeningObserver='1';
  if(boardObserver)boardObserver.disconnect();
  boardObserver=new MutationObserver(mutations=>{
    let refocus=false;
    for(const m of mutations){
      if(m.type!=='attributes')continue;
      const el=m.target;
      if(el instanceof Element&&(el.classList.contains('mb-board')||el.classList.contains('mb-folder')))refocus=true;
    }
    if(refocus)requestAnimationFrame(()=>focusOpeningCard(board));
  });
  boardObserver.observe(board,{subtree:true,attributes:true,attributeFilter:['class']});
}

function enhance(){
  const board=APP.querySelector('.mb-board');
  if(!board)return;
  if(!board.querySelector('.mb-cinematic-shade')){
    const shade=document.createElement('div');
    shade.className='mb-cinematic-shade';
    shade.setAttribute('aria-hidden','true');
    board.appendChild(shade);
  }
  bindShadowParallax(board);
  bindOpeningObserver(board);
  focusOpeningCard(board);
}
function scan(){cancelAnimationFrame(scanRAF);scanRAF=requestAnimationFrame(enhance)}

const rootObserver=new MutationObserver(scan);
rootObserver.observe(APP,{subtree:true,childList:true});
window.addEventListener('resize',scan,{passive:true});
scan();
})();
