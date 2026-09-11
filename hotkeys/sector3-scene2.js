(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if((parseInt(params.get('storyScene')||'0',10)||0)!==1)return;
if(window.VIDLIK_SCENE2)return;

let scene2SearchActive=false;
let scene2Search='';
let scene2InstructionInjected=false;
let scene2Phase='waiting';
let scene2ResultIndex=-1;
const SCENE2_RESULT_LINES=[
 'Дивись на джерело. Це не зовнішній канал.',
 'Сигнал прийшов із самого Сектора 3.',
 'І час збігається з днем зникнення Данила.',
 'Тепер перевіримо, скільки таких сигналів було.'
];
function help(){return document.getElementById('help')}
function directWindow(){return document.querySelector('.s3-direct-window')}
function directWindowActive(){
 const win=directWindow();
 return !!win&&win.style.display!=='none'&&!win.classList.contains('os-minimized')&&!win.classList.contains('os-window-minimized');
}
function scene2RuntimeReady(){
 const text=help()?.textContent||'';
 return /наступний крок розслідування/i.test(text)||['ready','search','result'].includes(scene2Phase);
}
function searchBox(){return document.querySelector('.s3-direct-window .s3-direct-search')}
function polyaMsg(text){
 const chat=document.getElementById('adminChat');if(!chat)return;
 const now=new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-direct-message s3-scene2-message';
 row.innerHTML='<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name">Поля</span><span class="admin-bubble-time">'+now+'</span></div><p></p></div>';
 row.querySelector('p').textContent=text;
 chat.appendChild(row);requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight});
}
function ensureScene2Instruction(){
 if(scene2InstructionInjected||!directWindowActive())return;
 const h=help();
 if(!h||!/наступний крок розслідування/i.test(h.textContent||''))return;
 scene2InstructionInjected=true;scene2Phase='ready';
 polyaMsg('У системі цей сигнал позначений як CH 17. Знайди його через пошук Excel.');
 h.innerHTML='<span><kbd>CTRL</kbd> + <kbd>F</kbd> відкрити пошук</span><span>шукати: <b>CH 17</b></span><span><kbd>ESC</kbd> пауза</span>';
}
function openScene2Search(){
 const box=searchBox();if(!box)return;
 scene2Phase='search';scene2SearchActive=true;scene2Search='';
 box.hidden=false;box.dataset.scene2Search='1';box.classList.remove('s3-search-error');
 const strong=box.querySelector('strong');if(strong)strong.textContent='';
 const label=box.querySelector('span');if(label)label.textContent='Пошук у реєстрі';
 const em=box.querySelector('em');if(em)em.textContent='Введіть CH 17 · Enter — знайти';
 const h=help();if(h)h.innerHTML='<span><kbd>ТЕКСТ</kbd> введіть <b>CH 17</b></span><span><kbd>ENTER</kbd> знайти</span><span><kbd>ESC</kbd> пауза</span>';
}
function normalizeQuery(value){return String(value||'').toUpperCase().replace(/\s+/g,'')}
function ensureSignalResultRow(){
 const win=directWindow();if(!win)return null;
 let row=win.querySelector('.s3-signal-source-row');if(row)return row;
 const grid=win.querySelector('.excel-grid-body');if(!grid)return null;
 row=document.createElement('div');row.className='excel-row register-row s3-signal-source-row';row.dataset.row='20';
 const values=['CH 17','NODE S3-LOCAL','ВНУТРІШНІЙ','ДЕНЬ ЗНИКНЕННЯ','АКТИВНИЙ','SOURCE: S3'];
 row.innerHTML='<div class="excel-row-head">20</div>'+values.map((v,i)=>'<button type="button" class="excel-cell'+(i===0?' is-selected':'')+'" data-cell="'+String.fromCharCode(65+i)+'20">'+v+'</button>').join('');
 grid.appendChild(row);return row;
}
function completeScene2Search(){
 scene2SearchActive=false;scene2Phase='result';scene2ResultIndex=-1;
 const box=searchBox();if(box){box.hidden=true;delete box.dataset.scene2Search;box.classList.remove('s3-search-error')}
 const row=ensureSignalResultRow();
 if(row){row.classList.add('s3-signal-source-found');setTimeout(()=>row.scrollIntoView({block:'center',behavior:'smooth'}),30)}
 polyaMsg('Є. CH 17.');
 const h=help();if(h)h.innerHTML='<span>Знайдено: <b>CH 17</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>';
}
function wrongScene2Search(){
 const box=searchBox();if(box){box.classList.remove('s3-search-error');void box.offsetWidth;box.classList.add('s3-search-error')}
 const h=help();if(h)h.innerHTML='<span>Не знайдено. Введіть точно: <b>CH 17</b></span><span><kbd>ENTER</kbd> знайти</span><span><kbd>ESC</kbd> пауза</span>';
}
function advanceScene2Result(){
 if(scene2Phase!=='result')return false;
 if(scene2ResultIndex<SCENE2_RESULT_LINES.length-1){
  scene2ResultIndex++;polyaMsg(SCENE2_RESULT_LINES[scene2ResultIndex]);
  const h=help();if(h)h.innerHTML='<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>';
  return true;
 }
 scene2Phase='complete';
 const h=help();if(h)h.innerHTML='<span>КРОК ЗАВЕРШЕНО · джерело <b>CH 17</b> знайдено</span><span><kbd>ESC</kbd> пауза</span>';
 return true;
}

