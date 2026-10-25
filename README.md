# Israeli Parties Matrix

A multilingual (English / Russian / Hebrew / Esperanto) matrix of Israeli political parties vs key policy issues
(Palestinian–Israeli conflict, religion & state, governance, economy, society).

## Stack

Vite + vanilla TypeScript, no framework. Static build, deployable to any static host.

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build into dist/
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

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
Live at https://elections-2026.lipu.dev (`public/CNAME`; DNS: Cloudflare CNAME `elections-2026` → `komapc.github.io`, DNS only).

## URLs

Every page has its own address (hash routes, so they work on static hosting):

| URL | Page |
|---|---|
| `#/ru/matrix` | Matrix in Russian |
| `#/en/map/religion/security?show=likely` | Map with chosen axes and tier filter |
| `#/he/matrix?party=raam` | Party card |
| `#/eo/matrix?issue=raam.lgbt` | One party × issue cell |
| `#/en/quiz?a=eB-c` | Quiz with shared answers (one letter per issue: a…e = −2…+2, uppercase = important) |
