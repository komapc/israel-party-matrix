# Israeli Parties Matrix

A bilingual (English / Russian) matrix of Israeli political parties vs key policy issues
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
| `parties.json` | Parties: names (en/ru/he), leader, seats, color |
| `positions.json` | One entry per party × issue: `score` (-2…2 or `null`), note, sources |

Scores describe *where* a party sits between the two poles, not whether that is good or bad.
Every position should cite at least one source.
