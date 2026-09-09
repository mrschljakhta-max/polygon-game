(()=>{
'use strict';
if(window.VIDLIK_POLYA_IDENTITY)return;

const POLYA_NAME='Поля';
const AVATAR='assets/sector3-prologue/polya-01.webp';

const style=document.createElement('style');
style.id='vidlik-polya-identity-style';
style.textContent=`
.admin-header[data-polya-identity="true"] .admin-header-avatar{
  background:linear-gradient(180deg,rgba(255,92,112,.05),rgba(0,0,0,.14)),url('${AVATAR}') 50% 22%/cover no-repeat!important;
  border-color:rgba(255,92,112,.9)!important;
  box-shadow:0 0 0 1px rgba(255,92,112,.16),0 0 16px rgba(255,92,112,.2),inset 0 0 10px rgba(0,0,0,.12)!important;
}
.admin-header[data-polya-identity="true"] .admin-header-avatar::before,
.admin-header[data-polya-identity="true"] .admin-header-avatar::after{display:none!important}
.admin-header[data-polya-identity="true"] .admin-header-name{color:#ff7183!important;text-transform:none!important}
.admin-header[data-polya-identity="true"] .admin-online{color:#ff8a98!important}
.admin-header[data-polya-identity="true"] .admin-online i{background:#ff5c70!important;box-shadow:0 0 7px rgba(255,92,112,.75)!important}
.admin-message.is-polya .admin-bubble-name,.caption b[data-polya-identity="true"]{text-transform:none!important}
`;
document.head.appendChild(style);

const isPolyaLabel=text=>/^поля$/iu.test(String(text||'').trim());
let scheduled=false;

function normalizeIdentity(){
  const header=document.querySelector('.admin-header');
  if(header){
    const name=header.querySelector('.admin-header-name');
    const isPolya=header.classList.contains('excel-polya-channel')||isPolyaLabel(name?.textContent);
    if(isPolya){
      if(header.dataset.polyaIdentity!=='true')header.dataset.polyaIdentity='true';
      if(name&&name.textContent!==POLYA_NAME)name.textContent=POLYA_NAME;
    }else if(header.dataset.polyaIdentity){
      delete header.dataset.polyaIdentity;
    }
  }

  document.querySelectorAll('.admin-bubble-name').forEach(el=>{
    if(isPolyaLabel(el.textContent)&&el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME;
  });
  document.querySelectorAll('.caption b').forEach(el=>{
    if(!isPolyaLabel(el.textContent))return;
    if(el.textContent!==POLYA_NAME)el.textContent=POLYA_NAME;
    if(el.dataset.polyaIdentity!=='true')el.dataset.polyaIdentity='true';
  });
  const footer=document.querySelector('.admin-footer');
  if(footer&&/^поля\s*·/iu.test(footer.textContent||''))footer.textContent=footer.textContent.replace(/^поля/iu,POLYA_NAME);
}

function scheduleNormalize(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;normalizeIdentity()});
}

normalizeIdentity();
/* Only DOM/text additions are observed. Class-attribute mutations are deliberately
   excluded so the normalizer can never participate in a class-mutation feedback loop. */
const observer=new MutationObserver(scheduleNormalize);
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
window.addEventListener('vidlik:os-reset',scheduleNormalize);
window.VIDLIK_POLYA_IDENTITY={normalize:normalizeIdentity,name:POLYA_NAME,avatar:AVATAR};
})();