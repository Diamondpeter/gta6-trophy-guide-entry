# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Diamondpeter/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Diamondpeter/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI**: every trophy with its official name, description and grade, a checklist saved in the browser, export and import of progress, filters by kind (story, missable, collectibles, activities, online and more), a spoiler setting that hides story trophies until they are earned, a five-stage roadmap to the platinum built from the official descriptions, the one missable trophy flagged, and a guide to each trophy in our own words, with its sources cited beside it.

This repository is an entry in make.fun's bounty **"Build the best GTA 6 trophy guide"** ($250 in USDC, deadline Sat 21 November 2026, 12:00 Africa/Lagos). It works with the network off: open `app/index.html` in a desktop browser, or serve `app/` with any static file server.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the guide, with 13 of 55 trophies earned as a demo, is seeded only when you open it with `?demo=1`.

To hand the entry in exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` first checks the entry is whole (the guide's front page exists, 3 or 4 screenshots inside the 256 KiB cap), then copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## What's inside

- `app/` — the guide itself: `index.html`, `css/`, `js/` and `app/data/trophies.json` (the official 55-trophy list with a guide to each).
- `app/data/trophies.json` — one item per trophy: official name, description and grade, hidden flag, kind, missable flag, roadmap stage, PSN count where one exists, a `confirmed: false` flag on the five trophies whose trigger no published guide has verified yet, and a guide in our own words with its sources.
- `app/js/` — `main.js` (boot, toolbar, tabs, routing), `views.js` (checklist and detail pane, roadmap, missables, Next-up planner, save page), `store.js` (localStorage progress, export/import with id validation), `filters.js` (search, kind, grade, earned-only, spoiler rule) and `data.js` (trophy loading, kind labels, roadmap stages).
- `screenshots/` — 4 renders of the guide in use (checklist with a guide open, roadmap, missables, planner).
- `main.ts` — Node 22, standard library only. It copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.
- `serve.ts` — a tiny static server for trying the guide locally.

## Sources

Trophy names, descriptions, grades and PSN counts come from the official list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Every guide is written in our own words for this entry and cites its sources beside it; where no published guide has verified a trigger yet, the guide says so plainly instead of inventing one. No Rockstar logo or official artwork is used anywhere — the look is our own.

## License

MIT — see [LICENSE](LICENSE).
