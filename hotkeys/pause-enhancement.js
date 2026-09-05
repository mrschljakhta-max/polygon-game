(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  const PREF_KEY='vidlik-hotkeys-pause-prefs-v2';
  let prefs={sound:false,effects:true};
  try{prefs={...prefs,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}}catch(e){}
  let audioCtx=null;
  let observer=null;
  let gameplayActive=false;

  function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs))}catch(e){}}
  function tone(kind){
    if(!prefs.sound)return;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
      const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
      osc.type='sine';
      osc.frequency.value=kind==='resume'?430:620;
      gain.gain.setValueAtTime(.0001,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.01);
      gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.11);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.12);
    }catch(e){}
  }

  function isGameplayDom(doc){
    return !!(doc.querySelector('.taskbox')&&doc.querySelector('.reader'));
  }

  function syncGameplayState(doc){
    if(isGameplayDom(doc)||doc.querySelector('.pause'))gameplayActive=true;
    else if(doc.querySelector('.level-grid')||doc.querySelector('.main-menu')||doc.querySelector('.result'))gameplayActive=false;
  }

  function forcePause(doc,win){
    try{
      win.eval("try{clearTimeout(nextTimer);nextTimer=null;pressed.clear();locked=false;feedback='idle';phase='playing';paused=true;stopTimer();render()}catch(e){}")
    }catch(e){console.error('VIDLIK force pause failed',e)}
    gameplayActive=true;
    setTimeout(()=>upgradePause(doc,win),0);
  }

  function installEscapeGuard(doc,win){
    if(!win.__vidlikOriginalLeave&&typeof win.leave==='function'){
      win.__vidlikOriginalLeave=win.leave.bind(win);
    }

    if(!win.__vidlikPauseLeavePatched&&win.__vidlikOriginalLeave){
      const originalLeave=win.__vidlikOriginalLeave;
      win.leave=async function(...args){
        try{
          const playing=!!(doc.querySelector('.taskbox')&&doc.querySelector('.reader'));
          const pauseVisible=!!doc.querySelector('.pause');
          if(playing&&!pauseVisible){
            forcePause(doc,win);
            return;
          }
        }catch(e){}
        return originalLeave(...args);
      };
      win.__vidlikPauseLeavePatched=true;
    }

    /*
      game.html already has a window-level Escape listener. It is registered before
      this enhancement and can briefly switch phase to the old level grid. This
      second window listener runs on the same Escape event and restores the active
      lesson as a paused lesson immediately. gameplayActive keeps the pre-event
      state because MutationObserver callbacks run only after event dispatch.
    */
    if(!win.__vidlikEscPauseV5){
      win.__vidlikEscPauseV5=true;
      win.addEventListener('keydown',e=>{
        if(e.code!=='Escape'&&e.key!=='Escape')return;
        if(!gameplayActive&&!isGameplayDom(doc)&&!doc.querySelector('.pause'))return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if(doc.querySelector('.pause'))resume(doc,win,false);
        else forcePause(doc,win);
      },true);
    }

    if(!doc.documentElement.dataset.pauseExitBound){
      doc.documentElement.dataset.pauseExitBound='1';
      doc.addEventListener('click',e=>{
        const exit=e.target.closest&&e.target.closest('.exit');
        if(!exit||doc.querySelector('.pause'))return;
        const originalLeave=win.__vidlikOriginalLeave;
        if(typeof originalLeave!=='function')return;
        e.preventDefault();
        e.stopImmediatePropagation();
        gameplayActive=false;
        originalLeave();
      },true);
    }

    /* Browser-controlled Escape can be consumed while leaving fullscreen. In that
       case keydown may never reach the page, so fullscreenchange is the fallback. */
    if(!doc.documentElement.dataset.pauseFullscreenBound){
      doc.documentElement.dataset.pauseFullscreenBound='1';
      doc.addEventListener('fullscreenchange',()=>{
        if(doc.fullscreenElement)return;
        setTimeout(()=>{
          if(gameplayActive&&!doc.querySelector('.pause')&&isGameplayDom(doc))forcePause(doc,win);
        },0);
      });
    }
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      const win=frame.contentWindow;
      if(!doc||!win||!doc.documentElement)return;

      syncGameplayState(doc);
      installEscapeGuard(doc,win);

      if(!doc.getElementById('vidlik-pause-enhancement')){
        const link=doc.createElement('link');
        link.id='vidlik-pause-enhancement';
        link.rel='stylesheet';
        link.href='./pause-enhancement.css?v=3';
        doc.head.appendChild(link);
      }

      applyPrefs(doc);
      if(observer)observer.disconnect();
      const root=doc.getElementById('game');
      if(!root)return;
      observer=new MutationObserver(()=>{
        syncGameplayState(doc);
        installEscapeGuard(doc,win);
        upgradePause(doc,win);
      });
      observer.observe(root,{childList:true,subtree:true});
      upgradePause(doc,win);

      if(!doc.documentElement.dataset.pauseEscBound){
        doc.documentElement.dataset.pauseEscBound='1';
        doc.addEventListener('keydown',e=>{
          if(e.code==='Escape'&&doc.querySelector('.pause')){
            e.preventDefault();
            e.stopImmediatePropagation();
            resume(doc,win,false);
          }
        },true);
      }
    }catch(e){console.error('VIDLIK pause enhancement failed',e)}
  }

  function applyPrefs(doc){
    doc.documentElement.classList.toggle('vidlik-no-effects',!prefs.effects);
  }
  function text(doc,sel,fallback=''){return (doc.querySelector(sel)?.textContent||fallback).trim()}
  function levelIndex(doc){
    const m=text(doc,'.taskbox .kicker').match(/РІВЕНЬ\s+(\d+)/i);
    return m?Math.max(0,Math.min(9,Number(m[1])-1)):0;
  }
  function data(doc){
    const meta=[...doc.querySelectorAll('.progress-meta span')].map(el=>el.textContent.trim());
    return {
      task:text(doc,'.taskbox h3','Поточне завдання'),
      progress:meta[0]||'',
      left:meta[1]||'',
      time:text(doc,'.hud>div:first-child b','00:00'),
      errors:text(doc,'.hud>div:nth-child(2) b','0')
    };
  }
  function clearPending(win,fullReset){
    try{
      win.eval("try{clearTimeout(nextTimer);nextTimer=null;if("+(fullReset?'true':'false')+"){locked=false;feedback='idle';pressed.clear()}}catch(e){}")
    }catch(e){}
  }
  function focusTask(doc){
    setTimeout(()=>{
      const box=doc.querySelector('.taskbox');
      if(!box||!prefs.effects)return;
      box.classList.remove('resume-focus');void box.offsetWidth;box.classList.add('resume-focus');
      setTimeout(()=>box.classList.remove('resume-focus'),1200);
    },100);
  }
  function resume(doc,win,repeat){
    clearPending(win,repeat);
    tone('resume');
    gameplayActive=true;
    try{
      const p=typeof win.enter==='function'?win.enter():win.eval('enter()');
      if(p&&typeof p.then==='function')p.finally(()=>focusTask(doc));else focusTask(doc);
    }catch(e){console.error('VIDLIK resume failed',e)}
  }
  function restart(doc,win){
    clearPending(win,true);tone('resume');gameplayActive=true;
    try{typeof win.startLevel==='function'?win.startLevel(levelIndex(doc)):win.eval('startLevel('+levelIndex(doc)+')')}catch(e){console.error(e)}
  }
  async function sector(win){
    clearPending(win,true);
    gameplayActive=false;
    try{win.navigator.keyboard?.unlock?.()}catch(e){}
    try{if(win.document.fullscreenElement)await win.document.exitFullscreen()}catch(e){}
    const params=new URLSearchParams(location.search);
    if(params.get('from')==='briefing'&&history.length>1){history.back();return}
    location.replace('module-briefing.html?sector=1');
  }

  function markup(doc){
    const d=data(doc);
    return '<section class="pause-card panel">'+
      '<img class="pause-icon-img" src="./assets/ui/player-pause.svg" alt="" aria-hidden="true">'+
      '<h2>Призупинено</h2>'+
      '<div class="pause-current"><span>Поточне завдання</span><strong>'+escapeHtml(d.task)+'</strong></div>'+
      '<div class="pause-stats"><span><b>'+escapeHtml(d.progress)+'</b></span><span>Час <b>'+escapeHtml(d.time)+'</b></span><span>Помилки <b>'+escapeHtml(d.errors)+'</b></span></div>'+
      '<button class="primary pause-resume" id="resume">▶ ПРОДОВЖИТИ</button>'+
      '<div class="pause-secondary">'+
        '<button id="pause-repeat-task">↻ Повторити завдання</button>'+
        '<button id="pause-restart-level">⟳ Перезапустити рівень</button>'+
        '<button id="pause-sector">⌂ До папки сектора</button>'+
      '</div>'+
      '<div class="pause-tools">'+
        '<button class="pause-tool '+(prefs.sound?'on':'')+'" id="pause-sound">ЗВУК · '+(prefs.sound?'УВІМК.':'ВИМК.')+'</button>'+
        '<button class="pause-tool '+(prefs.effects?'on':'')+'" id="pause-effects">ЕФЕКТИ · '+(prefs.effects?'УВІМК.':'ВИМК.')+'</button>'+
      '</div>'+
    '</section>';
  }
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function upgradePause(doc,win){
    const pause=doc.querySelector('.pause');
    if(!pause||pause.dataset.enhanced==='1')return;
    gameplayActive=true;
    clearPending(win,false);
    pause.dataset.enhanced='1';
    pause.classList.add('pause-enhanced');
    pause.innerHTML=markup(doc);

    doc.getElementById('resume')?.addEventListener('click',()=>resume(doc,win,false));
    doc.getElementById('pause-repeat-task')?.addEventListener('click',()=>resume(doc,win,true));
    doc.getElementById('pause-restart-level')?.addEventListener('click',()=>restart(doc,win));
    doc.getElementById('pause-sector')?.addEventListener('click',()=>sector(win));
    doc.getElementById('pause-sound')?.addEventListener('click',()=>{
      prefs.sound=!prefs.sound;savePrefs();tone('ok');pause.dataset.enhanced='0';upgradePause(doc,win);
    });
    doc.getElementById('pause-effects')?.addEventListener('click',()=>{
      prefs.effects=!prefs.effects;savePrefs();applyPrefs(doc);pause.dataset.enhanced='0';upgradePause(doc,win);
    });
  }

  frame.addEventListener('load',install);
  setInterval(()=>{
    try{
      const doc=frame.contentDocument;
      if(doc&&doc.readyState==='complete')install();
    }catch(e){}
  },1500);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')install();
})();
