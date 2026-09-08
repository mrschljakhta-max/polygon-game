(()=>{
'use strict';

const TITLE_HTML='ЗАБОРОНЕНИЙ<span class="second">ДЗВІНОК</span>';
const SUBTITLE='Початок історії. Один дзвінок — і звичний світ більше не виглядає таким, як раніше.';

function applyPrologueCopy(){
 const root=document.getElementById('vidlikPrologueTitle');
 if(!root)return false;
 const title=root.querySelector('.vpt-title');
 const subtitle=root.querySelector('.vpt-subtitle');
 if(title)title.innerHTML=TITLE_HTML;
 if(subtitle)subtitle.textContent=SUBTITLE;
 return Boolean(title||subtitle);
}

if(!applyPrologueCopy()){
 const observer=new MutationObserver(()=>{
  if(applyPrologueCopy())observer.disconnect();
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
}
})();