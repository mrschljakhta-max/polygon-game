(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc)return;

      if(!doc.getElementById('vidlik-sector-switcher-style')){
        const style=doc.createElement('style');
        style.id='vidlik-sector-switcher-style';
        style.textContent=`
          /* Start menu: one primary CTA + one quiet navigation action. */
          .main-menu .hero-actions{
            gap:10px!important;
            padding:5%!important;
          }
          .main-menu .hero-actions>.primary{
            margin-bottom:1px!important;
          }
          .main-menu .hero-actions>#sector{
            display:none!important;
          }
          .vidlik-sector-switcher{
            appearance:none!important;
            -webkit-appearance:none!important;
            width:max-content!important;
            max-width:100%!important;
            min-width:0!important;
            margin:.2em 0 0!important;
            padding:.42em 0!important;
            border:0!important;
            border-radius:0!important;
            background:transparent!important;
            box-shadow:none!important;
            color:#5edfd4!important;
            font-size:clamp(9px,.72vw,13px)!important;
            font-weight:720!important;
            letter-spacing:.035em!important;
            text-align:left!important;
            cursor:pointer!important;
            transition:color .16s ease,transform .16s ease!important;
          }
          .vidlik-sector-switcher::before{
            content:'▦';
            display:inline-block;
            margin-right:.65em;
            color:#45d9ce;
            font-size:1.05em;
          }
          .vidlik-sector-switcher::after{
            content:'→';
            display:inline-block;
            margin-left:.7em;
            color:#4ebeb5;
            transition:transform .16s ease,color .16s ease;
          }
          .vidlik-sector-switcher:hover{
            color:#a8fff7!important;
            transform:translateX(2px)!important;
          }
          .vidlik-sector-switcher:hover::after{
            color:#8efff4;
            transform:translateX(3px);
          }
          .main-menu .summary b{
            display:none!important;
          }
          .main-menu .summary{
            gap:0!important;
          }
          .main-menu .hero-actions small{
            color:#7f9f9b!important;
          }
          @media(max-width:800px){
            .main-menu .hero-actions{padding:4.5%!important;gap:8px!important}
            .vidlik-sector-switcher{font-size:clamp(9px,1.35vw,12px)!important}
          }
        `;
        doc.head.appendChild(style);
      }

      const sync=()=>{
        const actions=doc.querySelector('.main-menu .hero-actions');
        if(!actions)return;

        const sectorBtn=actions.querySelector('#sector');
        if(sectorBtn)sectorBtn.hidden=true;

        const summary=doc.querySelector('.main-menu .summary');
        if(summary){
          const label=summary.querySelector('span');
          if(label&&label.textContent.trim()!=='СЕКТОР 01')label.textContent='СЕКТОР 01';
        }

        const progressMeta=actions.querySelector('small');
        if(progressMeta){
          const m=progressMeta.textContent.match(/(\d+)\s*пройдено/i);
          if(m){
            const next=`${m[1]} / 10 пройдено`;
            if(progressMeta.textContent.trim()!==next)progressMeta.textContent=next;
          }
        }

        if(!actions.querySelector('.vidlik-sector-switcher')){
          const btn=doc.createElement('button');
          btn.type='button';
          btn.className='vidlik-sector-switcher';
          btn.textContent='СЕКТОРИ 01–08';
          btn.setAttribute('aria-label','Відкрити всі навчальні сектори');
          btn.addEventListener('click',()=>{
            frame.contentWindow.location.href='desktop-sectors.html?v=8';
          });
          actions.appendChild(btn);
        }
      };

      sync();
      const root=doc.getElementById('game');
      if(root){
        const mo=new MutationObserver(sync);
        mo.observe(root,{childList:true,subtree:true});
      }
    }catch(e){
      console.error('VIDLIK sector switcher failed',e);
    }
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')install();
})();