import {params} from '../../data/params';
import {decode} from '../../lib/bezier';
import {track} from '../../lib/controller';
import {vehicle} from '../../lib/vehicle';
import {clamp,distance} from '../../lib/math';
import {$,range,tabs,transport,hint} from '../../ui/controls';
import {Scene} from '../../ui/canvas';
export function mount(root:HTMLElement){
 root.innerHTML=`<div class="demo-header"><h3 class="demo-title">Bézier action playground</h3><span class="tag">11-dimensional action</span></div><div class="demo-body"><div class="presets"></div><div class="split split-wide"><div><div class="canvas-wrap"></div><div class="speed-chart"></div><div class="playback"></div></div><div><div class="ego-control"></div><div class="sliders"><fieldset class="slider-group"><legend>P₀ · initial handle</legend></fieldset><fieldset class="slider-group"><legend>P₁ · first endpoint</legend></fieldset><fieldset class="slider-group"><legend>P₂ · second endpoint</legend></fieldset></div></div></div><div class="notice">Decoding follows the equations supplied in the specification. Provisional: sᵢ = i × s; controller gains await Appendix A. All playback is illustrative.</div></div><div class="demo-footer">Appendix A · Two cubic segments, 50 samples, linearly interpolated target speed. Drag endpoints or handles; the same controls are available as keyboard-accessible sliders.</div>`;
 let action=[...params.presets.straight],speed=8,car=vehicle(0,0,0,0,speed),decoded=decode(action,speed),elapsed=0;
 const scene=new Scene($(root,'.canvas-wrap'),{xmin:-3,xmax:24,ymin:-10,ymax:10},'Draggable Bézier endpoints and handles, with a tracked ego vehicle');scene.canvas.classList.add('interactive');const inputs:HTMLInputElement[]=[];
 const groups=root.querySelectorAll<HTMLElement>('.slider-group');const labels=['a₀ handle x','a₁ endpoint x','a₁ endpoint y','a₁ handle x','a₁ handle y','a₁ target speed','a₂ endpoint x','a₂ endpoint y','a₂ handle x','a₂ handle y','a₂ target speed'];
 function sync(){inputs.forEach((input,i)=>{input.value=String(action[i]);input.previousElementSibling!.querySelector('output')!.textContent=action[i].toFixed(2);});}
 function change(){decoded=decode(action,speed);car=vehicle(0,0,0,0,speed);elapsed=0;draw();}
 labels.forEach((label,i)=>inputs.push(range(groups[i===0?0:i<6?1:2],label,-1,1,.01,action[i],v=>{action[i]=v;change();})));
 range($(root,'.ego-control'),'Ego speed (m/s)',0,20,.5,speed,v=>{speed=v;change();});
 tabs($(root,'.presets'),[['straight','Straight'],['left','Gentle left'],['right','Sharp right'],['stop','Stop']],'straight',v=>{action=[...params.presets[v as keyof typeof params.presets]];sync();change();});
 function draw(){scene.clear();scene.path([{x:-5,y:0},{x:30,y:0}],'#c9d3c5',1,true);scene.path(decoded.points,'#176754',3);decoded.ends.forEach((p,i)=>{scene.path([p,decoded.handles[i]],'#91a78e',1,true);if(i>0)scene.path([p,{x:2*p.x-decoded.handles[i].x,y:2*p.y-decoded.handles[i].y}],'#bbc9b4',1,true);scene.dot(p,`P${i}`);scene.dot(decoded.handles[i],`H${i}`,'#8b9e7e',4);});scene.vehicle(car);scene.label('DRAG THE CONTROL POINTS');scene.label(`t = ${elapsed.toFixed(1)} s   v = ${car.speed.toFixed(1)} m/s`,22,320);
 const points=decoded.points.map((p,i)=>`${35+i/(decoded.points.length-1)*490},${95-p.speed/20*70}`).join(' ');$(root,'.speed-chart').innerHTML=`<svg class="chart" viewBox="0 0 550 125" role="img" aria-label="Target speed along trajectory"><line x1="35" y1="95" x2="525" y2="95" class="grid"/><line x1="35" y1="25" x2="525" y2="25" class="grid"/><text x="3" y="29" class="muted">20</text><text x="10" y="99" class="muted">0</text><polyline points="${points}" stroke="#176754" stroke-width="2" fill="none"/><text x="35" y="117" class="muted">P₀</text><text x="274" y="117" class="muted">P₁</text><text x="510" y="117" class="muted">P₂</text><text x="390" y="17" class="muted">Target speed · m/s</text></svg>`;
 }
 let drag:{kind:'end'|'handle';index:number}|undefined;
 scene.canvas.onpointerdown=e=>{const p=scene.unproject(e);let min=1.2;decoded.ends.forEach((q,i)=>{const d=distance(p,q);if(i>0&&d<min){min=d;drag={kind:'end',index:i};}});decoded.handles.forEach((q,i)=>{const d=distance(p,q);if(d<min){min=d;drag={kind:'handle',index:i};}});if(drag){scene.canvas.setPointerCapture(e.pointerId);player.pause();}};
 scene.canvas.onpointermove=e=>{if(!drag)return;const p=scene.unproject(e),s=params.decoder.baseScale+speed/params.decoder.speedScale,i=drag.index,o=1+(i-1)*5;
 if(drag.kind==='end'){action[o]=clamp(p.x/(i*s)-params.decoder.endpointOffset,-1,1);action[o+1]=clamp(p.y/(i*s),-1,1);}else if(i===0){action[0]=clamp((p.x-1)*2/s-1,-1,1);}else{action[o+2]=clamp((p.x-decoded.ends[i].x)*4/s-1,-1,1);action[o+3]=clamp((p.y-decoded.ends[i].y)*2/s,-1,1);}sync();change();};
 scene.canvas.onpointerup=scene.canvas.onpointercancel=()=>{drag=undefined;};
 let budget=0;const player=transport($(root,'.playback'),dt=>{budget+=dt;while(budget>=.02){track(car,decoded.points,.02);elapsed+=.02;budget-=.02;}if(distance(car,decoded.ends[2])<.3||elapsed>8)player.pause();draw();},()=>{change();},()=>{track(car,decoded.points,params.dt);elapsed+=params.dt;draw();});
 hint($(root,'.demo-body'),'Move a handle to bend the path; change a target speed to see the controller brake or accelerate.');sync();draw();
}
