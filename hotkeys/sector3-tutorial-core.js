(()=>{
'use strict';
if(window.VIDLIK_TUTORIAL_CORE)return;

/*
 * Sector 3 tutorial core.
 * Owns shared tutorial infrastructure only:
 *  - narrative hierarchy normalization
 *  - adaptive access to the VIDLIK OS file system / Explorer state
 *  - shared tutorial UI helpers for lesson modules
 *
 * Concrete lessons remain separate modules (basic, files, keyboard, language, Excel).
 */

const hierarchy=Object.freeze({
 order:Object.freeze(['act','scene','episode','task']),
 labels:Object.freeze({act:'Акт',scene:'Сцена',episode:'Епізод',task:'Завдання'})
});

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
function hierarchyRoots(){
 return[
  document.getElementById('adminChat'),
  document.getElementById('adminFooter'),
  document.getElementById('help'),
  document.querySelector('.os-language-training-window'),
  document.querySelector('.vidlik-section-transition')
 ].filter(Boolean);
}
function normalizeText(text){
 let next=String(text??'');
 if(exactReplacements.has(next))next=exactReplacements.get(next);
 next=next.replace(/РОЗДІЛ/g,'ЕПІЗОД').replace(/Розділ/g,'Епізод').replace(/розділ/g,'епізод');
 if(/· ЗАВЕРШЕНО ✓$/.test(next)&&episodeTitles.some(title=>next.includes(title))&&!next.includes('ЕПІЗОД ЗАВЕРШЕНО')){
  next=next.replace(/· ЗАВЕРШЕНО ✓$/,'· ЕПІЗОД ЗАВЕРШЕНО ✓');
 }
 return next;
}
function normalizeNode(root){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const before=node.nodeValue||'',after=normalizeText(before);
  if(after!==before)node.nodeValue=after;
 }
}
let hierarchyScheduled=false;
function normalizeHierarchy(){
 hierarchyScheduled=false;
 for(const root of hierarchyRoots())normalizeNode(root);
}
function scheduleHierarchy(){
 if(hierarchyScheduled)return;
 hierarchyScheduled=true;
 queueMicrotask(normalizeHierarchy);
}
const hierarchyObserver=new MutationObserver(records=>{
 if(records.some(r=>r.type==='childList'||r.type==='characterData'))scheduleHierarchy();
});
hierarchyObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
[
 'vidlik:os-ready','vidlik:section2-ready','vidlik:section3-ready','vidlik:section4-ready','vidlik:section5-ready',
 'vidlik:episode2-ready','vidlik:episode3-ready','vidlik:episode4-ready','vidlik:episode5-ready'
].forEach(name=>window.addEventListener(name,scheduleHierarchy));

/* Adaptive OS / Explorer state shared by tutorial lessons. */
function os(){return window.VIDLIK_OS||null}
function root(){return os()?.getFileSystem?.()||null}
function trash(){return os()?.getState?.()?.trash||[]}
function walk(node,fn,parent=null,path=[]){
 if(!node)return null;
 const here=[...path,node];
 const out=fn(node,parent,here);if(out)return out;
 for(const child of node.children||[]){const hit=walk(child,fn,node,here);if(hit)return hit}
 return null;
}
function findById(id){return walk(root(),(node,parent,path)=>node.id===id?{node,parent,path}:null)}
function findByName(name,predicate=null){return walk(root(),(node,parent,path)=>node.name===name&&(!predicate||predicate(node,parent,path))?{node,parent,path}:null)}
function findAll(predicate){
 const out=[];
 const visit=(node,parent=null,path=[])=>{
  if(!node)return;
  const here=[...path,node];
  if(predicate(node,parent,here))out.push({node,parent,path:here});
  for(const child of node.children||[])visit(child,node,here);
 };
 visit(root());return out;
}
function findTrashById(id){
 for(const top of trash()){
  const hit=walk(top,(node,parent,path)=>node.id===id?{node,parent,path,trashTop:top}:null);
  if(hit)return hit;
 }
 return null;
}
function locate(id){
 const tree=findById(id);if(tree)return{where:'tree',...tree};
 const bin=findTrashById(id);if(bin)return{where:'trash',...bin};
 return{where:'missing',node:null,parent:null,path:[]};
}
function describePath(path){return(path||[]).map(x=>x.name).join(' › ')}
function parentPath(hit){return hit?.path?.slice(0,-1)||[]}
function currentExplorer(){
 const win=document.querySelector('.os-window[data-window-id="explorer"]');
 if(!win)return{open:false,trashMode:false,address:'',folder:null,path:[],selectedIds:[]};
 const address=win.querySelector('.os-address')?.textContent.trim()||'';
 const selectedIds=[...win.querySelectorAll('.os-file-item.selected')].map(x=>x.dataset.id).filter(Boolean);
 if(address==='Кошик')return{open:true,trashMode:true,address,folder:null,path:[],selectedIds,win};
 const names=address.split('›').map(x=>x.trim()).filter(Boolean);
 let node=root();const path=node?[node]:[];
 if(node&&names[0]===node.name)names.shift();
 for(const name of names){
  const next=node?.children?.find(x=>x.type==='folder'&&x.name===name);
  if(!next)break;node=next;path.push(node);
 }
 return{open:true,trashMode:false,address,folder:node||null,path,selectedIds,win};
}
function currentFolderId(){return currentExplorer().folder?.id||null}
function rowById(id){return document.querySelector(`.os-window[data-window-id="explorer"] .os-file-item[data-id="${CSS.escape(String(id))}"]`)}
function selectedId(){return currentExplorer().selectedIds[0]||null}
function objectName(id,fallback='об’єкт'){return locate(id).node?.name||fallback}
function parentId(id){return findById(id)?.parent?.id||null}
function isAtParent(id){const hit=findById(id);return !!hit&&currentFolderId()===hit.parent?.id}
function allIds(){return new Set(findAll(()=>true).map(x=>x.node.id))}

let adaptiveScheduled=false;
const adaptiveListeners=new Set();
function emitAdaptive(){
 adaptiveScheduled=false;
 for(const fn of adaptiveListeners){try{fn()}catch(err){console.error('[VIDLIK tutorial core]',err)}}
}
function scheduleAdaptive(){if(adaptiveScheduled)return;adaptiveScheduled=true;requestAnimationFrame(emitAdaptive)}
function subscribe(fn){adaptiveListeners.add(fn);return()=>adaptiveListeners.delete(fn)}
const adaptiveObserver=new MutationObserver(scheduleAdaptive);
adaptiveObserver.observe(document.body,{subtree:true,childList:true});
window.addEventListener('keydown',()=>setTimeout(scheduleAdaptive,0),true);
window.addEventListener('pointerup',()=>setTimeout(scheduleAdaptive,0),true);
window.addEventListener('contextmenu',()=>setTimeout(scheduleAdaptive,0),true);

const adaptive={
 root,trash,walk,findById,findByName,findAll,findTrashById,locate,describePath,parentPath,
 currentExplorer,currentFolderId,rowById,selectedId,objectName,parentId,isAtParent,allIds,
 subscribe,schedule:scheduleAdaptive
};

/* Shared presentation helpers for current and future lesson modules. */
function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(row){
 const chat=document.getElementById('adminChat');if(!chat)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const top=Math.max(0,chat.scrollHeight-chat.clientHeight);
  if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});else chat.scrollTop=top;
  row?.setAttribute('data-visible-latest','true');
 }));
}
function adminMessage(text,{sender='СИСТЕМНИЙ АДМІНІСТРАТОР',className='vidlik-tutorial-message'}={}){
 const chat=document.getElementById('adminChat');if(!chat)return null;
 const row=document.createElement('div');row.className=`admin-message ${className}`.trim();
 row.innerHTML='<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name"></span><span class="admin-bubble-time"></span></div><p></p></div>';
 row.querySelector('.admin-bubble-name').textContent=sender;
 row.querySelector('.admin-bubble-time').textContent=nowTime();
 const p=row.querySelector('p');p.textContent=text;p.style.whiteSpace='pre-line';
 chat.appendChild(row);scrollLatest(row);return row;
}
function setFooter(text){
 const footer=document.getElementById('adminFooter');if(!footer)return;
 footer.textContent=text;footer.classList.add('vidlik-tutorial-footer');
}
function setHelp(html){
 const help=document.getElementById('help');if(!help)return;
 help.classList.add('vidlik-tutorial-help');help.innerHTML=html;
}
function clearUi(){
 document.getElementById('adminFooter')?.classList.remove('vidlik-tutorial-footer');
 document.getElementById('help')?.classList.remove('vidlik-tutorial-help');
 document.querySelectorAll('.vidlik-tutorial-ui-target,.os-keyboard-target,.os-keyboard-focus,.vidlik-language-target,.vidlik-language-field-target')
  .forEach(x=>x.classList.remove('vidlik-tutorial-ui-target','os-keyboard-target','os-keyboard-focus','vidlik-language-target','vidlik-language-field-target'));
}

window.VIDLIK_TUTORIAL_CORE={
 hierarchy,adaptive,
 ui:{nowTime,scrollLatest,adminMessage,setFooter,setHelp,clear:clearUi},
 normalizeHierarchy,scheduleHierarchy
};

/* Compatibility APIs retained while lesson modules are migrated incrementally. */
window.VIDLIK_STORY_HIERARCHY=hierarchy;
window.VIDLIK_ADAPTIVE_STATE=adaptive;

normalizeHierarchy();
scheduleAdaptive();
})();