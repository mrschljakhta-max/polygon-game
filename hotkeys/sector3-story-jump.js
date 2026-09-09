(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

/* Scene 01 direct checkpoint.
 * Important: do NOT replay Episode 05 tutorials here. Scene 01 starts from an
 * explicit ready state and only the physical scene camera is used for Polya focus.
 */

document.body.classList.remove('prologue-title-pending','vidlik-act1-title-active','vidlik-prologue-title-active');
document.getElementById('vidlikPrologueTitle')?.remove();
document.getElementById('vidlikAct1Title')?.remove();
document.querySelector('.a1-desktop-reveal')?.remove();
const app=document.querySelector('.app');if(app)app.style.visibility='visible';

const scene=document.getElementById('scene');
const camera=document.getElementById('camera');
const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
const header=document.querySelector('.admin-header');
if(!scene||!camera||!mon||!chat||!footer||!help||!header)return;

let stage='dialog';
let line=-1;
let formula='';
let search='';
let searchOpen=false;
let row17=false;
let endingLine=-1;

const LINES=[
 'Не закривай файл.',
 'І нічого поки не натискай.',
 'Ти зараз сам у кімнаті?',
 'У реєстрі зверху написано, що тут 267 записів.',
 'Не вір мені.\nНе вір їм.\nПорахуй сам.',
 'Перейди в клітинку F2. Введи формулу =COUNTA(B2:B269) і натисни Enter.\nCOUNTA рахує непорожні клітинки. Тут ми рахуємо всі заповнені імена у стовпці B.'
];
const ENDING=['Данило Верес.','Мій брат.','Я маю тобі дещо пояснити.'];

const style=document.createElement('style');
style.id='s3-scene1-direct-style';
style.textContent=`
/* CANONICAL POLYA SHOT.
   Never resize/move .tablet-screen: it must stay glued to the physical tablet
   baked into desk.webp. We move the whole camera exactly like the opening call. */
.scene .camera{
  transition:transform .88s cubic-bezier(.22,1,.36,1)!important;
  will-change:transform;
}
.scene.s3-scene1-focus .camera{
  transform-origin:18.63% 59.46%!important;
  transform:translate3d(30.5%,-7.2%,0) scale(1.82)!important;
}
.scene.s3-scene1-focus::after{
  content:'';position:absolute;inset:0;z-index:35;pointer-events:none;
  background:radial-gradient(circle at 43% 51%,transparent 35%,rgba(0,0,0,.10) 67%,rgba(0,0,0,.32));
}
.scene.s3-scene1-focus .keys{z-index:520!important}
.scene.s3-scene1-focus .pause{z-index:900!important}
.s3-direct-window{position:absolute!important;left:6%!important;top:5%!important;width:88%!important;height:82%!important;z-index:90!important}
.s3-direct-window .excel-grid-body{overflow:auto!important}
.s3-direct-window .s3-found-row .excel-cell{background:#fff3f4!important;color:#8c1726!important;font-weight:800!important}
.s3-direct-search{position:absolute;right:18px;top:72px;z-index:10;display:flex;gap:8px;align-items:center;padding:8px 10px;background:#fff;border:1px solid #b9c7c2;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:11px}.s3-direct-search[hidden]{display:none}.s3-direct-search strong{min-width:70px;color:#173b31}
`;
document.head.appendChild(style);

function now(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function setHeaderPolya(){
 header.classList.add('excel-polya-channel');
 const n=header.querySelector('.admin-header-name');if(n)n.textContent='ПОЛЯ';
 const s=header.querySelector('.admin-online span');if(s)s.textContent='захищений канал';
}
function msg(text){
 const row=document.createElement('div');row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-direct-message';
 row.innerHTML=`<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name">ПОЛЯ</span><span class="admin-bubble-time">${now()}</span></div><p></p></div>`;
 row.querySelector('p').textContent=text;row.querySelector('p').style.whiteSpace='pre-line';chat.appendChild(row);
 requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight});
}
function setHint(html){help.innerHTML=html}
function focusTablet(on){scene.classList.toggle('s3-scene1-focus',!!on)}
function showAdmin(){
 ['idleLayer','incomingLayer','videoLayer','syncLayer'].forEach(id=>document.getElementById(id)?.classList.remove('visible'));
 document.getElementById('adminLayer')?.classList.add('visible');
}
function buildExcel(){
 const host=mon.querySelector('.os-layer');if(!host)return null;
 host.querySelector('.os-excel-story-window')?.remove();
 const win=document.createElement('section');win.className='os-window os-excel-story-window os-window-active s3-direct-window';win.dataset.windowId='excel-story';
 let rows='';
 const vals=(r,c)=>{
  if(r===1)return({A:'КОД',B:'ІМ’Я',C:'СТАТУС',D:'ПРИМІТКА',E:'ЗАЯВЛЕНО',F:'267'})[c]||'';
  if(r===2&&c==='E')return'ФАКТИЧНО';
  if(r===2&&c==='F')return'';
  if(r===17)return({A:'017',B:'ДАНИЛО ВЕРЕС',C:'НЕ ЕВАКУЙОВАНИЙ',D:'ВИКЛЮЧЕНО З ПІДСУМКУ'})[c]||'';
  const id=String(r-1).padStart(3,'0');return({A:id,B:`ОПЕРАТОР ${id}`,C:'ЕВАКУЙОВАНИЙ',D:'—'})[c]||'';
 };
 const cols=['A','B','C','D','E','F'];
 rows+='<div class="excel-col-head-row"><div class="excel-corner"></div>'+cols.map(c=>`<div class="excel-col-head">${c}</div>`).join('')+'</div>';
 for(let r=1;r<=19;r++){
  const hidden=r===17?' style="display:none"':'';
  rows+=`<div class="excel-row register-row" data-row="${r}"${hidden}><div class="excel-row-head">${r}</div>`+cols.map(c=>`<button type="button" class="excel-cell ${r===1?'is-header':''}" data-cell="${c}${r}">${vals(r,c)}</button>`).join('')+'</div>';
 }
 win.innerHTML=`<header class="os-window-titlebar excel-titlebar"><strong><span class="excel-app-mark">X</span> TRAINING_SYNC_SECTOR_3.xlsx — Microsoft Excel</strong></header><div class="os-window-body excel-body"><div class="excel-ribbon"><div class="excel-tabs"><b>Файл</b><span class="is-active">Основне</span><span>Вставлення</span><span>Формули</span><span>Дані</span><i class="excel-save-state">ЗБЕРЕЖЕНО</i></div><div class="excel-tools"><span>Вставити</span><span>Шрифт</span><span>Вирівнювання</span><span>Число</span><span>Σ Автосума</span><strong class="excel-declared">ЗАЯВЛЕНО: 267</strong></div></div><div class="excel-formula-bar"><span class="excel-name-box">F2</span><span class="excel-fx">fx</span><span class="excel-formula-value"></span></div><div class="excel-grid-body">${rows}</div><div class="excel-sheetbar"><button type="button">Вступ</button><button type="button" class="is-active">Реєстр</button><span class="excel-sheet-spacer"></span><span>100%</span></div><div class="s3-direct-search" hidden><span>Знайти</span><strong></strong><em>Enter — знайти</em></div></div>`;
 host.appendChild(win);
 win.querySelector('[data-cell="F2"]')?.classList.add('is-selected');
 return win;
}

