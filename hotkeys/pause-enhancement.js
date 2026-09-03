(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  function installPauseEnhancement(){
    try{
      const doc=frame.contentDocument;
      const win=frame.contentWindow;
      if(!doc||!win||doc.getElementById('vidlik-pause-enhancement'))return;

      const link=doc.createElement('link');
      link.id='vidlik-pause-enhancement';
      link.rel='stylesheet';
      link.href='./pause-enhancement.css';
      doc.head.appendChild(link);

      const behavior=doc.createElement('script');
      behavior.id='vidlik-pause-enhancement-behavior';
      behavior.textContent=`
        (function(){
          var PREF_KEY='vidlik-hotkeys-pause-prefs-v1';
          var prefs={sound:false,effects:true};
          try{prefs=Object.assign(prefs,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'))}catch(e){}
          var audioCtx=null,lastFeedback='';

          function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs))}catch(e){}}
          function tone(kind){
            if(!prefs.sound)return;
            try{
              audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
              if(audioCtx.state==='suspended')audioCtx.resume();
              var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
              osc.type='sine';
              osc.frequency.value=kind==='bad'?180:kind==='resume'?420:620;
              gain.gain.setValueAtTime(.0001,audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.01);
              gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.11);
              osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.12);
            }catch(e){}
          }
          function applyPrefs(){document.documentElement.classList.toggle('vidlik-no-effects',!prefs.effects)}
          applyPrefs();

          function text(sel,fallback){return (document.querySelector(sel)?.textContent||fallback||'').trim()}
          function levelNumber(){var m=text('.taskbox .kicker','').match(/РІВЕНЬ\\s+(\\d+)/i);return m?Math.max(0,Number(m[1])-1):0}
          function pauseData(){
            var task=text('.taskbox h3','Поточне завдання');
            var meta=[...document.querySelectorAll('.progress-meta span')].map(function(el){return el.textContent.trim()});
            return {
              task:task,
              progress:meta[0]||'',
              left:meta[1]||'',
              time:text('.hud>div:first-child b','00:00'),
              errors:text('.hud>div:nth-child(2) b','0')
            };
          }
          function resetPendingState(){
            try{window.eval("try{clearTimeout(nextTimer);nextTimer=null;locked=false;feedback='idle';pressed.clear()}catch(e){}") }catch(e){}
          }
          function focusTask(){
            setTimeout(function(){
              var box=document.querySelector('.taskbox');
              if(!box||!prefs.effects)return;
              box.classList.remove('resume-focus');void box.offsetWidth;box.classList.add('resume-focus');
              setTimeout(function(){box.classList.remove('resume-focus')},1200);
            },80);
          }
          function resumeGame(repeat){
            if(repeat)resetPendingState();
            tone('resume');
            try{
              var p=window.enter?window.enter():window.eval('enter()');
              if(p&&typeof p.then==='function')p.then(focusTask);else focusTask();
            }catch(e){focusTask()}
          }
          function restartLevel(){
            tone('resume');
            try{if(window.startLevel)window.startLevel(levelNumber());else window.eval('startLevel('+levelNumber()+')')}catch(e){}
          }
          function goSector(){
            try{if(window.leave)window.leave();else window.eval('leave()')}catch(e){}
          }
          function toggleSound(){prefs.sound=!prefs.sound;savePrefs();tone('ok');upgradePause()}
          function toggleEffects(){prefs.effects=!prefs.effects;savePrefs();applyPrefs();upgradePause()}

          function pauseMarkup(){
            var d=pauseData();
            return '<section class="pause-card panel">'+
              '<div class="pause-icon" aria-hidden="true"></div>'+
              '<h2>Призупинено</h2>'+
              '<div class="pause-current"><span>Поточне завдання</span><strong>'+d.task+'</strong></div>'+
              '<div class="pause-stats"><span><b>'+d.progress+'</b></span><span>Час <b>'+d.time+'</b></span><span>Помилки <b>'+d.errors+'</b></span></div>'+
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
          function bindPause(){
            document.getElementById('resume')?.addEventListener('click',function(){resumeGame(false)});
            document.getElementById('pause-repeat-task')?.addEventListener('click',function(){resumeGame(true)});
            document.getElementById('pause-restart-level')?.addEventListener('click',restartLevel);
            document.getElementById('pause-sector')?.addEventListener('click',goSector);
            document.getElementById('pause-sound')?.addEventListener('click',toggleSound);
            document.getElementById('pause-effects')?.addEventListener('click',toggleEffects);
          }
          function upgradePause(){
            var pause=document.querySelector('.pause');
            if(!pause||pause.dataset.enhanced==='1')return;
            resetPendingState();
            pause.dataset.enhanced='1';pause.classList.add('pause-enhanced');pause.innerHTML=pauseMarkup();bindPause();
          }
          function syncFeedbackSound(){
            var reader=document.querySelector('.reader');
            if(!reader){lastFeedback='';return}
            var state=reader.classList.contains('correct')?'correct':reader.classList.contains('wrong')?'wrong':'';
            var key=state+'|'+text('.taskbox h3','');
            if(state&&key!==lastFeedback){tone(state==='wrong'?'bad':'ok');lastFeedback=key}
            if(!state)lastFeedback='';
          }
          function sync(){upgradePause();syncFeedbackSound()}

          var root=document.getElementById('game');
          if(root){var observer=new MutationObserver(sync);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
          document.addEventListener('keydown',function(e){
            if(document.querySelector('.pause')&&e.code==='Escape'){
              e.preventDefault();e.stopImmediatePropagation();resumeGame(false);
            }
          },true);
          sync();
        })();
      `;
      doc.body.appendChild(behavior);
    }catch(e){console.error('VIDLIK pause enhancement failed',e)}
  }

  frame.addEventListener('load',installPauseEnhancement);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')installPauseEnhancement();
})();
