(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const requested=parseInt(params.get('storyScene')||'0',10)||0;
if(requested!==1)return;

/* Scene 01 direct checkpoint.
 * Do NOT replay Episode 05 tutorials here. Scene 01 starts from an explicit
 * ready state and owns its input independently of the legacy lesson chain.
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
let signalTriggered=false;
let scene2Line=-1;
let bootAttempts=0;
let excelMinimized=false;
let excelMaximized=false;
let excelClosed=false;
let excelTaskBtn=null;
let selectedCell='F2';

const LINES=[
 'Не закривай файл.',
 'І нічого поки не натискай.',
 'Ти зараз сам у кімнаті?',
 'У реєстрі зверху написано, що тут 267 записів.',
 'Перейди в клітинку F2. Введи формулу =COUNTA(B2:B269) і натисни Enter.\nCOUNTA рахує непорожні клітинки. Тут ми рахуємо всі заповнені імена у стовпці B.'
];
const ENDING=[
 'Данило Верес.',
 'Мій брат.',
 'Я маю тобі дещо пояснити.',
 'Данило зник одинадцять місяців тому.',
 'Офіційно — евакуація не підтвердилась.',
 'Але його запис не зник.',
 'Його сховали.',
 'Усе почалося в день його зникнення.',
 'Тоді в системі з’явився дивний сигнал.',
 'Ти це чув?',
 'Не натискай нічого.',
 'Я вже чула цей сигнал.',
 'У день, коли зник Данило.',
 'Я покажу тобі той самий сигнал.'
];
const SCENE2_INTRO=[
 'Ось. Саме це.',
 'Тепер знайдемо, звідки він прийшов.'
];

const style=document.createElement('style');
style.id='s3-scene1-direct-style';
style.textContent=`
/* CANONICAL POLYA SHOT.
   Never resize/move .tablet-screen: it stays glued to the physical tablet.
   The whole camera moves exactly like the opening call. */
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
.s3-direct-window.s3-direct-maximized{left:0!important;top:0!important;width:100%!important;height:100%!important;border-radius:0!important}
.s3-direct-window.os-minimized,.s3-direct-window.os-window-minimized{display:none!important}
.s3-direct-window .excel-grid-body{overflow:auto!important}
.s3-direct-window .s3-found-row .excel-cell{background:#fff3f4!important;color:#8c1726!important;font-weight:800!important}
.s3-direct-window .s3-found-row{animation:s3RowReveal 1.05s cubic-bezier(.22,1,.36,1) both}
@keyframes s3RowReveal{0%{filter:brightness(1);transform:translateX(0)}18%{filter:brightness(1.24);transform:translateX(2px)}36%{transform:translateX(-1px)}100%{filter:brightness(1);transform:none}}
.s3-direct-search{position:absolute;right:18px;top:72px;z-index:10;display:flex;gap:8px;align-items:center;padding:8px 10px;background:#fff;border:1px solid #b9c7c2;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:11px}.s3-direct-search[hidden]{display:none}.s3-direct-search strong{min-width:70px;color:#173b31}
.s3-signal-badge{position:absolute;right:2.8%;bottom:8.5%;z-index:180;min-width:150px;padding:10px 13px;border:1px solid rgba(71,237,229,.45);background:rgba(3,20,22,.92);box-shadow:0 0 22px rgba(45,224,218,.12);font:700 9px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;color:#8ff8f1;opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease;pointer-events:none}
.s3-signal-badge small{display:block;color:#ff9a75;font-size:8px;margin-bottom:3px}.s3-signal-badge.show{opacity:1;transform:none}
.monitor-screen.s3-monitor-glitch{animation:s3MonitorGlitch .16s steps(2,end) 5}
@keyframes s3MonitorGlitch{0%,100%{filter:none}25%{filter:contrast(1.12) brightness(1.12);transform:translateX(1px)}50%{filter:hue-rotate(-8deg) contrast(1.06);transform:translateX(-1px)}75%{filter:brightness(.91);transform:none}}
.s3-scene-title{position:absolute;inset:0;z-index:760;display:grid;place-items:center;background:rgba(1,7,10,.94);opacity:0;pointer-events:none;transition:opacity .55s ease;color:#eef7f7;text-align:center}
.s3-scene-title.show{opacity:1;pointer-events:auto}
.s3-scene-title-inner{min-width:min(720px,80vw);padding:38px 46px;border-top:1px solid rgba(80,232,225,.22);border-bottom:1px solid rgba(80,232,225,.22)}
.s3-scene-title-kicker{font:700 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.28em;color:#61dcd5;margin-bottom:18px}
.s3-scene-title h2{margin:0;font:800 clamp(34px,5vw,76px)/.95 system-ui,sans-serif;letter-spacing:.035em}
.s3-scene-title h2 b{color:#66e7df;font-weight:800}
.s3-scene-title p{margin:17px 0 0;color:#8ca3a6;font:600 14px/1.5 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.s3-scene-title-enter{margin-top:30px;opacity:0;transform:translateY(6px);transition:.35s ease;color:#d8eeee;font:700 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}
.s3-scene-title.ready .s3-scene-title-enter{opacity:1;transform:none}
.s3-story-fade{position:absolute;inset:0;z-index:730;background:#02090c;opacity:0;pointer-events:none;transition:opacity .48s ease}.s3-story-fade.show{opacity:.64}
`;
document.head.appendChild(style);

function now(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function syncClock(){const c=document.getElementById('desktopClock');if(c)c.textContent=now()}
syncClock();
const clockTimer=setInterval(syncClock,1000);
window.addEventListener('pagehide',()=>clearInterval(clockTimer),{once:true});

function setHeaderPolya(){
 header.classList.add('excel-polya-channel');
 const n=header.querySelector('.admin-header-name');if(n)n.textContent='Поля';
 const s=header.querySelector('.admin-online span');if(s)s.textContent='захищений канал';
}
function msg(text){
 const row=document.createElement('div');row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-direct-message';
 row.innerHTML=`<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name">Поля</span><span class="admin-bubble-time">${now()}</span></div><p></p></div>`;
 row.querySelector('p').textContent=text;row.querySelector('p').style.whiteSpace='pre-line';chat.appendChild(row);
 requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight});
}
function setHint(html){help.innerHTML=html}
function focusTablet(on){scene.classList.toggle('s3-scene1-focus',!!on)}
function showAdmin(){
 ['idleLayer','incomingLayer','videoLayer','syncLayer'].forEach(id=>document.getElementById(id)?.classList.remove('visible'));
 document.getElementById('adminLayer')?.classList.add('visible');
}
function ensureSignalBadge(){
 let badge=mon.querySelector('.s3-signal-badge');
 if(!badge){badge=document.createElement('div');badge.className='s3-signal-badge';badge.innerHTML='<small>CH 17</small><strong>SIGNAL DETECTED</strong>';mon.appendChild(badge)}
 return badge;
}
function ensureSceneTitle(){
 let overlay=scene.querySelector('.s3-scene-title');
 if(!overlay){
  overlay=document.createElement('div');overlay.className='s3-scene-title';overlay.innerHTML='<div class="s3-scene-title-inner"><div class="s3-scene-title-kicker">АКТ I · ЗНАЙОМСТВО</div><h2>СЦЕНА 02 — <b>СИГНАЛ</b></h2><p>Перший слід у системі</p><div class="s3-scene-title-enter"><kbd>ENTER</kbd> ПРОДОВЖИТИ</div></div>';scene.appendChild(overlay);
 }
 return overlay;
}
function playTone(freq,start,duration=.09,volume=.045){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const ctx=playTone.ctx||(playTone.ctx=new AC());
  ctx.resume?.();
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.value=freq;g.gain.value=0;
  o.connect(g);g.connect(ctx.destination);
  const t=ctx.currentTime+start;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.start(t);o.stop(t+duration+.02);
 }catch(_){}
}
function playSignalPattern(){playTone(740,0,.12,.04);playTone(740,.34,.12,.04);playTone(910,.68,.15,.045)}
function tinyRevealTone(){playTone(420,0,.08,.025);playTone(620,.09,.09,.02)}

let excelWin=null;
function taskbarHost(){return document.getElementById('osRunningApps')}
function ensureExcelTaskButton(){
 const running=taskbarHost();if(!running||excelClosed)return;
 if(excelTaskBtn?.isConnected)return;
 const b=document.createElement('button');
 b.className='os-running-button is-active';
 b.dataset.directStoryTask='excel-story';
 b.textContent='Excel · Сектор 3';
 b.title='TRAINING_SYNC_SECTOR_3.xlsx';
 b.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  if(!excelWin||excelClosed)return;
  if(excelMinimized){
   excelMinimized=false;
   excelWin.classList.remove('os-minimized','os-window-minimized');
   b.classList.remove('is-minimized');b.classList.add('is-active');
  }else{
   excelMinimized=true;
   excelWin.classList.add('os-minimized','os-window-minimized');
   b.classList.add('is-minimized');b.classList.remove('is-active');
  }
 });
 running.appendChild(b);excelTaskBtn=b;
}
function restoreDirectExcel(){
 if(!excelWin)return;
 excelClosed=false;excelMinimized=false;
 excelWin.style.display='';
 excelWin.classList.remove('os-minimized','os-window-minimized');
 ensureExcelTaskButton();
 excelTaskBtn?.classList.remove('is-minimized');excelTaskBtn?.classList.add('is-active');
}
function bindExcelWindowControls(win){
 const min=win.querySelector('[data-direct-win="min"]');
 const max=win.querySelector('[data-direct-win="max"]');
 const close=win.querySelector('[data-direct-win="close"]');
 min?.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  excelMinimized=true;
  win.classList.add('os-minimized','os-window-minimized');
  ensureExcelTaskButton();
  excelTaskBtn?.classList.add('is-minimized');excelTaskBtn?.classList.remove('is-active');
 });
 max?.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  excelMaximized=!excelMaximized;
  win.classList.toggle('s3-direct-maximized',excelMaximized);
  win.classList.toggle('os-maximized',excelMaximized);
  max.textContent=excelMaximized?'❐':'□';
  max.title=excelMaximized?'Відновити розмір':'Розгорнути';
  max.setAttribute('aria-label',max.title);
 });
 close?.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  excelClosed=true;excelMinimized=false;
  win.style.display='none';
  excelTaskBtn?.remove();excelTaskBtn=null;
 });
 win.querySelector('.os-window-titlebar')?.addEventListener('dblclick',e=>{
  if(e.target.closest('.os-window-actions'))return;
  e.preventDefault();
  max?.click();
 });
 ensureExcelTaskButton();
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
 win.innerHTML=`<header class="os-window-titlebar excel-titlebar"><strong><span class="excel-app-mark">X</span> TRAINING_SYNC_SECTOR_3.xlsx — Microsoft Excel</strong><span class="os-window-actions"><button type="button" data-direct-win="min" title="Згорнути" aria-label="Згорнути">—</button><button type="button" data-direct-win="max" title="Розгорнути" aria-label="Розгорнути">□</button><button type="button" data-direct-win="close" title="Закрити" aria-label="Закрити">×</button></span></header><div class="os-window-body excel-body"><div class="excel-ribbon"><div class="excel-tabs"><b>Файл</b><span class="is-active">Основне</span><span>Вставлення</span><span>Формули</span><span>Дані</span><i class="excel-save-state">ЗБЕРЕЖЕНО</i></div><div class="excel-tools"><span>Вставити</span><span>Шрифт</span><span>Вирівнювання</span><span>Число</span><span>Σ Автосума</span><strong class="excel-declared">ЗАЯВЛЕНО: 267</strong></div></div><div class="excel-formula-bar"><span class="excel-name-box">F2</span><span class="excel-fx">fx</span><span class="excel-formula-value"></span></div><div class="excel-grid-body">${rows}</div><div class="excel-sheetbar"><button type="button">Вступ</button><button type="button" class="is-active">Реєстр</button><span class="excel-sheet-spacer"></span><span>100%</span></div><div class="s3-direct-search" hidden><span>Знайти</span><strong></strong><em>Enter — знайти</em></div></div>`;
 host.appendChild(win);
 selectedCell='F2';
 win.querySelector('[data-cell="F2"]')?.classList.add('is-selected');
 win.addEventListener('click',e=>{const cell=e.target.closest('.excel-cell[data-cell]');if(cell)setSelectedCell(cell)},true);
 excelClosed=false;excelMinimized=false;excelMaximized=false;
 bindExcelWindowControls(win);
 return win;
}

