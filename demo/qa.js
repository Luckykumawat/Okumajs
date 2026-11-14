(async()=>{
 const lines=[],output=document.getElementById('results');
 function check(name,condition){lines.push((condition?'PASS':'FAIL')+' '+name);output.textContent=lines.join('\n');if(!condition)throw Error(name);}
 try{
 const a=FlowFX.imageEffect('#a',{style:3,debug:true,preset:'presets/wigglewobble.json'});await a.ready;
 check('preset loaded with vertex effect',a.instances[0].loaded&&a.exportPreset().style===3&&a.exportPreset().config.intensity===1.2);
 const b=FlowFX.imageEffect('#b',{style:'perlin'});await b.ready;
 check('all instances share one WebGL canvas',document.querySelectorAll('canvas[data-flowfx]').length===1);
 check('source hidden only after successful initialization',document.querySelector('#a img').style.opacity==='0');
 check('debug panel exists',!!document.querySelector('[data-flowfx="debug"]'));
 let duplicate=false;try{FlowFX.imageEffect('#a');}catch{duplicate=true;}check('duplicate initialization rejected',duplicate);
 a.setOptions({style:'cyber',gooey:true,config:{intensity:1.4}}).setProgress(.5);
 check('configuration, gooey and progress API',a.exportPreset().style===7&&a.exportPreset().gooey&&a.instances[0].targetProgress===.5);
 a.setProgress(0).next();check('next image API',a.instances[0].targetProgress===1);
 a.previous();check('previous image API',a.instances[0].targetProgress===0);
 a.pause();check('pause API',a.instances[0].paused);a.play();check('play API',!a.instances[0].paused);
 a.setOptions({hoverEdge:'blob',scrollEffect:'ribbon',config:{edgeStrength:1.4}});
 a.instances[0].target.dispatchEvent(new PointerEvent('pointerenter'));
 a.instances[0].update(.05,a.instances[0].target.getBoundingClientRect());
 check('pointer entry activates silhouette morph',a.instances[0].uniforms.uEdgeMode.value===2&&a.instances[0].uniforms.uActivity.value>0);
 check('edge and scroll modes survive preset export',a.exportPreset().hoverEdge==='blob'&&a.exportPreset().scrollEffect==='ribbon'&&a.exportPreset().config.edgeStrength===1.4);
 for(const [mode,id] of [['depth',1],['ribbon',2],['shutter',3],['lens',4]]){
   b.setOptions({scrollEffect:mode,scroll:true});
   b.instances[0].update(.05,{width:240,height:180,top:100});
   check(mode+' scroll mode works on a single image',b.instances[0].uniforms.uScrollMode.value===id&&Number.isFinite(b.instances[0].targetProgress));
 }
 a.setOptions({scroll:false,click:true}).setProgress(0);
 a.instances[0].target.dispatchEvent(new MouseEvent('click'));
 check('actual image click advances gallery',a.instances[0].targetProgress===1);
 a.setOptions({click:false});a.instances[0].target.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
 check('click false also disables keyboard image advance',a.instances[0].targetProgress===1);
 let invalidMode=false;try{a.setOptions({hoverEdge:'invalid'});}catch{invalidMode=true;}
 check('invalid silhouette mode rejected',invalidMode);
 a.destroy();check('destroy restores source and removes panel',document.querySelector('#a img').style.opacity===''&&!document.querySelector('[data-flowfx="debug"]'));
 check('destroying one instance preserves shared renderer',document.querySelectorAll('canvas[data-flowfx]').length===1);
 const c=FlowFX.imageEffect('#c');c.destroy();await c.ready;
 check('destroy before load does not hide source',document.querySelector('#c').style.opacity==='');
 b.destroy();check('last destroy removes canvas',!document.querySelector('canvas[data-flowfx]'));
 const again=FlowFX.imageEffect('#a',{style:4});await again.ready;check('reinitialize after destruction',again.instances[0].loaded);
 FlowFX.destroyAll();check('destroyAll restores images',!document.querySelector('canvas[data-flowfx]')&&document.querySelector('#a img').style.opacity==='');
 const bad=FlowFX.imageEffect('#a',{preset:'data:application/json,%7B%22config%22%3A%7B%22speed%22%3A%22bad%22%7D%7D'});
 let rejected=false;try{await bad.ready;}catch{rejected=true;}check('invalid preset rejects without hiding source',rejected&&document.querySelector('#a img').style.opacity==='');
 const probe=document.createElement('div');Object.assign(probe.style,{position:'fixed',left:'20px',top:'120px',width:'240px',height:'180px'});document.body.append(probe);
 const frame=()=>new Promise(requestAnimationFrame);
 for(const style of Object.keys(FlowFX.followerStyles)){
   const follower=FlowFX.mouseFollower({target:probe,style});
   probe.dispatchEvent(new PointerEvent('pointermove',{clientX:140,clientY:210,pointerType:'mouse'}));
   await frame();
   const canvas=document.querySelector('canvas[data-flowfx="followers"]');
   const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
   let drawn=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]){drawn=true;break;}
   check(style+' follower renders actual pixels',drawn!==matchMedia('(prefers-reduced-motion: reduce)').matches);
   follower.destroy();
 }
 const f1=FlowFX.mouseFollower({target:probe,style:'aura'}),f2=FlowFX.mouseFollower({target:'#c',style:'pixel'});
 check('followers share one 2D overlay',document.querySelectorAll('canvas[data-flowfx="followers"]').length===1);
 let duplicateFollower=false;try{FlowFX.mouseFollower({target:probe});}catch{duplicateFollower=true;}
 check('duplicate follower target rejected',duplicateFollower);
 f1.setOptions({style:'orbit',color:'#abc',size:45});
 check('follower style and color can be updated',f1.exportPreset().style==='orbit'&&f1.exportPreset().color==='#aabbcc'&&f1.exportPreset().size===45);
 f1.setEnabled(false);check('follower can be disabled',!f1.enabled);f1.setEnabled(true);
 probe.dispatchEvent(new PointerEvent('pointermove',{clientX:140,clientY:210,pointerType:'touch'}));
 check('touch does not activate mouse follower',!f1.active);
 const cursorBefore=probe.style.cursor;f1.setOptions({hideCursor:true});f1.destroy();
 check('destroy restores native cursor styling',probe.style.cursor===cursorBefore);
 f2.destroy();check('last follower removes 2D overlay',!document.querySelector('canvas[data-flowfx="followers"]'));
 const f3=FlowFX.mouseFollower({target:probe,style:'text'});FlowFX.destroyAll();
 check('destroyAll also removes followers',f3.destroyed&&!document.querySelector('canvas[data-flowfx="followers"]'));probe.remove();
 for(const [key,preset] of Object.entries(FlowFX.imagePresets)){
   const fx=FlowFX.imageEffect('#a',preset);await fx.ready;
   const instance=fx.instances[0];instance.activity=1;instance.update(.05,instance.target.getBoundingClientRect());
   check(key+' applies its independent motion and transition',fx.exportPreset().hoverMotion===preset.hoverMotion&&fx.exportPreset().transition===preset.transition&&instance.uniforms.uHoverMotion.value>0);
   fx.destroy();
 }
 lines.push('\nALL BROWSER CHECKS PASSED');output.textContent=lines.join('\n');
 }catch(error){lines.push('ERROR '+error.message);output.textContent=lines.join('\n');}
})();
