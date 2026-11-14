import {readFile,writeFile} from 'node:fs/promises';
const markdown=await readFile(new URL('../README.md',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const inline=s=>escape(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]*)\)/g,'<a href="$2">$1</a>');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const lines=markdown.split('\n'),toc=[];let content='',codeCount=0;
for(let i=0;i<lines.length;){
 const line=lines[i];
 if(line.startsWith('```')){
  const language=line.slice(3).trim();let code='';i++;
  while(i<lines.length&&!lines[i].startsWith('```')){code+=lines[i]+'\n';i++;}i++;
  codeCount++;content+=`<div class="doc-code"><div class="doc-code-bar"><span>${escape(language||'code')}</span><button data-copy-code aria-label="Copy code example ${codeCount}">Copy code</button></div><pre><code>${escape(code.trimEnd())}</code></pre></div>`;continue;
 }
 const heading=line.match(/^(#{1,4}) (.+)/);
 if(heading){const depth=heading[1].length,id=slug(heading[2]);if(depth===2)toc.push({id,title:heading[2]});content+=`<h${depth} id="${id}">${inline(heading[2])}</h${depth}>`;i++;continue;}
 if(line.startsWith('|')){
  const rows=[];while(i<lines.length&&lines[i].startsWith('|')){if(!/^\|[\s:|\-]+\|$/.test(lines[i]))rows.push(lines[i].split('|').slice(1,-1).map(x=>x.trim()));i++;}
  content+='<div class="doc-table"><table>'+rows.map((row,n)=>`<tr>${row.map(cell=>`<${n?'td':'th'}>${inline(cell)}</${n?'td':'th'}>`).join('')}</tr>`).join('')+'</table></div>';continue;
 }
 if(/^[-*] /.test(line)){
  content+='<ul>';while(i<lines.length&&/^[-*] /.test(lines[i])){content+=`<li>${inline(lines[i].slice(2))}</li>`;i++;}content+='</ul>';continue;
 }
 if(!line.trim()){i++;continue;}
 let paragraph=line;i++;
 while(i<lines.length&&lines[i].trim()&&!/^(#|```|\||[-*] )/.test(lines[i])){paragraph+=' '+lines[i];i++;}
 content+=`<p>${inline(paragraph)}</p>`;
}
const document=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Okumajs documentation: copy-ready image animations, scroll effects, cursor followers and the FlowFX API."><title>Okumajs — Documentation</title><link rel="stylesheet" href="docs.css?v=cream-customize-1"></head><body><header><a class="brand" href="./">okuma<em>js</em><i></i></a><nav aria-label="Main"><a href="./#hover">Hover & Click</a><a href="./#mouse-followers">Followers</a><a href="./#scroll-animations">Scroll</a><a href="https://github.com/Luckykumawat/Okumajs">GitHub ↗</a></nav><span>DOCUMENTATION / v0.3.0</span></header><div class="docs-intro"><div class="eyebrow">COPY THE CODE. MAKE IT YOURS.</div><h1>A little motion.<br><em>A clear starting point.</em></h1><p>Explore animations in the <a href="./">live playground</a>, copy an example, and add the CDN once.<br>The npm package is <code>okumajs</code>. The browser API is <code>FlowFX</code>.</p></div><div class="docs-layout"><aside><details open><summary>On this page</summary><nav aria-label="Table of contents">${toc.map(x=>`<a href="#${x.id}">${escape(x.title)}</a>`).join('')}</nav></details></aside><main id="content"><section class="quick-start" id="quick-start"><div class="eyebrow">START HERE</div><h2>One script. Your first effect.</h2><p>Paste this into an HTML page served over HTTPS or localhost. Move your mouse to try the cursor. Replace <code>orbit</code> with any follower style below.</p><div class="doc-code"><div class="doc-code-bar"><span>html</span><button data-copy-code aria-label="Copy quick start CDN example">Copy code</button></div><pre><code>${escape('<script src="https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js"></script>\n<script>\n  window.okumaCursor = FlowFX.mouseFollower({ style: "orbit" });\n</script>')}</code></pre></div><p><strong>Combining effects?</strong> Include the CDN script once, then add each animation’s markup and initialization. Replace the example images with your own same-origin or CORS-enabled images. Use one page-wide follower at a time; destroy it before switching.</p><a class="play-link" href="./#mouse-followers">Try all 10 followers ↗</a></section>${content}</main></div><footer><a href="./">← Back to playground</a><span>Okumajs · FlowFX API · MIT license</span><a href="https://www.npmjs.com/package/okumajs">npm package ↗</a></footer><div id="copy-status" role="status" aria-live="polite"></div><script src="docs.js"></script></body></html>`;
await writeFile(new URL('../demo/guide.html',import.meta.url),document);
console.log(`Generated documentation with ${codeCount+1} copyable code examples.`);
