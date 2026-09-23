import './style.css';
import {paper, directResults, resolutionResults, wosacResults, tableCaptions} from './data/results';
import {resultCharts} from './ui/static-charts';

const authorProfiles: Record<string, string> = {
  'Islem Kobbi': 'https://www.linkedin.com/in/islem-kobbi/',
  'Tiago Rocha Goncalves': 'https://www.linkedin.com/in/tiagorochag/',
  'Fawzi Nashashibi': 'https://www.linkedin.com/in/fawzi-nashashibi-3a50ab10/',
};
const authorLink = (name: string) => `<a href="${authorProfiles[name]}" target="_blank" rel="noopener noreferrer">${name}</a>`;

const app = document.querySelector<HTMLDivElement>('#app')!;
const heading = (number: string, label: string, title: string, description: string) => `<div class="section-heading"><span class="section-number">${number}</span><div><p class="eyebrow">${label}</p><h2>${title}</h2><p class="section-description">${description}</p></div></div>`;

const figure = (file: string, width: number, height: number, title: string, description: string, extraClass = '') => `<figure class="paper-figure ${extraClass}"><img src="${import.meta.env.BASE_URL}figures/${file}.png" width="${width}" height="${height}" alt="${description}" loading="lazy" decoding="async"><figcaption><strong>${title}</strong> ${description}</figcaption></figure>`;

const videoVersions: Record<string, string> = {"demo_nss_1": "6d5c76e42e09", "demo_nss_20": "768a84c9584a", "demo_dream": "05eb3a894a81", "dream_demo": "e312f96381c7", "direct_demo": "0a87a3d8e01c"};
const videoCard = (file: string, label: string) => `<figure class="case-card" style="--video-ratio:${file === 'dream_demo' ? 12 / 7 : file === 'direct_demo' ? 30 / 31 : 240 / 229}"><video data-playback-rate="${file === 'direct_demo' ? 0.25 : 1.5}" controls autoplay muted loop playsinline preload="metadata" aria-label="${label} demonstration"><source src="${import.meta.env.BASE_URL}videos/browser/${file}.webm?v=${videoVersions[file]}" type="video/webm"><source src="${import.meta.env.BASE_URL}videos/browser/${file}.mp4?v=${videoVersions[file]}" type="video/mp4">Video playback is unavailable.</video><figcaption><strong>${label}</strong></figcaption></figure>`;

