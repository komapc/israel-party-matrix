// Draws the preview cards for shared quiz results (public/og/<party>.png), one per party, language-neutral:
// the sentence ("closest party: …") is in each page's og:title. Run by hand after party names change:
//   node scripts/og-results.mjs
// The images are committed rather than built in CI, so they don't depend on the runner's Hebrew fonts.
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const parties = JSON.parse(await readFile('src/data/parties.json', 'utf8'));
const COLORS = { pro: '#3987e5', anti: '#eb6834', other: '#8a8984' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const card = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; width: 1200px; height: 630px; background: #141413; color: #f0efec; overflow: hidden;
    font-family: Inter, 'Noto Sans Hebrew', 'Noto Sans', system-ui, sans-serif; position: relative; }
  .bar { position: absolute; inset: 0 auto 0 0; width: 18px; background: ${COLORS[p.bloc]}; }
  main { position: absolute; left: 80px; right: 80px; top: 64px; bottom: 130px; display: flex; flex-direction: column; }
  .k { margin: 0; font-size: 24px; letter-spacing: .14em; text-transform: uppercase; color: #8f8e88; }
  .q { margin: 18px 0 0; font-size: 34px; color: #c3c2b7; }
  .q span { color: ${COLORS[p.bloc]}; }
  h1 { margin: 28px 0 0; font-size: ${p.name.en.length > 22 ? 72 : 104}px;
    line-height: 1.02; font-weight: 800; letter-spacing: -.02em; }
  .names { margin: auto 0 0; font-size: 30px; color: #c3c2b7; display: flex; flex-wrap: wrap; gap: 4px 28px; }
  .url { position: absolute; left: 80px; bottom: 60px; margin: 0; font-size: 26px; color: #8f8e88; }
  .cta { position: absolute; right: 70px; bottom: 54px; margin: 0; padding: 14px 26px; border-radius: 999px;
    background: #f0efec; color: #141413; font-size: 26px; font-weight: 700; }
</style></head><body>
  <div class="bar"></div>
  <main>
    <p class="k">Israel Election 2026 · Quiz</p>
    <p class="q">Closest party <span>●</span> הכי קרובה <span>●</span> Ближе всего</p>
    <h1>${esc(p.name.en)}</h1>
    <p class="names"><span dir="rtl" lang="he">${esc(p.name.he)}</span><span>${esc(p.name.ru)}</span></p>
  </main>
  <p class="url">elections-2026.lipu.dev</p>
  <p class="cta">Your match? →</p>
</body></html>`;

await mkdir('public/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of parties) {
  await page.setContent(card(p));
  await page.screenshot({ path: `public/og/${p.id}.png` });
}
await browser.close();
console.log(`drew ${parties.length} result cards`);
