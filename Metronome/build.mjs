import { writeFileSync } from 'node:fs';
import * as k from '/Users/piyushagarwal/.agents/skills/anatomy/kit/iso-kit.mjs';
import * as G from '/Users/piyushagarwal/.agents/skills/anatomy/kit/lathe.mjs';
import * as A from '/Users/piyushagarwal/.agents/skills/anatomy/kit/audit.mjs';

// Geometry is built here; the deliverable has no external dependencies.
const W = 680, H = 490, pivotZ = 110, frontY = 30;
const P = k.fitProjection([...k.boxCorners({x:-85,y:-58,w:170,d:116,r:5},0,24),[-65,0,267],[65,0,267]], W,H,{pad:38,azimuth:66,elevation:23});
const at = p => k.iso(p,P);
const S = (p,o={}) => k.solidSvg(p,o);
const L = (points,tone='lo') => k.lineSvg(k.pathOf(points.map(at)),{tone});
const F = {o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};
const R = A.recorder(P);
const items = R.items;
const meta = (name,owner='case') => ({name,owner});
let count=0;
function put(name,svg,shape,part='static',wood=false) {
  count++;
  const item = R.put({name,svg:`<g${wood?' class="wood"':''}>${svg}</g>`,shapes:[R.solid(shape)],at:[0,0,0],part});
  return item;
}
function slab(name,plan,z,h,tone='mid',wood=false,owner='case') {
  return put(name,S(k.slabOf(plan,z,h,P,5,.65),{tone}),A.slab(plan,z,h,meta(name,owner),5),'static',wood);
}
function prism(name,poly,y0,y1,tone='mid',part='static',wood=false,owner='case') {
  return put(name,S(G.prismOf(F,poly,y0,y1,P),{tone,lit:part==='weight'}),A.prism(F,poly,y0,y1,meta(name,owner)),part,wood);
}
function round(name,x,z,y0,y1,r,tone='mid',part='static',owner='case') {
  const f={...F,o:[x,0,z]};
  return put(name,S(G.disc(y0,y1,r,f,P,{steps:40}),{tone}),A.disc(f,y0,y1,r,meta(name,owner)),part);
}
function screw(name,x,y,z,r=1.5,part='static',owner='case') {
  const item=round(name,x,z,y,y+.65,r,'mid',part,owner);
  item.svg+=L([[x-r,y+.66,z],[x+r,y+.66,z]],'hi');
}
function rect(x,z,w,h){return [[x,z],[x+w,z],[x+w,z+h],[x,z+h]];}
const bpmAt = r => 60/Math.PI*Math.sqrt(9.81*(.060*.030-.014*r)/(.000060+.014*r*r));
function radiusAt(bpm){let lo=0,hi=.1285;for(let i=0;i<60;i++){const r=(lo+hi)/2;if(bpmAt(r)>bpm)lo=r;else hi=r;}return (lo+hi)/2*1000;}
const r0=radiusAt(120), rMin=radiusAt(208),rMax=radiusAt(40);

