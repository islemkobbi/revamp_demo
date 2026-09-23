import {metricInfo, paper, type Metric, type ResultRow} from '../data/results';

const colors = ['#a6b4ba', '#506c7b', '#e63312', '#76a83c'];
const fmt = (value: number) => Math.abs(value) < 1 && value !== 0 ? value.toFixed(3) : value.toFixed(2);
const category = (row: ResultRow): [string, string] => {
  if (row.id === 'direct1') return ['Direct', 'Nss = 1'];
  if (row.id === 'direct20') return ['Direct', 'Nss = 20'];
  if (row.id === 'revamp') return ['REVAMP', 'Nss = 20'];
  if (row.id === 'smart') return ['SMART-R1', 'external'];
  const match = row.label.match(/^(\d+) steps · (.+)$/);
  return match ? [`${match[1]} steps`, match[2]] : [row.label, ''];
};

function metricChart(rows: ResultRow[], metric: Metric, tall = false): string {
  const values = rows.map(row => row.metrics[metric]).filter(value => value !== undefined);
  if (!values.length) return '';
  const low = Math.min(...values.map(value => value.mean - (value.sd ?? 0)));
  const high = Math.max(...values.map(value => value.mean + (value.sd ?? 0)));
  const min = low < 0 ? low * 1.25 : 0;
  const max = high > 0 ? high * 1.22 : 0;
  const top = 30, bottom = tall ? 370 : 230, left = 66, right = 474;
  const y = (value: number) => bottom - (value - min) / (max - min) * (bottom - top);
  const baseline = y(0);
  const label = `${metricInfo[metric].label}${metricInfo[metric].unit ? ` (${metricInfo[metric].unit})` : ''}`;
  const ticks = Array.from({length: 5}, (_, i) => min + (max - min) * i / 4).map(value => `<line x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}" class="bar-grid"/><text x="${left-8}" y="${y(value)+4}" text-anchor="end" class="bar-tick">${fmt(value)}</text>`).join('');
  const slot = (right - left) / rows.length;
  const barWidth = Math.min(64, slot * .54);
  const bars = rows.map((row, i) => {
    const value = row.metrics[metric];
    if (!value) return '';
    const center = left + slot * (i + .5);
    const plotY = y(value.mean);
    const barTop = Math.min(baseline, plotY);
    const barHeight = Math.max(1, Math.abs(plotY - baseline));
    const sd = value.sd === undefined ? '' : `<line x1="${center}" y1="${y(value.mean-value.sd)}" x2="${center}" y2="${y(value.mean+value.sd)}" class="bar-error"/><line x1="${center-8}" y1="${y(value.mean-value.sd)}" x2="${center+8}" y2="${y(value.mean-value.sd)}" class="bar-error"/><line x1="${center-8}" y1="${y(value.mean+value.sd)}" x2="${center+8}" y2="${y(value.mean+value.sd)}" class="bar-error"/>`;
    const [first, second] = category(row);
    const valueY = value.mean >= 0 ? Math.max(17, y(value.mean+(value.sd ?? 0))-8) : Math.min(bottom + 19,y(value.mean-(value.sd ?? 0))+14);
    return `<rect x="${center-barWidth/2}" y="${barTop}" width="${barWidth}" height="${barHeight}" fill="${tall && i === 3 ? '#8c9298' : colors[i % colors.length]}"/>${sd}<text x="${center}" y="${valueY}" text-anchor="middle" class="bar-value">${fmt(value.mean)}</text><text x="${center}" y="${bottom + 28}" text-anchor="middle" class="bar-category">${first}</text><text x="${center}" y="${bottom + 48}" text-anchor="middle" class="bar-category-sub">${second}</text>`;
  }).join('');
  const description = rows.map(row => { const value = row.metrics[metric]; return `${row.label}: ${value ? `${fmt(value.mean)}${value.sd === undefined ? '' : ` ± ${fmt(value.sd)}`}` : 'not reported'}`; }).join('; ');
  return `<figure class="metric-chart"><figcaption>${label}</figcaption><svg viewBox="0 0 500 ${bottom + 68}" role="img" aria-label="Bar chart of ${label}. ${description}">${ticks}<line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" class="bar-axis"/><line x1="${left}" y1="${baseline}" x2="${right}" y2="${baseline}" class="bar-axis"/>${bars}</svg></figure>`;
}

export function resultCharts(rows: ResultRow[], metrics: Metric[], caption: string, columns = 3): string {
  const hasSd = rows.some(row => metrics.some(metric => row.metrics[metric]?.sd !== undefined));
  return `<div class="results-figure"><div class="results-charts${columns === 4 ? ' results-charts-four' : ''}">${metrics.map(metric => metricChart(rows, metric, columns === 4)).join('')}</div><p class="figure-note">${hasSd ? 'Bars show reported means; error bars show ±1 standard deviation. Axes start at zero. ' : 'Bars show reported scores. Axes start at zero. '}${caption}</p></div>`;
}

export function architectureFlow(): string {
  const a = paper.architecture;
  return `<figure class="architecture-flow"><figcaption>Policy architecture <span>from the supplied specification</span></figcaption><div class="flow-scroll"><svg viewBox="0 0 1000 370" role="img" aria-label="Ego, partner and road features pass through encoders and pooling, merge into 192 features, project to 256, enter a 256-unit LSTM, then branch into an 11-value actor and one-value critic"><defs><marker id="flow-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#869aa8"/></marker></defs>
  ${[[18,30,'Ego','8 features'],[18,140,'Partners','32 × 7 features'],[18,250,'Roads','128 × 7 features'],[230,30,'Ego encoder','64 dimensions'],[230,140,'Partner encoder','64 + max pool'],[230,250,'Road encoder','64 + max pool'],[450,140,'Concatenate','192 features'],[615,140,'Projection','256 dimensions'],[780,140,'LSTM','256 units'],[900,77,'Actor','11 outputs'],[900,205,'Critic','1 output']].map(([x,y,title,detail])=>`<g class="flow-node" transform="translate(${x} ${y})"><rect width="${Number(x)>=900?86: Number(x)>=780?100: Number(x)>=615?115: Number(x)>=450?125: Number(x)>=230?145:145}" height="68" rx="7"/><text x="12" y="28" class="flow-title">${title}</text><text x="12" y="48" class="flow-detail">${detail}</text></g>`).join('')}
  ${[[163,64,230,64],[163,174,230,174],[163,284,230,284],[375,64,425,64],[425,64,425,174],[375,174,450,174],[375,284,425,284],[425,284,425,174],[575,174,615,174],[730,174,780,174],[880,174,890,174],[890,174,890,111],[890,111,900,111],[890,174,890,239],[890,239,900,239]].map(([x1,y1,x2,y2])=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="flow-link" ${x2>x1?'marker-end="url(#flow-arrow)"':''}/>`).join('')}</svg></div><p>Three feature streams are encoded separately, combined, and passed through a recurrent policy before the actor and critic outputs.</p></figure>`;
}
