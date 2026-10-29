# Israeli Parties Matrix

A multilingual (English / Russian / Ukrainian / Belarusian / Hebrew / Esperanto) matrix of Israeli political parties vs key policy issues
(Palestinian–Israeli conflict, religion & state, governance, economy, society).

## Stack

Vite + vanilla TypeScript, no framework. Static build, deployable to any static host.

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build into dist/, then prerender every page (Playwright)
```

## Data

All content lives in `src/data/` as JSON; the schema is in `src/types.ts`.

| File | Contents |
|---|---|
| `categories.json` | Issue groups (security, state & religion, …) |
| `aspects.json` | Issues. Each has a `low` and `high` pole; scores run -2 … +2 between them |
| `tiers.json` | Party groups by chance of crossing the 3.25% threshold |
| `parties.json` | Lists on the ballot: names (en/ru/he), leader, member parties, tier, poll range |
| `blocs.json` | Stance toward a Netanyahu-led government (pro / anti / other) |
| `meta.json` | Election date, poll snapshot date, poll sources |
| `positions.json` | One entry per party × issue: `score` (-2…2 or `null`), note, sources |

Scores describe *where* a party sits between the two poles, not whether that is good or bad.
Every position should cite at least one source.

### Election results

`meta.json` → `resultsSource` is the Central Elections Committee's results page; the toolbar links to it
("Official results") without copying any numbers.

Once votes are counted, switch the site from polls to results — no code changes:

1. In `meta.json` add `"results": { "asOf": "2026-10-28", "final": false, "source": "<CEC results URL>" }`.
2. In `parties.json` give every party `"result": { "seats": 24, "pct": 19.8 }` (`seats: 0` = below threshold).

Tiers then follow the results (elected / not elected; while `final` is `false`, a list within 0.15 points of
3.25% shows as "too close to call"), and seat counts, bloc totals, the "as of" line and the FAQ answers switch
to results. Set `final: true` when the count is official.

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
Live at https://elections-2026.lipu.dev (`public/CNAME`; DNS: Cloudflare CNAME `elections-2026` → `komapc.github.io`, DNS only).

## URLs

Every page has its own path. `npm run build` prerenders each one (all languages) into static HTML with its own
title, description, canonical, hreflang alternates and Open Graph tags, and writes `sitemap.xml`;
`404.html` is the app shell for anything else (e.g. single cells), routed on the client.

| URL | Page |
|---|---|
| `/ru/` | Matrix in Russian |
| `/en/map/religion/security/?show=likely` | Map with chosen axes and tier filter |
| `/he/party/raam/` | Party card |
| `/eo/party/raam/lgbt/` | One party × issue cell |
| `/uk/quiz/?a=eB-c` | Quiz with shared answers (one letter per issue: a…e = −2…+2, uppercase = important) |

Old hash links (`#/ru/matrix?party=raam`) still work.