// Plinth, feet and two beads of the wood molding.
const plinth={x:-85,y:-58,w:170,d:116,r:5};
const halo=`<path class="iso-halo" d="${k.haloOf(plinth,0,13,P)}"/>`;
for(const [i,[x,y]] of k.corners(plinth,17).entries()){
  const plan={x:x-6,y:y-6,w:12,d:12,r:3};
  slab('stand.foot.'+i,plan,0,5,'lo',false,'plinth');
  slab('foot.washer.'+i,{...plan,x:x-7,y:y-7,w:14,d:14},5,1,'mid',false,'plinth');
}
slab('plinth.bottom',plinth,6,2,'lo',true,'plinth');
slab('plinth.wood',k.insetPlan(plinth,1),8,12,'mid',true,'plinth');
slab('plinth.bevel',k.insetPlan(plinth,1.5),20,2,'hi',true,'plinth');
// Grain follows the full top face between the two real edges.
let grain='';
for(const y of [-48,-40,-29,36,43,51]) grain+=L([[-83.5,y,22],[83.5,y,22]],'faint');
items.at(-1).svg+=grain;
for(const [i,[x,y]] of [[-66,-38],[66,-38],[-66,38],[66,38]].entries()){
  const plan={x:x-4,y:y-4,w:8,d:8,r:1};
  slab('mount.shoe.'+i,plan,22,3,'lo');
}
slab('case.base',{x:-65,y:-41,w:130,d:82,r:3},25,6,'mid',true);
slab('case.bead',{x:-62,y:-38,w:124,d:76,r:2},31,3,'hi',true);
// The case is an open-front tapered shell, assembled from actual cheeks.
prism('case.back',[[-58,34],[58,34],[24,255],[-24,255]],-27,-22,'lo','static',true);
prism('case.left',[[-58,34],[-50,34],[-18,255],[-24,255]],-22,22,'mid','static',true);
prism('case.right',[[50,34],[58,34],[24,255],[18,255]],-22,22,'mid','static',true);
prism('case.left.bead',[[-50,34],[-47,34],[-16,252],[-18,255]],18,24,'hi','static',true);
prism('case.right.bead',[[47,34],[50,34],[18,255],[16,252]],18,24,'hi','static',true);
prism('case.cap',[[-24,255],[24,255],[24,260],[-24,260]],-27,22,'hi','static',true);
prism('scale.board',[[-34,115],[34,115],[15,252],[-15,252]],10,13,'hi');
prism('scale.mount',rect(-12,238,24,6),-22,10,'mid');
// Scale rails: ticks stay physically rooted in a vertical strip.
prism('scale.rail.left',rect(-8,154,2.5,83),13,13.5,'lo');
prism('scale.rail.right',rect(5.5,154,2.5,83),13,13.5,'lo');
for(const [i,[x,z]] of [[-10,246],[10,246],[-29,120],[29,120]].entries())screw('scale.screw.'+i,x,13,z,1.1);
let scale='';
for(const b of [40,44,48,52,56,60,66,72,80,88,96,104,112,120,132,144,160,176,192,208]){
  const z=pivotZ+radiusAt(b),major=[40,60,80,120,160,208].includes(b);
  scale+=L([[-8,13.6,z],[-8-(major?7:4),13.6,z]],major?'mid':'lo');
  scale+=L([[8,13.6,z],[8+(major?7:4),13.6,z]],major?'mid':'lo');
}
items.find(i=>i.name==='scale.board').svg+=scale;
// Small brass movement below the scale, attached to the case base.
prism('movement.plate',rect(-31,34,62,64),-4,0,'lo');
round('spring.barrel',-12,62,0,7,19,'mid');
round('spring.cover',-12,62,7,8,16,'hi');
round('spring.arbor',-12,62,8,10,3,'mid');
// Closed concentric grooves represent the mainspring cover, not loose wires.
items.at(-2).svg+=k.lineSvg(G.circleOf({...F,o:[-12,0,62]},8.05,12,P),{tone:'lo'});
for(const [i,x] of [-29,29].entries()){
  prism('bearing.post.'+i,rect(x-3,34,6,77),8,20,'mid');
  round('bearing.boss.'+i,x,107,20,23,4,'hi');
  screw('movement.screw.'+i,x,20,42,1.5);
}
prism('pivot.bridge',rect(-33,102,66,10),20,24,'mid');
round('pivot.shaft',0,pivotZ,24,30,4,'mid');
round('pivot.back.collar',0,pivotZ,28,30,7,'hi');
prism('pallet.left',rect(-15,99,10,3),23,26,'mid');
prism('pallet.right',rect(5,99,10,3),23,26,'mid');
// Lower case front: a framed opening leaves the movement visible.
prism('case.front.lower',rect(-47,34,94,12),24,26,'mid','static',true);
for(const x of [-39,34])prism('case.front.clip.'+x,rect(x,46,5,6),24,26,'mid');
// Wind-up key, on the visible right side, made in its own x-axis frame.
prism('key.seat',[[54,60],[58,60],[58,70],[52,70]],-5,5,'mid');
const keyF={o:[58,0,65],a:[1,0,0],u:[0,1,0],v:[0,0,1]};
for(const [name,s0,s1,r] of [['boss',0,3,5],['shaft',3,13,2],['shoulder',13,15,4]]){
  put('key.'+name,S(G.disc(s0,s1,r,keyF,P,{steps:32}),{tone:'mid'}),A.disc(keyF,s0,s1,r,meta('key.'+name)));
}
put('key.bow',S(G.prismOf(keyF,[[-10,-5],[10,-5],[10,5],[-10,5]],15,17,P),{tone:'hi'}),A.prism(keyF,[[-10,-5],[10,-5],[10,5],[-10,5]],15,17,meta('key.bow')));
// Pendulum: the lower mass counterbalances the sliding upper mass.
prism('pendulum.rod',rect(-1.3,73,2.6,178),30,32,'hi','pendulum',false,'pendulum');
prism('pendulum.tip',rect(-2.2,248,4.4,4),30,32,'mid','pendulum',false,'pendulum');
prism('pendulum.bob',[[-14,73],[14,73],[14,87],[-14,87]],28,30,'mid','pendulum',false,'pendulum');
prism('pendulum.bob.face',rect(-12,75,24,10),32,33,'hi','pendulum',false,'pendulum');
for(const x of [-9,9])screw('bob.screw.'+x,x,33,80,1,'pendulum','pendulum');
// The sliding weight is built at the initial position and translated along its rod.
prism('weight.sleeve',rect(-4,pivotZ+r0-9,8,18),28,30,'mid','weight',false,'pendulum');
prism('weight.body',[[-10,pivotZ+r0-8],[10,pivotZ+r0-8],[8,pivotZ+r0+8],[-8,pivotZ+r0+8]],32,39,'hi','weight',false,'pendulum');
prism('weight.bevel',rect(-7,pivotZ+r0-5,14,10),39,40,'hi','weight',false,'pendulum');
round('weight.lock.collar',0,pivotZ+r0,40,41,3,'hi','weight','pendulum');
round('weight.lock',0,pivotZ+r0,41,42.5,2.2,'hi','weight','pendulum');
items.at(-1).svg+=L([[-2.2,42.6,pivotZ+r0],[2.2,42.6,pivotZ+r0]],'hi');
// Pivot cap is always in front of the moving rod.
round('pivot.washer',0,pivotZ,32,33,6,'hi','cap');
screw('pivot.screw',0,33,pivotZ,3,'cap');

