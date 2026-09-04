(()=>{
'use strict';
const APP=document.getElementById('ds-app');
if(!APP)return;

let boardObserver=null,scanRAF=0,shadowRAF=0,introTimer=0;
const NS='http://www.w3.org/2000/svg';

function cubicParts(d){
  const nums=(d||'').match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
  if(nums.length<8)return null;
  return{x1:nums[0],y1:nums[1],c1x:nums[2],c1y:nums[3],c2x:nums[4],c2y:nums[5],x2:nums[6],y2:nums[7]};
}
function tightPath(d){
  const p=cubicParts(d);if(!p)return d;
  const dx=p.x2-p.x1;
  const curve=Math.max(17,Math.abs(dx)*.105);
  return`M ${p.x1.toFixed(1)} ${p.y1.toFixed(1)} C ${(p.x1+curve).toFixed(1)} ${p.y1.toFixed(1)}, ${(p.x2-curve).toFixed(1)} ${p.y2.toFixed(1)}, ${p.x2.toFixed(1)} ${p.y2.toFixed(1)}`;
}
function rememberThread(path){
  if(!(path instanceof SVGPathElement)||!path.classList.contains('mb-string'))return;
  if(!path.dataset.mbBaseD){
    const d=path.getAttribute('d')||'';
    path.dataset.mbBaseD=d;
    path.dataset.mbTightD=tightPath(d);
  }
}
function morphThread(path,hot){
  rememberThread(path);
  const wanted=hot?path.dataset.mbTightD:path.dataset.mbBaseD;
  if(!wanted)return;
  path.querySelectorAll('animate[data-mb-tension]').forEach(a=>a.remove());
  const from=path.getAttribute('d')||wanted;
  if(from===wanted)return;
  try{
    const anim=document.createElementNS(NS,'animate');
    anim.dataset.mbTension='1';
    anim.setAttribute('attributeName','d');
    anim.setAttribute('from',from);
    anim.setAttribute('to',wanted);
    anim.setAttribute('dur','.20s');
    anim.setAttribute('fill','freeze');
    path.appendChild(anim);
    anim.beginElement();
    setTimeout(()=>{if(path.isConnected){path.setAttribute('d',wanted);anim.remove()}},220);
  }catch(e){path.setAttribute('d',wanted)}
}
function syncTension(board){
  board.querySelectorAll('.mb-string').forEach(p=>morphThread(p,p.classList.contains('hot')));
}

function focusOpeningCard(board){
  const card=board.querySelector('.mb-opening-card');if(!card)return;
  const br=board.getBoundingClientRect(),r=card.getBoundingClientRect();
  const x=((r.left+r.width/2-br.left)/Math.max(1,br.width))*100;
  const y=((r.top+r.height/2-br.top)/Math.max(1,br.height))*100;
  board.style.setProperty('--mb-focus-x',`${x.toFixed(2)}%`);
  board.style.setProperty('--mb-focus-y',`${y.toFixed(2)}%`);
}

function scheduleThreadIntro(board){
  if(board.dataset.mbThreadIntro==='done')return;
  clearTimeout(introTimer);
  introTimer=setTimeout(()=>{
    if(!board.isConnected||board.dataset.mbThreadIntro==='done')return;
    const paths=[...board.querySelectorAll('.mb-string')];
    if(!paths.length)return;
    board.dataset.mbThreadIntro='done';
    paths.forEach((p,i)=>{
      rememberThread(p);
      p.style.strokeDasharray='1';
      p.style.strokeDashoffset='1';
      const a=p.animate(
        [{strokeDashoffset:'1',opacity:.10},{strokeDashoffset:'0',opacity:p.classList.contains('hot')?1:.36}],
        {duration:720,delay:i*82,easing:'cubic-bezier(.22,.72,.24,1)',fill:'forwards'}
      );
      a.finished.then(()=>{
        if(!p.isConnected)return;
        p.style.strokeDashoffset='0';
        p.style.strokeDasharray='none';
        p.style.opacity='';
      }).catch(()=>{});
    });
  },1850);
}

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
      const sx=(-nx*7).toFixed(2);
      const sy=(15-ny*5).toFixed(2);
      board.querySelectorAll('.mb-folder').forEach((card,i)=>{
        const depth=.88+(i%4)*.04;
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

function attachBoardObserver(board){
  if(boardObserver)boardObserver.disconnect();
  boardObserver=new MutationObserver(mutations=>{
    let needsTension=false,needsIntro=false,needsFocus=false;
    for(const m of mutations){
      if(m.type==='attributes'){
        if(m.target instanceof SVGPathElement&&m.target.classList.contains('mb-string'))needsTension=true;
        if(m.target instanceof Element&&(m.target.classList.contains('mb-opening-card')||m.target.classList.contains('mb-board')))needsFocus=true;
      }
      if(m.type==='childList'){
        m.addedNodes.forEach(node=>{
          if(!(node instanceof Element))return;
          if(node.matches?.('.mb-string')||node.querySelector?.('.mb-string')){needsIntro=true;needsTension=true}
          if(node.matches?.('.mb-opening-card')||node.querySelector?.('.mb-opening-card'))needsFocus=true;
        });
      }
    }
    if(needsTension)requestAnimationFrame(()=>syncTension(board));
    if(needsIntro)scheduleThreadIntro(board);
    if(needsFocus)requestAnimationFrame(()=>focusOpeningCard(board));
  });
  boardObserver.observe(board,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}

function enhance(){
  const board=APP.querySelector('.mb-board');if(!board)return;
  if(!board.querySelector('.mb-cinematic-shade')){
    const shade=document.createElement('div');shade.className='mb-cinematic-shade';shade.setAttribute('aria-hidden','true');board.appendChild(shade);
  }
  bindShadowParallax(board);
  if(board.dataset.mbEffectsBound!=='1'){
    board.dataset.mbEffectsBound='1';
    attachBoardObserver(board);
  }
  board.querySelectorAll('.mb-string').forEach(rememberThread);
  syncTension(board);
  scheduleThreadIntro(board);
  focusOpeningCard(board);
}
function scan(){cancelAnimationFrame(scanRAF);scanRAF=requestAnimationFrame(enhance)}

const rootObserver=new MutationObserver(scan);
rootObserver.observe(APP,{subtree:true,childList:true});
window.addEventListener('resize',scan,{passive:true});
scan();
})();
