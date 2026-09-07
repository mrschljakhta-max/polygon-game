(()=>{
'use strict';

function os(){return window.VIDLIK_OS||null}
function root(){return os()?.getFileSystem?.()||null}
function trash(){return os()?.getState?.()?.trash||[]}

function walk(node,fn,parent=null,path=[]){
 if(!node)return null;
 const here=[...path,node];
 const out=fn(node,parent,here);
 if(out)return out;
 for(const child of node.children||[]){
  const hit=walk(child,fn,node,here);
  if(hit)return hit;
 }
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
 visit(root());
 return out;
}
function findTrashById(id){
 for(const top of trash()){
  const hit=walk(top,(node,parent,path)=>node.id===id?{node,parent,path,trashTop:top}:null);
  if(hit)return hit;
 }
 return null;
}
function locate(id){
 const tree=findById(id);
 if(tree)return{where:'tree',...tree};
 const bin=findTrashById(id);
 if(bin)return{where:'trash',...bin};
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
 let node=root();
 const path=node?[node]:[];
 if(node&&names[0]===node.name)names.shift();
 for(const name of names){
  const next=node?.children?.find(x=>x.type==='folder'&&x.name===name);
  if(!next)break;
  node=next;path.push(node);
 }
 return{open:true,trashMode:false,address,folder:node||null,path,selectedIds,win};
}
function currentFolderId(){return currentExplorer().folder?.id||null}
function rowById(id){return document.querySelector(`.os-window[data-window-id="explorer"] .os-file-item[data-id="${CSS.escape(String(id))}"]`)}
function selectedId(){return currentExplorer().selectedIds[0]||null}
function objectName(id,fallback='об’єкт'){return locate(id).node?.name||fallback}
function parentId(id){const hit=findById(id);return hit?.parent?.id||null}
function isAtParent(id){const hit=findById(id);return !!hit&&currentFolderId()===hit.parent?.id}
function allIds(){return new Set(findAll(()=>true).map(x=>x.node.id))}

let scheduled=false;
const listeners=new Set();
function emit(){
 scheduled=false;
 for(const fn of listeners){try{fn()}catch(err){console.error('[VIDLIK adaptive]',err)}}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(emit)}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
window.addEventListener('keydown',()=>setTimeout(schedule,0),true);
window.addEventListener('pointerup',()=>setTimeout(schedule,0),true);
window.addEventListener('contextmenu',()=>setTimeout(schedule,0),true);

window.VIDLIK_ADAPTIVE_STATE={
 root,trash,walk,findById,findByName,findAll,findTrashById,locate,describePath,parentPath,
 currentExplorer,currentFolderId,rowById,selectedId,objectName,parentId,isAtParent,allIds,
 subscribe,schedule
};
})();
