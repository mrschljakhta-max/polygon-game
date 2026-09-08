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

document.documentElement.classList.add('sector3-story-nav');
screen.setAttribute('aria-label','Сектор 3 — акти та сцени');

const style=document.createElement('style');
style.textContent=`
.sector3-story-nav #mbf-levels-list{pointer-events:auto!important}
.sector3-story-nav .s3-story-row{position:absolute;left:8.5%;width:37%;height:6.2%;margin:0;padding:0;border:0;background:transparent;color:#292823;cursor:pointer;text-align:left;font:inherit;z-index:80;transition:filter .16s ease,opacity .16s ease}
.sector3-story-nav .s3-story-row:hover{filter:brightness(.92)}
.sector3-story-nav .s3-story-row:focus-visible{outline:0}
.sector3-story-nav .s3-story-num{position:absolute;left:1.3%;top:9%;width:7.5%;height:79%;display:grid;place-items:center;border:1px solid rgba(42,77,69,.68);background:rgba(238,218,181,.34);font:900 clamp(8px,.62vw,12px)/1 Consolas,monospace;color:#432d28;transition:.16s ease}
.sector3-story-nav .s3-story-title{position:absolute;left:12%;right:10%;top:0;height:100%;display:flex;align-items:center;font:900 clamp(8px,.68vw,13px)/1.08 "Segoe UI",Arial,sans-serif;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:.16s ease}
.sector3-story-nav .s3-story-state{position:absolute;right:1.5%;top:50%;transform:translateY(-50%);font:900 clamp(5px,.42vw,8px)/1 Consolas,monospace;letter-spacing:.06em;color:#796e5c;opacity:.72}
.sector3-story-nav .s3-story-row.is-selected .s3-story-num{background:rgba(18,74,67,.94);border-color:rgba(53,158,146,.78);color:#e7fff9;box-shadow:0 0 9px rgba(55,199,184,.18)}
.sector3-story-nav .s3-story-row.is-selected .s3-story-title{color:#153f39}
.sector3-story-nav .s3-story-row.is-selected::after{content:'✓';position:absolute;right:2.1%;top:50%;transform:translateY(-50%);font:900 clamp(10px,.8vw,15px)/1 Consolas,monospace;color:#8a1631;text-shadow:0 1px rgba(255,255,255,.18)}
.sector3-story-nav .s3-story-row.is-selected .s3-story-state{display:none}
.sector3-story-nav .s3-story-row.is-planned{opacity:.56}
.sector3-story-nav .s3-story-row.is-planned.is-selected{opacity:.74}
.sector3-story-nav .s3-story-row.is-planned.is-selected::after{content:'•';color:#766c5d}
.sector3-story-nav #mbf-page-toggle{display:flex!important}
.sector3-story-nav .mbf-page-nav{display:flex!important;align-items:center;justify-content:center;gap:.3em;margin-top:.45em}
.sector3-story-nav .mbf-page-nav button{border:0;background:transparent;color:#2c4d48;font:900 1em/1 Consolas,monospace;cursor:pointer;padding:.12em .2em}
.sector3-story-nav .mbf-page-nav button:disabled{opacity:.2;cursor:default}
.sector3-story-nav .mbf-page-nav b{font:900 clamp(5px,.42vw,8px)/1 Consolas,monospace;letter-spacing:.05em}
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
const pageLabel=q('#mbf-page-label');
const prevBtn=q('#mbf-prev-page');
const nextBtn=q('#mbf-next-page');
const pageToggle=q('#mbf-page-toggle');
const action=q('#mbf-action-label');
const actions=q('.mbf-actions');

if(actions)actions.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd> СЦЕНА</span><span><kbd>←</kbd><kbd>→</kbd> АКТ</span><span><kbd>ESC</kbd> НАЗАД</span><span><kbd>ENTER</kbd> <b id="mbf-action-label">ПЕРЕЙТИ</b></span>';
const actionLive=q('#mbf-action-label');

let chapterIndex=1;
const requestedAct=params.get('act');
if(requestedAct!==null){
 const n=parseInt(requestedAct,10);
 if(Number.isFinite(n))chapterIndex=Math.max(0,Math.min(CHAPTERS.length-1,n));
}
let sceneIndex=0;
const ROW_TOP=[25.5,32.9,40.4,47.8,55.2,62.6];
let leaving=false;

function chapter(){return CHAPTERS[chapterIndex]}
function scene(){return chapter().scenes[Math.max(0,Math.min(sceneIndex,chapter().scenes.length-1))]}
function chapterLabel(c){return c.kind==='prologue'?'ПРОЛОГ':`АКТ ${c.roman}`}

function renderRows(){
 const c=chapter();
 list.innerHTML='';
 c.scenes.forEach((s,i)=>{
  const b=document.createElement('button');
  b.type='button';
  b.className=`s3-story-row${i===sceneIndex?' is-selected':''}${s.available?'':' is-planned'}`;
  b.dataset.sceneIndex=String(i);
  b.style.top=`${ROW_TOP[i]}%`;
  b.setAttribute('aria-current',i===sceneIndex?'true':'false');
  b.setAttribute('aria-label',`${chapterLabel(c)}, сцена ${s.no}: ${s.title}${s.available?'':' — у розробці'}`);
  b.innerHTML=`<span class="s3-story-num">${s.no}</span><span class="s3-story-title">${s.title}</span>${s.available?'':`<span class="s3-story-state">ПЛАН</span>`}`;
  list.appendChild(b);
 });
}

function renderMeta(){
 const c=chapter(),s=scene();
 if(kicker)kicker.textContent=`VIDLIK · СЕКТОР 03 · ${chapterLabel(c)}`;
 if(title)title.textContent=c.title;
 if(heading)heading.textContent=`СЦЕНА ${s.no} · ${s.title}`;
 if(summary){summary.textContent=s.summary;summary.parentElement?.classList.toggle('is-planned',!s.available)}
 if(statLabel)statLabel.textContent='СЦЕНА';
 if(statValue)statValue.textContent=s.no;
 if(statSmall)statSmall.textContent=s.available?'ДОСТУПНА':'В РОЗРОБЦІ';
 if(pageLabel)pageLabel.textContent=`${chapterIndex+1} / ${CHAPTERS.length}`;
 if(prevBtn)prevBtn.disabled=chapterIndex===0;
 if(nextBtn)nextBtn.disabled=chapterIndex===CHAPTERS.length-1;
 if(pageToggle){
  const next=CHAPTERS[Math.min(CHAPTERS.length-1,chapterIndex+1)];
  if(chapterIndex<CHAPTERS.length-1){
   pageToggle.hidden=false;
   pageToggle.innerHTML=`<span class="mbf-page-toggle-label">ДАЛІ →</span><span class="mbf-page-toggle-range">${chapterLabel(next)}</span>`;
  }else{
   pageToggle.hidden=true;
  }
 }
 if(actionLive)actionLive.textContent=s.available?'ПЕРЕЙТИ':'В РОЗРОБЦІ';
}

function render(){renderRows();renderMeta()}
function selectScene(next){
 const c=chapter();
 sceneIndex=Math.max(0,Math.min(c.scenes.length-1,next));
 render();
}
function changeChapter(delta){
 const next=Math.max(0,Math.min(CHAPTERS.length-1,chapterIndex+delta));
 if(next===chapterIndex)return;
 list.classList.add('is-changing');
 setTimeout(()=>{chapterIndex=next;sceneIndex=0;render();requestAnimationFrame(()=>list.classList.remove('is-changing'))},90);
}
function unavailableFeedback(){
 const card=summary?.parentElement;
 if(!card)return;
 card.classList.remove('is-unavailable');void card.offsetWidth;card.classList.add('is-unavailable');
}
function openSelected(){
 const s=scene();
 if(!s.available||!s.target){unavailableFeedback();return}
 if(leaving)return;
 leaving=true;screen.classList.add('mbf-leaving');
 try{sessionStorage.setItem('vidlik-sector3-story-selection-v1',JSON.stringify({chapter:chapterIndex,scene:s.id}))}catch(_){ }
 setTimeout(()=>location.href=s.target,280);
}
function back(){
 if(leaving)return;leaving=true;screen.classList.add('mbf-leaving');setTimeout(()=>location.href='desktop-sectors.html?v=14',280);
}

render();

// Capture input before the generic module briefing controller. Sector 3 now owns
// its own story navigation: ↑/↓ scenes, ←/→ acts, Enter open, Esc back.
document.addEventListener('keydown',e=>{
 if(!document.documentElement.classList.contains('sector3-story-nav'))return;
 const k=e.key;
 if(!['Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','PageUp','PageDown'].includes(k))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(k==='Escape'){back();return}
 if(k==='ArrowUp'){selectScene(sceneIndex-1);return}
 if(k==='ArrowDown'){selectScene(sceneIndex+1);return}
 if(k==='ArrowLeft'||k==='PageUp'){changeChapter(-1);return}
 if(k==='ArrowRight'||k==='PageDown'){changeChapter(1);return}
 if(k==='Enter')openSelected();
},true);

document.addEventListener('click',e=>{
 if(!e.target.closest('#mbf-screen'))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(e.target.closest('#mbf-back')){back();return}
 const row=e.target.closest('.s3-story-row');
 if(row){selectScene(parseInt(row.dataset.sceneIndex||'0',10)||0);return}
 if(e.target.closest('#mbf-prev-page')){changeChapter(-1);return}
 if(e.target.closest('#mbf-next-page,#mbf-page-toggle')){changeChapter(1);return}
 if(e.target.closest('.mbf-summary,.mbf-stat')){openSelected();return}
},true);

window.addEventListener('pageshow',()=>{leaving=false;screen.classList.remove('mbf-leaving')});
})();