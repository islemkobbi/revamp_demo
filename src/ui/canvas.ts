import type {Point} from '../lib/math';
import type {Vehicle} from '../lib/vehicle';
export type View={xmin:number;xmax:number;ymin:number;ymax:number};
export class Scene {
 canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D; width=800;height=340;
 constructor(root:HTMLElement,public view:View={xmin:-5,xmax:46,ymin:-13,ymax:13},label='Top-down driving simulation'){
 this.canvas=document.createElement('canvas');this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label',label);this.canvas.textContent=label;root.append(this.canvas);this.ctx=this.canvas.getContext('2d')!;const ratio=matchMedia('(max-width:720px)').matches?1:Math.min(2,devicePixelRatio||1);this.canvas.width=this.width*ratio;this.canvas.height=this.height*ratio;this.ctx.scale(ratio,ratio);
 }
 get scale(){return Math.min(this.width/(this.view.xmax-this.view.xmin),this.height/(this.view.ymax-this.view.ymin));}
 point(p:Point){const s=this.scale;return {x:this.width/2+(p.x-(this.view.xmax+this.view.xmin)/2)*s,y:this.height/2-(p.y-(this.view.ymax+this.view.ymin)/2)*s};}
 unproject(event:PointerEvent):Point{const r=this.canvas.getBoundingClientRect(),x=(event.clientX-r.left)/r.width*this.width,y=(event.clientY-r.top)/r.height*this.height;return {x:(x-this.width/2)/this.scale+(this.view.xmax+this.view.xmin)/2,y:-(y-this.height/2)/this.scale+(this.view.ymax+this.view.ymin)/2};}
 clear(){const c=this.ctx;c.clearRect(0,0,this.width,this.height);c.fillStyle='#f0f2ed';c.fillRect(0,0,this.width,this.height);c.strokeStyle='#e4e8df';c.lineWidth=.7;for(let x=0;x<800;x+=25){c.beginPath();c.moveTo(x,0);c.lineTo(x,340);c.stroke();}for(let y=0;y<340;y+=25){c.beginPath();c.moveTo(0,y);c.lineTo(800,y);c.stroke();}}
 path(points:Point[],color='#176754',width=2,dashed=false){if(!points.length)return;const c=this.ctx;c.save();c.strokeStyle=color;c.lineWidth=width;if(dashed)c.setLineDash([7,6]);c.beginPath();points.forEach((p,i)=>{const q=this.point(p);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);});c.stroke();c.restore();}
 road(){this.path([{x:-20,y:0},{x:70,y:0}],'#dfe3dc',14*this.scale);this.path([{x:-20,y:7},{x:70,y:7}],'#b5beb2',1.5);this.path([{x:-20,y:-7},{x:70,y:-7}],'#b5beb2',1.5);this.path([{x:-20,y:0},{x:70,y:0}],'#fafbf7',2,true);}
 intersection(x:number){this.path([{x,y:-25},{x,y:25}],'#dfe3dc',14*this.scale);this.path([{x,y:-25},{x,y:25}],'#fafbf7',2,true);}
 vehicle(v:Pick<Vehicle,'x'|'y'|'heading'|'length'|'width'>,kind:'ego'|'other'|'ghost'|'obstacle'|'phantom'='ego',alpha=1){const c=this.ctx,p=this.point(v),s=this.scale;c.save();c.translate(p.x,p.y);c.rotate(-v.heading);c.globalAlpha=alpha;const w=v.length*s,h=v.width*s;c.fillStyle=kind==='ego'?'#176754':kind==='other'?'#7c8983':kind==='obstacle'?'#323f38':kind==='phantom'?'#b3574c':'#91b7a6';c.strokeStyle=kind==='phantom'?'#ad473a':'#176754';if(kind==='ghost'||kind==='phantom'){c.globalAlpha=alpha*.45;c.setLineDash([4,3]);}c.beginPath();c.roundRect(-w/2,-h/2,w,h,4);c.fill();if(kind==='ghost'||kind==='phantom')c.stroke();c.setLineDash([]);c.fillStyle='rgba(245,255,248,.65)';c.fillRect(w*.12,-h*.34,w*.15,h*.68);c.fillStyle='rgba(20,40,30,.25)';c.fillRect(-w*.33,-h*.32,w*.18,h*.64);c.restore();}
 dot(p:Point,label:string,color='#176754',radius=5){const q=this.point(p),c=this.ctx;c.fillStyle=color;c.beginPath();c.arc(q.x,q.y,radius,0,Math.PI*2);c.fill();c.font='12px monospace';c.fillText(label,q.x+8,q.y-9);}
 label(text:string,x=22,y=27){this.ctx.fillStyle='#51685b';this.ctx.font='11px monospace';this.ctx.fillText(text,x,y);}
}
