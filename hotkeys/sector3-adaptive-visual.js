(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
if(!mon)return;

const A=()=>window.VIDLIK_ADAPTIVE_STATE;
const OS=()=>window.VIDLIK_OS;
const P=()=>window.VIDLIK_EXPLORER_POLISH;

let currentKey='';
let targetSince=0;
let currentEl=null;
let tick=null;

const scrollHint=document.createElement('div');
scrollHint.className='vidlik-adaptive-scroll-hint';
scrollHint.hidden=true;
mon.appendChild(scrollHint);

function tutorial(){
 const files=window.VIDLIK_FILES_TUTORIAL;
 if(files?.active)return{kind:'files',task:files.task,phase:files.phase,refs:files.refs||{}};
 const keyboard=window.VIDLIK_KEYBOARD_TUTORIAL;
 if(keyboard?.active)return{kind:'keyboard',task:keyboard.task,phase:keyboard.phase,refs:keyboard.refs||{}};
 return null;
}
function explorerWin(){return mon.querySelector('.os-window[data-window-id="explorer"]')}
function current(){return A()?.currentExplorer?.()||{open:false,trashMode:false,path:[],folder:null}}
function selected(){return A()?.selectedId?.()||null}
function osState(){return OS()?.getState?.()||{activeWindowId:null}}
function by(sel){return mon.querySelector(sel)}
function menu(action){return mon.querySelector(`.os-context-menu:not([hidden]) [data-menu="${action}"]`)}
function back(){return by('.os-window[data-window-id="explorer"] [data-act="back"]')}
function plus(){return by('.os-window[data-window-id="explorer"] [data-act="new"]')}
function searchButton(){return by('.os-window[data-window-id="explorer"] [data-act="search"]')}
function searchInput(){return by('.os-window[data-window-id="explorer"] input[id^="osSearch-"]')}
function pane(){return by('.os-window[data-window-id="explorer"] .os-file-pane')}
function inlineInput(){return by('.os-window[data-window-id="explorer"] .os-inline-input')}
function dialogOk(){return by('.os-dialog-wrap [data-dlg]')}
function taskbarExplorer(){return by('[data-task-window="explorer"]')}
function desktop(kind){return by(`.desktop-icon[data-app="${kind}"]`)}
function sidebar(nav){return by(`.os-window[data-window-id="explorer"] [data-nav="${nav}"]`)}
function help(){return document.getElementById('help')}
function same(a,b){return String(a||'')===String(b||'')}
function cut(id){return !!id&&!!P()?.isCut?.(id)}

function clearVisual(){
 document.querySelectorAll('.vidlik-adaptive-visual-target').forEach(el=>el.classList.remove('vidlik-adaptive-visual-target','vidlik-adaptive-pulse','vidlik-adaptive-stuck'));
 currentEl=null;
 scrollHint.hidden=true;
 scrollHint.classList.remove('vidlik-adaptive-pulse');
}
function result(el,key){return el?{el,key}:null}

function showScroll(direction,key){
 const p=pane();if(!p)return null;
 const mr=mon.getBoundingClientRect(),pr=p.getBoundingClientRect();
 scrollHint.hidden=false;
 scrollHint.dataset.direction=direction;
 scrollHint.textContent=direction==='up'?'↑ ПРОКРУТІТЬ':'↓ ПРОКРУТІТЬ';
 scrollHint.style.left=`${Math.max(24,pr.right-mr.left-7)}px`;
 scrollHint.style.top=`${direction==='up'?pr.top-mr.top+43:pr.bottom-mr.top-25}px`;
 return{el:scrollHint,key:`${key}:scroll:${direction}`,scroll:true};
}
function rowResult(id,key){
 const row=A()?.rowById?.(id);if(!row)return null;
 const p=pane();if(!p)return result(row,key);
 const rr=row.getBoundingClientRect(),pr=p.getBoundingClientRect();
 if(rr.bottom>pr.bottom-4)return showScroll('down',key);
 if(rr.top<pr.top+26)return showScroll('up',key);
 return result(row,key);
}
function searchClearIfFiltering(key){
 const input=searchInput();
 if(!input?.value)return null;
 const clear=by('.os-window[data-window-id="explorer"] [data-act="clear"]');
 return clear?result(clear,`${key}:clear-search`):null;
}

function docsId(){return A()?.findByName?.('Документи',n=>n.type==='folder')?.node?.id||null}
function launchForPath(path,trashMode=false){
 if(trashMode)return result(desktop('trash'),'launch:trash');
 const did=docsId();
 if(did&&(path||[]).some(x=>same(x.id,did)))return result(desktop('folder'),'launch:docs');
 return result(desktop('pc'),'launch:pc');
}
function ensureExplorerVisible(path=[],trashMode=false){
 const win=explorerWin();
 if(!win)return launchForPath(path,trashMode);
 if(win.classList.contains('os-minimized')||win.classList.contains('os-window-minimized'))return result(taskbarExplorer(),'restore:explorer');
 const state=osState();
 if(state.activeWindowId&&state.activeWindowId!=='explorer')return result(taskbarExplorer(),'activate:explorer');
 return null;
}
function sidebarForNode(node){
 if(!node)return null;
 if(node.name==='Документи')return sidebar('docs');
 if(node.name==='Звіти')return sidebar('reports');
 if(node.name==='Архів')return sidebar('archive');
 if(node.name==='Цей ПК')return sidebar('pc');
 return null;
}
function commonPrefix(a,b){
 let i=0;while(i<a.length&&i<b.length&&same(a[i],b[i]))i++;return i;
}
function navigateToPath(path,key='route'){
 const launch=ensureExplorerVisible(path,false);if(launch)return launch;
 const cur=current();
 if(cur.trashMode){
  const first=(path||[]).find((x,i)=>i>0)||path?.[0];
  return result(sidebarForNode(first)||sidebar('pc'),`${key}:from-trash`);
 }
 const cp=cur.path||[],dp=path||[];
 if(!dp.length)return null;
 if(cp.length&&same(cp.at(-1)?.id,dp.at(-1)?.id))return null;
 const common=commonPrefix(cp,dp);
 if(common<cp.length){
  const b=back();
  return b&&!b.disabled?result(b,`${key}:back:${cp.at(-1)?.id}`):result(sidebar('pc'),`${key}:root`);
 }
 const next=dp[cp.length];
 if(!next)return null;
 if(next.name==='Документи'){
  const docs=sidebar('docs');
  if(docs)return result(docs,`${key}:sidebar-docs:${next.id}`);
 }
 const row=rowResult(next.id,`${key}:next:${next.id}`);if(row)return row;
 const filtered=searchClearIfFiltering(key);if(filtered)return filtered;
 return result(sidebarForNode(next),`${key}:sidebar:${next.id}`);
}
function routeTrash(id,key='trash'){
 const hit=A()?.locate?.(id);if(!hit||hit.where!=='trash')return null;
 const launch=ensureExplorerVisible([],true);if(launch)return launch;
 const cur=current();
 if(!cur.trashMode)return result(sidebar('trash'),`${key}:open-trash`);
 const top=hit.trashTop||hit.node;
 const restore=menu('restore');
 if(restore&&selected()===top?.id)return result(restore,`${key}:restore:${top.id}`);
 return rowResult(top?.id,`${key}:item:${top?.id}`)||searchClearIfFiltering(key);
}
function routeToObject(id,key='object'){
 if(!id)return null;
 const hit=A()?.locate?.(id);if(!hit)return null;
 if(hit.where==='trash')return routeTrash(id,key);
 if(hit.where==='missing')return result(help(),`${key}:missing`);
 const parentPath=(hit.path||[]).slice(0,-1);
 const nav=navigateToPath(parentPath,key);if(nav)return nav;
 return rowResult(id,`${key}:row:${id}`)||searchClearIfFiltering(key);
}
function routeIntoFolder(id,key='folder'){
 if(!id)return null;
 const hit=A()?.locate?.(id);if(!hit)return null;
 if(hit.where==='trash')return routeTrash(id,key);
 if(hit.where==='missing')return result(help(),`${key}:missing`);
 return navigateToPath(hit.path||[],key);
}
function routeToContainer(id,key='container'){
 const hit=A()?.locate?.(id);if(!hit)return null;
 if(hit.where==='trash')return routeTrash(id,key);
 if(hit.where==='missing')return result(help(),`${key}:missing`);
 return navigateToPath((hit.path||[]).slice(0,-1),key);
}

function filesHint(t){
 const r=t.refs||{},task=Number(t.task)||0,cur=current();
 if(task===1){
  if(cur.open&&!cur.trashMode&&same(cur.folder?.id,r.docs))return null;
  return result(sidebar('docs'),'f1-sidebar-docs')||routeIntoFolder(r.docs,'f1-docs');
 }
 if(task===2)return routeToObject(r.training,'f2-training');
 if(task===3){
  if(r.folder){
   const input=inlineInput();if(input)return result(input,'f3-name-input');
   return routeToObject(r.folder,'f3-created-folder');
  }
  const nav=routeIntoFolder(r.docs,'f3-docs');if(nav)return nav;
  return result(plus(),'f3-new-button');
 }
 if(task===4){
  if(r.folder&&same(cur.folder?.id,r.folder))return result(back(),'f4-back');
  return routeToObject(r.folder,'f4-folder');
 }
 if(task===5){
  const ok=dialogOk();if(ok)return result(ok,'f5-dialog-ok');
  const prop=menu('prop');if(prop&&selected()===r.training)return result(prop,'f5-properties');
  return routeToObject(r.training,'f5-training');
 }
 if(task===6){
  const copyAction=menu('copy');if(copyAction&&selected()===r.training)return result(copyAction,'f6-copy-action');
  return routeToObject(r.training,'f6-training');
 }
 if(task===7){
  const nav=routeIntoFolder(r.folder,'f7-folder');if(nav)return nav;
  const paste=menu('paste');if(paste)return result(paste,'f7-paste-action');
  return result(pane(),'f7-paste-area');
 }
 if(task===8){
  const input=inlineInput();if(input)return result(input,'f8-rename-input');
  const rename=menu('rename');if(rename&&selected()===r.copy)return result(rename,'f8-rename-action');
  return routeToObject(r.copy,'f8-copy');
 }
 if(task===9){
  if(!r.draft)return null;
  const dl=A()?.locate?.(r.draft);
  if(dl?.where==='trash')return routeTrash(r.draft,'f9-draft-trash');
  if(dl?.where==='missing')return result(help(),'f9-draft-missing');
  if(r.folder&&same(dl?.parent?.id,r.folder))return null;
  if(cut(r.draft)){
   const nav=routeIntoFolder(r.folder,'f9-destination');if(nav)return nav;
   const paste=menu('paste');if(paste)return result(paste,'f9-paste-action');
   return result(pane(),'f9-paste-area');
  }
  const cutAction=menu('cut');if(cutAction&&selected()===r.draft)return result(cutAction,'f9-cut-action');
  return routeToObject(r.draft,'f9-draft');
 }
 if(task===10){
  const dl=A()?.locate?.(r.draft);
  if(dl?.where==='trash')return routeTrash(r.draft,'f10-trash');
  const del=menu('delete');if(del&&selected()===r.draft)return result(del,'f10-delete-action');
  return routeToObject(r.draft,'f10-draft');
 }
 if(task===11){
  const dl=A()?.locate?.(r.draft);
  if(dl?.where==='trash')return routeTrash(r.draft,'f11-restore');
  if(dl?.where==='missing')return result(help(),'f11-missing');
 }
 return null;
}

function keyboardHint(t){
 const r=t.refs||{},task=Number(t.task)||0,cur=current();
 if(task===1)return routeToObject(r.folder,'k1-folder');
 if(task===2){
  if(r.folder&&same(cur.folder?.id,r.folder))return result(back(),'k2-back-retry');
  return routeToObject(r.folder,'k2-folder');
 }
 if(task===3||task===4){
  const nav=routeIntoFolder(r.folder,`k${task}-folder`);if(nav)return nav;
  const focus=by('.os-keyboard-focus');if(focus)return result(focus,`k${task}-focus`);
  return result(back(),`k${task}-first-focus`);
 }
 if(task===5)return routeToObject(r.draft,'k5-draft');
 if(task===6)return routeToObject(r.original,'k6-original');
 if(task===7){
  const nav=routeIntoFolder(r.folder,'k7-folder');if(nav)return nav;
  return result(pane(),'k7-paste-area');
 }
 if(task===8){
  if(!r.copy)return result(help(),'k8-no-copy');
  if(cut(r.copy)){
   if(!same(cur.folder?.id,r.docs))return result(sidebar('docs'),'k8-sidebar-docs')||routeIntoFolder(r.docs,'k8-docs');
   return result(pane(),'k8-paste-docs');
  }
  return routeToObject(r.copy,'k8-copy');
 }
 if(task===9)return result(help(),'k9-undo');
 if(task===10){
  if(!same(cur.folder?.id,r.docs))return result(sidebar('docs'),'k10-sidebar-docs')||routeIntoFolder(r.docs,'k10-docs');
  return result(help(),'k10-select-all');
 }
 if(task===11){
  const nav=routeToContainer(r.reports,'k11-search-parent');if(nav)return nav;
  const input=searchInput();if(input)return result(input,'k11-search-input');
  return result(help(),'k11-search-shortcut');
 }
 return null;
}

function resolve(){
 if(document.body.classList.contains('vidlik-section-transition-active'))return null;
 const t=tutorial();if(!t)return null;
 return t.kind==='files'?filesHint(t):keyboardHint(t);
}

function apply(res){
 const now=Date.now();
 if(!res?.el){clearVisual();currentKey='';targetSince=0;return}
 const sameKey=res.key===currentKey;
 if(!sameKey){currentKey=res.key;targetSince=now}
 clearVisual();
 currentEl=res.el;
 const age=now-targetSince;
 currentEl.classList.add('vidlik-adaptive-visual-target');
 if(age>2200)currentEl.classList.add('vidlik-adaptive-pulse');
 if(age>7000)currentEl.classList.add('vidlik-adaptive-stuck');
 if(res.scroll&&age>900)scrollHint.classList.add('vidlik-adaptive-pulse');
}
function refresh(){
 try{apply(resolve())}catch(err){console.error('[VIDLIK visual guide]',err)}
}
function schedule(ms=0){clearTimeout(tick);tick=setTimeout(refresh,ms)}

A()?.subscribe?.(()=>schedule(20));
mon.addEventListener('scroll',()=>schedule(0),true);
mon.addEventListener('pointerup',()=>schedule(25),true);
window.addEventListener('keydown',()=>schedule(25),true);
window.addEventListener('resize',()=>schedule(20));
window.addEventListener('vidlik:section2-ready',()=>schedule(120));
window.addEventListener('vidlik:section3-ready',()=>schedule(120));
window.addEventListener('vidlik:os-reset',()=>{clearVisual();currentKey='';targetSince=0});
setInterval(refresh,260);
schedule(250);

window.VIDLIK_ADAPTIVE_VISUAL={refresh,resolve,get key(){return currentKey}};
})();