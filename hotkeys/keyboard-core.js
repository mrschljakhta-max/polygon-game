(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.VidlikKeyboard=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const MODIFIERS=new Set(['ControlLeft','ControlRight','ShiftLeft','ShiftRight','AltLeft','AltRight','MetaLeft','MetaRight']);
  const PREVENTABLE_KEYS=new Set(['F1','F2','Home','End','PageUp','PageDown','Space','Tab','Enter','Delete','Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown']);
  const BROWSER_SHORTCUTS=new Set([
    'Ctrl+KeyF','Ctrl+KeyP','Ctrl+KeyS','Ctrl+KeyL','Ctrl+KeyT','Ctrl+KeyW','Ctrl+KeyN',
    'Ctrl+Shift+KeyT','Ctrl+Shift+KeyN','F1','F5','F11'
  ]);
  const SYSTEM_SHORTCUTS=new Set([
    'Alt+F4','Alt+Tab','Ctrl+Alt+Delete','Meta+KeyD','Meta+KeyE','Meta+KeyL','PrintScreen'
  ]);

  function signature(source){
    const parts=[];
    if(source.ctrlKey||source.ctrl)parts.push('Ctrl');
    if(source.altKey||source.alt)parts.push('Alt');
    if(source.shiftKey||source.shift)parts.push('Shift');
    if(source.metaKey||source.meta)parts.push('Meta');
    parts.push(source.code||'');
    return parts.join('+');
  }

  function mode(task){
    if(task&&task.mode)return task.mode;
    const sig=signature(task||{});
    if(SYSTEM_SHORTCUTS.has(sig))return 'simulation';
    if(BROWSER_SHORTCUTS.has(sig))return 'browser-lock';
    return 'real';
  }

  function matches(event,task){
    return event.code===task.code&&
      (!!event.ctrlKey===!!task.ctrl)&&
      (!!event.shiftKey===!!task.shift)&&
      (!!event.altKey===!!task.alt)&&
      (!!event.metaKey===!!task.meta);
  }

  function shouldPrevent(event,active){
    if(!active)return false;
    return event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||PREVENTABLE_KEYS.has(event.code);
  }

  function isModifier(code){return MODIFIERS.has(code)}

  async function capture(element){
    const result={fullscreen:false,keyboardLock:false};
    try{
      if(element&&element.requestFullscreen&&!document.fullscreenElement){
        await element.requestFullscreen({navigationUI:'hide'});
      }
      result.fullscreen=!!document.fullscreenElement;
    }catch(error){result.fullscreen=false}
    try{
      if(navigator.keyboard&&navigator.keyboard.lock){
        await navigator.keyboard.lock();
        result.keyboardLock=true;
      }
    }catch(error){result.keyboardLock=false}
    return result;
  }

  async function release(exitFullscreen){
    try{if(navigator.keyboard&&navigator.keyboard.unlock)navigator.keyboard.unlock()}catch(error){}
    if(exitFullscreen){
      try{if(document.fullscreenElement)await document.exitFullscreen()}catch(error){}
    }
  }

  return {signature,mode,matches,shouldPrevent,isModifier,capture,release};
});
