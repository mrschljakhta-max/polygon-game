(function(){
  const frame=document.getElementById('sector1Backdrop');
  if(!frame)return;

  function prepare(){
    try{
      const doc=frame.contentDocument;
      if(!doc)return;

      const game=doc.getElementById('game');
      if(game)game.style.setProperty('display','none','important');

      const vignette=doc.querySelector('.vignette');
      if(vignette)vignette.style.setProperty('display','none','important');

      const shell=doc.querySelector('.shell');
      const stage=doc.querySelector('.stage');
      const bg=doc.querySelector('.bg');

      if(shell){
        shell.style.setProperty('background','transparent','important');
        shell.style.setProperty('width','100%','important');
        shell.style.setProperty('height','100%','important');
      }
      if(stage){
        stage.style.setProperty('width','100%','important');
        stage.style.setProperty('height','100%','important');
        stage.style.setProperty('max-width','none','important');
        stage.style.setProperty('max-height','none','important');
        stage.style.setProperty('box-shadow','none','important');
      }
      if(bg){
        bg.style.setProperty('display','block','important');
        bg.style.setProperty('width','100%','important');
        bg.style.setProperty('height','100%','important');
        bg.style.setProperty('object-fit','cover','important');
        bg.style.setProperty('object-position','50% 50%','important');
        bg.style.setProperty('opacity','1','important');
        bg.style.setProperty('filter','none','important');
      }

      frame.classList.add('ready');
    }catch(err){
      console.error('VIDLIK: sector 01 backdrop preparation failed',err);
    }
  }

  frame.addEventListener('load',prepare,{once:false});
  if(frame.contentDocument?.readyState==='complete')prepare();
})();
