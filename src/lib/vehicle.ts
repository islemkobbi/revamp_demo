import {params} from '../data/params';
import {clamp,wrap} from './math';
export type Vehicle={id:number;x:number;y:number;heading:number;speed:number;length:number;width:number;integral:number;lastError:number};
export function vehicle(id:number,x:number,y:number,heading=0,speed=params.scene.egoSpeed):Vehicle{return {id,x,y,heading,speed,length:params.vehicle.length,width:params.vehicle.width,integral:0,lastError:0};}
export function integrate(v:Vehicle,steer:number,acceleration:number,dt:number):void{
 const p=params.vehicle;const delta=clamp(steer,-p.maxSteer,p.maxSteer);v.x+=v.speed*Math.cos(v.heading)*dt;v.y+=v.speed*Math.sin(v.heading)*dt;v.heading=wrap(v.heading+v.speed/p.wheelbase*Math.tan(delta)*dt);v.speed=clamp(v.speed+clamp(acceleration,-p.maxBrake,p.maxAcceleration)*dt,0,20);
}
/** Oriented rectangle separating-axis collision check. */
export function collides(a:Pick<Vehicle,'x'|'y'|'heading'|'length'|'width'>,b:Pick<Vehicle,'x'|'y'|'heading'|'length'|'width'>):boolean{
 const axes=[a.heading,a.heading+Math.PI/2,b.heading,b.heading+Math.PI/2];
 return axes.every(t=>{const project=(v:typeof a)=>Math.abs(Math.cos(v.heading-t))*v.length/2+Math.abs(Math.sin(v.heading-t))*v.width/2;return Math.abs((a.x-b.x)*Math.cos(t)+(a.y-b.y)*Math.sin(t))<=project(a)+project(b);});
}
