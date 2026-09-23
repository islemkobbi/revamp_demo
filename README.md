# REVAMP — Research Demonstrations

<p>
  <img src="public/logos/inria.png" alt="Inria" height="40">&nbsp;&nbsp;&nbsp;
  <img src="public/logos/valeo.png" alt="Valeo" height="40">
</p>

This repository hosts the demonstration website accompanying **REVAMP: Reversible Lookahead for Mid-to-Mid Reinforcement Learning Motion Planning**, by **Islem Kobbi, Tiago Rocha Goncalves, and Fawzi Nashashibi**.

**This is a demo-only repository. It does not contain the research source code, training pipeline, trained models, or experiment-reproduction code.** The source files here implement the presentation website and its visualizations.

## About REVAMP

REVAMP evaluates predicted driving trajectories through a reversible lookahead. Agents advance in a temporary copy of the environment, where future outcomes contribute to the learning reward. The temporary state is then discarded, while real execution retains a short step before replanning.

The approach combines structured observations, a continuous trajectory action interface, and a recurrent policy to connect reinforcement learning with motion planning.

## What the website presents

- The driving pipeline, reversible lookahead mechanism, observation and action spaces, and policy architecture.
- Graphs summarizing motion planning performance, WOSAC scores, and lookahead resolution experiments.
- Videos illustrating Direct baselines and REVAMP.

The website is supplementary visual material for the article. Refer to the article for the complete methodology, experimental protocol, and interpretation of the results.

## Run the demo website locally

Requires Node.js 20.19+ or 22+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To build the website for hosting:

```sh
npm run build
npm run preview
```

The generated `dist/` directory contains the deployable site. Asset paths support hosting under a repository subpath.

## Website assets

Figures and institutional logos are stored in `public/figures/` and `public/logos/`. Videos are supplied in WebM and MP4 formats under `public/videos/browser/`; original recordings remain in `public/videos/`. Reported measurements used by the graphs are stored in `src/data/results.ts`.

## Contact

- [Islem Kobbi](https://www.linkedin.com/in/islem-kobbi/)
- [Tiago Rocha Goncalves](https://www.linkedin.com/in/tiagorochag/)
- [Fawzi Nashashibi](https://www.linkedin.com/in/fawzi-nashashibi-3a50ab10/)
