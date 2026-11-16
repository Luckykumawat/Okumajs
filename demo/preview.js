const stage=document.getElementById('preview-stage'),frame=document.getElementById('preview-frame'),instruction=document.getElementById('preview-instruction');
let effect=null,currentKey='',serial=0,lastRequest=null;
function stop(){serial++;effect?.destroy();effect=null;currentKey='';stage.replaceChildren();delete stage.dataset.ready;}
async function configure(request){
 const {id,revision,payload}=request;lastRequest=request;
 const key=payload.kind+':'+(payload.sources??[]).map(image=>image.src).join('|');
 const shouldCreate=!effect||key!==currentKey;
 if(shouldCreate){stop();currentKey=key;}
 const ticket=++serial;
 try{
  if(payload.kind==='image'){
   frame.style.padding=payload.frameEnabled?'6px':'0';frame.style.background=payload.frameColor;stage.className='';stage.style.background=payload.frameColor;
   const {frameColor,frameEnabled,scroll,...options}=payload.options;
   options.scroll=false;options.click=options.click??true;options.gooey=!!options.gooey;
   if(shouldCreate){for(const source of payload.sources){const image=document.createElement('img');image.src=source.src;image.alt=source.alt;stage.append(image);}effect=FlowFX.imageEffect(stage,options);}
   else effect.setOptions(options);
   await effect.ready;if(ticket!==serial)return;
   if(payload.scrubbable)effect.setProgress(payload.progress);
   instruction.textContent=payload.scrubbable?'SCRUB THE SCROLL PROGRESS BELOW':'HOVER TO INTERACT · CLICK TO CHANGE';
  }else{
   frame.style.padding='0';frame.style.background='#e9ece2';stage.className='follower-stage'+(payload.options.style==='ink'?' ink':'');stage.style.background=payload.options.style==='ink'?'#dce6ee':'';
   const options={...payload.options,idleAnimation:true,hideCursor:false};
   if(shouldCreate)effect=FlowFX.mouseFollower({...options,target:stage});else effect.setOptions(options);
   instruction.textContent='MOVE YOUR MOUSE HERE';
  }
  if(ticket!==serial)return;
  stage.dataset.ready='true';stage.dataset.kind=payload.kind;
  parent.postMessage({type:'okuma-preview-rendered',id,revision,kind:payload.kind},location.origin);
 }catch(error){if(ticket===serial)parent.postMessage({type:'okuma-preview-error',id,revision},location.origin);}
}
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin)return;if(event.data?.type==='okuma-preview-update')configure(event.data);if(event.data?.type==='okuma-preview-stop')stop();});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&lastRequest)parent.postMessage({type:'okuma-preview-close',id:lastRequest.id,revision:lastRequest.revision},location.origin);});
parent.postMessage({type:'okuma-preview-ready'},location.origin);
