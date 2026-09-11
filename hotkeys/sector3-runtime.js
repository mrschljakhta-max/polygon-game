(()=>{
'use strict';
if(window.VIDLIK_RUNTIME)return;
const direct=!!window.__VIDLIK_STORY_JUMP_REQUESTED;
const mode=direct?'direct':'normal';
const LOAD_TIMEOUT_MS=12000;
const gameplayStyles=Object.freeze([
 'sector3-intro.css?v=20260906-2',
 'sector3-incoming-effects.css?v=20260906-2',
 'sector3-admin.css?v=20260906-6',
 'sector3-sync.css?v=20260906-3',
 'sector3-os.css?v=20260906-1',
 'sector3-os-windows.css?v=20260911-1',
 'sector3-os-explorer.css?v=20260911-1',
 'sector3-tutorial.css?v=20260906-2',
 'sector3-keyboard-tutorial.css?v=20260907-1',
 'sector3-language-tutorial.css?v=20260907-1',
 'sector3-excel-tutorial.css?v=20260907-1',
 'sector3-excel-onboarding.css?v=20260908-3',
 'sector3-adaptive-visual.css?v=20260907-3',
 'sector3-transitions.css?v=20260911-2',
 'sector3-pause.css?v=20260911-1',
 'sector3-ui.css?v=20260911-1'
]);
const manifests=Object.freeze({
 title:Object.freeze(['sector3-transitions.js?v=20260911-1','sector3-prologue.js?v=20260911-2']),
 common:Object.freeze(['sector3-story-router.js?v=20260911-5','sector3-pause.js?v=20260910-1','sector3-input.js?v=20260911-1','sector3-ui.js?v=20260911-1']),
 direct:Object.freeze(['sector3-os.js?v=20260906-3']),
 normal:Object.freeze([]),
 styles:gameplayStyles
});
const loaded=new Set();
let assetsHydrated=false;
function isStyle(src){return /\.css(?:[?#]|$)/i.test(src)}
function load(src){
 if(loaded.has(src))return Promise.resolve(src);
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finishOk=(node)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(node)node.dataset.vidlikLoaded='1';
   loaded.add(src);resolve(src);
  };
  const finishError=(err,node)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(node?.dataset?.vidlikRuntime==='1')node.remove();
   reject(err);
  };
  const timer=setTimeout(()=>finishError(new Error('Таймаут завантаження '+src)),LOAD_TIMEOUT_MS);
  if(isStyle(src)){
   const existing=[...document.querySelectorAll('link[rel="stylesheet"]')].find(l=>l.href&&l.href.endsWith(src));
   if(existing){
    if(existing.dataset.vidlikLoaded==='1'||existing.sheet){finishOk(existing);return}
    existing.addEventListener('load',()=>finishOk(existing),{once:true});
    existing.addEventListener('error',()=>finishError(new Error('Не вдалося завантажити '+src),existing),{once:true});
    return;
   }
   const l=document.createElement('link');l.rel='stylesheet';l.href=src;l.dataset.vidlikRuntime='1';
   l.onload=()=>finishOk(l);
   l.onerror=()=>finishError(new Error('Не вдалося завантажити '+src),l);
   document.head.appendChild(l);
   return;
  }
  const existing=[...document.scripts].find(s=>s.src&&s.src.endsWith(src));
  if(existing){
   if(existing.dataset.vidlikLoaded==='1'){finishOk(existing);return}
   existing.addEventListener('load',()=>finishOk(existing),{once:true});
   existing.addEventListener('error',()=>finishError(new Error('Не вдалося завантажити '+src),existing),{once:true});
   return;
  }
  const s=document.createElement('script');s.src=src;s.async=false;s.dataset.vidlikRuntime='1';
  s.onload=()=>finishOk(s);
  s.onerror=()=>finishError(new Error('Не вдалося завантажити '+src),s);
  document.body.appendChild(s);
 });
}
async function seq(list){for(const src of list)await load(src)}
async function loadGameplayStyles(){await seq(gameplayStyles);return gameplayStyles}
function hydrateGameplayAssets(){
 if(assetsHydrated)return 0;
 const nodes=[...document.querySelectorAll('[data-vidlik-src]')];
 for(const node of nodes){
  const src=node.getAttribute('data-vidlik-src');
  if(src&&!node.getAttribute('src'))node.setAttribute('src',src);
  node.removeAttribute('data-vidlik-src');
 }
 assetsHydrated=true;
 window.dispatchEvent(new CustomEvent('vidlik:gameplay-assets-hydrated',{detail:{count:nodes.length}}));
 return nodes.length;
}
function fail(err){
 console.error('[VIDLIK runtime]',err);document.documentElement.dataset.vidlikRuntime='error';
 const h=document.getElementById('help');if(h)h.innerHTML='<span>ПОМИЛКА ЗАВАНТАЖЕННЯ СЦЕНИ</span><span><kbd>R</kbd> повторити</span><span><kbd>ESC</kbd> назад</span>';
 window.dispatchEvent(new CustomEvent('vidlik:runtime-error',{detail:{mode,error:err}}));
}
async function boot(){
 if(boot.promise)return boot.promise;
 boot.promise=(async()=>{
  document.documentElement.dataset.vidlikRuntime='loading';
  if(!direct)await seq(manifests.title);
  await seq(manifests.common);
  if(direct){
   await loadGameplayStyles();
   hydrateGameplayAssets();
   await seq(manifests.direct);
   document.body.classList.remove('prologue-title-pending');
  }
  document.documentElement.dataset.vidlikRuntime='ready';
  window.dispatchEvent(new CustomEvent('vidlik:runtime-ready',{detail:{mode}}));
  return mode;
 })().catch(err=>{fail(err);throw err});
 return boot.promise;
}
function startAfterInitialLoad(){
 const start=()=>{
  document.documentElement.dataset.vidlikInitialLoad='complete';
  boot().catch(()=>{});
 };
 if(document.readyState==='complete')queueMicrotask(start);
 else window.addEventListener('load',start,{once:true});
}
window.VIDLIK_RUNTIME={mode,manifests,load,loadGameplayStyles,hydrateGameplayAssets,boot,get loaded(){return[...loaded]}};
startAfterInitialLoad();
})();