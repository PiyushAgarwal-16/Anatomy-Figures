// Lightweight first-draft interaction checks, without a browser dependency.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('./metronome.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
function setup(reduced=false){
  let next=1;const frames=new Map(),nodes=new Map();
  class Element{
    attrs={};listeners={};textContent='';dataset={};classList={add(){},remove(){}};
    setAttribute(k,v){this.attrs[k]=String(v)}
    addEventListener(k,fn){this.listeners[k]=fn}
    focus(){}setPointerCapture(){}hasPointerCapture(){return false}releasePointerCapture(){}
    getScreenCTM(){return {inverse(){return {}}}}
    createSVGPoint(){return {x:0,y:0,matrixTransform(){return this}}}
  }
  const node=s=>{if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s)};
  const document={hidden:false,body:node('body'),querySelector:node,addEventListener(){}};
  const media={matches:reduced,addEventListener(){}};
  const context=vm.createContext({document,window:{},matchMedia:()=>media,IntersectionObserver:class{observe(){}},requestAnimationFrame:fn=>{const id=next++;frames.set(id,fn);return id},cancelAnimationFrame:id=>frames.delete(id),console});
  new vm.Script(script).runInContext(context);
  const evaluate=s=>vm.runInContext(s,context);
  function advance(seconds,start=0){for(let n=0;n<=Math.round(seconds*120);n++){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(start+n*1000/120));}}
  return {context,node,document,evaluate,advance,frames};
}
const t=setup();
assert.equal(t.document.body.dataset.bpm,'120.000');
assert.equal(t.node('#interval').textContent,'500');
assert.ok(!t.node('#swing').attrs.transform.includes('NaN'));
t.advance(10);
assert.ok(Number(t.document.body.dataset.beats)>=19&&Number(t.document.body.dataset.beats)<=20,'120 BPM gives 20 beats in 10 seconds');
const identity=t.evaluate('transform(0)');
assert.equal(identity,'matrix(1 0 0 1 0 0)');
const before=t.evaluate('phase');t.node('#play').listeners.click();t.advance(1,11000);assert.equal(t.evaluate('phase'),before);
t.node('#play').listeners.click();
t.node('#weight').listeners.keydown({key:'Home',preventDefault(){}});t.advance(1,13000);assert.ok(Math.abs(Number(t.document.body.dataset.bpm)-40)<.01);
t.node('#weight').listeners.keydown({key:'End',preventDefault(){}});t.advance(2,15000);assert.ok(Math.abs(Number(t.document.body.dataset.bpm)-208)<.01);
t.node('#reset').listeners.click();t.advance(2,18000);assert.equal(t.document.body.dataset.bpm,'120.000');
const event={button:0,pointerId:7,clientX:330,clientY:200,preventDefault(){}};
t.node('#weight').listeners.pointerdown(event);
const v=t.evaluate('drag.v'),p=t.evaluate('phase');
t.node('#weight').listeners.pointermove({...event,clientX:330+v[0]*20,clientY:200+v[1]*20});t.advance(1,21000);
assert.ok(Number(t.document.body.dataset.bpm)<120,'dragging the weight upward slows the beat');assert.equal(t.evaluate('phase'),p,'swing holds while dragging');
t.node('#weight').listeners.pointerup(event);assert.equal(t.evaluate('drag'),null);
const reduced=setup(true);assert.equal(reduced.node('#swing').attrs.transform,'matrix(1 0 0 1 0 0)');
reduced.node('#weight').listeners.keydown({key:'ArrowDown',preventDefault(){}});assert.equal(reduced.document.body.dataset.bpm,'121.000');
reduced.advance(1);assert.equal(reduced.document.body.dataset.beats,'0');
assert.ok(!html.match(/<script[^>]+src=|<link[^>]+href=|<img[^>]+src=/),'standalone file has no runtime assets');
console.log('Passed: initial tempo, 10-second timing, rotation, pause/resume, keyboard limits, reset, drag direction, capture release, reduced motion, self-contained HTML.');
