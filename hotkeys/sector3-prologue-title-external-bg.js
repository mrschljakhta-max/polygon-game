(()=>{
'use strict';

const IMAGE_URL='assets/sector3-prologue/prologue-title-bg.png';
let tries=0;

function applyExternalBackground(){
  const root=document.getElementById('vidlikPrologueTitle');
  const bg=root?.querySelector('.vpt-bg');

  if(!bg){
    if(tries++<180) requestAnimationFrame(applyExternalBackground);
    return;
  }

  // The title module may define an embedded/data background. This external file
  // is the canonical source and must win over that style.
  bg.style.setProperty('background-image',`url("${IMAGE_URL}")`,'important');
  bg.style.setProperty('background-size','cover','important');
  bg.style.setProperty('background-position','center center','important');
  bg.style.setProperty('background-repeat','no-repeat','important');
  bg.style.opacity='0';
  bg.style.transition='opacity 1.25s ease';

  const image=new Image();
  image.decoding='async';
  image.onload=()=>{
    bg.style.opacity='1';
    root.classList.add('vpt-external-bg-ready');
  };
  image.onerror=()=>{
    console.error('[VIDLIK] Не вдалося завантажити фон прологу:',IMAGE_URL);
    bg.style.opacity='1';
    root.classList.add('vpt-external-bg-error');
  };
  image.src=IMAGE_URL;
}

applyExternalBackground();
})();
