(function(){
  const frame=document.getElementById('gameFrame');
  if(!frame)return;

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc)return;

      if(!doc.getElementById('vidlik-start-menu-lite-style')){
        const style=doc.createElement('style');
        style.id='vidlik-start-menu-lite-style';
        style.textContent=`
          .main-menu .hero-actions{
            gap:9px!important;
            padding:4.6%!important;
            min-height:0!important;
          }
          .main-menu .hero-actions>.primary{
            margin:0 0 2px!important;
          }
          .main-menu .hero-actions #sector,
          .main-menu .vidlik-sector-nav,
          .main-menu .vidlik-sector-switcher{
            display:none!important;
          }
          .main-menu .summary b{
            display:none!important;
          }
          .main-menu .summary{
            gap:0!important;
          }
          .main-menu .hero-actions small{
            color:#819f9b!important;
            margin-top:-2px!important;
          }
          .vidlik-sector-link{
            appearance:none!important;
            -webkit-appearance:none!important;
            display:inline-flex!important;
            align-items:center!important;
            justify-content:flex-start!important;
            width:max-content!important;
            max-width:100%!important;
            margin:2px 0 0!important;
            padding:.38em 0!important;
            border:0!important;
            background:transparent!important;
            box-shadow:none!important;
            color:#62ddd3!important;
            font-size:clamp(9px,.72vw,13px)!important;
            line-height:1.2!important;
            font-weight:720!important;
            letter-spacing:.035em!important;
            cursor:pointer!important;
            transition:color .16s ease,transform .16s ease!important;
          }
          .vidlik-sector-link::before{
            content:'▦';
            margin-right:.65em;
            color:#45d9ce;
          }
          .vidlik-sector-link::after{
            content:'→';
            margin-left:.72em;
            color:#4bbcb3;
            transition:transform .16s ease,color .16s ease;
          }
          .vidlik-sector-link:hover{
            color:#a8fff7!important;
            transform:translateX(2px)!important;
          }
          .vidlik-sector-link:hover::after{
            color:#8efff4;
            transform:translateX(3px);
          }
          @media(max-width:800px){
            .main-menu .hero-actions{gap:7px!important;padding:4%!important}
            .vidlik-sector-link{font-size:clamp(9px,1.35vw,12px)!important}
          }
        `;
        doc.head.appendChild(style);
      }

      const sync=()=>{
        const actions=doc.querySelector('.main-menu .hero-actions');
        if(!actions)return;

        // Remove every legacy two-button navigation wrapper left by older builds.
        actions.querySelectorAll('.vidlik-sector-nav').forEach(nav=>{
          const sector=nav.querySelector('#sector');
          if(sector)sector.remove();
          nav.remove();
        });
        actions.querySelectorAll('#sector,.vidlik-sector-switcher').forEach(el=>el.remove());

        const summary=doc.querySelector('.main-menu .summary');
        if(summary){
          const label=summary.querySelector('span');
          if(label)label.textContent='СЕКТОР 01';
          summary.querySelectorAll('b').forEach(el=>el.remove());
        }

        const progressMeta=actions.querySelector('small');
        if(progressMeta){
          const m=progressMeta.textContent.match(/(\d+)\s*пройдено/i);
          if(m)progressMeta.textContent=`${m[1]} / 10 пройдено`;
        }

        if(!actions.querySelector('.vidlik-sector-link')){
          const link=doc.createElement('button');
          link.type='button';
          link.className='vidlik-sector-link';
          link.textContent='СЕКТОРИ 01–08';
          link.setAttribute('aria-label','Відкрити всі навчальні сектори');
          link.addEventListener('click',()=>{
            frame.contentWindow.location.href='desktop-sectors.html?v=9';
          });
          actions.appendChild(link);
        }
      };

      sync();
      const root=doc.getElementById('game');
      if(root){
        const mo=new MutationObserver(sync);
        mo.observe(root,{childList:true,subtree:true});
      }
    }catch(e){
      console.error('VIDLIK start menu lite failed',e);
    }
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')install();
})();
