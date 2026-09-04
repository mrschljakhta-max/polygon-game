(()=>{
'use strict';
const params=new URLSearchParams(location.search);
const n=parseInt(params.get('directSector')||'',10);
if(!(n>=2&&n<=8))return;
window.VIDLIK_DIRECT_SECTOR=n;
let tries=0;
function open(){
  const btn=document.querySelector(`[data-sector="${n}"]`);
  if(btn){btn.click();params.delete('directSector');const q=params.toString();history.replaceState(null,'',location.pathname+(q?'?'+q:''));window.VIDLIK_DIRECT_SECTOR=0;return}
  if(++tries<40)setTimeout(open,50);
}
setTimeout(open,0);
})();