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
          function syncTaskInstruction(){
            try{
              if(typeof currentTask!=='function')return;
              var task=currentTask();
              var title=document.querySelector('.taskbox h3');
              if(!task||!title)return;
              var instruction=(task.text||task.title||'').trim().replace(/[.!?]+$/,'');
              if(!instruction)return;
              title.textContent=instruction.toUpperCase();
              title.setAttribute('data-task-scene',task.scene||'');
            }catch(e){}
          }

          var root=document.getElementById('game');
          if(root){
            var observer=new MutationObserver(syncTaskInstruction);
            observer.observe(root,{childList:true,subtree:true,characterData:true});
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
