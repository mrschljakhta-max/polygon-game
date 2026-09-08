(()=>{
'use strict';
if(window.__VIDLIK_EXCEL_SLIDE_PATH_FIX)return;
window.__VIDLIK_EXCEL_SLIDE_PATH_FIX=true;

const BASE='assets/sector3-excel-onboarding/';
const pathFor=n=>`${BASE}excel-slide-0${n}.png?v=20260908-1`;

function fixImage(img){
  if(!(img instanceof HTMLImageElement))return;
  if(!img.classList.contains('vidlik-excel-slide-image'))return;
  const m=(img.alt||'').match(/слайд\s+(\d)\s+з\s+4/i);
  const n=Math.max(1,Math.min(4,Number(m?.[1]||1)));
  const wanted=pathFor(n);
  if(img.dataset.vidlikFixedSrc===wanted)return;
  img.dataset.vidlikFixedSrc=wanted;
  img.src=wanted;
}

function scan(root=document){
  if(root instanceof HTMLImageElement)fixImage(root);
  root.querySelectorAll?.('.vidlik-excel-slide-image').forEach(fixImage);
}

const observer=new MutationObserver(records=>{
  for(const record of records){
    for(const node of record.addedNodes){
      if(node instanceof Element)scan(node);
    }
  }
});
observer.observe(document.documentElement,{childList:true,subtree:true});
scan();
})();