app.innerHTML = `
<header class="topbar"><div class="brand">REVAMP<span class="brand-divider">/</span><span class="brand-caption">Research demonstrations</span></div><div class="institution-logos" aria-label="Inria and Valeo"><img src="${import.meta.env.BASE_URL}logos/inria.png" alt="Inria"><img src="${import.meta.env.BASE_URL}logos/valeo.png" alt="Valeo"></div></header>
<main id="main">
<header class="paper-header wrap"><p class="eyebrow">Reinforcement learning · Motion planning</p><h1>${paper.title}</h1><p class="authors">${paper.authors.map(authorLink).join('<span> · </span>')}</p><p class="affiliation">INRIA ASTRA team</p></header>
<div class="wrap content">
<section id="method" class="paper-section idea-section">
${heading('01', 'The idea', 'Evaluate the future. Keep the present.', 'A short executed step can hide problems later in a predicted trajectory. REVAMP evaluates that future in a temporary copy of the world, then returns to the original state for a short real step.')}

${figure('pipeline',2400,954,'Planning pipeline.','Comparison of modular, mid-to-mid, and end-to-end driving pipelines. The mid-to-mid module maps structured perception to planned trajectories.')}
<div class="idea-copy method-intro"><p class="idea-summary">Predict a full trajectory. Test it in a temporary world. Learn from what happens. Then execute just one short step and plan again.</p></div>
${figure('lookahead',2400,946,'Reversible lookahead.','The agent’s trajectory feeds real execution and a copied environment. Temporary rollout rewards are aggregated before the copied state is discarded.')}
<div class="case-grid system-videos">${videoCard('direct_demo','Direct')}${videoCard('dream_demo','REVAMP')}</div>
<div class="interface-figures">
${figure('observations',2400,1140,'Observation space.','The ego vehicle observes nearby partners, road geometry, goals, and a reference path within a limited perception area.')}
${figure('actions',2400,1045,'Action interface.','Bézier endpoints and handles define the planned trajectory followed by the ego vehicle.')}
</div>
<div class="method-notes"><div><h3>Continuous action space</h3><p>Eleven normalized policy outputs define two cubic Bézier segments and target speeds. A vehicle controller follows the continuous path.</p></div><div><h3>Reward the whole trajectory</h3><p>Later rollout steps receive greater weight. Progress, alignment, efficiency, and safety contribute to the lookahead reward.</p></div></div>
${figure('network',2047,2400,'Policy network.','Ego, partner, and road features pass through MLP encoders and pooling, a shared projection and LSTM, then action and value heads.','network-figure')}
</section>
<section id="quantitative" class="paper-section">
${heading('02', 'Results', 'Reported performance and ablations.', 'The following graphs summarize the supplied results. Error bars show standard deviation where reported; the full source paper is still needed to verify the values.')}
<div class="metrics-strip results-summary"><div class="metrics-context"><span class="eyebrow">Selected results</span><p>REVAMP compared with Direct Nss = 20</p></div>${paper.headlines.map((h,i)=>`<div class="headline-metric"><span>${h.label}</span><div><s>${i===2?h.before.toFixed(3):h.before.toFixed(2)}${h.unit}</s><span class="metric-arrow">→</span><strong>${i===2?h.after.toFixed(3):h.after.toFixed(2)}${h.unit}</strong></div><small>${h.note}</small></div>`).join('')}</div>
<div class="sub-heading"><h3>Motion planning performance</h3></div>
${resultCharts(directResults,['collision','offroad','dnf','success','alignment','minDist','heading'],tableCaptions.direct)}
<div class="sub-heading"><h3>WOSAC scores</h3></div>
${resultCharts(wosacResults,['realism','kinematic','interactive','map'],tableCaptions.wosac,4)}
<div id="ablations" class="sub-heading"><h3>Lookahead resolution</h3><p>Rollout step size affects throughput and trajectory quality.</p></div>
${resultCharts(resolutionResults,['sps','collision','offroad','dnf','success','alignment'],tableCaptions.resolution)}
</section>
<section id="qualitative" class="paper-section">
${heading('03', 'Model demonstrations', 'Driving scenes and model videos.', 'Demonstrations of Direct Nss = 1, Direct Nss = 20, and REVAMP.')}
<div class="case-grid">${videoCard('demo_nss_1','Direct · Nss = 1')}${videoCard('demo_nss_20','Direct · Nss = 20')}${videoCard('demo_dream','REVAMP')}</div>
</section>
<section id="limitations" class="closing"><p class="eyebrow">Notes & limitations</p><h2>Source verification and next steps</h2><div class="closing-columns"><p>The reported measurements were transcribed from the supplied specification. The full source paper is needed to verify controller gains, reward coefficients, noise scales, and the action decoder’s scale notation.</p><p>The method and qualitative figures and demo videos were supplied separately from the full paper. Adversarial agents remain a direction for future work.</p></div></section>
<section id="citation" class="citation"><div><span class="eyebrow">BUILD ON THIS WORK</span><h2>Reference</h2><p>BibTeX template · publication details pending</p></div><div class="citation-code"><pre><code id="bibtex">@misc{kobbi_revamp,
  title = {${paper.title}},
  author = {Kobbi, Islem and Rocha Goncalves, Tiago
            and Nashashibi, Fawzi},
  note = {Publication details pending}
}</code></pre></div></section>
</div></main><footer class="wrap site-footer"><div class="footer-project"><span class="brand">REVAMP</span><p>Demonstrations accompanying the research article.</p><p class="repo-note">This repository contains the demo website only. Research source code is not included.</p></div><div class="footer-contact"><h2>Contact</h2><p>${paper.authors.map(authorLink).join('<br>')}<br><span>Inria ASTRA team · LinkedIn</span></p></div></footer>`;

// Set the media property explicitly: dynamically inserted markup only sets defaultMuted.
for (const video of document.querySelectorAll<HTMLVideoElement>('.case-card video')) {
  const updateAspectRatio = () => {
    if (video.videoWidth && video.videoHeight) {
      video.closest<HTMLElement>('.case-card')?.style.setProperty('--video-ratio', String(video.videoWidth / video.videoHeight));
    }
  };
  video.addEventListener('loadedmetadata', updateAspectRatio);
  if (video.readyState >= 1) updateAspectRatio();
  const playbackRate = Number(video.dataset.playbackRate) || 1.5;
  video.defaultPlaybackRate = playbackRate;
  video.playbackRate = playbackRate;
  video.muted = true;
  video.defaultMuted = true;
  void video.play().catch(() => {
    // Native controls remain available when autoplay is blocked.
  });
  const sources = [...video.querySelectorAll('source')];
  let failedSources = 0;
  const showError = () => {
    const card = video.closest('figure');
    if (!card || card.querySelector('.video-error')) return;
    const message = document.createElement('p');
    message.className = 'video-error';
    message.textContent = 'This video could not be loaded or decoded. Try refreshing the page or opening it in another browser.';
    card.append(message);
  };
  video.addEventListener('error', showError);
  for (const source of sources) {
    source.addEventListener('error', () => {
      failedSources += 1;
      if (failedSources === sources.length) showError();
    });
  }
  video.addEventListener('loadeddata', () => video.closest('figure')?.querySelector('.video-error')?.remove());
}