// Settle the real recorded solids, without manually nudging painter keys.
A.settle(R,P,{step:.5});
if(process.argv.includes('--audit'))A.auditOrExit(R,P);
const sorted=[...items].sort((a,b)=>a.key-b.key);
const staticSvg=sorted.filter(i=>i.part==='static').map(i=>i.svg).join('');
const pendulumSvg=sorted.filter(i=>i.part==='pendulum').map(i=>i.svg).join('');
const weightSvg=sorted.filter(i=>i.part==='weight').map(i=>i.svg).join('');
const capSvg=sorted.filter(i=>i.part==='cap').map(i=>i.svg).join('');
const svg=k.figureSvg({width:W,height:H,label:'An open-front mechanical metronome on a small wooden plinth. Drag the dark sliding weight up to slow the beat, or down to speed it up.',body:halo+staticSvg+`<g id="swing">${pendulumSvg}<g id="weight" role="slider" tabindex="0" aria-label="Tempo. Drag weight up to slow down. Arrow keys change tempo." aria-valuemin="40" aria-valuemax="208" aria-valuenow="120" aria-valuetext="120 beats per minute"><title>Drag up: slower · Drag down: faster</title>${weightSvg}<circle id="weight-hit" cx="${at([0,36,pivotZ+r0])[0]}" cy="${at([0,36,pivotZ+r0])[1]}" r="22" fill="transparent" stroke="none"/></g></g>${capSvg}`});
const controls=`<div class="controls"><button id="play" aria-pressed="true">Pause</button><button id="reset">120 BPM</button><button id="sound" aria-pressed="false">Sound off</button><span class="interval"><span id="interval">500</span> ms / beat</span></div>`;
let body=k.plateHtml({fig:'FIG. 01',title:'Mechanical metronome',hint:'Drag the weight ↕',readout:'120 BPM',body:`<div class="iso-stage">${svg}</div>`,keys:[{mark:'lit',label:'Sliding weight sets the tempo'},{mark:'raised',label:'One beat at each end of the swing'}],caption:'Raise the weight for a slower beat; lower it for a faster one. At 120 BPM, each beat is 0.5 seconds apart. An ideal double-pendulum model drives the weight, swing and readout.'});
body+=controls+`<p class="keyboard">Weight: ↑ slower · ↓ faster · Shift for 10 BPM &nbsp; / &nbsp; Space to pause</p>`;
const runtime=`
const P=${JSON.stringify(P)},r0=${r0},rMin=${rMin},rMax=${rMax},pivotZ=${pivotZ};
const bpmAt=${bpmAt.toString()},radiusAt=${radiusAt.toString()};
const svg=document.querySelector('.iso-svg'),swing=document.querySelector('#swing'),weight=document.querySelector('#weight');
const readout=document.querySelector('[data-readout]'),interval=document.querySelector('#interval'),play=document.querySelector('#play'),soundButton=document.querySelector('#sound');
const still=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rad=Math.PI/180, az=P.azimuth*rad, el=P.elevation*rad, K=P.scale*Math.sqrt(1.6);
const ex=[Math.sin(az)*K,Math.cos(az)*Math.sin(el)*K],ez=[0,-Math.cos(el)*K];
function project(x,y,z){return [P.origin[0]+(x*Math.sin(az)-y*Math.cos(az))*K,P.origin[1]+((x*Math.cos(az)+y*Math.sin(az))*Math.sin(el)-z*Math.cos(el))*K];}
const pivot=project(0,31,pivotZ);
let radius=r0,target=r0,phase=0,angle=0,playing=true,visible=true,frame=0,last=0,drag=null;
let sound=false,ctx=null,beatCount=0;
function transform(theta){
  const c=Math.cos(theta),s=Math.sin(theta),a=c-s*ex[1]/ez[1],b=-s*(ez[1]+ex[1]*ex[1]/ez[1])/ex[0],d=c+ex[1]*s/ez[1],cc=ex[0]*s/ez[1];
  // World rotation x'=x cosθ+z sinθ, z'=−x sinθ+z cosθ, projected into the pendulum plane.
  return 'matrix('+[a,b,cc,d,pivot[0]-a*pivot[0]-cc*pivot[1],pivot[1]-b*pivot[0]-d*pivot[1]].join(' ')+')';
}
function draw(){
  angle=still.matches?0:.29*Math.cos(phase);
  swing.setAttribute('transform',transform(angle));
  weight.setAttribute('transform','translate('+(ez[0]*(radius-r0))+' '+(ez[1]*(radius-r0))+')');
  const bpm=bpmAt(radius/1000),value=Math.round(bpm);
  readout.textContent=value+' BPM'; interval.textContent=String(Math.round(60000/bpm));
  document.body.dataset.bpm=bpm.toFixed(3);document.body.dataset.beats=String(beatCount);
}
function clickBeat(time){
  if(!sound||!ctx)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='triangle';osc.frequency.setValueAtTime(1400,time);osc.frequency.exponentialRampToValueAtTime(500,time+.025);
  gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.18,time+.001);gain.gain.exponentialRampToValueAtTime(.0001,time+.035);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(time);osc.stop(time+.04);
}
function tick(now){
  frame=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  radius=still.matches?target:radius+(target-radius)*(1-Math.exp(-dt/.09));
  if(Math.abs(radius-target)<.0001)radius=target;
  if(playing&&!still.matches&&!drag){const before=Math.floor(phase/Math.PI);phase+=dt*bpmAt(radius/1000)/60*Math.PI;const after=Math.floor(phase/Math.PI);if(after>before){beatCount++;clickBeat(ctx?ctx.currentTime:0);}}
  draw();if(visible&&!document.hidden&&((playing&&!still.matches&&!drag)||radius!==target))frame=requestAnimationFrame(tick);
}
function run(){if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
function describe(){const b=Math.round(bpmAt(target/1000));weight.setAttribute('aria-valuenow',b);weight.setAttribute('aria-valuetext',b+' beats per minute');}
function setBpm(b){target=radiusAt(clamp(b,40,208));describe();if(still.matches){radius=target;draw();}run();}
function toggle(){playing=!playing;play.textContent=playing?'Pause':'Resume';play.setAttribute('aria-pressed',playing);run();}
play.addEventListener('click',toggle);
document.querySelector('#reset').addEventListener('click',()=>setBpm(120));
soundButton.addEventListener('click',async()=>{if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){soundButton.textContent='Audio unavailable';return;}ctx=new Audio();}await ctx.resume();sound=!sound;soundButton.textContent=sound?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',sound);});
weight.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;e.preventDefault();weight.focus();
  weight.setPointerCapture(e.pointerId);
  const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const local=p.matrixTransform(svg.getScreenCTM().inverse());
  const v=[ex[0]*Math.sin(angle)+ez[0]*Math.cos(angle),ex[1]*Math.sin(angle)+ez[1]*Math.cos(angle)];
  drag={id:e.pointerId,p:[local.x,local.y],r:target,v};weight.classList.add('dragging');
});
weight.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());
  const v=drag.v,along=((q.x-drag.p[0])*v[0]+(q.y-drag.p[1])*v[1])/(v[0]*v[0]+v[1]*v[1]);
  target=clamp(drag.r+along,rMin,rMax);describe();if(still.matches){radius=target;draw();}run();
});
function release(e){if(!drag||e.pointerId!==drag.id)return;drag=null;weight.classList.remove('dragging');if(weight.hasPointerCapture(e.pointerId))weight.releasePointerCapture(e.pointerId);run();}
weight.addEventListener('pointerup',release);weight.addEventListener('pointercancel',release);weight.addEventListener('lostpointercapture',e=>{if(drag)release(e);});
weight.addEventListener('keydown',e=>{
  const b=Math.round(bpmAt(target/1000)),step=e.shiftKey?10:1;
  if(['ArrowUp','ArrowLeft'].includes(e.key))setBpm(b-step);
  else if(['ArrowDown','ArrowRight'].includes(e.key))setBpm(b+step);
  else if(e.key==='Home')setBpm(40);else if(e.key==='End')setBpm(208);
  else if(e.key===' '||e.key==='Enter')toggle();else return;e.preventDefault();
});
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else run();}).observe(svg);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else run();});
still.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;radius=target;draw();run();});
draw();run();
`;
const css=`
.iso-page{max-width:780px;margin:48px auto}.iso-figure{margin:0}.iso-plate{padding:42px 16px 48px;border-radius:6px;box-shadow:0 0 0 1px #d9d7d0}.iso-stage{max-width:680px;margin:auto}.iso-svg{width:100%;height:auto;display:block;overflow:visible}
body.iso[data-theme="light"]{--anatomy-page:#f5f4ef;--anatomy-card:#fdfcf8;--anatomy-shade-0:#d0cec5;--anatomy-shade-1:#dedcd3;--anatomy-shade-2:#e8e6dd;--anatomy-shade-3:#efeee7;--anatomy-top:#f5f3eb;--anatomy-text:#30332f;--anatomy-muted:#777b71;--anatomy-hi:#74786e;--anatomy-mid:#a2a496;--anatomy-lo:#c3c3b7;--anatomy-faint:#deddd2;--anatomy-lit:#3d443b}
.wood{--anatomy-shade-0:#b0a18a;--anatomy-shade-1:#c1b49d;--anatomy-shade-2:#cec3ad;--anatomy-shade-3:#ded4c1;--anatomy-top:#e6ddcb;--anatomy-hi:#8b7d67;--anatomy-mid:#a69980;--anatomy-lo:#b9ad97;--anatomy-faint:#cabfa9}
#weight{cursor:grab;touch-action:none;outline:none}#weight.dragging{cursor:grabbing}#weight:hover .iso-solid,#weight:focus-visible .iso-solid{filter:drop-shadow(0 0 2px #566b4c66)}#weight:focus-visible #weight-hit{stroke:#526348;stroke-width:1;stroke-dasharray:3 3}
.controls{display:flex;align-items:center;gap:8px;margin-top:24px;padding-top:18px;border-top:1px solid #deddd3}.controls button{font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#485043;background:#fdfcf8;border:1px solid #d1d2c6;border-radius:5px;padding:9px 15px;cursor:pointer;white-space:nowrap}.controls button:hover{background:#eeeee5}.controls button:focus-visible{outline:2px solid #7d896e;outline-offset:3px}.interval{margin-left:auto;font:11px ui-monospace,monospace;color:#777b71;font-variant-numeric:tabular-nums}.keyboard{font-size:11px;color:#85877e;margin-top:10px}.iso-legend{max-width:640px;margin-top:18px;gap:10px;font-size:12px}.iso-caption{max-width:580px}.iso-plate-corner{font-size:10px}.iso-plate-corner[data-corner="readout"]{font-size:13px}.iso-key{font-size:11px}
@media(max-width:560px){.iso-page{width:calc(100% - 28px);margin:22px auto}.iso-plate{padding:48px 0 64px}.iso-plate-corners{inset:18px 15px}.iso-plate-corner[data-corner="title"]{font-size:8px}.iso-plate-corner[data-corner="hint"]{bottom:0;font-size:8px}.iso-stage{width:100%}.controls{gap:6px;flex-wrap:wrap}.controls button{padding:9px 10px;font-size:11px}.interval{font-size:10px}.keyboard{font-size:10px;line-height:1.7}.iso-keys{gap:8px}.iso-key{font-size:10px}}
`;
let html=k.pageHtml({title:'Mechanical metronome · Figure 01',theme:'light',body,script:runtime,width:780});
html=html.replace('</style>',css+'</style>');
writeFileSync(new URL('./metronome.html',import.meta.url),html);
console.log('Wrote metronome.html — '+count+' physical parts; initial 120 BPM, 500 ms/beat.');