function formulaBar(){return excelWin?.querySelector('.excel-formula-value')}
function f2(){return excelWin?.querySelector('[data-cell="F2"]')}
function searchBox(){return excelWin?.querySelector('.s3-direct-search')}
function setSelectedCell(cell){
 if(!cell||!excelWin)return false;
 excelWin.querySelectorAll('.excel-cell.is-selected').forEach(x=>x.classList.remove('is-selected'));
 cell.classList.add('is-selected');selectedCell=cell.dataset.cell||selectedCell;
 const name=excelWin.querySelector('.excel-name-box');if(name)name.textContent=selectedCell;
 cell.scrollIntoView({block:'nearest',inline:'nearest'});return true;
}
function moveCell(dx,dy){
 if(!excelWin)return;
 const m=/^([A-F])(\d+)$/.exec(selectedCell||'F2');if(!m)return;
 const cols=['A','B','C','D','E','F'];let ci=cols.indexOf(m[1]),ri=parseInt(m[2],10);
 ci=Math.max(0,Math.min(cols.length-1,ci+dx));ri=Math.max(1,Math.min(19,ri+dy));
 const step=dy===0?0:(dy>0?1:-1);let guard=0,cell=null;
 while(guard++<20){
  cell=excelWin.querySelector(`[data-cell="${cols[ci]}${ri}"]`);
  const row=cell?.closest('.excel-row');
  if(cell&&(!row||getComputedStyle(row).display!=='none'))break;
  if(!step)return;ri+=step;if(ri<1||ri>19)return;
 }
 if(cell)setSelectedCell(cell);
}

