# REVAMP research overview

A static Vite and TypeScript page summarizing REVAMP's reversible lookahead method and reported results as static graphs. The page has no interactive demos, controls, or playback. The result plots and policy architecture flow are static. Five supplied videos are loaded from `public/videos/`: `direct_demo.mp4` and `dream_demo.mp4` below the system diagram, followed by `demo_nss_1.mp4`, `demo_nss_20.mp4`, and `demo_dream.mp4` below the qualitative comparison.

## Run

Requires Node 20.19+ or Node 22+.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. To create the deployable `dist/` directory, run `npm run build`.

## Source and limitations

Reported measurements in `src/data/results.ts` were transcribed from the supplied `prmpt.txt`. The full source paper was not available, so these values have not been independently verified against it. The action decoder's scale notation, controller gains, reward coefficients, and noise scales also need PDF verification. The supplied PDF diagrams are rendered as PNG assets in `public/figures/`. They cover the pipeline, reversible lookahead, observations, actions, and policy network. The supplied qualitative comparison is displayed before the demo videos; its column-to-model mapping remains unspecified. 

## Browser video formats

The site loads WebM (VP8) videos with an H.264 MP4 fallback from `public/videos/browser/`. Both versions use 15 fps and YUV 4:2:0 pixel format; MP4s include fast-start metadata. Original uploads remain in `public/videos/`.
