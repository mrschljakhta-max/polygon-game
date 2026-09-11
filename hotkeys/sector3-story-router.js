(()=>{
'use strict';
if(window.VIDLIK_STORY_ROUTER)return;

const params=new URLSearchParams(location.search);
const requestedScene=parseInt(params.get('storyScene')||'0',10)||0;
const direct=!!window.__VIDLIK_STORY_JUMP_REQUESTED;
let current=direct?'direct-bootstrap':'prologue-title';
let routePromise=null;

const routes=Object.freeze({
 'prologue-call':Object.freeze([
  'sector3-scene1-investigation.js?v=20260908-1',
  'sector3-os.js?v=20260906-3',
  'sector3-os-explorer.js?v=20260911-1',
  'sector3-tutorial-core.js?v=20260911-1',
  'sector3-tutorial.js?v=20260906-4',
  'sector3-files-tutorial.js?v=20260907-3',
  'sector3-keyboard-tutorial.js?v=20260907-4',
  'sector3-language-tutorial.js?v=20260907-1',
  'sector3-excel-onboarding.js?v=20260908-5',
  'sector3-excel-tutorial.js?v=20260907-1',
  'sector3-adaptive-visual.js?v=20260907-4',
  'sector3-polya-cinematic.js?v=20260908-1',
  'sector3-polya-identity.js?v=20260909-3',
  'sector3-intro.js?v=20260907-prologue2'
 ]),
 'direct-scene-01':Object.freeze([
  'sector3-scene2.js?v=20260911-1',
  'sector3-scene2-countif.js?v=20260911-2',
  'sector3-scene2-pattern.js?v=20260909-1',
  'sector3-scene1.js?v=20260911-1',
  'sector3-scene3.js?v=20260911-1',
  'sector3-adaptive-visual.js?v=20260907-4',
  'sector3-polya-identity.js?v=20260909-3'
 ])
});

function runtime(){
 const api=window.VIDLIK_RUNTIME;
 if(!api?.load)throw new Error('VIDLIK runtime loader unavailable');
 return api;
}
async function prepareGameplay(){
 const api=runtime();
 if(api.loadGameplayStyles)await api.loadGameplayStyles();
 api.hydrateGameplayAssets?.();
}
async function loadRoute(name){
 const list=routes[name];
 if(!list)throw new Error('Unknown story route: '+name);
 for(const src of list)await runtime().load(src);
 current=name;
 window.dispatchEvent(new CustomEvent('vidlik:story-route-ready',{detail:{route:name,requestedScene}}));
 return name;
}
async function continuePrologue(){
 if(direct)return current;
 if(routePromise)return routePromise;
 routePromise=(async()=>{
  await prepareGameplay();
  const route=await loadRoute('prologue-call');
  document.body.classList.remove('prologue-title-pending');
  return route;
 })().finally(()=>{routePromise=null});
 return routePromise;
}
function completePrologueTransition(){
 if(current!=='prologue-call')return false;
 try{
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'r',code:'KeyR',bubbles:true,cancelable:true}));
 }catch(_){}
 window.dispatchEvent(new CustomEvent('vidlik:story-route-enter',{detail:{route:current}}));
 return true;
}
async function bootDirect(){
 if(!direct)return null;
 await prepareGameplay();
 if(requestedScene===1){
  const route=await loadRoute('direct-scene-01');
  document.body.classList.remove('prologue-title-pending');
  return route;
 }
 document.documentElement.dataset.vidlikStoryRoute='unsupported';
 window.dispatchEvent(new CustomEvent('vidlik:story-route-error',{detail:{requestedScene,error:'unsupported-checkpoint'}}));
 return null;
}
function onRuntimeReady(e){
 if(e.detail?.mode!=='direct')return;
 bootDirect().catch(err=>{
  console.error('[VIDLIK story router]',err);
  window.dispatchEvent(new CustomEvent('vidlik:story-route-error',{detail:{requestedScene,error:err}}));
 });
}
window.addEventListener('vidlik:runtime-ready',onRuntimeReady);

window.VIDLIK_STORY_ROUTER={
 routes,
 requestedScene,
 get current(){return current},
 loadRoute,
 continuePrologue,
 completePrologueTransition,
 bootDirect
};
})();