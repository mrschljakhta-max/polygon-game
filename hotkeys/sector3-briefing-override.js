(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(parseInt(params.get('sector')||'0',10)!==3)return;

const q=s=>document.querySelector(s);
const list=q('#mbf-levels-list');
const first=list?.querySelector('li');

if(first){
  [...list.children].slice(1).forEach(n=>n.remove());
  first.classList.add('is-selected');
  first.setAttribute('aria-current','true');
  const label=first.querySelector('.mbf-level-label,.mbf-level-name,strong,span:last-child');
  if(label)label.textContent='Знайомство';
}

const pageToggle=q('#mbf-page-toggle');
const pageNav=q('.mbf-page-nav');
if(pageToggle)pageToggle.hidden=true;
if(pageNav)pageNav.hidden=true;

const heading=q('#mbf-page-heading');
const summary=q('#mbf-summary');
const levels=q('#mbf-levels');
const pageLabel=q('#mbf-page-label');
const action=q('#mbf-action-label');
const progress=q('#mbf-progress');
const fill=q('#mbf-progress-fill');

if(heading)heading.textContent='УРОК 01';
if(summary)summary.textContent='Знайомство з Полею та початок сюжетної роботи у Секторі 3.';
if(levels)levels.textContent='0 / 1';
if(pageLabel)pageLabel.textContent='1 / 1';
if(progress)progress.textContent='0%';
if(fill)fill.style.width='0%';
if(action)action.textContent='РОЗПОЧАТИ';

document.documentElement.classList.add('sector3-single-lesson');
const style=document.createElement('style');
style.textContent=`
.sector3-single-lesson #mbf-page-toggle,
.sector3-single-lesson .mbf-page-nav{display:none!important}
.sector3-single-lesson #mbf-levels-list>li:not(:first-child){display:none!important}
.sector3-single-lesson .mbf-actions span:nth-child(1),
.sector3-single-lesson .mbf-actions span:nth-child(2){display:none!important}
`;
document.head.appendChild(style);

function openStory(){
  const screen=q('#mbf-screen');
  if(screen)screen.classList.add('is-leaving');
  setTimeout(()=>location.href='sector3-intro.html?v=20260906-2&level=1&from=briefing',120);
}
function back(){location.href='index.html';}

document.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    e.preventDefault();e.stopImmediatePropagation();openStory();
  }else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();e.stopImmediatePropagation();
  }else if(e.key==='Escape'){
    e.preventDefault();e.stopImmediatePropagation();back();
  }
},true);

document.addEventListener('click',e=>{
  if(e.target.closest('#mbf-back'))return;
  if(e.target.closest('#mbf-screen')){
    e.preventDefault();e.stopImmediatePropagation();openStory();
  }
},true);
})();
