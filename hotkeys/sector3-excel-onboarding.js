(()=>{
'use strict';
if(window.VIDLIK_EXCEL_ONBOARDING)return;

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
const excelIcon=document.querySelector('.desktop-icon[data-app="excel"]');
if(!mon||!chat||!footer||!help||!excelIcon)return;

const asDataUri=v=>!v?'':(v.startsWith('data:')?v:`data:image/webp;base64,${v}`);
const SLIDES=[1,2,3,4].map(n=>asDataUri(window[`VIDLIK_EXCEL_SLIDE_${n}`]));

let active=false;
let completed=false;
let stage=0;
let overlay=null;
let launching=false;

function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(rowEl){requestAnimationFrame(()=>requestAnimationFrame(()=>{const top=Math.max(0,chat.scrollHeight-chat.clientHeight);if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});else chat.scrollTop=top;rowEl?.setAttribute('data-visible-latest','true')}))}
function adminMessage(text){
 const r=document.createElement('div');r.className='admin-message vidlik-tutorial-message excel-onboarding-message';
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=nowTime();
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}
function preloadSlides(){for(const src of SLIDES){if(!src)continue;const img=new Image();img.decoding='async';img.src=src}}
function minimizeOldWindows(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 for(const b of [...mon.querySelectorAll('.os-window:not(.os-minimized):not(.os-window-minimized) [data-win="min"]')]){try{b.click()}catch(_){}}
}
function removeOverlay(){
 if(overlay){overlay.classList.add('is-leaving');const old=overlay;setTimeout(()=>old.remove(),180)}
 overlay=null;
 mon.classList.remove('vidlik-excel-card-open','vidlik-excel-launching','vidlik-excel-slides-open');
}
function ensureOverlay(){
 if(overlay?.isConnected)return overlay;
 overlay=document.createElement('section');
 overlay.className='vidlik-excel-onboarding vidlik-excel-slides';
 overlay.setAttribute('aria-label','Знайомство з Microsoft Excel');
 mon.appendChild(overlay);
 requestAnimationFrame(()=>overlay?.classList.add('is-visible'));
 return overlay;
}
function renderSlide(n){
 const src=SLIDES[n-1];
 const root=ensureOverlay();
 root.innerHTML=src
  ? `<div class="vidlik-excel-slide-shell"><img class="vidlik-excel-slide-image" src="${src}" alt="Excel · навчальний слайд ${n} з ${SLIDES.length}" draggable="false"></div>`
  : `<div class="vidlik-excel-slide-error">Слайд ${n} недоступний</div>`;
 mon.classList.add('vidlik-excel-slides-open');
 setFooter(`ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ · ЗНАЙОМСТВО З EXCEL · ${n}/${SLIDES.length}`);
 setHelp(`<span><kbd>ENTER</kbd> далі · ${n}/${SLIDES.length}</span><span><kbd>ESC</kbd> пауза</span>`);
}
function stageReady(){
 removeOverlay();stage=5;
 mon.classList.add('vidlik-excel-onboarding-active');
 excelIcon.classList.add('vidlik-excel-icon-focus','is-selected');
 adminMessage('Базове знайомство завершено. Тепер відкрийте Microsoft Excel подвійним кліком по зеленому значку на робочому столі.');
 setFooter('ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ · ЗАПУСК EXCEL');
 setHelp('<span><kbd>ЛКМ ×2</kbd> Microsoft Excel · відкрити</span><span><kbd>ESC</kbd> пауза</span>');
}
function setStage(next){
 if(!active||launching)return;
 stage=next;
 if(stage>=1&&stage<=SLIDES.length)renderSlide(stage);
 else if(stage===SLIDES.length+1)stageReady();
}
function begin(){
 if(active||completed)return;
 active=true;stage=0;launching=false;preloadSlides();minimizeOldWindows();removeOverlay();
 mon.classList.add('vidlik-excel-onboarding-active');excelIcon.classList.add('vidlik-excel-icon-focus');
 setFooter('ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ · ЗНАЙОМСТВО З EXCEL');
 setHelp('<span><kbd>ЛКМ</kbd> вибрати значок Microsoft Excel</span><span><kbd>ESC</kbd> пауза</span>');
 adminMessage('Перед наступним завданням — коротке знайомство з новою програмою. На робочому столі знайдіть зелений значок Microsoft Excel і виберіть його одним кліком.');
}
function launch(){
 if(!active||launching||stage!==5)return;
 launching=true;mon.classList.remove('vidlik-excel-onboarding-active');excelIcon.classList.remove('vidlik-excel-icon-focus','is-selected');
 const root=ensureOverlay();root.classList.add('is-visible','vidlik-excel-launch-screen');mon.classList.add('vidlik-excel-launching');
 root.innerHTML='<div class="vidlik-excel-launch-copy"><strong>MICROSOFT EXCEL</strong><span>Відкриття TRAINING_SYNC_SECTOR_3.xlsx…</span></div>';
 setHelp('<span><kbd>EXCEL</kbd> відкриття книги…</span>');
 setTimeout(()=>{completed=true;active=false;launching=false;removeOverlay();window.VIDLIK_EXCEL_STORY_TUTORIAL?.start?.()},720);
}
function gate(e){if(completed)return;e.preventDefault?.();e.stopImmediatePropagation();e.stopPropagation();begin()}
window.addEventListener('vidlik:episode5-ready',gate,true);
window.addEventListener('vidlik:section5-ready',gate,true);

mon.addEventListener('click',e=>{
 if(!active||launching)return;
 const icon=e.target.closest('.desktop-icon[data-app="excel"]');
 if(icon&&stage===0){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();excelIcon.classList.add('is-selected');adminMessage('Так. Це Microsoft Excel. На моніторі відкриється коротка довідка — перегляньте її клавішею Enter.');setStage(1);return}
 if(stage>=1&&stage<=SLIDES.length&&e.target.closest('.vidlik-excel-slide-shell')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setStage(stage+1);return}
 if(icon&&stage===5&&e.detail>=2){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch()}
},true);
mon.addEventListener('dblclick',e=>{if(!active||stage!==5||!e.target.closest('.desktop-icon[data-app="excel"]'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch()},true);
window.addEventListener('keydown',e=>{
 if(!active||launching)return;
 if(e.key==='Escape')return;
 if(stage>=1&&stage<=SLIDES.length&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setStage(stage+1);return}
 if(stage===5&&e.key==='Enter'&&excelIcon.classList.contains('is-selected')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch();return}
 if(stage>=1){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
},true);
window.addEventListener('vidlik:os-reset',()=>{active=false;completed=false;stage=0;launching=false;removeOverlay();mon.classList.remove('vidlik-excel-onboarding-active');excelIcon.classList.remove('vidlik-excel-icon-focus','is-selected')});
window.VIDLIK_EXCEL_ONBOARDING={begin,launch,get active(){return active},get stage(){return stage},get completed(){return completed}};
})();
