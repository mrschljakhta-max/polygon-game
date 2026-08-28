(()=>{
  const RX_PATH='/stages/16_level4_rx.html';
  const LAYOUT={
    onomatopoeia:{left:13.2167,top:12.3206,width:26.57,height:23.3724},
    technicalInfo:{left:2.0408,top:77.6737,width:26.3653,height:20.5738},
    displayInput:{left:32.2339,top:38.2077,width:30.764,height:17.9104}
  };

  const states=new WeakMap();
  const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();

  const visible=el=>{
    if(!el||!el.isConnected)return false;
    const r=el.getBoundingClientRect();
    const cs=el.ownerDocument.defaultView.getComputedStyle(el);
    return r.width>4&&r.height>4&&cs.display!=='none'&&cs.visibility!=='hidden';
  };

  function sceneRoot(d){
    const candidates=[
      d.getElementById('stage'),
      d.getElementById('app'),
      d.querySelector('.stage'),
      d.querySelector('.app')
    ].filter(Boolean);
    return candidates.find(el=>{
      const r=el.getBoundingClientRect();
      return r.width>500&&r.height>350;
    })||d.body;
  }

  function exactTextNode(d,phrase){
    const target=norm(phrase);
    const els=[...d.querySelectorAll('div,section,aside,article,p,span,b,strong,h1,h2,h3,label,button')];
    const exact=els.filter(el=>visible(el)&&norm(el.textContent)===target);
    if(exact.length){
      return exact.sort((a,b)=>{
        const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
        return ar.width*ar.height-br.width*br.height;
      })[0];
    }
    return null;
  }

  function safeBox(el,root,kind){
    if(!el||!root||!visible(el))return false;
    const d=root.ownerDocument;
    if(el===root||el===d.body||el===d.documentElement)return false;
    if(!root.contains(el))return false;

    const rr=root.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    if(rr.width<1||rr.height<1)return false;

    const wr=r.width/rr.width;
    const hr=r.height/rr.height;
    const ar=(r.width*r.height)/(rr.width*rr.height);

    // Найважливіший запобіжник: службовий пошук ніколи не має права
    // вибрати весь екран/сцену і змінити її width/height.
    if(kind==='tech'&&(wr>.48||hr>.38||ar>.16))return false;
    if(kind==='display'&&(wr>.58||hr>.40||ar>.20))return false;
    return r.width>90&&r.height>35;
  }

  function nearestLayoutBox(leaf,root,kind){
    if(!leaf)return null;
    let cur=leaf;
    for(let i=0;cur&&cur!==root&&i<6;i++,cur=cur.parentElement){
      if(!safeBox(cur,root,kind))continue;
      const cs=cur.ownerDocument.defaultView.getComputedStyle(cur);
      const positioned=cs.position==='absolute'||cs.position==='fixed';
      const bordered=parseFloat(cs.borderTopWidth)>0||parseFloat(cs.borderLeftWidth)>0;
      const bg=cs.backgroundColor&&cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent';
      if(positioned||bordered||bg)return cur;
    }
    return safeBox(leaf,root,kind)?leaf:null;
  }

  function findTechnical(d,root){
    const ids=['miniHud','techInfo','technicalInfo','taskInfo','missionInfo','taskBox','infoBox','statusBox'];
    for(const id of ids){
      const el=d.getElementById(id);
      if(safeBox(el,root,'tech'))return el;
    }
    return nearestLayoutBox(exactTextNode(d,'ЗАВДАННЯ'),root,'tech');
  }

  function findDisplayInput(d,root){
    const ids=['displayInput','inputPanel','inputBox','entryPanel','displayEntry','freqEntry','rxInput'];
    for(const id of ids){
      const el=d.getElementById(id);
      if(safeBox(el,root,'display'))return el;
    }
    return nearestLayoutBox(exactTextNode(d,'ВВЕДИ ЗНАЧЕННЯ'),root,'display');
  }

  function cssTarget(root,spec){
    const rr=root.getBoundingClientRect();
    return {
      left:rr.left+rr.width*spec.left/100,
      top:rr.top+rr.height*spec.top/100,
      width:rr.width*spec.width/100,
      height:rr.height*spec.height/100
    };
  }

  function place(el,root,spec,role){
    if(!el||!root)return false;
    if(role==='technicalInfo'&&!safeBox(el,root,'tech'))return false;
    if(role==='displayInput'&&!safeBox(el,root,'display'))return false;

    el.dataset.rx01LayoutRole=role;
    el.style.setProperty('position','absolute','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('margin','0','important');
    el.style.setProperty('transform','none','important');
    el.style.setProperty('transform-origin','top left','important');

    const op=el.offsetParent||root;
    const or=op.getBoundingClientRect();
    const target=cssTarget(root,spec);
    const sx=or.width/(op.clientWidth||or.width||1);
    const sy=or.height/(op.clientHeight||or.height||1);
    const originX=or.left+(op.clientLeft||0)*sx;
    const originY=or.top+(op.clientTop||0)*sy;
    const left=(target.left-originX)/sx+(op.scrollLeft||0);
    const top=(target.top-originY)/sy+(op.scrollTop||0);
    const width=target.width/sx;
    const height=target.height/sy;

    el.style.setProperty('left',left+'px','important');
    el.style.setProperty('top',top+'px','important');
    el.style.setProperty('width',width+'px','important');
    el.style.setProperty('height',height+'px','important');
    el.style.setProperty('max-width','none','important');
    el.style.setProperty('max-height','none','important');
    el.style.setProperty('box-sizing','border-box','important');

    if(role==='onomatopoeia'){
      const img=el.querySelector('img');
      if(img){
        img.style.setProperty('width','100%','important');
        img.style.setProperty('height','100%','important');
        img.style.setProperty('object-fit','contain','important');
      }
    }
    return true;
  }

  function getState(d,root){
    let state=states.get(d);
    if(!state){
      state={root,tech:null,display:null};
      states.set(d,state);
    }
    state.root=root;
    return state;
  }

  function apply(frame){
    try{
      const w=frame?.contentWindow,d=frame?.contentDocument;
      if(!w||!d||!d.body||!w.location.pathname.endsWith(RX_PATH))return false;
      const root=sceneRoot(d);
      if(!root)return false;
      const state=getState(d,root);

      // Ці два блоки визначаємо один раз і надалі не шукаємо заново
      // після зміни текстів/стану гри. Саме повторний пошук після введення
      // азимуту раніше міг помилково схопити контейнер усієї сцени.
      if(!state.tech||!state.tech.isConnected)state.tech=findTechnical(d,root);
      if(!state.display||!state.display.isConnected)state.display=findDisplayInput(d,root);

      const ono=d.getElementById('rx01RxOnoPng')||d.getElementById('rx01PetroOnoV2');

      if(ono)place(ono,root,LAYOUT.onomatopoeia,'onomatopoeia');
      if(state.tech)place(state.tech,root,LAYOUT.technicalInfo,'technicalInfo');
      if(state.display)place(state.display,root,LAYOUT.displayInput,'displayInput');

      d.documentElement.dataset.rx01LayoutV2='2';
      return !!(ono||state.tech||state.display);
    }catch(err){
      console.warn('RX-01 layout v2 failed',err);
      return false;
    }
  }

  function arm(frame){
    try{
      const w=frame?.contentWindow,d=frame?.contentDocument;
      if(!w||!d||!d.body||!w.location.pathname.endsWith(RX_PATH))return;

      // Без MutationObserver. Інтерфейс після введення азимуту може змінювати
      // текст, але геометрію вже виставлених блоків чіпати не потрібно.
      apply(frame);
      [80,180,400,800,1400].forEach(ms=>setTimeout(()=>apply(frame),ms));

      if(!w.__rx01LayoutResizeBound){
        w.__rx01LayoutResizeBound=true;
        w.addEventListener('resize',()=>apply(frame),{passive:true});
      }
    }catch(err){
      console.warn('RX-01 layout v2 arm failed',err);
    }
  }

  window.RX01_APPLY_LEVEL4_RX_LAYOUT=arm;
  const frame=document.getElementById('frame');
  if(frame){
    frame.addEventListener('load',()=>arm(frame));
    setTimeout(()=>arm(frame),0);
  }
})();