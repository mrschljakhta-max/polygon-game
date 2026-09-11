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
  'sector3-intro.js?v=20260907-prologue2'
 ]),
 'direct-scene-01':Object.freeze([
  'sector3-direct-scene2.js?v=20260911-1',
  'sector3-scene2-countif.js?v=20260911-2',
  'sector3-scene2-pattern.js?v=20260909-1',
  'sector3-story-jump.js?v=20260909-8',
  'sector3-scene3-official.js?v=20260909-1',
  'sector3-adaptive-visual.js?v=20260907-4',
  'sector3-polya-identity.js?v=20260909-3'
 ])
});

function runtime(){
 const api=window.VIDLIK_RUNTIME;
 if(!api?.load)throw new Error('VIDLIK runtime loader unavailable');
 return api;
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
 document.body.classList.remove('prologue-title-pending');
 routePromise=loadRoute('prologue-call').finally(()=>{routePromise=null});
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
 if(requestedScene===1)return loadRoute('direct-scene-01');
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