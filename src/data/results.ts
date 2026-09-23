/** Paper values transcribed from prmpt.txt. PDF verification is pending. */
export type Estimate = { mean: number; sd?: number };
export type Metric = 'collision'|'offroad'|'dnf'|'success'|'alignment'|'minDist'|'heading'|'realism'|'kinematic'|'interactive'|'map'|'sps';
export type ResultRow = { id: string; label: string; external?: boolean; metrics: Partial<Record<Metric,Estimate>> };
export const metricInfo: Record<Metric,{label:string; unit:string; higher:boolean}> = {
 collision:{label:'Collision',unit:'%',higher:false},offroad:{label:'Off-road',unit:'%',higher:false},dnf:{label:'Did not finish',unit:'%',higher:false},success:{label:'Success',unit:'%',higher:true},alignment:{label:'Alignment',unit:'',higher:true},minDist:{label:'Min. distance error',unit:'m',higher:false},heading:{label:'Heading error',unit:'rad',higher:false},realism:{label:'Realism',unit:'',higher:true},kinematic:{label:'Kinematic',unit:'',higher:true},interactive:{label:'Interactive',unit:'',higher:true},map:{label:'Map-based',unit:'',higher:true},sps:{label:'Throughput',unit:'k SPS',higher:true}
};
const motion:Metric[]=['collision','offroad','dnf','success','alignment','minDist','heading'];
const row=(id:string,label:string,keys:Metric[],values:number[][],external=false):ResultRow=>({id,label,external,metrics:Object.fromEntries(keys.map((key,i)=>[key,{mean:values[i][0],...(values[i].length>1?{sd:values[i][1]}:{})}]))});
export const directResults:ResultRow[]=[
 row('direct1','Direct · Nss = 1',motion,[[1.42,.22],[1.61,.33],[3.10,.27],[93.87,.12],[-.155,.004],[.297,.007],[.094,.003]]),
 row('direct20','Direct · Nss = 20',motion,[[1.94,.57],[4.21,1.14],[3.35,.22],[90.49,1.77],[-.220,.012],[.622,.054],[.081,.004]]),
 row('revamp','REVAMP · Nss = 20',motion,[[2.28,.04],[2.63,1.17],[2.65,.40],[92.45,1.46],[-.141,.011],[.279,.025],[.087,.007]])
];
const wosacKeys:Metric[]=['realism','kinematic','interactive','map'];
export const wosacResults:ResultRow[]=[
 row('direct1','Direct · Nss = 1',wosacKeys,[[.690],[.308],[.688],[.765]]),row('direct20','Direct · Nss = 20',wosacKeys,[[.687],[.280],[.694],[.765]]),row('revamp','REVAMP · Nss = 20',wosacKeys,[[.702],[.363],[.689],[.769]]),row('smart','SMART-R1 · external reference',wosacKeys,[[.786],[.494],[.811],[.919]],true)
];
export const resolutionResults:ResultRow[]=[
 row('r7','7 steps · 0.3 s',['sps',...motion],[[130],[3.38,1.46],[5.94,3.44],[20.50,14.95],[70.18,18.93],[-.145,.007],[.350,.041],[.068,.007]]),
 row('r10','10 steps · 0.2 s',['sps',...motion],[[115],[1.89,.29],[2.61,.82],[3.96,.39],[91.54,.61],[-.132,.004],[.258,.019],[.073,.011]]),
 row('r20','20 steps · 0.1 s',['sps',...motion],[[105],[2.28,.04],[2.63,1.17],[2.65,.40],[92.45,1.46],[-.141,.011],[.279,.025],[.087,.007]])
];
export const noiseLevels=[0,.5,1];
export type RobustMetric='success'|'collision'|'offroad'|'alignment';
const matrix=(v:number[][][]):Estimate[][]=>v.map(r=>r.map(([mean,sd])=>({mean,sd})));
export const robustness:Record<RobustMetric,Estimate[][]>={
 success:matrix([[[91.54,.61],[91.46,1.16],[91.09,1.16]],[[92.46,1.53],[91.93,1.04],[91.72,1.12]],[[92.09,1.84],[91.52,1.64],[91.35,1.67]]]),
 collision:matrix([[[1.89,.29],[1.93,.11],[2.12,.06]],[[1.73,.05],[1.69,.12],[1.90,.15]],[[1.86,.53],[1.93,.47],[1.87,.58]]]),
 offroad:matrix([[[2.61,.82],[2.70,.68],[2.81,.77]],[[2.10,.69],[2.34,.42],[2.32,.60]],[[2.44,1.02],[2.77,.83],[2.92,.95]]]),
 alignment:matrix([[[-.132,.004],[-.200,.008],[-.202,.009]],[[-.133,.013],[-.214,.047],[-.215,.046]],[[-.145,.017],[-.231,.017],[-.231,.016]]])
};
export const robustnessRows:ResultRow[]=noiseLevels.flatMap((train,i)=>noiseLevels.map((evalXi,j)=>({id:`noise-${i}-${j}`,label:`Train ξ ${train} / eval ξ ${evalXi}`,metrics:Object.fromEntries(Object.entries(robustness).map(([k,m])=>[k,m[i][j]]))})));
export const paper = {
 title:'REVAMP: Reversible Lookahead for Mid-to-Mid Reinforcement Learning Motion Planning',
 authors:['Islem Kobbi','Tiago Rocha Goncalves','Fawzi Nashashibi'],
 headlines:[{label:'Success rate',before:90.49,after:92.45,unit:'%',note:'+1.96 percentage points'}, {label:'Off-road rate',before:4.21,after:2.63,unit:'%',note:'−1.58 percentage points'}, {label:'WOSAC realism',before:.687,after:.702,unit:'',note:'+0.015 realism score'}],
 ade:{before:12.7,after:11.8}, directSPS:{direct1:141,direct20:107},
 architecture:{ego:8,partners:32,partnerFeatures:7,roads:128,roadFeatures:7,observation:1128,encoder:64,concat:192,projection:256,lstm:256,actor:11,critic:1},
 provenance:'Transcribed from the supplied specification; source PDF not yet available.'
};
export const tableCaptions={
 direct:'Direct Nss = 1 has the best collision, off-road, and success rates. The paper’s argument concerns complete-trajectory quality: look beyond the executed prefix. Direct variability is across checkpoints; Lookahead variability is across seeds.',
 wosac:'REVAMP improves overall realism relative to Direct Nss = 20. SMART-R1 is an external reference, not a controlled baseline. Standard deviations were not supplied for this table.',
 resolution:'10 steps at 0.2 s is the favorable throughput–quality compromise. Coarser rollouts degrade success and increase unfinished episodes.',
 robustness:'Success stays similar across these corruption levels, while alignment deteriorates. Training corruption does not uniformly improve every metric.'
};