window.addEventListener('keydown',e=>{
 const find=(e.ctrlKey||e.metaKey)&&e.code==='KeyF';
 if(find&&directWindowActive()){
  e.preventDefault();
  if(scene2RuntimeReady()){
   e.stopPropagation();e.stopImmediatePropagation();openScene2Search();return;
  }
 }
 if(scene2Phase==='result'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();advanceScene2Result();return;
 }
 if(!scene2SearchActive)return;
 if(e.key==='Escape'){
  scene2SearchActive=false;scene2Phase='ready';
  const box=searchBox();if(box){box.hidden=true;delete box.dataset.scene2Search}
  return;
 }
 if(e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(!scene2Search.trim()||normalizeQuery(scene2Search)!=='CH17'){wrongScene2Search();return}
  completeScene2Search();return;
 }
 if(e.key==='Backspace')scene2Search=scene2Search.slice(0,-1);
 else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey)scene2Search+=e.key;
 else return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const strong=searchBox()?.querySelector('strong');if(strong)strong.textContent=scene2Search;
},true);

function normalizePolyaMessages(){
 document.querySelectorAll('.s3-direct-message p').forEach(p=>{
  if((p.textContent||'').trim()!=='Не натискай нічого.')return;
  p.closest('.s3-direct-message')?.remove();
  setTimeout(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true})),30);
 });
}

