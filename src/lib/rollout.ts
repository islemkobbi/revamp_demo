import {params} from '../data/params';
export type XY=[number,number];
export type ReplayAgent={id:number;x:number;y:number;heading:number;speed:number;length:number;width:number;plan?:XY[];lookahead?:XY[][];selected_partner_ids?:number[];selected_road_ids?:number[]};
export type Rollout={scenario:string;method:'direct1'|'direct20'|'revamp';dt:number;synthetic?:boolean;map:{roads:XY[][];edges:XY[][];goal:XY};obstacles:{x:number;y:number;heading:number;length:number;width:number}[];frames:{t:number;agents:ReplayAgent[]}[]};
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const xy=(v:unknown):v is XY=>Array.isArray(v)&&v.length===2&&v.every(finite);
const poly=(v:unknown):v is XY[]=>Array.isArray(v)&&v.length>=2&&v.every(xy);
const geometry=(v:unknown)=>obj(v)&&['x','y','heading','length','width'].every(k=>finite(v[k]))&&(v.length as number)>0&&(v.width as number)>0;
export function validateRollout(value:unknown):Rollout {
 if(!obj(value)||typeof value.scenario!=='string'||!['direct1','direct20','revamp'].includes(String(value.method))||value.dt!==params.dt)throw new Error('Rollout needs a scenario, valid method, and dt = 0.1.');
 if(value.synthetic!==undefined&&typeof value.synthetic!=='boolean')throw new Error('synthetic must be a boolean when supplied.');
 if(!obj(value.map)||!Array.isArray(value.map.roads)||!value.map.roads.every(poly)||!Array.isArray(value.map.edges)||!value.map.edges.every(poly)||!xy(value.map.goal))throw new Error('Map roads/edges must be arrays of [x,y] polylines and goal an [x,y] point.');
 if(!Array.isArray(value.obstacles)||!value.obstacles.every(geometry))throw new Error('Obstacles need finite pose and positive dimensions.');
 if(!Array.isArray(value.frames)||!value.frames.length)throw new Error('Rollout must have at least one frame.');
 let previous=-Infinity;for(const frame of value.frames){if(!obj(frame)||!finite(frame.t)||frame.t<0||frame.t<=previous||(Number.isFinite(previous)&&Math.abs(frame.t-previous-params.dt)>1e-6)||!Array.isArray(frame.agents)||!frame.agents.length)throw new Error('Frame times must increase in 0.1 s increments and every frame needs agents.');previous=frame.t;const ids=new Set();
 for(const a of frame.agents){if(!obj(a)||!geometry(a)||!Number.isInteger(a.id)||ids.has(a.id)||!finite(a.speed)||a.speed<0)throw new Error('Agent IDs must be unique integers; pose, speed, and dimensions must be finite.');ids.add(a.id);
 if(a.plan!==undefined&&(!poly(a.plan)||a.plan.length!==params.samples))throw new Error('Agent plan must contain exactly 50 [x,y] points.');
 if(a.lookahead!==undefined&&(!Array.isArray(a.lookahead)||!a.lookahead.every(poly)))throw new Error('Lookahead must be an array of point polylines.');
 for(const key of ['selected_partner_ids','selected_road_ids'])if(a[key]!==undefined&&(!Array.isArray(a[key])||!(a[key] as unknown[]).every(Number.isInteger)))throw new Error(`${key} must be an array of integer IDs.`);
 }}
 return value as unknown as Rollout;
}
export const methodNames={direct1:'Direct · Nss = 1',direct20:'Direct · Nss = 20',revamp:'REVAMP'};
export function syntheticRollout(scenario:string,method:Rollout['method']):Rollout{
 const curved=scenario==='curved',intersection=scenario==='intersection';
 const road=(x:number)=>curved?Math.sin((x-5)/45*Math.PI)*5:0;
 const xs=Array.from({length:61},(_,i)=>i-5);const roads:XY[][]=[xs.map(x=>[x,road(x)])];const edges:XY[][]=[xs.map(x=>[x,road(x)+7]),xs.map(x=>[x,road(x)-7])];if(intersection){roads.push([[26,-20],[26,20]]);edges.push([[19,-20],[19,-7]],[[33,7],[33,20]]);}
 const obstacle={x:28,y:road(28),heading:0,length:params.vehicle.length,width:params.vehicle.width};
 const offset=method==='direct20'?-5:-3;const traj=(t:number):XY=>{const x=t*5;const dodge=scenario==='overtaking'?Math.exp(-(((x-27)/12)**2)):Math.exp(-(((x-28)/9)**2));return [x,road(x)+offset*dodge];};
 const frames=Array.from({length:params.rollout.frames},(_,i)=>{const t=i*params.dt,p=traj(t),next=traj(t+.01);let plan:XY[];
 if(method==='direct1'){plan=Array.from({length:params.samples},(_,j)=>{const x=p[0]+j/(params.samples-1)*12;return [x,p[1]+(road(x)-p[1])*j/(params.samples-1)];});}
 else{const sampled=method==='direct20'?Math.floor(t/2)*2:t;plan=Array.from({length:params.samples},(_,j)=>traj(sampled+j/(params.samples-1)*2));}
 const agents:ReplayAgent[]=[{id:0,x:p[0],y:p[1],heading:Math.atan2(next[1]-p[1],next[0]-p[0]),speed:5,length:4.5,width:1.8,plan},
 {id:1,x:intersection?26:48-t*3,y:intersection?-16+t*3:road(48-t*3)+4,heading:intersection?Math.PI/2:Math.PI,speed:3,length:4.5,width:1.8},
 {id:2,x:8+t*3,y:road(8+t*3)-5,heading:0,speed:3,length:4.5,width:1.8}];return {t,agents};});
 return {scenario,method,dt:params.dt,synthetic:true,map:{roads,edges,goal:[49,road(49)]},obstacles:[obstacle],frames};
}
