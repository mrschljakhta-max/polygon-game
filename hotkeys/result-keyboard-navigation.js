(()=>{
'use strict';

function onResultScreen(){
  return !!document.querySelector('.ds-result');
}

function nextAction(){
  const btn=document.getElementById('ds-next');
  if(btn&&!btn.disabled){
    btn.click();
    return true;
  }
  return false;
}

function repeatAction(){
  const btn=document.getElementById('ds-repeat');
  if(btn&&!btn.disabled){
    btn.click();
    return true;
  }
  return false;
}

function decorate(){
  if(!onResultScreen())return;
  const next=document.getElementById('ds-next');
  const repeat=document.getElementById('ds-repeat');
  if(next&&!next.dataset.keyboardHint){
    next.dataset.keyboardHint='1';
    next.insertAdjacentHTML('beforeend',' <span class="ds-result-keyhint">ENTER</span>');
  }
  if(repeat&&!repeat.dataset.keyboardHint){
    repeat.dataset.keyboardHint='1';
    repeat.insertAdjacentHTML('beforeend',' <span class="ds-result-keyhint">R</span>');
  }
}

window.addEventListener('keydown',e=>{
  if(!onResultScreen())return;
  if(e.ctrlKey||e.altKey||e.metaKey)return;

  if(e.code==='Enter'||e.code==='NumpadEnter'){
    e.preventDefault();
    e.stopImmediatePropagation();
    nextAction();
    return;
  }

  if(e.code==='KeyR'&&!e.shiftKey){
    e.preventDefault();
    e.stopImmediatePropagation();
    repeatAction();
  }
},true);

const observer=new MutationObserver(decorate);
observer.observe(document.documentElement,{childList:true,subtree:true});
decorate();
})();
