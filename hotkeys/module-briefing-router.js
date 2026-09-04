(()=>{
'use strict';
/* Mission-board handles the trusted click first so its cinematic opening animation remains intact.
   The board then replays a synthetic click; this router captures that replay and opens the briefing. */
document.addEventListener('click',e=>{
  if(e.isTrusted||window.VIDLIK_DIRECT_SECTOR)return;
  const target=e.target.closest?.('.mb-board [data-sector]');
  if(!target)return;
  const n=parseInt(target.dataset.sector||'',10);
  if(!(n>=1&&n<=8))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  location.href=`module-briefing.html?sector=${n}`;
},true);
})();