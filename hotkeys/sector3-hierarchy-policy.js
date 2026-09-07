(()=>{
'use strict';

/*
 * Canonical narrative hierarchy for Sector 3:
 * ACT → SCENE → EPISODE → TASK.
 *
 * Some older modules still use "section" in event/class/file identifiers.
 * Those identifiers are kept temporarily for runtime compatibility, but all
 * user-facing terminology is normalized to "episode".
 */
window.VIDLIK_STORY_HIERARCHY=Object.freeze({
 order:Object.freeze(['act','scene','episode','task']),
 labels:Object.freeze({
  act:'Акт',
  scene:'Сцена',
  episode:'Епізод',
  task:'Завдання'
 })
});

const roots=()=>[
 document.getElementById('adminChat'),
 document.getElementById('adminFooter'),
 document.getElementById('help'),
 document.querySelector('.os-language-training-window'),
 document.querySelector('.vidlik-section-transition')
].filter(Boolean);

const exactReplacements=new Map([
 ['9 / 9 · БАЗОВЕ ЗНАЙОМСТВО З РОБОЧОЮ СТАНЦІЄЮ ЗАВЕРШЕНО ✓','9 / 9 · БАЗОВЕ ЗНАЙОМСТВО З ОПЕРАЦІЙНОЮ СИСТЕМОЮ · ЕПІЗОД ЗАВЕРШЕНО ✓'],
 ['базовий блок виконано','епізод завершено']
]);

const episodeTitles=[
 'БАЗОВЕ ЗНАЙОМСТВО З ОПЕРАЦІЙНОЮ СИСТЕМОЮ',
 'ФАЙЛИ ТА ПАПКИ',
 'РОБОТА З КЛАВІАТУРОЮ',
 'МОВА ВВЕДЕННЯ',
 'ПЕРША ТАБЛИЦЯ'
];

function normalizeText(text){
 let next=String(text??'');
 if(exactReplacements.has(next))next=exactReplacements.get(next);
 next=next
  .replace(/РОЗДІЛ/g,'ЕПІЗОД')
  .replace(/Розділ/g,'Епізод')
  .replace(/розділ/g,'епізод');

 if(/· ЗАВЕРШЕНО ✓$/.test(next)&&episodeTitles.some(title=>next.includes(title))&&!next.includes('ЕПІЗОД ЗАВЕРШЕНО')){
  next=next.replace(/· ЗАВЕРШЕНО ✓$/,'· ЕПІЗОД ЗАВЕРШЕНО ✓');
 }
 return next;
}

function normalizeNode(root){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const before=node.nodeValue||'';
  const after=normalizeText(before);
  if(after!==before)node.nodeValue=after;
 }
}

let scheduled=false;
function normalizeAll(){
 scheduled=false;
 for(const root of roots())normalizeNode(root);
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(normalizeAll);
}

const observer=new MutationObserver(records=>{
 if(records.some(r=>r.type==='childList'||r.type==='characterData'))schedule();
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});

[
 'vidlik:os-ready',
 'vidlik:section2-ready',
 'vidlik:section3-ready',
 'vidlik:section4-ready',
 'vidlik:section5-ready',
 'vidlik:episode2-ready',
 'vidlik:episode3-ready',
 'vidlik:episode4-ready',
 'vidlik:episode5-ready'
].forEach(name=>window.addEventListener(name,schedule));

schedule();
})();