(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  const PREF_KEY='vidlik-hotkeys-pause-prefs-v2';
  let prefs={sound:false,effects:true};
  try{prefs={...prefs,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}}catch(e){}
  let audioCtx=null;
  let observer=null;

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

  function install(){
    try{
      const doc=frame.contentDocument;
      const win=frame.contentWindow;
      if(!doc||!win||!doc.documentElement)return;

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
      observer=new MutationObserver(()=>upgradePause(doc,win));
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
    try{
      const p=typeof win.enter==='function'?win.enter():win.eval('enter()');
      if(p&&typeof p.then==='function')p.finally(()=>focusTask(doc));else focusTask(doc);
    }catch(e){console.error('VIDLIK resume failed',e)}
  }
  function restart(doc,win){
    clearPending(win,true);tone('resume');
    try{typeof win.startLevel==='function'?win.startLevel(levelIndex(doc)):win.eval('startLevel('+levelIndex(doc)+')')}catch(e){console.error(e)}
  }
  function sector(win){
    clearPending(win,true);
    try{typeof win.leave==='function'?win.leave():win.eval('leave()')}catch(e){console.error(e)}
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
        '<button id="pause-sector">⌂ До рівнів</button>'+
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
