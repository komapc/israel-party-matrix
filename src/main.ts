import './style.css';
import aspectsData from './data/aspects.json';
import categoriesData from './data/categories.json';
import partiesData from './data/parties.json';
import positionsData from './data/positions.json';
import { LANGS, initialLang, saveLang, ui } from './i18n';
import type { Aspect, Category, Lang, Party, Position } from './types';

const aspects = aspectsData as Aspect[];
const categories = categoriesData as Category[];
const parties = partiesData as Party[];
const positions = positionsData as Position[];

const positionIndex = new Map(positions.map((p) => [`${p.party}/${p.aspect}`, p]));

let lang: Lang = initialLang();

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function renderHeader(): string {
  const buttons = LANGS.map(
    (l) =>
      `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${l.toUpperCase()}</button>`,
  ).join('');
  return `
    <header class="masthead">
      <div>
        <h1>${ui.title[lang]}</h1>
        <p class="subtitle">${ui.subtitle[lang]}</p>
      </div>
      <div class="lang-switch" role="group" aria-label="Language">${buttons}</div>
    </header>`;
}

function renderCell(party: Party, aspect: Aspect): string {
  const pos = positionIndex.get(`${party.id}/${aspect.id}`);
  if (!pos || pos.score === null) {
    return `<td class="cell cell--none" title="${ui.noPosition[lang]}">—</td>`;
  }
  const title = pos.note ? esc(pos.note[lang]) : '';
  return `<td class="cell" data-score="${pos.score}" title="${title}">${pos.score > 0 ? '+' : ''}${pos.score}</td>`;
}

function renderMatrix(): string {
  const head = parties
    .map(
      (p) => `
      <th scope="col" class="party" style="--party:${p.color}">
        <span class="party__name">${esc(p.name[lang])}</span>
        <span class="party__he" lang="he" dir="rtl">${esc(p.name.he)}</span>
        ${p.seats ? `<span class="party__seats">${p.seats} ${ui.seats[lang]}</span>` : ''}
      </th>`,
    )
    .join('');

  const body = categories
    .map((cat) => {
      const rows = aspects
        .filter((a) => a.category === cat.id)
        .map(
          (a) => `
          <tr>
            <th scope="row" class="aspect">
              <span class="aspect__name">${a.name[lang]}</span>
              <span class="aspect__poles">${a.low[lang]} ↔ ${a.high[lang]}</span>
            </th>
            ${parties.map((p) => renderCell(p, a)).join('')}
          </tr>`,
        )
        .join('');
      return `
        <tbody>
          <tr class="category"><th scope="rowgroup" colspan="${parties.length + 1}">${cat.name[lang]}</th></tr>
          ${rows}
        </tbody>`;
    })
    .join('');

  return `
    <div class="matrix-wrap">
      <table class="matrix">
        <thead><tr><th scope="col" class="corner">${ui.aspect[lang]}</th>${head}</tr></thead>
        ${body}
      </table>
    </div>
    ${parties.length === 0 ? `<p class="empty">${ui.empty[lang]}</p>` : ''}`;
}

function renderLegend(): string {
  const swatches = [-2, -1, 0, 1, 2]
    .map((s) => `<span class="cell legend__swatch" data-score="${s}">${s > 0 ? '+' : ''}${s}</span>`)
    .join('');
  return `<div class="legend"><span>${ui.legend[lang]}</span>${swatches}</div>`;
}

function render(): void {
  document.documentElement.lang = lang;
  document.title = ui.title[lang];
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderLegend()}
      ${renderMatrix()}
    </main>
    <footer class="footer">${ui.footer[lang]}</footer>`;
}

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-lang]');
  if (!btn) return;
  lang = btn.dataset.lang as Lang;
  saveLang(lang);
  render();
});

render();
