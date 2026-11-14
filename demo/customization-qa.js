(async()=>{
 const output=document.getElementById('results'),iframe=document.querySelector('iframe'),lines=[];
 function check(name,condition){lines.push((condition?'PASS ':'FAIL ')+name);output.textContent=lines.join('\n');if(!condition)throw Error(name);}
 try{
  await new Promise(resolve=>iframe.addEventListener('load',resolve,{once:true}));
  const w=iframe.contentWindow,d=w.document,start=performance.now();
  while(d.querySelectorAll('.card-customizer').length<25){if(performance.now()-start>30000)throw Error('Editors did not initialize');await new Promise(requestAnimationFrame);}
  const panels=[...d.querySelectorAll('.card-customizer')],initial=panels.map(p=>p.querySelector('code').textContent);
  check('all 25 animation cards expose independent editors',panels.length===25);
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
   const change=(key,value)=>{const el=panel.querySelector(`[data-setting="${key}"]`);el.value=String(value);el.dispatchEvent(new w.Event('input',{bubbles:true}));};
   change('speed',image?1.5:18);change('intensity',1.25);change('color','#ff6677');
   const code=panel.querySelector('code').textContent,after=execute(code).options;
   check('card '+(i+1)+' speed/intensity/color update generated runnable code',image?after.config.speed===1.5&&after.config.intensity===1.25&&code.includes('background:#ff6677')&&!Object.hasOwn(after,'frameColor'):after.speed===18&&after.color==='#ff6677'&&after.size===before.options.size*1.25);
   const other=panels[(i+1)%panels.length];check('card '+(i+1)+' settings stay isolated',other.querySelector('code').textContent===initial[(i+1)%panels.length]);
   copied='';panel.querySelector('[data-copy-custom]').click();await Promise.resolve();check('card '+(i+1)+' copies current preview exactly',copied===code);
   panel.querySelector('[data-reset-custom]').click();check('card '+(i+1)+' reset restores original snippet',panel.querySelector('code').textContent===initial[i]);
   toggle.click();check('card '+(i+1)+' closes controls',panel.hidden&&toggle.getAttribute('aria-expanded')==='false');
  }
  clipboard.writeText=originalWrite;
  lines.push('\nALL 176 CUSTOMIZATION CHECKS PASSED');output.textContent=lines.join('\n');iframe.hidden=true;
 }catch(e){lines.push('ERROR '+e.message);output.textContent=lines.join('\n');}
})();