function nextDialog(){
 if(line<LINES.length-1){line++;msg(LINES[line]);return}
 stage='formula';focusTablet(false);footer.textContent='Поля · ПЕРЕВІРКА РЕЄСТРУ';setHint('<span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> до <b>F2</b> · <kbd>=COUNTA(B2:B269)</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>');
}
function acceptFormula(){
 if(selectedCell!=='F2'){setHint('<span>Перейдіть стрілками до <b>F2</b></span><span><kbd>ESC</kbd> пауза</span>');return}
 const normalized=formula.replace(/\s+/g,'').toUpperCase();
 if(normalized!=='=COUNTA(B2:B269)'){setHint('<span>Перевір формулу: <kbd>=COUNTA(B2:B269)</kbd> <kbd>ENTER</kbd></span><span><kbd>ESC</kbd> пауза</span>');return}
 f2().textContent='268';formulaBar().textContent='=COUNTA(B2:B269)';
 msg('268.\nДобре. Тепер знайди сімнадцятий.');stage='find';setHint('<span><kbd>CTRL</kbd> + <kbd>F</kbd> знайти запис</span><span><kbd>ESC</kbd> пауза</span>');
}
function reveal17(){
 const row=excelWin?.querySelector('[data-row="17"]');if(row){row.style.display='';row.classList.add('s3-found-row');row.scrollIntoView({block:'center'});tinyRevealTone()}
 row17=true;searchOpen=false;searchBox().hidden=true;stage='ending';focusTablet(true);endingLine=-1;msg('Знайшов?');footer.textContent='Поля · ЗАХИЩЕНИЙ КАНАЛ';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function triggerSignalSequence(){
 if(signalTriggered)return;signalTriggered=true;stage='signal';
 const badge=ensureSignalBadge();badge.classList.add('show');mon.classList.add('s3-monitor-glitch');playSignalPattern();
 setHint('<span>СИГНАЛ...</span><span><kbd>ESC</kbd> пауза</span>');
 setTimeout(()=>mon.classList.remove('s3-monitor-glitch'),1000);
 setTimeout(()=>badge.classList.remove('show'),1450);
 setTimeout(()=>{
  endingLine=9;msg(ENDING[endingLine]);stage='ending';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
 },1750);
}
function nextEnding(){
 if(endingLine===8&&!signalTriggered){triggerSignalSequence();return}
 if(endingLine<ENDING.length-1){
  endingLine++;msg(ENDING[endingLine]);
  if(endingLine===8)setTimeout(()=>{if(stage==='ending'&&!signalTriggered)triggerSignalSequence()},650);
  return;
 }
 beginScene2Title();
}
function beginScene2Title(){
 stage='title';focusTablet(false);setHint('');
 const overlay=ensureSceneTitle();overlay.classList.remove('ready');overlay.classList.add('show');
 setTimeout(()=>overlay.classList.add('ready'),900);
}
function startScene2(){
 const overlay=ensureSceneTitle();overlay.classList.remove('ready','show');
 stage='scene2Lock';chat.innerHTML='';footer.textContent='Поля · ЗАХИЩЕНИЙ КАНАЛ';focusTablet(false);setHint('<span>...</span><span><kbd>ESC</kbd> пауза</span>');
 setTimeout(()=>{playSignalPattern();mon.classList.add('s3-monitor-glitch');ensureSignalBadge().classList.add('show')},900);
 setTimeout(()=>{mon.classList.remove('s3-monitor-glitch');ensureSignalBadge().classList.remove('show');scene2Line=0;msg(SCENE2_INTRO[0]);stage='scene2Intro';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>')},2150);
}
function nextScene2Intro(){
 if(scene2Line<SCENE2_INTRO.length-1){scene2Line++;msg(SCENE2_INTRO[scene2Line]);return}
 stage='scene2Ready';setHint('<span><kbd>CTRL</kbd> + <kbd>F</kbd> — наступний крок розслідування</span><span><kbd>ESC</kbd> пауза</span>');
}

function keydown(e){
 if(e.__vidlikScene1Handled)return;
 try{e.__vidlikScene1Handled=true}catch(_){}
 if(e.repeat)return;
 if(e.key==='Escape')return;
 if(stage==='dialog'){
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();nextDialog()}
  else if(!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
  return;
 }
 if(stage==='formula'){
  const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(arrows[e.key]){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();moveCell(...arrows[e.key]);return}
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();acceptFormula();return}
  if(selectedCell!=='F2'&&(e.key==='Backspace'||(e.key.length===1&&!e.ctrlKey&&!e.metaKey))){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHint('<span>Перейдіть стрілками до <b>F2</b></span><span><kbd>ESC</kbd> пауза</span>');return}
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
  const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(arrows[e.key]){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();moveCell(...arrows[e.key]);return}
 }
 if(stage==='ending'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();nextEnding();return}
 if(stage==='signal'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return}
 if(stage==='title'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();startScene2();return}
 if(stage==='scene2Lock'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return}
 if(stage==='scene2Intro'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();nextScene2Intro();return}
}

window.VIDLIK_SCENE1_INPUT=keydown;

document.getElementById('desktopIcons')?.addEventListener('dblclick',e=>{
 const icon=e.target.closest('.desktop-icon[data-app="excel"]');
 if(!icon||!excelClosed)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 restoreDirectExcel();
},true);

function boot(){
 showAdmin();syncClock();
 try{window.VIDLIK_OS?.enable?.()}catch(_){}
 const host=mon.querySelector('.os-layer');
 if(!host){
  bootAttempts++;
  if(bootAttempts<120){setTimeout(boot,50);return}
  setHint('<span>Не вдалося підготувати Сцену 01. <kbd>R</kbd> повторити</span><span><kbd>ESC</kbd> пауза</span>');
  return;
 }
 try{window.VIDLIK_EXCEL_STORY_TUTORIAL?.reset?.()}catch(_){}
 chat.innerHTML='';
 setHeaderPolya();
 excelWin=buildExcel();
 if(!excelWin){setTimeout(boot,80);return}
 footer.textContent='Поля · ЗАХИЩЕНИЙ КАНАЛ';
 focusTablet(true);
 setHint('<span><kbd>ENTER</kbd> наступне повідомлення</span><span><kbd>ESC</kbd> пауза</span>');
 scene.focus?.({preventScroll:true});
 window.VIDLIK_SCENE1_READY=true;
 setTimeout(()=>{if(stage==='dialog'&&line<0)nextDialog()},650);
}

window.addEventListener('keydown',keydown,true);
boot();
})();