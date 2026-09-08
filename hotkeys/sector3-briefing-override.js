(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(parseInt(params.get('sector')||'0',10)!==3)return;

const CHAPTERS=[
 {kind:'prologue',roman:'',title:'ЗАБОРОНЕНИЙ ДЗВІНОК',scenes:[
  {id:0,no:'00',title:'ЗАБОРОНЕНИЙ ДЗВІНОК',summary:'Перший контакт із Полею, синхронізація робочої станції та вхід у Сектор 3.',available:true,target:'sector3-intro.html?v=20260908-1&from=briefing'}
 ]},
 {kind:'act',roman:'I',title:'ЗНАЙОМСТВО',scenes:[
  {id:1,no:'01',title:'ІНША ВЕРСІЯ',summary:'267 заявлених записів перетворюються на 268. Прихований рядок №17 відкриває ім’я Данила Вереса.',available:true,target:'sector3-intro.html?v=20260908-1&storyScene=1&from=briefing'},
  {id:2,no:'02',title:'СИГНАЛ',summary:'Три ноти повертають Булку до Ночі 17. Перевірка статусів руйнує офіційну версію про повну евакуацію.',available:false},
  {id:3,no:'03',title:'ОФІЦІЙНА ВЕРСІЯ',summary:'Ірина Вольська надсилає офіційний архів. Дві версії одних даних починають суперечити одна одній.',available:false}
 ]},
 {kind:'act',roman:'II',title:'ПОЛЮВАННЯ',scenes:[
  {id:4,no:'04',title:'ЗРАДА МАКСИМА',summary:'Версії файлів приводять до сліду Максима й показують, хто відкрив адресу укриття Полі.',available:false},
  {id:5,no:'05',title:'ВИБІР ПОЛІ',summary:'Коли переслідувачі вже біля дверей, Поля обирає не архів, а Булку. Доказ доведеться зберегти гравцеві.',available:false},
  {id:6,no:'06',title:'ЛАДА',summary:'Лада відкриває першу справжню правду про Ніч 17 і власний зв’язок із Данилом та Булкою.',available:false}
 ]},
 {kind:'act',roman:'III',title:'НОВА НІЧ',scenes:[
  {id:7,no:'07',title:'БЛЕКАУТ',summary:'Місто починає гаснути. Дані вперше підтверджують: зупинка протоколу також може коштувати життів.',available:false},
  {id:8,no:'08',title:'РАЙОН АНТОНА',summary:'У зону ізоляції потрапляє район доньки Антона, і система пропонує йому особистий виняток.',available:false},
  {id:9,no:'09',title:'РОЗЛУКА',summary:'Поля віддає Булку Ладі й сама виходить на відкритий канал, відводячи переслідування від доказів.',available:false},
  {id:10,no:'10',title:'ПОВНА ПРАВДА',summary:'Оригінальний журнал показує цифровий підпис Полі під командою ізоляції та справжню ціну її плану.',available:false}
 ]},
 {kind:'act',roman:'IV',title:'НУЛЬОВА ГОДИНА',scenes:[
  {id:11,no:'11',title:'ДАНИЛОВЕ ПОВІДОМЛЕННЯ',summary:'Останній запис Данила пояснює, чому система так легко перетворює конкретну людину на допустиму втрату.',available:false},
  {id:12,no:'12',title:'ПОШУК ПОЛІ',summary:'Лада й Антон відновлюють маршрут Полі, а Булка допомагає знайти вхід до старої станції «Контуру».',available:false},
  {id:13,no:'13',title:'ТРИ ГОЛОСИ',summary:'Ірина, Поля і Лада пропонують три різні рішення. Уперше остаточний вибір повністю переходить до гравця.',available:false},
  {id:14,no:'14',title:'ВЛАСНЕ РІШЕННЯ',summary:'Фінальна перевірка даних відкриває крайні варіанти або третій шлях — якщо гравець зібрав достатньо доказів.',available:false}
 ]}
];

const q=s=>document.querySelector(s);
const list=q('#mbf-levels-list');
const screen=q('#mbf-screen');
if(!list||!screen)return;

const chapterLabel=c=>c.kind==='prologue'?'ПРОЛОГ':`АКТ ${c.roman}`;
const SCENES=CHAPTERS.flatMap((chapter,chapterIndex)=>chapter.scenes.map(scene=>({...scene,chapter,chapterIndex})));
const ROW_TOP=[25.5,32.9,40.4,47.8,55.2,62.6];
const WINDOW=ROW_TOP.length;

document.documentElement.classList.add('sector3-story-nav','sector3-story-nav-continuous');
screen.setAttribute('aria-label','Сектор 3 — послідовний список сцен');

const style=document.createElement('style');
style.textContent=`
.sector3-story-nav #mbf-levels-list{pointer-events:auto!important}
.sector3-story-nav .s3-story-row{position:absolute;left:8.5%;width:37%;height:6.2%;margin:0;padding:0;border:0;background:transparent;color:#292823;cursor:pointer;text-align:left;font:inherit;z-index:80;transition:filter .16s ease,opacity .16s ease,transform .16s ease}
.sector3-story-nav .s3-story-row:hover{filter:brightness(.92)}
.sector3-story-nav .s3-story-row:focus-visible{outline:0}
.sector3-story-nav .s3-story-num{position:absolute;left:1.3%;top:9%;width:7.5%;height:79%;display:grid;place-items:center;border:1px solid rgba(42,77,69,.68);background:rgba(238,218,181,.34);font:900 clamp(8px,.62vw,12px)/1 Consolas,monospace;color:#432d28;transition:.16s ease}
.sector3-story-nav .s3-story-title{position:absolute;left:12%;right:18%;top:0;height:100%;display:flex;align-items:center;font:900 clamp(8px,.68vw,13px)/1.08 "Segoe UI",Arial,sans-serif;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:.16s ease}
.sector3-story-nav .s3-story-act{position:absolute;right:1.7%;top:50%;transform:translateY(-50%);font:900 clamp(5px,.39vw,7px)/1 Consolas,monospace;letter-spacing:.05em;color:#625a4d;opacity:.76;white-space:nowrap}
.sector3-story-nav .s3-story-row.is-selected .s3-story-num{background:rgba(18,74,67,.94);border-color:rgba(53,158,146,.78);color:#e7fff9;box-shadow:0 0 9px rgba(55,199,184,.18)}
.sector3-story-nav .s3-story-row.is-selected .s3-story-title{color:#153f39}
.sector3-story-nav .s3-story-row.is-planned{opacity:.56}
.sector3-story-nav .s3-story-row.is-planned.is-selected{opacity:.78}
.sector3-story-nav .s3-story-row.is-selected::after{content:'✓';position:absolute;right:2.2%;top:50%;transform:translateY(-50%);font:900 clamp(10px,.8vw,15px)/1 Consolas,monospace;color:#8a1631;text-shadow:0 1px rgba(255,255,255,.18)}
.sector3-story-nav .s3-story-row.is-selected .s3-story-act{display:none}
.sector3-story-nav .s3-story-row.is-planned.is-selected::after{content:'•';color:#766c5d}
.sector3-story-nav #mbf-page-toggle,.sector3-story-nav .mbf-page-nav{display:none!important}
.sector3-story-nav .mbf-summary{cursor:pointer}
.sector3-story-nav .mbf-summary.is-planned{cursor:default}
.sector3-story-nav .mbf-summary.is-unavailable{animation:s3StoryNudge .28s ease}
.sector3-story-nav .mbf-stat>small{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sector3-story-nav .mbf-progress-wrap,.sector3-story-nav #mbf-stamp{display:none!important}
.sector3-story-nav .mbf-actions{pointer-events:none}
@keyframes s3StoryNudge{0%,100%{transform:rotate(var(--mbf-rotate)) translateX(0)}35%{transform:rotate(var(--mbf-rotate)) translateX(-4px)}70%{transform:rotate(var(--mbf-rotate)) translateX(4px)}}
`;
document.head.appendChild(style);

const title=q('#mbf-title');
const kicker=q('#mbf-kicker');
const heading=q('#mbf-page-heading');
const summary=q('#mbf-summary');
const stat=q('.mbf-stat');
const statLabel=stat?.querySelector(':scope>span');
const statValue=q('#mbf-progress');
const statSmall=q('#mbf-levels');
const pageToggle=q('#mbf-page-toggle');
const pageNav=q('.mbf-page-nav');
const actions=q('.mbf-actions');
if(pageToggle)pageToggle.hidden=true;
if(pageNav)pageNav.hidden=true;
if(actions)actions.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd> СЦЕНА</span><span><kbd>←</kbd><kbd>→</kbd> АКТ</span><span><kbd>ESC</kbd> НАЗАД</span><span><kbd>ENTER</kbd> <b id="mbf-action-label">ПЕРЕЙТИ</b></span>';
const actionLive=q('#mbf-action-label');

let selectedIndex=1;
let viewportStart=0;
let leaving=false;

function findInitial(){
 const requestedScene=parseInt(params.get('scene')||params.get('storyScene')||'',10);
 if(Number.isFinite(requestedScene)){const i=SCENES.findIndex(s=>s.id===requestedScene);if(i>=0)return i}
 const requestedAct=parseInt(params.get('act')||'',10);
 if(Number.isFinite(requestedAct)){const i=SCENES.findIndex(s=>s.chapterIndex===Math.max(0,Math.min(CHAPTERS.length-1,requestedAct)));if(i>=0)return i}
 try{
  const saved=JSON.parse(sessionStorage.getItem('vidlik-sector3-story-selection-v1')||'null');
  if(saved&&Number.isFinite(Number(saved.scene))){const i=SCENES.findIndex(s=>s.id===Number(saved.scene));if(i>=0)return i}
 }catch(_){ }
 return 1;
}
selectedIndex=findInitial();

function ensureVisible(){
 if(selectedIndex<viewportStart)viewportStart=selectedIndex;
 if(selectedIndex>=viewportStart+WINDOW)viewportStart=selectedIndex-WINDOW+1;
 viewportStart=Math.max(0,Math.min(Math.max(0,SCENES.length-WINDOW),viewportStart));
}
ensureVisible();

function selected(){return SCENES[selectedIndex]}
function renderRows(){
 ensureVisible();list.innerHTML='';
 SCENES.slice(viewportStart,viewportStart+WINDOW).forEach((s,slot)=>{
  const globalIndex=viewportStart+slot;
  const b=document.createElement('button');
  b.type='button';
  b.className=`s3-story-row${globalIndex===selectedIndex?' is-selected':''}${s.available?'':' is-planned'}`;
  b.dataset.storyIndex=String(globalIndex);
  b.style.top=`${ROW_TOP[slot]}%`;
  b.setAttribute('aria-current',globalIndex===selectedIndex?'true':'false');
  b.setAttribute('aria-label',`${chapterLabel(s.chapter)}, сцена ${s.no}: ${s.title}${s.available?'':' — у розробці'}`);
  b.innerHTML=`<span class="s3-story-num">${s.no}</span><span class="s3-story-title">${s.title}</span><span class="s3-story-act">${chapterLabel(s.chapter)}</span>`;
  list.appendChild(b);
 });
}
function renderMeta(){
 const s=selected(),c=s.chapter;
 if(kicker)kicker.textContent=`VIDLIK · СЕКТОР 03 · ${chapterLabel(c)}`;
 if(title)title.textContent=c.title;
 if(heading)heading.textContent=`СЦЕНА ${s.no} · ${s.title}`;
 if(summary){summary.textContent=s.summary;summary.parentElement?.classList.toggle('is-planned',!s.available)}
 if(statLabel)statLabel.textContent='СЦЕНА';
 if(statValue)statValue.textContent=s.no;
 if(statSmall)statSmall.textContent=s.available?'ДОСТУПНА':'В РОЗРОБЦІ';
 if(actionLive)actionLive.textContent=s.available?'ПЕРЕЙТИ':'В РОЗРОБЦІ';
}
function render(){renderRows();renderMeta()}
function selectIndex(next){selectedIndex=Math.max(0,Math.min(SCENES.length-1,next));render()}
function jumpAct(delta){
 const current=selected().chapterIndex;
 const target=Math.max(0,Math.min(CHAPTERS.length-1,current+delta));
 if(target===current)return;
 const i=SCENES.findIndex(s=>s.chapterIndex===target);if(i>=0)selectIndex(i);
}
function unavailableFeedback(){
 const card=summary?.parentElement;if(!card)return;
 card.classList.remove('is-unavailable');void card.offsetWidth;card.classList.add('is-unavailable');
}
function openSelected(){
 const s=selected();
 if(!s.available||!s.target){unavailableFeedback();return}
 if(leaving)return;
 leaving=true;screen.classList.add('mbf-leaving');
 try{sessionStorage.setItem('vidlik-sector3-story-selection-v1',JSON.stringify({chapter:s.chapterIndex,scene:s.id}))}catch(_){ }
 setTimeout(()=>location.href=s.target,280);
}

list.addEventListener('click',e=>{
 const row=e.target.closest('.s3-story-row');if(!row)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const i=parseInt(row.dataset.storyIndex||'-1',10);if(i<0)return;
 if(i===selectedIndex)openSelected();else selectIndex(i);
},true);
list.addEventListener('wheel',e=>{
 e.preventDefault();e.stopPropagation();selectIndex(selectedIndex+(e.deltaY>0?1:-1));
},{passive:false,capture:true});
summary?.parentElement?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openSelected()},true);

window.addEventListener('keydown',e=>{
 if(leaving)return;
 if(e.key==='Escape'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();q('#mbf-back')?.click();return;
 }
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();selectIndex(selectedIndex+(e.key==='ArrowDown'?1:-1));return;
 }
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();jumpAct(e.key==='ArrowRight'?1:-1);return;
 }
 if(e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSelected();return;
 }
},true);

render();
})();
