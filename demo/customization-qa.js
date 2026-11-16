(async()=>{
 const output=document.getElementById('results'),iframe=document.querySelector('iframe'),lines=[];
 function check(name,condition){lines.push((condition?'PASS ':'FAIL ')+name);output.textContent=lines.join('\n');if(!condition)throw Error(name);}
 try{
  await new Promise(resolve=>iframe.addEventListener('load',resolve,{once:true}));
  const w=iframe.contentWindow,d=w.document,start=performance.now();
  while(d.querySelectorAll('.card-customizer').length<25){if(performance.now()-start>30000)throw Error('Editors did not initialize');await new Promise(requestAnimationFrame);}
  const panels=[...d.querySelectorAll('.card-customizer')],initial=panels.map(p=>p.querySelector('code').textContent);
  check('all 25 animation cards expose independent editors',panels.length===25);
  check('original cream theme is preserved',w.getComputedStyle(d.body).backgroundColor==='rgb(243, 242, 235)');
  const ready=async()=>{const start=performance.now();while(d.querySelector('.customizer-dialog')?.dataset.previewState!=='ready'){if(d.querySelector('.customizer-dialog')?.dataset.previewState==='error')throw Error('Preview renderer failed');if(performance.now()-start>30000)throw Error('Preview timeout');await new Promise(requestAnimationFrame);}};
  const execute=html=>{
   const parsed=new DOMParser().parseFromString(html,'text/html');let captured;
   const stub={imageEffect:(selector,options)=>{captured={type:'image',options};return {ready:Promise.resolve()};},mouseFollower:options=>{captured={type:'follower',options};return {destroy(){}};}};
   const script=[...parsed.querySelectorAll('script')].at(-1).textContent;
   new Function('FlowFX','window',script)(stub,{});return captured;
  };
  let copied='';const clipboard=w.navigator.clipboard,originalWrite=clipboard.writeText;
  clipboard.writeText=async text=>{copied=text;};
  for(const [i,panel] of panels.entries()){
   const before=execute(initial[i]),image=before.type==='image',toggle=d.querySelector(`[aria-controls="${panel.id}"]`);
   check('card '+(i+1)+' controls start collapsed',panel.hidden&&toggle.getAttribute('aria-expanded')==='false');toggle.click();
   check('card '+(i+1)+' Customize opens controls',!panel.hidden&&toggle.getAttribute('aria-expanded')==='true');
   check('card '+(i+1)+' opens in a native popup',d.querySelectorAll('dialog[open]').length===1&&d.querySelector('dialog').contains(panel));
   await ready();const preview=d.querySelector('.modal-preview-frame').contentDocument;
   check('card '+(i+1)+' renders a live popup preview',preview.querySelector('#preview-stage').dataset.ready==='true'&&preview.querySelector('#preview-stage').dataset.kind===(image?'image':'follower')&&!!preview.querySelector('canvas'));
   const change=(key,value)=>{const el=panel.querySelector(`[data-setting="${key}"]`);el.value=String(value);el.dispatchEvent(new w.Event('input',{bubbles:true}));};
   change('speed',image?1.5:18);change('intensity',1.25);change('color','#ff6677');
   await ready();check('card '+(i+1)+' updates the live preview',d.querySelector('dialog').dataset.previewState==='ready');
   const code=panel.querySelector('code').textContent,after=execute(code).options;
   check('card '+(i+1)+' speed/intensity/color update generated runnable code',image?after.config.speed===1.5&&after.config.intensity===1.25&&code.includes('background:#ff6677')&&!Object.hasOwn(after,'frameColor'):after.speed===18&&after.color==='#ff6677'&&after.size===before.options.size*1.25);
   const other=panels[(i+1)%panels.length];check('card '+(i+1)+' settings stay isolated',other.querySelector('code').textContent===initial[(i+1)%panels.length]);
   copied='';panel.querySelector('[data-copy-custom]').click();await Promise.resolve();check('card '+(i+1)+' copies current preview exactly',copied===code);
   panel.querySelector('[data-reset-custom]').click();check('card '+(i+1)+' reset restores original snippet',panel.querySelector('code').textContent===initial[i]);
   if(image){
    const input=panel.querySelector('input[type=file]'),transfer=new w.DataTransfer();
    const canvas=d.createElement('canvas');canvas.width=32;canvas.height=32;canvas.getContext('2d').fillRect(0,0,32,32);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    transfer.items.add(new w.File([blob],'my image.png',{type:'image/png'}));transfer.items.add(new w.File([blob],'second.png',{type:'image/png'}));
    input.files=transfer.files;input.dispatchEvent(new w.Event('change',{bubbles:true}));
    const started=performance.now();while(!panel.querySelector('.upload-status').textContent.startsWith('2 images loaded')){if(performance.now()-started>10000)throw Error('Upload timeout');await new Promise(requestAnimationFrame);}await ready();
    const uploaded=panel.querySelector('code').textContent;
    check('card '+(i+1)+' uploads two local images into live preview',preview.querySelectorAll('#preview-stage img').length===2&&preview.querySelector('#preview-stage img').src.startsWith('data:image/png'));
    check('card '+(i+1)+' exports portable image paths without local data',uploaded.includes('assets/01-my_image.png')&&uploaded.includes('assets/02-second.png')&&!uploaded.includes('data:image')&&!uploaded.includes('blob:'));
    panel.querySelector('[data-copy-custom]').click();await Promise.resolve();check('card '+(i+1)+' copies uploaded image settings',copied===uploaded);
    panel.querySelector('[data-restore-images]').click();await ready();check('card '+(i+1)+' restores demo images and code',panel.querySelector('code').textContent===initial[i]);
   }else check('card '+(i+1)+' follower has no image upload',!panel.querySelector('input[type=file]'));
   d.querySelector('[data-close-customizer]').click();check('card '+(i+1)+' closes controls',panel.hidden&&toggle.getAttribute('aria-expanded')==='false');
  }
  clipboard.writeText=originalWrite;
  lines.push('\nALL '+lines.filter(x=>x.startsWith('PASS')).length+' POPUP CHECKS PASSED');output.textContent=lines.join('\n');iframe.hidden=true;
 }catch(e){lines.push('ERROR '+e.message);output.textContent=lines.join('\n');}
})();
