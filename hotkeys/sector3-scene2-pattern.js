(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if((parseInt(params.get('storyScene')||'0',10)||0)!==1)return;
if(window.VIDLIK_SCENE2_PATTERN)return;

let phase='waiting';
let line=-1;
let armed=false;
let filterOpen=false;
const RESULT_LINES=[
 '03:17. Усі сімнадцять.',
 'Занадто точно, щоб бути випадковістю.',
 'CH 17. Сімнадцять сигналів. 03:17.',
 'Сектор 3 / 17.',
 'Данило називав це... Протокол 17.'
];

function help(){return document.getElementById('help')}
function win(){return document.querySelector('.s3-direct-window')}
function grid(){return win()?.querySelector('.excel-grid-body')}
function sheetbar(){return win()?.querySelector('.excel-sheetbar')}
function nameBox(){return win()?.querySelector('.excel-name-box')}
function formulaBar(){return win()?.querySelector('.excel-formula-value')}
function chat(){return document.getElementById('adminChat')}
function now(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function msg(text){
 const host=chat();if(!host)return;
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-direct-message s3-scene2-pattern-message';
 row.innerHTML='<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name">Поля</span><span class="admin-bubble-time">'+now()+'</span></div><p></p></div>';
 row.querySelector('p').textContent=text;row.querySelector('p').style.whiteSpace='pre-line';
 host.appendChild(row);requestAnimationFrame(()=>{host.scrollTop=host.scrollHeight});
}
function setHint(html){const h=help();if(h)h.innerHTML=html}
function ensureStyle(){
 if(document.getElementById('s3-scene2-pattern-style'))return;
 const st=document.createElement('style');st.id='s3-scene2-pattern-style';st.textContent=`
 .s3-pattern-sheet-row .excel-cell{font-size:10px!important}
 .s3-pattern-sheet-row.s3-pattern-head .excel-cell{background:#e6f0eb!important;color:#174c3d!important;font-weight:900!important;position:relative}
 .s3-pattern-sheet-row .excel-cell.s3-time-cell{font-weight:800;color:#0b6a4d}
 .s3-pattern-sheet-row .excel-cell.s3-time-hit{background:#e1f6ee!important;color:#075a42!important;box-shadow:inset 0 0 0 1px rgba(22,151,105,.34)}
 .s3-filter-caret{float:right;margin-left:6px;color:#167e63;font-size:9px;opacity:.95}
 .s3-pattern-filter-menu{position:absolute;z-index:90;top:126px;left:43%;width:185px;background:#fff;border:1px solid #9eb5aa;box-shadow:0 10px 28px rgba(0,0,0,.22);border-radius:4px;padding:8px 9px;color:#23352f;font-size:11px}
 .s3-pattern-filter-menu strong{display:block;padding-bottom:7px;border-bottom:1px solid #d7e0dc;margin-bottom:7px;color:#0a5e46}
 .s3-pattern-filter-option{display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:3px;background:#eff7f3;box-shadow:inset 0 0 0 1px #abd0c0;font-weight:800}
 .s3-pattern-filter-option b{color:#0b7254}.s3-pattern-filter-menu small{display:block;margin-top:7px;color:#697a73;text-align:right}
 .s3-pattern-badge{position:absolute;z-index:80;right:22px;top:112px;display:flex;gap:8px;align-items:baseline;padding:7px 10px;border-radius:4px;background:#0c5947;color:#eafff7;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:10px;opacity:0;transform:translateY(-6px);transition:.35s ease}
 .s3-pattern-badge.show{opacity:1;transform:none}.s3-pattern-badge strong{font-size:15px;letter-spacing:.04em}.s3-pattern-badge span{opacity:.8}
 .s3-protocol-overlay{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:rgba(0,8,11,.82);opacity:0;pointer-events:none;transition:opacity .32s ease;overflow:hidden}
 .s3-protocol-overlay.show{opacity:1}.s3-protocol-overlay:before,.s3-protocol-overlay:after{content:'';position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#28dbc0,transparent);opacity:.55;animation:s3ProtoScan 1.4s linear infinite}.s3-protocol-overlay:after{animation-delay:.7s}
 .s3-protocol-card{text-align:center;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;color:#d9fff7;text-shadow:0 0 18px rgba(50,255,220,.25)}
 .s3-protocol-card small{display:block;color:#70d8c5;font-size:10px;margin-bottom:10px}.s3-protocol-card strong{display:block;font-size:34px;letter-spacing:.12em}.s3-protocol-card b{display:inline-block;margin-top:12px;padding:5px 9px;border:1px solid rgba(255,72,92,.55);color:#ff8b98;font-size:10px;letter-spacing:.18em}
 @keyframes s3ProtoScan{0%{top:15%}100%{top:85%}}
 `;document.head.appendChild(st);
}
function ensureSignalsTab(){
 const bar=sheetbar();if(!bar)return null;
 let b=bar.querySelector('[data-s3-sheet="signals"]');if(b)return b;
 b=document.createElement('button');b.type='button';b.dataset.s3Sheet='signals';b.textContent='Сигнали';
 const spacer=bar.querySelector('.excel-sheet-spacer');bar.insertBefore(b,spacer||null);return b;
}
function hideRegisterRows(){
 const g=grid();if(!g)return;
 [...g.children].forEach(el=>{
  if(el.classList.contains('excel-col-head-row')||el.classList.contains('s3-pattern-sheet-row'))return;
  if(!el.dataset.s3PrevDisplay)el.dataset.s3PrevDisplay=el.style.display||'__empty__';
  el.style.display='none';
 });
}
function buildSignalsSheet(){
 const g=grid();if(!g)return;
 if(g.querySelector('.s3-pattern-sheet-row')){hideRegisterRows();return}
 hideRegisterRows();
 const headers=['ID','ДАТА','ЧАС','ДЖЕРЕЛО','КАНАЛ','СТАН'];
 const head=document.createElement('div');head.className='excel-row register-row s3-pattern-sheet-row s3-pattern-head';head.dataset.row='1';
 head.innerHTML='<div class="excel-row-head">1</div>'+headers.map((v,i)=>'<button type="button" class="excel-cell" data-cell="'+String.fromCharCode(65+i)+'1">'+v+'</button>').join('');g.appendChild(head);
 const dates=['17.10.25','21.10.25','28.10.25','05.11.25','13.11.25','22.11.25','02.12.25','14.12.25','29.12.25','11.01.26','26.01.26','09.02.26','01.03.26','19.03.26','07.04.26','28.04.26','17.05.26'];
 for(let i=0;i<17;i++){
  const r=i+2,channel=String(i+1).padStart(2,'0');
  const vals=['S'+String(i+1).padStart(2,'0'),dates[i],'03:17','NODE S3-LOCAL','CH '+channel,'ЗАФІКСОВАНО'];
  const row=document.createElement('div');row.className='excel-row register-row s3-pattern-sheet-row';row.dataset.row=String(r);
  row.innerHTML='<div class="excel-row-head">'+r+'</div>'+vals.map((v,j)=>'<button type="button" class="excel-cell'+(j===2?' s3-time-cell':'')+'" data-cell="'+String.fromCharCode(65+j)+r+'">'+v+'</button>').join('');g.appendChild(row);
 }
}
function switchToSignals(){
 ensureStyle();buildSignalsSheet();
 const bar=sheetbar();bar?.querySelectorAll('button').forEach(b=>b.classList.remove('is-active'));
 ensureSignalsTab()?.classList.add('is-active');
 const n=nameBox();if(n)n.textContent='C1';const f=formulaBar();if(f)f.textContent='';
 win()?.querySelectorAll('.excel-cell.is-selected').forEach(x=>x.classList.remove('is-selected'));
 win()?.querySelector('[data-cell="C1"]')?.classList.add('is-selected');
 phase='filterPrompt';
 msg('Ось усі сімнадцять сигналів. Тепер подивимось на час.\nУвімкни фільтр комбінацією Ctrl+Shift+L.');
 setHint('<span><kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>L</kbd> увімкнути фільтр</span><span><kbd>ESC</kbd> пауза</span>');
}
function enableFilters(){
 const head=win()?.querySelector('.s3-pattern-head');if(!head)return;
 head.querySelectorAll('.excel-cell').forEach(c=>{if(!c.querySelector('.s3-filter-caret'))c.insertAdjacentHTML('beforeend','<span class="s3-filter-caret">▼</span>')});
 phase='filterOpenPrompt';
 msg('Фільтр увімкнено. Ми вже стоїмо на стовпці ЧАС.\nВідкрий його меню: Alt + ↓.');
 setHint('<span><kbd>ALT</kbd> + <kbd>↓</kbd> відкрити фільтр стовпця <b>ЧАС</b></span><span><kbd>ESC</kbd> пауза</span>');
}
function openFilter(){
 const body=win()?.querySelector('.excel-body');if(!body)return;
 body.style.position='relative';let menu=body.querySelector('.s3-pattern-filter-menu');if(menu)menu.remove();
 menu=document.createElement('div');menu.className='s3-pattern-filter-menu';menu.innerHTML='<strong>ЧАС · значення</strong><div class="s3-pattern-filter-option"><span>03:17</span><b>17</b></div><small>Enter — застосувати</small>';body.appendChild(menu);
 filterOpen=true;phase='filterMenu';
 setHint('<span>Єдине значення: <b>03:17</b></span><span><kbd>ENTER</kbd> застосувати фільтр</span><span><kbd>ESC</kbd> пауза</span>');
}
function applyFilter(){
 filterOpen=false;win()?.querySelector('.s3-pattern-filter-menu')?.remove();
 win()?.querySelectorAll('.s3-time-cell').forEach(c=>c.classList.add('s3-time-hit'));
 const body=win()?.querySelector('.excel-body');if(body){
  let badge=body.querySelector('.s3-pattern-badge');if(!badge){badge=document.createElement('div');badge.className='s3-pattern-badge';badge.innerHTML='<strong>03:17</strong><span>17 з 17</span>';body.appendChild(badge)}
  requestAnimationFrame(()=>badge.classList.add('show'));
 }
 phase='result';line=0;msg(RESULT_LINES[0]);
 setHint('<span>Збіг: <b>17 з 17</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function ensureProtocolOverlay(){
 const mon=document.querySelector('.monitor-screen');if(!mon)return null;
 let o=mon.querySelector('.s3-protocol-overlay');if(o)return o;
 o=document.createElement('div');o.className='s3-protocol-overlay';o.innerHTML='<div class="s3-protocol-card"><small>S3 / CH17 / 03:17</small><strong>PROTOCOL 17</strong><b>STATUS: ACTIVE</b></div>';mon.appendChild(o);return o;
}
function revealProtocol(){
 phase='protocol';const overlay=ensureProtocolOverlay();requestAnimationFrame(()=>overlay?.classList.add('show'));
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(AC){const c=new AC(),o=c.createOscillator(),g=c.createGain();o.frequency.value=118;g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.8);o.stop(c.currentTime+.82)}
 }catch(_){}
 setHint('<span>PROTOCOL 17 · ACTIVE</span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
 setTimeout(()=>msg('Тепер зрозуміло, чому його запис сховали.'),650);
}
function advanceResult(){
 if(line<RESULT_LINES.length-1){line++;msg(RESULT_LINES[line]);setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');return}
 revealProtocol();
}
function arm(){
 if(armed||phase!=='waiting')return;
 const text=help()?.textContent||'';
 if(!/КРОК ЗАВЕРШЕНО/i.test(text)||!/17/i.test(text)||!/SOURCE:\s*S3/i.test(text))return;
 armed=true;phase='ready';
 setHint('<span>Знайдено <b>17</b> сигналів <b>SOURCE: S3</b></span><span><kbd>ENTER</kbd> знайти закономірність</span><span><kbd>ESC</kbd> пауза</span>');
}
function start(){
 phase='sheetPrompt';ensureSignalsTab();
 msg('Кількість є. Тепер знайдемо закономірність.\nЯ винесла всі сімнадцять сигналів на окремий аркуш «Сигнали». Перейди на нього: Ctrl + PageDown.');
 setHint('<span><kbd>CTRL</kbd> + <kbd>PGDN</kbd> перейти на аркуш <b>Сигнали</b></span><span><kbd>ESC</kbd> пауза</span>');
}

window.addEventListener('keydown',e=>{
 if(phase==='ready'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();start();return;
 }
 if(phase==='sheetPrompt'&&(e.ctrlKey||e.metaKey)&&(e.code==='PageDown'||e.key==='PageDown')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();switchToSignals();return;
 }
 if(phase==='filterPrompt'&&(e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.code==='KeyL'||String(e.key).toLowerCase()==='l')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();enableFilters();return;
 }
 if(phase==='filterOpenPrompt'&&e.altKey&&(e.code==='ArrowDown'||e.key==='ArrowDown')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openFilter();return;
 }
 if(phase==='filterMenu'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();applyFilter();return;
 }
 if(phase==='result'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();advanceResult();return;
 }
 if(phase==='protocol'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  ensureProtocolOverlay()?.classList.remove('show');phase='complete';
  setHint('<span>СЦЕНА 02 ЗАВЕРШЕНА · <b>PROTOCOL 17</b> ВИЯВЛЕНО</span><span><kbd>ESC</kbd> пауза</span>');return;
 }
 if(filterOpen&&e.key==='Escape'){
  filterOpen=false;win()?.querySelector('.s3-pattern-filter-menu')?.remove();phase='filterOpenPrompt';return;
 }
},true);

const observer=new MutationObserver(arm);observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setInterval(arm,400);arm();
window.VIDLIK_SCENE2_PATTERN={get phase(){return phase},start};
})();
