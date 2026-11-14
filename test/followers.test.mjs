import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFollowerOptions,followerStyles} from '../src/follower-config.js';
import {imagePresets} from '../src/image-presets.js';
import {resolveMode,hoverMotions,transitions,hoverEdges} from '../src/config.js';
import {mouseFollower} from '../src/index.js';
test('ten follower styles have independent palettes and valid settings',()=>{
  assert.equal(Object.keys(followerStyles).length,10);
  assert.equal(new Set(Object.values(followerStyles).map(x=>x.color)).size,10);
  for(const style of Object.keys(followerStyles))assert.equal(normalizeFollowerOptions({style}).style,style);
});
test('switching style picks its palette while partial updates preserve customization',()=>{
  const custom=normalizeFollowerOptions({style:'aura',color:'#abc',size:44});
  assert.equal(custom.color,'#aabbcc');
  assert.equal(normalizeFollowerOptions({speed:18},custom).color,'#aabbcc');
  assert.equal(normalizeFollowerOptions({style:'comet'},custom).color,followerStyles.comet.color);
  assert.equal(normalizeFollowerOptions({style:'comet'},custom).size,44);
});
test('invalid colors, modes and numeric values fail before creating a canvas',()=>{
  for(const options of [{style:'unknown'},{color:'bad'},{size:NaN},{trail:Infinity},{text:1},{hideCursor:'yes'}])assert.throws(()=>normalizeFollowerOptions(options));
  assert.equal(normalizeFollowerOptions({size:1000,trail:1000}).size,100);
  assert.equal(normalizeFollowerOptions({trail:1000}).trail,40);
});
test('card presets all validate and each carries a distinct design',()=>{
  const values=Object.values(imagePresets);assert.equal(values.length,10);
  assert.equal(new Set(values.map(x=>JSON.stringify(x))).size,10);
  for(const preset of values){resolveMode(preset.hoverMotion,hoverMotions,'hoverMotion');resolveMode(preset.hoverEdge,hoverEdges,'hoverEdge');resolveMode(preset.transition,transitions,'transition');}
  const collection=values.slice(0,7);
  assert.equal(new Set(collection.map(x=>x.hoverMotion)).size,7);
  assert.equal(new Set(collection.map(x=>x.hoverEdge)).size,7);
  assert.equal(new Set(collection.map(x=>x.transition)).size,7);
});
test('mouse follower initialization is guarded on the server',()=>{assert.throws(()=>mouseFollower(),/browser after mount/);});
