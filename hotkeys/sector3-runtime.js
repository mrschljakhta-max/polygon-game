(()=>{
'use strict';
if(window.VIDLIK_RUNTIME)return;

const direct=!!window.__VIDLIK_STORY_JUMP_REQUESTED;
const MODE=direct?'direct':'normal';

const manifests=Object.freeze({
  title:Object.freeze([
    'sector3-prologue-title.js?v=20260907-4',
    'sector3-prologue-title-copy.js?v=20260908-1',
    'sector3-prologue-title-external-bg.js?v=20260907-1'
  ]),
  common:Object.freeze([
    'sector3-pause.js?v=20260910-1',
    'sector3-input.js?v=20260911-1',
    'sector3-ui.js?v=20260911-1'
  ]),
  direct:Object.freeze([
    'sector3-os.js?v=20260906-3',
    'sector3-direct-scene2.js?v=20260911-1',
    'sector3-scene2-countif.js?v=20260909-2',
    'sector3-story-jump.js?v=20260909-8',
    'sector3-scene3-official.js?v=20260909-1',
    'sector3-adaptive-visual.js?v=20260907-4',
    'sector3-polya-identity.js?v=20260909-3'
  ]),
  normal:Object.freeze([
    'sector3-scene1-investigation.js?v=20260908-1',
    'sector3-os.js?v=20260906-3',
    'sector3-os-explorer.js?v=20260911-1',
    'sector3-tutorial-core.js?v=20260911-1',
    'sector3-tutorial.js?v=20260906-4',
    'sector3-section-transition.js?v=20260907-3',
    'sector3-files-tutorial.js?v=20260907-3',
    'sector3-keyboard-tutorial.js?v=20260907-4',
    'sector3-language-tutorial.js?v=20260907-1',
    'sector3-excel-onboarding.js?v=20260908-5',
    'sector3-excel-tutorial.js?v=20260907-1',
    'sector3-adaptive-visual.js?v=20260907-4',
    'sector3-polya-cinematic.js?v=20260908-1',
    'sector3-polya-identity.js?v=20260909-3'
  ])
});

const loaded=new Set();

function load(src){
  if(loaded.has(src))return Promise.resolve(src);
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>s.src&&s.src.endsWith(src));
    if(existing){
      loaded.add(src);
      resolve(src);
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.dataset.vidlikRuntime='1';
    script.onload=()=>{
      loaded.add(src);
      resolve(src);
    };
    script.onerror=()=>reject(new Error('Не вдалося завантажити '+src));
    document.body.appendChild(script);
  });
}

async function loadSequence(list){
  for(const src of list)await load(src);
}

function showFailure(err){
  console.error('[VIDLIK runtime]',err);
  document.documentElement.dataset.vidlikRuntime='error';
  const help=document.getElementById('help');
  if(help)help.innerHTML='<span>ПОМИЛКА ЗАВАНТАЖЕННЯ СЦЕНИ</span><span><kbd>ESC</kbd> назад</span>';
  window.dispatchEvent(new CustomEvent('vidlik:runtime-error',{detail:{mode:MODE,error:err}}));
}

async function boot(){
  if(boot.promise)return boot.promise;
  boot.promise=(async()=>{
    document.documentElement.dataset.vidlikRuntime='loading';

    if(direct){
      document.body.classList.remove('prologue-title-pending');
    }else{
      await loadSequence(manifests.title);
    }

    await loadSequence(manifests.common);
    await loadSequence(manifests[MODE]);

    document.documentElement.dataset.vidlikRuntime='ready';
    window.dispatchEvent(new CustomEvent('vidlik:runtime-ready',{detail:{mode:MODE}}));
    return MODE;
  })().catch(err=>{
    showFailure(err);
    throw err;
  });
  return boot.promise;
}

window.VIDLIK_RUNTIME={
  mode:MODE,
  manifests,
  load,
  boot,
  get loaded(){return [...loaded]}
};

boot().catch(()=>{});
})();