(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if(parseInt(params.get('sector')||'0',10)!==3)return;

/*
 * Sector 3 has its own story navigator. It deliberately reuses the approved
 * briefing layout/CSS (number slots, text slots, paper card, selection mark),
 * but none of the old "10 lessons / two pages" runtime is used here.
 */
const DATA=window.VIDLIK_MODULE_BRIEFINGS||{};
const LAYOUTS=window.VIDLIK_MODULE_LAYOUTS||{};
const cfg=DATA[3]||{};
const layout=LAYOUTS[3]||{};

const SCENES=[
 {id:0,no:'00',act:0,actLabel:'ПРОЛОГ',actTitle:'ЗАБОРОНЕНИЙ ДЗВІНОК',title:'ЗАБОРОНЕНИЙ ДЗВІНОК',summary:'Перший контакт із Полею, синхронізація робочої станції та вхід у Сектор 3.',available:true,target:'sector3-intro.html?v=20260908-4&from=briefing'},
 {id:1,no:'01',act:1,actLabel:'АКТ I',actTitle:'ЗНАЙОМСТВО',title:'ІНША ВЕРСІЯ',summary:'267 заявлених записів перетворюються на 268. Прихований запис №17 відкриває ім’я Данила Вереса.',available:true,target:'sector3-intro.html?v=20260908-4&storyScene=1&from=briefing'},
 {id:2,no:'02',act:1,actLabel:'АКТ I',actTitle:'ЗНАЙОМСТВО',title:'СИГНАЛ',summary:'Три ноти повертають Булку до Ночі 17. Перевірка статусів руйнує офіційну версію про повну евакуацію.',available:false},
 {id:3,no:'03',act:1,actLabel:'АКТ I',actTitle:'ЗНАЙОМСТВО',title:'ОФІЦІЙНА ВЕРСІЯ',summary:'Ірина Вольська надсилає офіційний архів. Дві версії одних даних починають суперечити одна одній.',available:false},
 {id:4,no:'04',act:2,actLabel:'АКТ II',actTitle:'ПОЛЮВАННЯ',title:'ЗРАДА МАКСИМА',summary:'Версії файлів приводять до сліду Максима й показують, хто відкрив адресу укриття Полі.',available:false},
 {id:5,no:'05',act:2,actLabel:'АКТ II',actTitle:'ПОЛЮВАННЯ',title:'ВИБІР ПОЛІ',summary:'Коли переслідувачі вже біля дверей, Поля обирає не архів, а Булку. Доказ доведеться зберегти гравцеві.',available:false},
 {id:6,no:'06',act:2,actLabel:'АКТ II',actTitle:'ПОЛЮВАННЯ',title:'ЛАДА',summary:'Лада відкриває першу справжню правду про Ніч 17 і власний зв’язок із Данилом та Булкою.',available:false},
 {id:7,no:'07',act:3,actLabel:'АКТ III',actTitle:'НОВА НІЧ',title:'БЛЕКАУТ',summary:'Місто починає гаснути. Дані вперше підтверджують: зупинка протоколу також може коштувати життів.',available:false},
 {id:8,no:'08',act:3,actLabel:'АКТ III',actTitle:'НОВА НІЧ',title:'РАЙОН АНТОНА',summary:'У зону ізоляції потрапляє район доньки Антона, і система пропонує йому особистий виняток.',available:false},
 {id:9,no:'09',act:3,actLabel:'АКТ III',actTitle:'НОВА НІЧ',title:'РОЗЛУКА',summary:'Поля віддає Булку Ладі й сама виходить на відкритий канал, відводячи переслідування від доказів.',available:false},
 {id:10,no:'10',act:3,actLabel:'АКТ III',actTitle:'НОВА НІЧ',title:'ПОВНА ПРАВДА',summary:'Оригінальний журнал показує цифровий підпис Полі під командою ізоляції та справжню ціну її плану.',available:false},
 {id:11,no:'11',act:4,actLabel:'АКТ IV',actTitle:'НУЛЬОВА ГОДИНА',title:'ДАНИЛОВЕ ПОВІДОМЛЕННЯ',summary:'Останній запис Данила пояснює, чому система так легко перетворює конкретну людину на допустиму втрату.',available:false},
 {id:12,no:'12',act:4,actLabel:'АКТ IV',actTitle:'НУЛЬОВА ГОДИНА',title:'ПОШУК ПОЛІ',summary:'Лада й Антон відновлюють маршрут Полі, а Булка допомагає знайти вхід до старої станції «Контуру».',available:false},
 {id:13,no:'13',act:4,actLabel:'АКТ IV',actTitle:'НУЛЬОВА ГОДИНА',title:'ТРИ ГОЛОСИ',summary:'Ірина, Поля і Лада пропонують три різні рішення. Остаточний вибір переходить до гравця.',available:false},
 {id:14,no:'14',act:4,actLabel:'АКТ IV',actTitle:'НУЛЬОВА ГОДИНА',title:'ВЛАСНЕ РІШЕННЯ',summary:'Фінальна перевірка даних відкриває крайні варіанти або третій шлях — якщо зібрано достатньо доказів.',available:false}
];

const q=s=>document.querySelector(s);
const screen=q('#mbf-screen');
const shell=q('.mbf-shell');
const art=q('#mbf-art');
const list=q('#mbf-levels-list');
const title=q('#mbf-title');
const kicker=q('#mbf-kicker');
const summaryWrap=q('.mbf-summary');
const heading=q('#mbf-page-heading');
const summary=q('#mbf-summary');
const stat=q('.mbf-stat');
const statLabel=stat?.querySelector(':scope>span');
const statValue=q('#mbf-progress');
const statSmall=q('#mbf-levels');
const pageToggle=q('#mbf-page-toggle');
const progress=q('.mbf-progress-wrap');
const stamp=q('#mbf-stamp');
const pageNav=q('.mbf-page-nav');
const actions=q('.mbf-actions');
const backBtn=q('#mbf-back');
if(!screen||!shell||!art||!list)return;

screen.classList.add('mbf-v3','mbf-sector-3','sector3-story-nav');
screen.setAttribute('aria-label','Сектор 3 — акти та сцени');
screen.style.backgroundImage='url("/hotkeys/assets/backgrounds/sectors-board.webp")';

const style=document.createElement('style');
style.id='sector3-story-nav-clean-style';
style.textContent=`
.sector3-story-nav #mbf-page-toggle,
.sector3-story-nav .mbf-page-nav,
.sector3-story-nav .mbf-progress-wrap,
.sector3-story-nav #mbf-stamp{display:none!important}
.sector3-story-nav #mbf-levels-list{pointer-events:auto!important}
.sector3-story-nav .mbf-level{cursor:pointer}
.sector3-story-nav .mbf-level.is-locked{cursor:default}
.sector3-story-nav .mbf-summary{cursor:pointer}
.sector3-story-nav .mbf-summary.is-planned{cursor:default}
.sector3-story-nav .mbf-summary.is-unavailable{animation:s3BriefNudge .28s ease}
.sector3-story-nav .mbf-actions{pointer-events:none}
.sector3-story-nav .mbf-levels-list.is-changing{opacity:.55;transform:translateY(var(--page-shift,0));transition:opacity .09s ease,transform .09s ease}
@keyframes s3BriefNudge{0%,100%{transform:rotate(var(--mbf-rotate)) translateX(0)}35%{transform:rotate(var(--mbf-rotate)) translateX(-4px)}70%{transform:rotate(var(--mbf-rotate)) translateX(4px)}}
`;
document.head.appendChild(style);

function setBox(el,r){
 if(!el||!r)return;
 const angle=`${Number(r.angleDeg)||0}deg`;
 el.style.left=`${r.xPct}%`;
 el.style.top=`${r.yPct}%`;
 el.style.width=`${r.widthPct}%`;
 el.style.height=`${r.heightPct}%`;
 el.style.setProperty('--mbf-rotate',angle);
 el.style.transform='rotate(var(--mbf-rotate))';
 el.style.zIndex=String(r.z||1);
}

/* Restore the exact approved folder geometry that the old briefing runtime used. */
const f=layout.folder;
if(f){
 shell.style.setProperty('--folder-x',`${f.xPct}%`);
 shell.style.setProperty('--folder-y',`${f.yPct}%`);
 shell.style.setProperty('--folder-w',`${f.widthPct}%`);
 shell.style.setProperty('--folder-aspect',`${f.sourceW||f.actualW||1951}/${f.sourceH||f.actualH||806}`);
}
setBox(q('.mbf-title'),layout.title);
setBox(summaryWrap,layout.summary);
setBox(stat,layout.stat);
if(pageToggle)pageToggle.hidden=true;
if(progress)progress.style.display='none';
if(stamp)stamp.style.display='none';
if(pageNav)pageNav.style.display='none';

function loadArt(path){
 if(!path)return;
 const img=new Image();
 img.decoding='async';
 img.onload=()=>{
  if(img.naturalWidth&&img.naturalHeight)shell.style.setProperty('--folder-aspect',`${img.naturalWidth}/${img.naturalHeight}`);
  art.style.backgroundImage=`url("${path}")`;
  screen.classList.add('mbf-art-ready');
 };
 img.onerror=()=>screen.classList.add('mbf-art-missing');
 img.src=path;
}
if(cfg.image){
 const optimized=cfg.image.replace(/\.png(?:\?.*)?$/,'.webp?v=20260905-1');
 const test=new Image();
 test.onload=()=>loadArt(optimized);
 test.onerror=()=>loadArt(cfg.image);
 test.src=optimized;
}

if(actions)actions.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd> СЦЕНА</span><span><kbd>←</kbd><kbd>→</kbd> АКТ</span><span><kbd>ESC</kbd> НАЗАД</span><span><kbd>ENTER</kbd> <b id="mbf-action-label">ПЕРЕЙТИ</b></span>';
const actionLive=q('#mbf-action-label');

const slotCount=Math.max(1,Math.min(6,layout.numberSlots?.length||6,layout.textSlots?.length||6));
let selected=0;
let start=0;
let leaving=false;
let animationTimer=0;

try{
 const saved=JSON.parse(sessionStorage.getItem('vidlik-sector3-story-selection-v2')||'null');
 if(Number.isFinite(saved?.scene)){const idx=SCENES.findIndex(s=>s.id===saved.scene);if(idx>=0)selected=idx}
}catch(_){ }

function scene(){return SCENES[selected]}
function ensureVisible(){
 if(selected<start)start=selected;
 if(selected>=start+slotCount)start=selected-slotCount+1;
 start=Math.max(0,Math.min(start,Math.max(0,SCENES.length-slotCount)));
}

function digitIcon(sceneNo){
 const icon=document.createElement('span');
 icon.className='mbf-level-icon';
 const fallback=document.createElement('span');
 fallback.className='mbf-number-fallback';
 fallback.textContent=sceneNo;
 icon.appendChild(fallback);
 if(!cfg.numberIconsBase)return icon;
 let loaded=0,failed=false;
 const imgs=[];
 String(sceneNo).padStart(2,'0').split('').forEach(d=>{
  const img=document.createElement('img');
  img.className='mbf-digit';img.alt='';img.src=`${cfg.numberIconsBase}number-${d}-small.svg`;
  img.onload=()=>{loaded++;if(!failed&&loaded===2)icon.classList.add('has-digit-art')};
  img.onerror=()=>{failed=true;imgs.forEach(x=>x.remove());icon.classList.remove('has-digit-art')};
  imgs.push(img);icon.appendChild(img);
 });
 return icon;
}
function selectionRect(i){
 const boxes=[layout.numberSlots?.[i],layout.textSlots?.[i]].filter(Boolean);
 if(!boxes.length)return null;
 const left=Math.min(...boxes.map(b=>Number(b.xPct)||0));
 const top=Math.min(...boxes.map(b=>Number(b.yPct)||0));
 const bottom=Math.max(...boxes.map(b=>(Number(b.yPct)||0)+(Number(b.heightPct)||0)));
 return{xPct:Math.max(0,left-.45),yPct:Math.max(0,top+.08),widthPct:.3,heightPct:Math.max(1,bottom-top-.16),angleDeg:0,z:60};
}

function renderRows(){
 ensureVisible();
 list.innerHTML='';
 SCENES.slice(start,start+slotCount).forEach((s,i)=>{
  const globalIndex=start+i;
  const li=document.createElement('li');
  const state=s.available?'open':'locked';
  li.className=`mbf-level is-${state}${globalIndex===selected?' is-selected':''}`;
  li.dataset.scene=String(s.id);
  li.dataset.index=String(globalIndex);
  li.setAttribute('aria-selected',globalIndex===selected?'true':'false');
  li.setAttribute('aria-label',`${s.actLabel}, сцена ${s.no}: ${s.title}${s.available?'':' — у розробці'}`);
  li.tabIndex=-1;

  const icon=digitIcon(s.no);
  const text=document.createElement('span');
  const check=document.createElement('span');
  text.className='mbf-level-text';text.textContent=s.title;
  check.className='mbf-level-check';
  setBox(icon,layout.numberSlots?.[i]);
  setBox(text,layout.textSlots?.[i]);
  setBox(check,layout.checkSlots?.[i]);

  if(globalIndex===selected){
   const frame=document.createElement('span');
   frame.className='mbf-level-selection';
   setBox(frame,selectionRect(i));
   li.append(frame);
  }
  li.append(icon,text,check);
  list.appendChild(li);
 });
}

function renderMeta(){
 const s=scene();
 if(kicker)kicker.textContent=`VIDLIK · СЕКТОР 03 · ${s.actLabel}`;
 if(title)title.textContent=s.actTitle;
 if(heading)heading.textContent=`СЦЕНА ${s.no} · ${s.title}`;
 if(summary){summary.textContent=s.summary;summaryWrap?.classList.toggle('is-planned',!s.available)}
 if(statLabel)statLabel.textContent='СЦЕНА';
 if(statValue)statValue.textContent=s.no;
 if(statSmall)statSmall.textContent=s.available?'ДОСТУПНА':'В РОЗРОБЦІ';
 if(actionLive)actionLive.textContent=s.available?'ПЕРЕЙТИ':'В РОЗРОБЦІ';
 art.setAttribute('aria-label',`${s.actLabel} — ${s.actTitle}; сцена ${s.no} — ${s.title}`);
}
function render(){renderRows();renderMeta()}

function selectIndex(next,animate=true){
 next=Math.max(0,Math.min(SCENES.length-1,next));
 if(next===selected){renderMeta();return}
 clearTimeout(animationTimer);
 const oldStart=start;
 selected=next;ensureVisible();
 if(animate&&oldStart!==start){
  list.style.setProperty('--page-shift',`${next>selected?-7:7}px`);
  list.classList.add('is-changing');
  animationTimer=setTimeout(()=>{render();requestAnimationFrame(()=>list.classList.remove('is-changing'))},80);
 }else render();
 try{sessionStorage.setItem('vidlik-sector3-story-selection-v2',JSON.stringify({scene:scene().id}))}catch(_){ }
}
function jumpAct(delta){
 const currentAct=scene().act;
 const acts=[...new Set(SCENES.map(s=>s.act))];
 const p=acts.indexOf(currentAct);
 const nextAct=acts[Math.max(0,Math.min(acts.length-1,p+delta))];
 if(nextAct===currentAct)return;
 const idx=SCENES.findIndex(s=>s.act===nextAct);
 if(idx>=0)selectIndex(idx);
}
function unavailableFeedback(){
 if(!summaryWrap)return;
 summaryWrap.classList.remove('is-unavailable');void summaryWrap.offsetWidth;summaryWrap.classList.add('is-unavailable');
}
function openSelected(){
 const s=scene();
 if(!s.available||!s.target){unavailableFeedback();return}
 if(leaving)return;
 leaving=true;screen.classList.add('mbf-leaving');
 try{sessionStorage.setItem('vidlik-sector3-story-selection-v2',JSON.stringify({scene:s.id}))}catch(_){ }
 setTimeout(()=>location.href=s.target,280);
}
function goBack(){
 if(leaving)return;
 leaving=true;screen.classList.add('mbf-leaving');
 const cameFromPause=params.get('from')==='pause';
 setTimeout(()=>{
  if(cameFromPause&&history.length>1)history.back();
  else location.href='desktop-sectors.html?v=14';
 },260);
}

if(backBtn){
 backBtn.textContent=params.get('from')==='pause'?'← ДО ГРИ · ESC':'← СЕКТОРИ · ESC';
 backBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();goBack()});
}
list.addEventListener('click',e=>{
 const li=e.target.closest('.mbf-level[data-index]');
 if(!li)return;
 e.preventDefault();e.stopPropagation();
 const idx=Number(li.dataset.index);
 if(Number.isFinite(idx))selectIndex(idx,false);
});
list.addEventListener('dblclick',e=>{
 if(!e.target.closest('.mbf-level[data-index]'))return;
 e.preventDefault();e.stopPropagation();openSelected();
});
summaryWrap?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openSelected()});
list.addEventListener('wheel',e=>{
 if(Math.abs(e.deltaY)<4)return;
 e.preventDefault();
 selectIndex(selected+(e.deltaY>0?1:-1));
},{passive:false});

document.addEventListener('keydown',e=>{
 if(!['Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(e.key==='Escape'){goBack();return}
 if(e.key==='ArrowUp'){selectIndex(selected-1);return}
 if(e.key==='ArrowDown'){selectIndex(selected+1);return}
 if(e.key==='ArrowLeft'){jumpAct(-1);return}
 if(e.key==='ArrowRight'){jumpAct(1);return}
 if(e.key==='Enter')openSelected();
},true);

window.addEventListener('pageshow',()=>{leaving=false;screen.classList.remove('mbf-leaving')});
render();
})();