function installCanonicalSceneTitle(){
 const overlay=document.querySelector('.s3-scene-title');
 if(!overlay||overlay.dataset.canonicalTitle==='1')return;
 overlay.dataset.canonicalTitle='1';
 overlay.innerHTML=`
  <div class="s3ct-bg"></div><div class="s3ct-shade"></div><div class="s3ct-laser"></div><div class="s3ct-frame"></div>
  <div class="s3ct-rail"><span></span><i></i><b>СЦЕНА / 02</b></div>
  <div class="s3ct-hero">
   <div class="s3ct-kicker"><strong>СЦЕНА 02</strong><i></i></div>
   <h2><em>«</em>СИГНАЛ<em>»</em></h2><div class="s3ct-divider"></div>
   <p>ПЕРШИЙ СЛІД У СИСТЕМІ</p><div class="s3ct-terminal"><span>&gt;</span><b>продовжити</b><i></i></div>
  </div><div class="s3ct-meta"><span></span> ВІДЛІК<br>СЕКТОР 3 / АКТ I</div>`;
 if(document.getElementById('s3-canonical-scene-title-style'))return;
 const st=document.createElement('style');st.id='s3-canonical-scene-title-style';st.textContent=`
 .s3-scene-title{position:absolute!important;inset:0!important;z-index:760!important;display:block!important;background:#03080b!important;color:#f3f5f6!important;text-align:left!important;overflow:hidden!important;isolation:isolate!important}
 .s3-scene-title.show{opacity:1!important;pointer-events:auto!important}.s3-scene-title:not(.show){opacity:0!important;pointer-events:none!important}
 .s3ct-bg{position:absolute;inset:-2%;z-index:0;background:#03080b url('assets/sector3-prologue/act1-title-bg.png') center center/cover no-repeat;filter:brightness(.72) saturate(.88);transform:scale(1.018)}
 .s3ct-shade{position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 73% 40%,transparent 0 20%,rgba(0,5,8,.12) 48%,rgba(0,3,5,.54) 100%),linear-gradient(90deg,rgba(0,5,8,.38) 0%,rgba(0,5,8,.16) 39%,transparent 60%),linear-gradient(180deg,rgba(0,0,0,.18),transparent 34%,rgba(0,0,0,.38))}
 .s3ct-laser{position:absolute;top:33.55%;left:31%;right:0;z-index:2;height:1px;background:linear-gradient(90deg,transparent,rgba(255,27,51,.38) 28%,rgba(255,63,78,.88) 54%,transparent 92%);filter:drop-shadow(0 0 7px #ff263f);opacity:.34}
 .s3ct-frame{position:absolute;inset:24px;z-index:11;border:1px solid rgba(181,224,232,.10);pointer-events:none}.s3ct-frame:before,.s3ct-frame:after{content:'';position:absolute;width:62px;height:1px;background:linear-gradient(90deg,#ff263f,transparent)}.s3ct-frame:before{top:-1px;left:-1px}.s3ct-frame:after{right:-1px;bottom:-1px;transform:rotate(180deg)}
 .s3ct-rail{position:absolute;left:64px;top:50%;z-index:14;display:flex;flex-direction:column;align-items:center;gap:12px;transform:translateY(-50%);opacity:.62}.s3ct-rail span{width:1px;height:128px;background:linear-gradient(transparent,rgba(145,218,232,.46),transparent)}.s3ct-rail i{width:5px;height:5px;border-radius:50%;background:#ff263f;box-shadow:0 0 11px rgba(255,38,63,.86)}.s3ct-rail b{color:rgba(220,237,240,.48);font:600 9px/1 Consolas,monospace;letter-spacing:.22em;writing-mode:vertical-rl}
 .s3ct-hero{position:absolute;left:10.7vw;top:50%;z-index:10;width:min(680px,43vw);transform:translateY(-50%)}
 .s3ct-kicker{display:flex;align-items:center;gap:16px;width:min(470px,100%);margin-bottom:23px}.s3ct-kicker strong{color:#ff263f;font:700 clamp(12px,.92vw,16px)/1 Consolas,monospace;letter-spacing:.42em}.s3ct-kicker i{height:1px;flex:1;background:linear-gradient(90deg,rgba(255,38,63,.72),transparent)}
 .s3ct-hero h2{margin:0!important;width:max-content;max-width:100%;color:rgba(247,249,250,.97)!important;font:760 clamp(48px,4.2vw,82px)/.96 'Segoe UI',Arial,sans-serif!important;letter-spacing:.045em!important;text-transform:uppercase;text-shadow:0 12px 42px rgba(0,0,0,.62)}.s3ct-hero h2 em{color:rgba(255,38,63,.76);font-style:normal;font-weight:350}
 .s3ct-divider{width:116px;height:1px;margin:31px 0 25px;background:linear-gradient(90deg,#ff263f,transparent);box-shadow:0 0 15px rgba(255,38,63,.18)}
 .s3ct-hero p{max-width:520px;margin:0 0 35px!important;color:rgba(222,232,236,.60)!important;font:500 clamp(13px,1vw,18px)/1.75 'Segoe UI',Arial,sans-serif!important;letter-spacing:.09em!important;text-transform:uppercase}
 .s3ct-terminal{display:inline-flex;align-items:center;color:rgba(241,246,247,.87);font:500 13px/1 Consolas,monospace;letter-spacing:.08em}.s3ct-terminal span{margin-right:10px;color:#ff263f;font-weight:800}.s3ct-terminal i{width:8px;height:16px;margin-left:5px;background:#ff263f;box-shadow:0 0 10px rgba(255,38,63,.54);animation:s3ctBlink .88s steps(1,end) infinite}
 .s3ct-meta{position:absolute;right:54px;bottom:42px;z-index:14;color:rgba(218,235,238,.42);font:500 9px/1.8 Consolas,monospace;letter-spacing:.26em;text-align:right;text-transform:uppercase}.s3ct-meta span{display:inline-block;width:28px;height:1px;margin-right:10px;vertical-align:middle;background:#ff263f}
 .s3-direct-search.s3-search-error{animation:s3SearchError .18s linear 2;border-color:#c34858!important;box-shadow:0 0 0 2px rgba(195,72,88,.14),0 8px 24px rgba(0,0,0,.2)!important}
 .s3-signal-source-row .excel-cell{background:#eefaf8!important;color:#15443c!important;font-weight:700!important}.s3-signal-source-row .excel-cell:first-of-type{color:#8c1726!important}.s3-signal-source-found{animation:s3SignalFound 1.15s cubic-bezier(.22,1,.36,1) both}
 @keyframes s3SearchError{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
 @keyframes s3SignalFound{0%{filter:brightness(1)}22%{filter:brightness(1.32)}100%{filter:brightness(1)}}
 @keyframes s3ctBlink{0%,46%{opacity:1}47%,100%{opacity:0}}
 @media(max-width:760px){.s3ct-rail,.s3ct-meta{display:none}.s3ct-hero{left:7vw;top:auto;bottom:9vh;width:86vw;transform:none}.s3ct-hero h2{font-size:clamp(36px,10.2vw,60px)!important}.s3ct-bg{background-position:66% center}}
 `;document.head.appendChild(st);
}

const observer=new MutationObserver(()=>{normalizePolyaMessages();installCanonicalSceneTitle();ensureScene2Instruction()});
observer.observe(document.documentElement,{childList:true,subtree:true});
normalizePolyaMessages();installCanonicalSceneTitle();ensureScene2Instruction();

const api={
 get phase(){return scene2Phase},
 openSearch:openScene2Search,
 get searching(){return scene2SearchActive}
};
window.VIDLIK_SCENE2=api;
window.VIDLIK_DIRECT_SCENE2=api;
})();