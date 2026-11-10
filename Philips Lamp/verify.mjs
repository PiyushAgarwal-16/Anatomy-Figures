import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class El {constructor(){this.attrs={};this.style={};this.children=[];this.value='';}setAttribute(k,v){this.attrs[k]=String(v)}appendChild(e){this.children=this.children.filter(x=>x!==e);this.children.push(e)}get outerHTML(){return `<path ${Object.entries(this.attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}/>`}}
const els=new Map;const el=k=>{if(!els.has(k))els.set(k,new El);return els.get(k)};let queue=[];
const context=vm.createContext({console,document:{querySelector:el,createElementNS:()=>new El},matchMedia:()=>({matches:true,addEventListener(){}}),requestAnimationFrame:f=>(queue.push(f),queue.length),IntersectionObserver:class{observe(){}},window:{}});
const html=readFileSync('philips-61013.html','utf8');vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],context);
let clock=0;function flush(){let n=0;while(queue.length&&n++<500){let q=queue;queue=[];q.forEach(f=>f(clock+=16))}assert(n<500)}
function act(code){vm.runInContext(code,context);flush()}
function snapshot(name){
 const parts=el('#parts').children.filter(e=>e.style.display!=='none').map(e=>e.outerHTML).join('');
 const defs=html.match(/<defs>([\s\S]*?)<\/defs>/)[1].replace(/<linearGradient id="beamGradient"[^>]*>/, '<linearGradient id="beamGradient" gradientUnits="userSpaceOnUse" '+Object.entries(el('#beamGradient').attrs).map(([k,v])=>`${k}="${v}"`).join(' ')+'>');
 const air=el('#airLight').children.map(e=>e.outerHTML).join('');
 writeFileSync('shots/'+name+'.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" width="900" height="540"><defs>${defs}</defs><rect width="900" height="540" fill="#191c1e"/><path d="${el('#poolPath').attrs.d}" fill="url(#pool)" mask="url(#airBounds)" opacity="${el('#light').attrs.opacity}"/><g mask="url(#airBounds)" filter="url(#beamSoft)" opacity="${el('#airLight').attrs.opacity}">${air}</g>${parts}<g opacity="${el('#emission').attrs.opacity}"><path d="${el('#glowRim').attrs.d}" fill="none" stroke="#d3efff" stroke-width="10" filter="url(#rimGlow)"/><path d="${el('#brightRim').attrs.d}" fill="none" stroke="#effbff" stroke-width="2.5" stroke-linecap="round"/></g></svg>`);
}
mkdirSync('shots',{recursive:true});snapshot('model-on');
assert(context.window.lamp.parts>=40);act('power()');assert.equal(context.window.lamp.state.light,0);assert.equal(el('#power').attrs['aria-checked'],'false');assert.equal(el('#light').attrs.opacity,'0');assert.equal(el('#airLight').attrs.opacity,'0');assert.equal(el('#emission').attrs.opacity,'0');snapshot('model-off');act('power()');assert.equal(context.window.lamp.state.light,1);
for(const a of [5,25,50,75,100])for(const h of [0,45,90,135,180]){act(`target.arm=${a};steer('head',${h})`);assert(context.window.lamp.state.arm>=a);assert.equal(context.window.lamp.state.head,h);assert(vm.runInContext('state.arm>=minArm(state.head)',context));for(const e of el('#parts').children){assert(!/NaN|Infinity/.test(e.attrs.d));if(e.style.display!=='none'){const nums=e.attrs.d.match(/-?\d+(?:\.\d+)?/g).map(Number);for(let i=0;i<nums.length;i+=2){assert(nums[i]>=0&&nums[i]<=900,'x clipped');assert(nums[i+1]>=0&&nums[i+1]<=540,'y clipped')}}}}
snapshot('model-upright');act("steer('head',0);steer('arm',5)");snapshot('model-folded');act("steer('head',180);steer('arm',5)");snapshot('model-flat');act("steer('arm',100);steer('head',135)");snapshot('model-diffuser');act("document.querySelector('#reset').onclick()");assert.equal(context.window.lamp.state.arm,100);assert.equal(context.window.lamp.state.head,75);
console.log('PASS: '+context.window.lamp.parts+' parts; on/off, light state, reset, 25 angle combinations, finite geometry and viewBox bounds.');
