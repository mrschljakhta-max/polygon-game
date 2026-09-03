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
          .vidlik-sector-nav{
            display:grid!important;
            grid-template-columns:1fr 1fr!important;
            gap:10px!important;
            width:100%!important;
            margin-top:0!important;
          }
          .vidlik-sector-nav #sector,
          .vidlik-sector-switcher{
            width:100%!important;
            min-width:0!important;
            margin:0!important;
            padding:.82em .75em!important;
            border:1px solid #315d58!important;
            border-radius:9px!important;
            background:#071714cc!important;
            color:#a8c9c5!important;
            font-weight:750!important;
            cursor:pointer!important;
            text-align:center!important;
            transition:.18s ease!important;
          }
          .vidlik-sector-switcher{
            border-color:#3baea4!important;
            color:#83f5ea!important;
            background:linear-gradient(145deg,rgba(6,35,32,.92),rgba(3,19,18,.9))!important;
          }
          .vidlik-sector-nav #sector:hover,
          .vidlik-sector-switcher:hover{
            color:#d8fffb!important;
            border-color:#63e8dc!important;
            box-shadow:0 0 18px rgba(45,220,206,.08)!important;
          }
          .vidlik-sector-switcher:before{
            content:'▦';
            display:inline-block;
            margin-right:.55em;
            color:#45d9ce;
          }
          @media(max-width:800px){
            .vidlik-sector-nav{grid-template-columns:1fr!important;gap:7px!important}
          }
        `;
        doc.head.appendChild(style);
      }

      const sync=()=>{
        const actions=doc.querySelector('.main-menu .hero-actions');
        const sectorBtn=doc.getElementById('sector');
        if(!actions||!sectorBtn)return;
        if(actions.querySelector('.vidlik-sector-nav'))return;

        const nav=doc.createElement('div');
        nav.className='vidlik-sector-nav';

        const btn=doc.createElement('button');
        btn.type='button';
        btn.className='vidlik-sector-switcher';
        btn.textContent='СЕКТОРИ 01–08';
        btn.setAttribute('aria-label','Відкрити всі навчальні сектори');
        btn.addEventListener('click',()=>{
          frame.contentWindow.location.href='desktop-sectors.html?v=2';
        });

        sectorBtn.parentNode.insertBefore(nav,sectorBtn);
        nav.appendChild(sectorBtn);
        nav.appendChild(btn);
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