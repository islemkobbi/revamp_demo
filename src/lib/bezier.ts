import {params} from '../data/params';
import {lerp,type Point} from './math';
export type PathPoint=Point&{speed:number};
export type Decoded={ends:Point[];handles:Point[];speeds:number[];points:PathPoint[]};
export function cubic(a:Point,b:Point,c:Point,d:Point,t:number):Point {const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}
export function decode(action:number[],speed:number):Decoded{
 if(action.length!==11 || action.some(v=>!Number.isFinite(v)||v< -1||v>1))throw new Error('Action must contain 11 finite values in [−1, 1].');
 const s=params.decoder.baseScale+speed/params.decoder.speedScale;
 const ends:Point[]=[{x:0,y:0}],handles:Point[]=[{x:1+(action[0]+1)/2*s,y:0}],speeds=[speed];
 for(let i=1;i<=2;i++){const o=1+(i-1)*5;const si=i*s; // PROVISIONAL s_i = i*s; verify Appendix A before scientific use.
 const e={x:(action[o]+params.decoder.endpointOffset)*si,y:action[o+1]*si};ends.push(e);handles.push({x:e.x+(action[o+2]+1)/4*s,y:e.y+action[o+3]/2*s});speeds.push(params.decoder.maxTargetHalf*(action[o+4]+1));}
 const points=Array.from({length:params.samples},(_,j)=>{const u=j/(params.samples-1)*2,i=Math.min(1,Math.floor(u)),t=u-i,e=ends[i+1],h=handles[i+1];return {...cubic(ends[i],handles[i],{x:2*e.x-h.x,y:2*e.y-h.y},e,t),speed:lerp(speeds[i],speeds[i+1],t)};});
 return {ends,handles,speeds,points};
}
export function worldPath(points:PathPoint[],origin:Point,heading:number):PathPoint[]{const c=Math.cos(heading),s=Math.sin(heading);return points.map(p=>({x:origin.x+p.x*c-p.y*s,y:origin.y+p.x*s+p.y*c,speed:p.speed}));}
