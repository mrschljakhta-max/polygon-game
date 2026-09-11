(()=>{
'use strict';
if(window.VIDLIK_RUNTIME)return;
const direct=!!window.__VIDLIK_STORY_JUMP_REQUESTED;
const mode=direct?'direct':'normal';
const LOAD_TIMEOUT_MS=12000;
const manifests=Object.freeze({
 title:Object.freeze(['sector3-transitions.js?v=20260911-1','sector3-prologue.js?v=20260911-2']),
 common:Object.freeze(['sector3-story-router.js?v=20260911-3','sector3-pause.js?v=20260910-1','sector3-input.js?v=20260911-1','sector3-ui.js?v=20260911-1']),
 direct:Object.freeze(['sector3-os.js?v=20260906-3']),
 normal:Object.freeze([])
});
const loaded=new Set();
function load(src){
 if(loaded.has(src))return Promise.resolve(src);
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finishOk=(script)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(script)script.dataset.vidlikLoaded='1';
   loaded.add(src);resolve(src);
  };
  const finishError=(err,script)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(script?.dataset?.vidlikRuntime==='1')script.remove();
   reject(err);
  };
  const timer=setTimeout(()=>finishError(new Error('Таймаут завантаження '+src)),LOAD_TIMEOUT_MS);
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
function fail(err){
 console.error('[VIDLIK runtime]',err);document.documentElement.dataset.vidlikRuntime='error';
 const h=document.getElementById('help');if(h)h.innerHTML='<span>ПОМИЛКА ЗАВАНТАЖЕННЯ СЦЕНИ</span><span><kbd>R</kbd> повторити</span><span><kbd>ESC</kbd> назад</span>';
 window.dispatchEvent(new CustomEvent('vidlik:runtime-error',{detail:{mode,error:err}}));
}
async function boot(){
 if(boot.promise)return boot.promise;
 boot.promise=(async()=>{
  document.documentElement.dataset.vidlikRuntime='loading';
  if(direct)document.body.classList.remove('prologue-title-pending');else await seq(manifests.title);
  await seq(manifests.common);await seq(manifests[mode]);
  document.documentElement.dataset.vidlikRuntime='ready';
  window.dispatchEvent(new CustomEvent('vidlik:runtime-ready',{detail:{mode}}));
  return mode;
 })().catch(err=>{fail(err);throw err});
 return boot.promise;
}
window.VIDLIK_RUNTIME={mode,manifests,load,boot,get loaded(){return[...loaded]}};
boot().catch(()=>{});
})();