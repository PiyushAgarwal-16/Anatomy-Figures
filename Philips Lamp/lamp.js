const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg';
const P={origin:[370,465],scale:.68,azimuth:62,elevation:25};
const rad=d=>d*Math.PI/180,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const view=[Math.cos(rad(62))*Math.cos(rad(25)),Math.sin(rad(62))*Math.cos(rad(25)),Math.sin(rad(25))];
const state={arm:100,head:75,light:1},target={...state};let on=true,raf=0,last=0,visible=true;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const paths=[], meshes=[];
function path(points){return points.map((p,i)=>(i?'L':'M')+iso(p,P).map(n=>n.toFixed(2)).join(',')).join('')+'Z'}
function element(tag,attrs,parent){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.appendChild(e);return e}
function prism(name,ring,z,h,group='base',color=[190,199,200],emitter=false){
 const low=ring.map(([x,y])=>[x,y,z]),high=ring.map(([x,y])=>[x,y,z+h]);
 const faces=[low.slice().reverse(),high,...ring.map((_,i)=>[low[i],low[(i+1)%ring.length],high[(i+1)%ring.length],high[i]])];
 for(const vertices of faces){const el=element('path',{'stroke-linejoin':'round'},$('#parts'));paths.push({vertices,group,color,emitter,el,name,order:meshes.length});}meshes.push(name);
}
function slab(name,x,y,w,d,z,h,r,group,color,emitter){prism(name,roundedPlan({x,y,w,d,r},5),z,h,group,color,emitter)}
const white=[194,202,203], dark=[54,63,66], seam=[100,110,113];
for(const x of [-52,52])for(const y of [-49,49])slab('Rubber foot',x-8,y-8,16,16,0,4,5,'base',[38,45,47]);
slab('Lower base',-72,-66,144,132,4,8,12,'base',seam);
slab('Base seam',-72,-66,144,132,12,1,12,'base',dark);
slab('Upper base',-72,-66,144,132,13,9,12,'base',white);
for(const x of [-57,57])for(const y of [-51,51]){slab('Screw seat',x-2,y-2,4,4,22,.2,2,'base',seam);slab('Screw head',x-1,y-1,2,2,22.2,.2,1,'base',dark)}
slab('Hinge pedestal',-59,-16,28,32,22,13,4,'base',white);
slab('Arm back',0,-10,302,20,-7,6,8,'arm',seam);
slab('Arm seam',0,-10,302,20,-1,1,8,'arm',dark);
slab('Arm front',0,-10,302,20,0,7,8,'arm',white);
function hinge(group,x){
 // Round discs extruded along y, with their axis exactly through the hinge.
 for(const [y,len,r,col] of [[-17,1,8,white],[-16,1,10,seam],[-15,30,12,white],[15,1,10,seam],[16,1,8,white],[17,.3,3,dark]]){
 const ring=Array.from({length:32},(_,i)=>[x+Math.cos(i*Math.PI/16)*r,Math.sin(i*Math.PI/16)*r]);
 const before=paths.length;prism('Hinge cap',ring,y,len,group,col);
 for(const f of paths.slice(before))f.vertices=f.vertices.map(([a,b,c])=>[a,c,-b]);
 }
}
hinge('arm',0);hinge('head',0);
// A single closed housing. When folded, the arm meets the middle of the
// diffuser face across its width, with 0.5 mm clearance; no channel or cutout.
slab('Head lower bezel',7,-26,207,52,8.5,2,10,'head',seam);
slab('Head seam',7,-26,207,52,10.5,.5,10,'head',dark);
slab('Head upper shell',7,-26,207,52,11,9.5,10,'head',white);
slab('Diffuser inset',17,-21,186,42,8,.5,6,'head',dark);
slab('Frosted diffuser',20,-18,180,36,7.5,.5,5,'head',[157,175,181],true);
slab('Switch recess',29,-12,21,24,22,.5,4,'base',dark);
slab('Rocker',31,-10,17,20,22.5,3,3,'switch',[65,76,78]);
slab('On mark',38,-6,2,5,25.5,.15,.6,'switch',[209,222,222]);
slab('Off mark',37,3,4,4,25.5,.15,2,'switch',seam);
function rotation(p,a){const c=Math.cos(rad(a)),s=Math.sin(rad(a));return [p[0]*c-p[2]*s,p[1],p[0]*s+p[2]*c]}
function transform(p,g){if(g==='arm')return add([-45,0,36],rotation(p,state.arm));if(g==='head')return add(add([-45,0,36],rotation([302,0,0],state.arm)),rotation(p,state.arm+state.head-180));if(g==='switch')return [p[0],p[1],p[2]+(p[1]/10)*(state.light-.5)*1.5];return p}
function setLine(el,a,b){el.setAttribute('d','M'+iso(a,P).join(',')+'L'+iso(b,P).join(','))}
// Resolve visibility where faces actually overlap, using camera-space depth
// at the intersection. Long faces cannot be sorted by their centre alone.
function overlapPolygon(a,b){
 let out=a;
 const area=b.reduce((v,p,i)=>v+p[0]*b[(i+1)%b.length][1]-p[1]*b[(i+1)%b.length][0],0),sign=area>=0?1:-1;
 for(let i=0;i<b.length&&out.length;i++){
  const u=b[i],v=b[(i+1)%b.length],inside=p=>sign*((v[0]-u[0])*(p[1]-u[1])-(v[1]-u[1])*(p[0]-u[0]));
  const input=out;out=[];
  for(let j=0;j<input.length;j++){
   const p=input[j],q=input[(j+1)%input.length],dp=inside(p),dq=inside(q);
   if(dp>=-1e-7)out.push(p);
   if((dp>0&&dq<0)||(dp<0&&dq>0)){const t=dp/(dp-dq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}
  }
 }
 return out;
}
function depthPlane(screen,vertices){
 const a=screen[0],za=dot(vertices[0],view);
 for(let i=1;i<screen.length-1;i++){
  const b=screen[i],c=screen[i+1],dx=b[0]-a[0],dy=b[1]-a[1],ex=c[0]-a[0],ey=c[1]-a[1],det=dx*ey-dy*ex;
  if(Math.abs(det)<1e-7)continue;
  const dz=dot(vertices[i],view)-za,ez=dot(vertices[i+1],view)-za,x=(dz*ey-ez*dy)/det,y=(dx*ez-ex*dz)/det;
  return p=>za+x*(p[0]-a[0])+y*(p[1]-a[1]);
 }
 return ()=>za;
}
function orderFaces(faces){
 const links=faces.map(()=>new Set),incoming=faces.map(()=>0);
 for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++){
  const a=faces[i],b=faces[j];
  if(a.bounds[0]>=b.bounds[2]||b.bounds[0]>=a.bounds[2]||a.bounds[1]>=b.bounds[3]||b.bounds[1]>=a.bounds[3])continue;
  const region=overlapPolygon(a.screen,b.screen);if(region.length<3)continue;
  const area=Math.abs(region.reduce((s,p,k)=>s+p[0]*region[(k+1)%region.length][1]-p[1]*region[(k+1)%region.length][0],0));if(area<.002)continue;
  const p=region.reduce((s,p)=>[s[0]+p[0]/region.length,s[1]+p[1]/region.length],[0,0]),delta=a.depth(p)-b.depth(p);
  if(Math.abs(delta)<.001)continue;
  const from=delta<0?i:j,to=delta<0?j:i;links[from].add(to);incoming[to]++;
 }
 const remaining=new Set(faces.map((_,i)=>i)),result=[];
 while(remaining.size){let next=-1;for(const i of remaining)if(incoming[i]===0&&(next<0||faces[i].mean<faces[next].mean))next=i;
  // Coaxial fittings have intentional contacts; resolve their subpixel ties.
  if(next<0)next=[...remaining].reduce((a,b)=>faces[a].mean<faces[b].mean?a:b);
  remaining.delete(next);result.push(faces[next]);for(const to of links[next])incoming[to]--;
 }
 return result;
}
function convexHull(points){const pts=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const lo=[],hi=[];for(const p of pts){while(lo.length>1&&turn(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p)}for(const p of pts.reverse()){while(hi.length>1&&turn(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p)}return lo.slice(0,-1).concat(hi.slice(0,-1))}
const beamSheets=Array.from({length:7},()=>element('path',{fill:'url(#beamGradient)',opacity:'.20'},$('#airLight')));
function draw(){
 const sorted=[];
 for(const f of paths){const v=f.vertices.map(p=>transform(p,f.group)),n=cross(sub(v[1],v[0]),sub(v[2],v[0])),len=Math.hypot(...n);if(dot(n,view)<=0||((f.emitter||f.name==='Diffuser inset')&&dot(rotation([0,0,-1],state.arm+state.head-180),view)<=0)){f.el.style.display='none';continue}f.el.style.display='';const norm=n.map(x=>x/len);const shade=.60+.38*Math.max(0,dot(norm,[-.25,-.35,.9]));let col=f.color.map(c=>Math.round(c*shade));if(f.emitter)col=col.map((c,i)=>Math.round(c+( [231,245,255][i]-c)*state.light));f.el.setAttribute('fill',`rgb(${col})`);f.el.setAttribute('stroke',`rgb(${col})`);f.el.setAttribute('stroke-width','.35');f.el.setAttribute('d',path(v));const screen=v.map(p=>iso(p,P)),xs=screen.map(p=>p[0]),ys=screen.map(p=>p[1]);sorted.push({el:f.el,screen,depth:depthPlane(screen,v),mean:dot(v.reduce((a,p)=>add(a,p),[0,0,0]).map(x=>x/v.length),view),bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]});}
 for(const f of orderFaces(sorted))$('#parts').appendChild(f.el);
 const start=transform([0,0,0],'arm'),joint=transform([302,0,0],'arm'),tip=transform([210,0,0],'head');setLine($('#armHit'),start,joint);setLine($('#headHit'),joint,tip);
 for(const [id,p]of [['armHandle',joint],['headHandle',tip]]){const q=iso(p,P);$('#'+id).setAttribute('cx',q[0]);$('#'+id).setAttribute('cy',q[1]);}
 $('#switchHit').setAttribute('d',path([[28,-13,27],[52,-13,27],[52,14,27],[28,14,27]]));
 const centre=transform([110,0,7.5],'head'),angle=rad(state.arm+state.head-180),dx=Math.sin(angle),dz=-Math.cos(angle),t=dz<-.01?-centre[2]/dz:0,cx=centre[0]+dx*t;
 const normal=rotation([0,0,-1],state.arm+state.head-180);
 const source=iso(centre,P),end=iso(add(centre,normal.map(v=>v*300)),P);
 for(const [key,value]of Object.entries({x1:source[0],y1:source[1],x2:end[0],y2:end[1]}))$('#beamGradient').setAttribute(key,value);
 // Feathered, widening sheets share the diffuser's world-space plane and stop at the desk.
 for(let j=0;j<beamSheets.length;j++){
   const spread=1+j*.22,vertices=[];
   for(const x of [20,200])for(const y of [-18,18]){
     const start=transform([x,y,7.4],'head');vertices.push(iso(start,P));
     const far=add(start,normal.map(v=>v*300));
     const along=rotation([(x-110)*.48*spread,y*2.2*spread,0],state.arm+state.head-180);
     let finish=add(far,along);
     if(finish[2]<1){const f=(start[2]-1)/(start[2]-finish[2]);finish=start.map((v,i)=>v+(finish[i]-v)*f)}
     vertices.push(iso(finish,P));
   }
   const hull=convexHull(vertices);beamSheets[j].setAttribute('d',hull.map((p,i)=>(i?'L':'M')+p.join(',')).join('')+'Z');
 }
 $('#airLight').setAttribute('opacity',state.light);
 // A narrow luminous edge and soft halo remain readable when the diffuser faces away.
 const rim=[transform([20,19,7.6],'head'),transform([200,19,7.6],'head')];
 setLine($('#glowRim'),...rim);setLine($('#brightRim'),...rim);
 $('#emission').setAttribute('opacity',state.light);

 const ring=Array.from({length:80},(_,i)=>{const a=i*Math.PI/40;return [cx+Math.cos(a)*Math.min(145,75+centre[2]*.18),Math.sin(a)*(65+centre[2]*.12),.1]});$('#poolPath').setAttribute('d',path(ring));$('#light').setAttribute('opacity',state.light*(t>0?Math.min(1,Math.max(0,-dz)*3):0));
 $('#armValue').value=Math.round(state.arm)+'°';$('#headValue').value=Math.round(state.head)+'°';$('.readout').textContent=(on?'ON · 6500 K':'OFF')+'  /  '+Math.round(state.arm+state.head-180)+'° head pitch';
}
function minArm(head){
 // Keep the closed head housing above the desk through its full travel.
 for(let a=5;a<=100;a+=.25){const z=36+302*Math.sin(rad(a));const pitch=rad(a+head-180);if(z+Math.min(0,214*Math.sin(pitch))-21*Math.abs(Math.cos(pitch))>=28)return a}return 100;
}
function steer(name,value){target[name]=value;target.arm=Math.max(target.arm,minArm(target.head));$('#arm').value=target.arm;$('#head').value=target.head;run()}
function tick(now){const dt=last?Math.min(.05,(now-last)/1000):.016;last=now;let settled=true;for(const k of ['arm','head','light']){state[k]+= (target[k]-state[k])*(reduced.matches?1:1-Math.exp(-dt/.1));if(Math.abs(state[k]-target[k])<.005)state[k]=target[k];else settled=false}state.arm=Math.max(state.arm,minArm(state.head));draw();raf=!settled&&visible?requestAnimationFrame(tick):0}
function run(){if(!raf&&visible){last=0;raf=requestAnimationFrame(tick)}}
function power(){on=!on;target.light=on?1:0;$('#power').setAttribute('aria-checked',on);$('#powerText').textContent=on?'Light on':'Light off';run()}
$('#power').onclick=power;$('#switchHit').onclick=power;
for(const name of ['arm','head'])$('#'+name).oninput=e=>{steer(name,Number(e.target.value))};
$('#reset').onclick=()=>{target.arm=100;target.head=75;$('#arm').value=100;$('#head').value=75;run()};
function svgPoint(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#scene').getScreenCTM().inverse());return [p.x,p.y]}
for(const name of ['arm','head']){const hit=$('#'+name+'Hit');let drag=null;hit.onpointerdown=e=>{e.preventDefault();hit.setPointerCapture(e.pointerId);drag={point:svgPoint(e),value:target[name]}};hit.onpointermove=e=>{if(!drag)return;const p=svgPoint(e),input=$('#'+name);steer(name,Math.max(+input.min,Math.min(+input.max,drag.value+(p[1]-drag.point[1])*(name==='arm'?-.4:-.65))));input.value=Math.round(target[name])};hit.onpointerup=hit.onpointercancel=()=>{drag=null};}
new IntersectionObserver(es=>{visible=es.at(-1).isIntersecting;if(visible)run()}).observe($('#scene'));
reduced.addEventListener('change',run);draw();
window.lamp={state,target,parts:meshes.length};
