(function(){
  const stage=document.querySelector('.ds-stage');
  const bg=document.querySelector('.ds-bg');
  if(!stage||!bg)return;

  fetch('game.html?v=sector1-bg-sync-1',{cache:'no-store'})
    .then(r=>{
      if(!r.ok)throw new Error('game.html '+r.status);
      return r.text();
    })
    .then(html=>{
      const parsed=new DOMParser().parseFromString(html,'text/html');
      const source=parsed.querySelector('img.bg');
      if(!source||!source.getAttribute('src'))throw new Error('Sector 01 background not found');
      const src=source.getAttribute('src');

      const probe=new Image();
      probe.onload=()=>{
        bg.src=src;
        bg.style.display='block';
        stage.style.backgroundImage='none';
        stage.classList.add('sector1-bg-ready');
      };
      probe.onerror=()=>console.error('VIDLIK: sector 01 background image failed to decode');
      probe.src=src;
    })
    .catch(err=>console.error('VIDLIK: sector 01 background sync failed',err));
})();
