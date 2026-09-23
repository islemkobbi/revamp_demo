export type Point={x:number;y:number};
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
export function gaussian(random= Math.random){return Math.sqrt(-2*Math.log(Math.max(1e-10,random())))*Math.cos(2*Math.PI*random());}
export function seeded(seed:number){return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
