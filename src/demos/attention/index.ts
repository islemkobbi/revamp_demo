import type {Rollout,ReplayAgent} from '../../lib/rollout';
import type {Scene} from '../../ui/canvas';
/** Optional analysis, not in the paper. Road IDs refer to indices in map.roads. */
export function drawAttention(scene:Scene,rollout:Rollout,agents:ReplayAgent[]){const ego=agents.find(a=>a.id===0);if(!ego)return;
 for(const id of ego.selected_partner_ids??[]){const v=agents.find(a=>a.id===id);if(v){scene.vehicle(v,'ghost');scene.dot(v,'max-pool','#578c45',9);}}
 for(const id of ego.selected_road_ids??[]){const line=rollout.map.roads[id];if(line)scene.path(line.map(([x,y])=>({x,y})),'#73a663',5);}
}
