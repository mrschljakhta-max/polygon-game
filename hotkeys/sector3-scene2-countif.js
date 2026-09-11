(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if((parseInt(params.get('storyScene')||'0',10)||0)!==1)return;
if(window.VIDLIK_SCENE2_COUNTIF)return;

let phase='waiting';
let formula='';
let resultIndex=-1;
let armed=false;
const EXPECTED='=COUNTIF(F2:F269;"SOURCE:S3")';
const RESULT_LINES=[
 'Це не один сигнал.',
 'Це серія.',
 'І всі вони йдуть із Сектора 3.',
 'Тепер треба з’ясувати, що їх об’єднує.'
];

function help(){return document.getElementById('help')}
function win(){return document.querySelector('.s3-direct-window')}
function chat(){return document.getElementById('adminChat')}
function now(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function msg(text){
 const host=chat();if(!host)return;
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message excel-story-message is-polya s3-direct-message s3-scene2-countif-message';
 row.innerHTML='<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name">Поля</span><span class="admin-bubble-time">'+now()+'</span></div><p></p></div>';
 row.querySelector('p').textContent=text;
 row.querySelector('p').style.whiteSpace='pre-line';
 host.appendChild(row);requestAnimationFrame(()=>{host.scrollTop=host.scrollHeight});
}
function normalized(v){
 return String(v||'').toUpperCase().replace(/\s+/g,'').replace(/,/g,';');
}
function formulaBar(){return win()?.querySelector('.excel-formula-value')}
function nameBox(){return win()?.querySelector('.excel-name-box')}
function grid(){return win()?.querySelector('.excel-grid-body')}
function ensureStyle(){
 if(document.getElementById('s3-scene2-countif-style'))return;
 const st=document.createElement('style');st.id='s3-scene2-countif-style';st.textContent=`
 .s3-countif-row .excel-cell{background:rgba(238,248,244,.92)!important;border-top-color:#78a99a!important;font-weight:700}
 .s3-countif-row .excel-row-head{color:#11634d!important;font-weight:800}
 .s3-countif-row .excel-cell.is-selected{outline:2px solid #1f9b72!important;outline-offset:-2px!important;background:#fff!important}
 .s3-countif-row.s3-countif-done .excel-cell{animation:s3CountifPulse .85s cubic-bezier(.22,1,.36,1) both}
 .s3-countif-row.s3-countif-done [data-cell="E21"]{background:#dff4e9!important;color:#0b6a4d!important;font-size:13px!important;font-weight:900!important}
 @keyframes s3CountifPulse{0%{filter:brightness(1)}35%{filter:brightness(1.16)}100%{filter:none}}
 `;document.head.appendChild(st);
}
function ensureCountRow(){
 const w=win(),g=grid();if(!w||!g)return null;
 let row=w.querySelector('.s3-countif-row');if(row)return row;
 row=document.createElement('div');row.className='excel-row register-row s3-countif-row';row.dataset.row='21';
 const values=['Σ','SOURCE: S3','КІЛЬКІСТЬ','COUNTIF','',''];
 row.innerHTML='<div class="excel-row-head">21</div>'+values.map((v,i)=>'<button type="button" class="excel-cell" data-cell="'+String.fromCharCode(65+i)+'21">'+v+'</button>').join('');
 g.appendChild(row);return row;
}
function selectE21(){
 const w=win();if(!w)return;
 const row=ensureCountRow();if(!row)return;
 w.querySelectorAll('.excel-cell.is-selected').forEach(x=>x.classList.remove('is-selected'));
 const cell=row.querySelector('[data-cell="E21"]');cell?.classList.add('is-selected');
 const n=nameBox();if(n)n.textContent='E21';
 const f=formulaBar();if(f)f.textContent=formula;
 setTimeout(()=>row.scrollIntoView({block:'center',behavior:'smooth'}),30);
}
function armContinuation(){
 if(armed||phase!=='waiting')return;
 const text=help()?.textContent||'';
 if(!/КРОК ЗАВЕРШЕНО/i.test(text)||!/CH 17/i.test(text))return;
 armed=true;phase='ready';
 const h=help();if(h)h.innerHTML='<span>Джерело <b>CH 17</b> знайдено</span><span><kbd>ENTER</kbd> продовжити розслідування</span><span><kbd>ESC</kbd> пауза</span>';
}
function startCountTask(){
 phase='input';formula='';resultIndex=-1;ensureStyle();selectE21();
 msg('Тепер порахуємо всі такі сигнали.\nУ клітинці E21 введи формулу =COUNTIF(F2:F269;"SOURCE: S3") і натисни Enter.\nCOUNTIF рахує клітинки, що відповідають умові. Тут ми рахуємо всі SOURCE: S3 у стовпці F.');
 const h=help();if(h)h.innerHTML='<span>Введіть у <b>E21</b>: <kbd>=COUNTIF(F2:F269;"SOURCE: S3")</kbd></span><span><kbd>ENTER</kbd> виконати</span><span><kbd>ESC</kbd> пауза</span>';
}
function wrongFormula(){
 const h=help();if(h)h.innerHTML='<span>Перевір формулу: <kbd>=COUNTIF(F2:F269;"SOURCE: S3")</kbd></span><span><kbd>ENTER</kbd> виконати</span><span><kbd>ESC</kbd> пауза</span>';
 const f=formulaBar();if(f){f.animate([{backgroundColor:'rgba(255,80,80,.18)'},{backgroundColor:'transparent'}],{duration:420,easing:'ease-out'})}
}
function acceptFormula(){
 if(normalized(formula)!==EXPECTED){wrongFormula();return}
 const row=ensureCountRow(),cell=row?.querySelector('[data-cell="E21"]');
 if(cell)cell.textContent='17';
 const f=formulaBar();if(f)f.textContent='=COUNTIF(F2:F269;"SOURCE: S3")';
 row?.classList.add('s3-countif-done');
 phase='result';resultIndex=-1;
 msg('Сімнадцять...');
 const h=help();if(h)h.innerHTML='<span>Результат: <b>17</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>';
}
function advanceResult(){
 if(resultIndex<RESULT_LINES.length-1){
  resultIndex++;msg(RESULT_LINES[resultIndex]);
  const h=help();if(h)h.innerHTML='<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>';
  return;
 }
 phase='complete';
 const h=help();if(h)h.innerHTML='<span>КРОК ЗАВЕРШЕНО · знайдено <b>17</b> сигналів <b>SOURCE: S3</b></span><span><kbd>ESC</kbd> пауза</span>';
}

window.addEventListener('keydown',e=>{
 if(phase==='ready'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();startCountTask();return;
 }
 if(phase==='result'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();advanceResult();return;
 }
 if(phase!=='input')return;
 if(e.key==='Escape')return;
 if(e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();acceptFormula();return;
 }
 if(e.key==='Backspace'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  formula=formula.slice(0,-1);const f=formulaBar();if(f)f.textContent=formula;return;
 }
 if(e.ctrlKey||e.metaKey||e.altKey||e.key.length!==1)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 formula+=e.key;const f=formulaBar();if(f)f.textContent=formula;
},true);

const observer=new MutationObserver(armContinuation);
observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setInterval(armContinuation,350);
armContinuation();

window.VIDLIK_SCENE2_COUNTIF={get phase(){return phase},start:startCountTask};
})();