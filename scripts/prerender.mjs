// Renders every page of the built site to static HTML so search engines and link previews
// (Telegram, WhatsApp, Facebook) see real content and per-page meta tags. Also writes sitemap.xml.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';

const SITE = 'https://elections-2026.lipu.dev';
const DIST = 'dist';
const data = async (name) => JSON.parse(await readFile(`src/data/${name}.json`, 'utf8'));

const i18n = await readFile('src/i18n.ts', 'utf8');
const LANGS = JSON.parse(i18n.match(/export const LANGS: Lang\[] = (\[.*?]);/)[1].replace(/'/g, '"'));
const parties = (await data('parties')).map((p) => p.id);
const dims = (await data('dimensions')).map((d) => d.id);

/** Page paths without the language prefix; each exists in every language. */
const pages = ['/', '/quiz/', ...parties.map((p) => `/party/${p}/`)];
for (const x of dims) for (const y of dims) if (x !== y) pages.push(`/map/${x}/${y}/`);

// Unknown paths (e.g. single issue cells) fall back to the app shell, which routes on the client.
await copyFile(join(DIST, 'index.html'), join(DIST, '404.html'));

const server = await preview({ preview: { port: 4180, strictPort: true }, logLevel: 'warn' });
const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'en-US' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

async function snapshot(url, file, page) {
  await page.goto(`http://localhost:4180${url}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#app main');
  const html = await page.content();
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const urls = [];
for (const lang of LANGS) {
  for (const p of pages) {
    const url = `/${lang}${p}`;
    await snapshot(url, join(DIST, url, 'index.html'), page);
    urls.push(url);
  }
}
// The bare root is the English matrix (its canonical points to /en/). A fresh page, so the language
// remembered from the pages above doesn't leak into it.
const fresh = await browser.newPage({ locale: 'en-US' });
fresh.on('pageerror', (e) => errors.push(e.message));
await snapshot('/', join(DIST, 'index.html'), fresh);

await browser.close();
await new Promise((resolve) => server.httpServer.close(resolve));
if (errors.length) {
  console.error(errors);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const entry = (p) => {
  const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${p}"/>`);
  alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${p}"/>`);
  return LANGS.map(
    (l) => `  <url>\n    <loc>${SITE}/${l}${p}</loc>\n    <lastmod>${today}</lastmod>\n${alts.join('\n')}\n  </url>`,
  ).join('\n');
};
await writeFile(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(entry).join('\n')}
</urlset>
`,
);
console.log(`prerendered ${urls.length + 1} pages, sitemap with ${urls.length} urls`);
