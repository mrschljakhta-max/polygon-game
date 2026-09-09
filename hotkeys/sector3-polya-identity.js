(()=>{
'use strict';
if(window.VIDLIK_POLYA_IDENTITY)return;

const POLYA_NAME='Поля';
const AVATAR='assets/sector3-prologue/polya-01.webp';

const style=document.createElement('style');
style.id='vidlik-polya-identity-style';
style.textContent=`
.admin-header[data-polya-identity="true"] .admin-header-avatar{
  background:
    linear-gradient(180deg,rgba(255,92,112,.05),rgba(0,0,0,.14)),
    url('${AVATAR}') 50% 22%/cover no-repeat!important;
  border-color:rgba(255,92,112,.9)!important;
  box-shadow:
    0 0 0 1px rgba(255,92,112,.16),
    0 0 16px rgba(255,92,112,.2),
    inset 0 0 10px rgba(0,0,0,.12)!important;
}
.admin-header[data-polya-identity="true"] .admin-header-avatar::before,
.admin-header[data-polya-identity="true"] .admin-header-avatar::after{
  display:none!important;
}
.admin-header[data-polya-identity="true"] .admin-header-name{
  color:#ff7183!important;
  text-transform:none!important;
}
.admin-header[data-polya-identity="true"] .admin-online{
  color:#ff8a98!important;
}
.admin-header[data-polya-identity="true"] .admin-online i{
  background:#ff5c70!important;
  box-shadow:0 0 7px rgba(255,92,112,.75)!important;
}
.admin-message.is-polya .admin-bubble-name,
.caption b[data-polya-identity="true"]{
  text-transform:none!important;
}
`;
document.head.appendChild(style);

function isPolyaLabel(text){
  return /^поля$/iu.test(String(text||'').trim());
}

function normalizeIdentity(root=document){
  const header=root.querySelector?.('.admin-header')||document.querySelector('.admin-header');
  if(header){
    const name=header.querySelector('.admin-header-name');
    const polya=header.classList.contains('excel-polya-channel')||isPolyaLabel(name?.textContent);
    if(polya){
      header.dataset.polyaIdentity='true';
      if(name&&name.textContent!==POLYA_NAME)name.textContent=POLYA_NAME;
    }else{
      delete header.dataset.polyaIdentity;
    }
  }

  const bubbleNames=root.querySelectorAll?.('.admin-bubble-name')||[];
  bubbleNames.forEach(el=>{if(isPolyaLabel(el.textContent)&&el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME});

  const captionNames=root.querySelectorAll?.('.caption b')||[];
  captionNames.forEach(el=>{
    if(isPolyaLabel(el.textContent)){
      if(el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME;
      el.dataset.polyaIdentity='true';
    }
  });

  const footer=root.querySelector?.('.admin-footer')||document.querySelector('.admin-footer');
  if(footer&&/^поля\s*·/iu.test(footer.textContent||'')){
    footer.textContent=footer.textContent.replace(/^поля/iu,POLYA_NAME);
  }
}

normalizeIdentity(document);

const observer=new MutationObserver(records=>{
  for(const record of records){
    const target=record.target instanceof Element?record.target:record.target.parentElement;
    normalizeIdentity(target?.closest?.('.tablet-screen')||document);
    break;
  }
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});

window.addEventListener('vidlik:os-reset',()=>requestAnimationFrame(()=>normalizeIdentity(document)));
window.VIDLIK_POLYA_IDENTITY={normalize:()=>normalizeIdentity(document),name:POLYA_NAME,avatar:AVATAR};
})();