let excelWin=null;
function formulaBar(){return excelWin?.querySelector('.excel-formula-value')}
function f2(){return excelWin?.querySelector('[data-cell="F2"]')}
function searchBox(){return excelWin?.querySelector('.s3-direct-search')}

function nextDialog(){
 if(line<LINES.length-1){line++;msg(LINES[line]);return}
 stage='formula';focusTablet(false);footer.textContent='ПОЛЯ · ПЕРЕВІРКА РЕЄСТРУ';setHint('<span><kbd>=COUNTA(B2:B269)</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>');
}
function acceptFormula(){
 const normalized=formula.replace(/\s+/g,'').toUpperCase();
 if(normalized!=='=COUNTA(B2:B269)'){setHint('<span>Перевір формулу: <kbd>=COUNTA(B2:B269)</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>');return}
 f2().textContent='268';formulaBar().textContent='=COUNTA(B2:B269)';
 msg('268.\nДобре. Тепер знайди сімнадцятий.');stage='find';setHint('<span><kbd>CTRL</kbd> + <kbd>F</kbd> знайти запис</span><span><kbd>ESC</kbd> пауза</span>');
}
function reveal17(){
 const row=excelWin?.querySelector('[data-row="17"]');if(row){row.style.display='';row.classList.add('s3-found-row');row.scrollIntoView({block:'center'})}
 row17=true;searchOpen=false;searchBox().hidden=true;stage='ending';focusTablet(true);endingLine=-1;msg('Данило Верес.');endingLine=0;footer.textContent='ПОЛЯ · ЗАХИЩЕНИЙ КАНАЛ';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function nextEnding(){
 if(endingLine<ENDING.length-1){endingLine++;msg(ENDING[endingLine]);return}
 setHint('<span><kbd>ESC</kbd> пауза</span>');
}

function keydown(e){
 if(e.repeat)return;
 if(e.key==='Escape')return;
 if(stage==='dialog'){
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();nextDialog()}
  else if(!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
  return;
 }
 if(stage==='formula'){
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();acceptFormula();return}
  if(e.key==='Backspace'){formula=formula.slice(0,-1)}
  else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey)formula+=e.key;
  else return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();formulaBar().textContent=formula;return;
 }
 if(stage==='find'){
  if((e.ctrlKey||e.metaKey)&&e.code==='KeyF'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();searchOpen=true;search='';searchBox().hidden=false;searchBox().querySelector('strong').textContent='';setHint('<span><kbd>17</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>');return}
  if(searchOpen){
   if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(search.trim()==='17'||search.trim()==='017')reveal17();return}
   if(e.key==='Backspace')search=search.slice(0,-1);else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey)search+=e.key;else return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();searchBox().querySelector('strong').textContent=search;return;
  }
 }
 if(stage==='ending'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();nextEnding()}
}

function boot(){
 showAdmin();
 try{window.VIDLIK_OS?.enable?.()}catch(_){}
 const host=mon.querySelector('.os-layer');
 if(!host){setTimeout(boot,50);return}
 try{window.VIDLIK_EXCEL_STORY_TUTORIAL?.reset?.()}catch(_){}
 chat.innerHTML='';setHeaderPolya();excelWin=buildExcel();
 footer.textContent='ПОЛЯ · ЗАХИЩЕНИЙ КАНАЛ';
 focusTablet(true);setHint('<span><kbd>ENTER</kbd> наступне повідомлення</span><span><kbd>ESC</kbd> пауза</span>');
 setTimeout(()=>{if(line<0)nextDialog()},900);
 window.addEventListener('keydown',keydown,true);
}

boot();
})();
