let statusTimer;
for(const button of document.querySelectorAll('[data-copy-code]'))button.addEventListener('click',async()=>{
 const text=button.closest('.doc-code').querySelector('code').textContent;
 try{
  await navigator.clipboard.writeText(text);button.textContent='Copied ✓';
  document.getElementById('copy-status').textContent='Code copied to clipboard.';
 }catch{
  const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();
  const success=document.execCommand('copy');area.remove();
  button.textContent=success?'Copied ✓':'Select code below';document.getElementById('copy-status').textContent=success?'Code copied to clipboard.':'Clipboard unavailable. Select and copy the code below.';
 }
 clearTimeout(statusTimer);statusTimer=setTimeout(()=>{button.textContent='Copy code';document.getElementById('copy-status').textContent='';},2500);
});
