import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeConfig,resolveStyle,normalizeProgress,resolveMode,scrollEffects,hoverEdges} from '../src/config.js';
import {imageEffect} from '../src/index.js';
test('every distinct shader has a stable name and numeric ID',()=>{
  ['liquid','distortion','wobble','wind','ripple','perlin','cyber'].forEach((style,i)=>assert.equal(resolveStyle(style),i+1));
  assert.throws(()=>resolveStyle('unknown'),RangeError);assert.throws(()=>resolveStyle(8),RangeError);
});
test('config clamps GPU input ranges and rejects invalid values',()=>{
  assert.equal(normalizeConfig({intensity:100}).intensity,2);
  assert.equal(normalizeConfig({frequency:-1}).frequency,1);
  assert.throws(()=>normalizeConfig({speed:NaN}),TypeError);
  assert.throws(()=>normalizeConfig({intensity:'1'}),TypeError);
  assert.throws(()=>normalizeConfig(null),TypeError);
});
test('partial configuration updates preserve tuned settings',()=>{
  const initial=normalizeConfig({speed:2,frequency:9});
  const updated=normalizeConfig({intensity:1.5},initial);
  assert.equal(updated.speed,2);assert.equal(updated.frequency,9);assert.equal(updated.intensity,1.5);assert.notEqual(initial,updated);
});
test('scroll progress is finite and bounded',()=>{
  assert.equal(normalizeProgress(-1),0);assert.equal(normalizeProgress(2),1);assert.equal(normalizeProgress(.4),.4);assert.throws(()=>normalizeProgress(Infinity),TypeError);
});
test('module import is safe on the server; DOM initialization gives an actionable error',()=>{
  assert.throws(()=>imageEffect('.image'),/browser after mounting/);
});

test('scroll and edge modes are explicit and validate public options',()=>{
  for(const [name,id] of Object.entries(scrollEffects))assert.equal(resolveMode(name,scrollEffects,'scrollEffect'),id);
  for(const [name,id] of Object.entries(hoverEdges))assert.equal(resolveMode(name,hoverEdges,'hoverEdge'),id);
  assert.equal(resolveMode(false,hoverEdges,'hoverEdge'),0);
  assert.throws(()=>resolveMode('unknown',hoverEdges,'hoverEdge'),RangeError);
  assert.throws(()=>resolveMode(3,scrollEffects,'scrollEffect'),RangeError);
});
test('edge strength has safe bounds and merges with older presets',()=>{
  assert.equal(normalizeConfig({edgeStrength:8}).edgeStrength,2);
  assert.equal(normalizeConfig({intensity:.7}).edgeStrength,1);
  assert.throws(()=>normalizeConfig({edgeStrength:NaN}),TypeError);
});
