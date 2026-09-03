(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  function enhanceTaskGuidance(){
    try{
      const doc=frame.contentDocument;
      if(!doc||doc.getElementById('vidlik-task-guidance'))return;

      const link=doc.createElement('link');
      link.id='vidlik-task-guidance';
      link.rel='stylesheet';
      link.href='./task-guidance.css';
      doc.head.appendChild(link);

      const behavior=doc.createElement('script');
      behavior.id='vidlik-task-guidance-behavior';
      behavior.textContent=`
        (function(){
          var syncing=false;

          function syncTaskInstruction(){
            if(syncing)return;
            syncing=true;
            try{
              if(typeof currentTask!=='function')return;
              var task=currentTask();
              var title=document.querySelector('.taskbox h3');
              if(!task||!title)return;

              var instruction=(task.text||task.title||'').trim().replace(/[.!?]+$/,'');
              if(!instruction)return;

              var nextText=instruction.toUpperCase();
              var nextScene=task.scene||'';

              /* Важливо: не переписуємо DOM, якщо значення вже актуальні.
                 Інакше MutationObserver запускає сам себе безкінечно. */
              if(title.textContent.trim()!==nextText){
                title.textContent=nextText;
              }
              if(title.getAttribute('data-task-scene')!==nextScene){
                title.setAttribute('data-task-scene',nextScene);
              }
            }catch(e){}
            finally{syncing=false;}
          }

          var root=document.getElementById('game');
          if(root){
            var observer=new MutationObserver(function(){
              syncTaskInstruction();
            });
            /* render() замінює вміст #game, тому childList достатньо.
               characterData тут не потрібен і лише провокував зайві цикли. */
            observer.observe(root,{childList:true,subtree:true});
          }

          syncTaskInstruction();
        })();
      `;
      doc.body.appendChild(behavior);
    }catch(e){console.error('VIDLIK task guidance injection failed',e)}
  }

  frame.addEventListener('load',enhanceTaskGuidance);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')enhanceTaskGuidance();
})();
