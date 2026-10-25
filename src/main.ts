import './style.css';
import aspectsData from './data/aspects.json';
import categoriesData from './data/categories.json';
import metaData from './data/meta.json';
import partiesData from './data/parties.json';
import positionsData from './data/positions.json';
import tiersData from './data/tiers.json';
import { LANGS, initialLang, saveLang, ui } from './i18n';
import { loadCollapsed, saveCollapsed } from './state';
import type { Aspect, Category, Lang, Meta, Party, Position, Tiers } from './types';

const aspects = aspectsData as Aspect[];
const categories = categoriesData as Category[];
const parties = partiesData as Party[];
const positions = positionsData as Position[];
const tiers = tiersData as Tiers[];
const meta = metaData as Meta;

const positionIndex = new Map(positions.map((p) => [`${p.party}/${p.aspect}`, p]));
const partiesByTier = new Map(tiers.map((t) => [t.id, parties.filter((p) => p.tier === t.id)]));

let lang: Lang = initialLang();
const collapsed = loadCollapsed();

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const chevron = (open: boolean) =>
  `<svg class="chevron${open ? ' chevron--open' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Column groups as currently displayed: an expanded tier contributes its parties, a collapsed one a single stub. */
function visibleTiers() {
  return tiers
    .map((t) => ({ tier: t, parties: partiesByTier.get(t.id) ?? [], open: !collapsed.has(`tier:${t.id}`) }))
    .filter((g) => g.parties.length > 0);
}

function renderHeader(): string {
  const buttons = LANGS.map(
    (l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${l.toUpperCase()}</button>`,
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

function renderToolbar(): string {
  const swatches = [-2, -1, 0, 1, 2]
    .map((s) => `<span class="cell legend__swatch" data-score="${s}">${s > 0 ? '+' : ''}${s}</span>`)
    .join('');
  return `
    <div class="toolbar">
      <dl class="facts">
        <div><dt>${ui.election[lang]}</dt><dd>${formatDate(meta.electionDate)}</dd></div>
        <div><dt>${ui.pollsAsOf[lang]}</dt><dd>${formatDate(meta.pollsAsOf)}</dd></div>
      </dl>
      <div class="legend"><span>${ui.legend[lang]}</span>${swatches}</div>
      <div class="bulk">
        <button type="button" class="btn" data-bulk="expand">${ui.expandAll[lang]}</button>
        <button type="button" class="btn" data-bulk="collapse">${ui.collapseAll[lang]}</button>
      </div>
    </div>`;
}

function renderPolls(p: Party): string {
  if (!p.polls) return `<span class="party__polls party__polls--none">${ui.notPolled[lang]}</span>`;
  const { avg, min, max } = p.polls;
  if (max === 0) return `<span class="party__polls party__polls--none">${ui.belowThreshold[lang]}</span>`;
  const range = min === max ? '' : ` <span class="party__range">(${min}–${max})</span>`;
  return `<span class="party__polls" title="${ui.pollTitle[lang]}">~${avg}${range}</span>`;
}

function renderPartyHead(p: Party): string {
  const tooltip = [p.leader?.[lang], p.members?.[lang]].filter(Boolean).join(' · ');
  return `
    <th scope="col" class="party" style="--party:${p.color}" title="${esc(tooltip)}">
      <span class="party__name">${esc(p.name[lang])}</span>
      ${p.name.he ? `<span class="party__he" lang="he" dir="rtl">${esc(p.name.he)}</span>` : ''}
      ${p.leader ? `<span class="party__leader">${esc(p.leader[lang])}</span>` : ''}
      ${renderPolls(p)}
    </th>`;
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
  const groups = visibleTiers();
  const colCount = 1 + groups.reduce((n, g) => n + (g.open ? g.parties.length : 1), 0);

  const tierRow = groups
    .map(
      (g) => `
      <th scope="colgroup" class="tier tier--${g.tier.id}" colspan="${g.open ? g.parties.length : 1}">
        <button type="button" class="toggle" data-toggle="tier:${g.tier.id}" aria-expanded="${g.open}" title="${g.tier.hint[lang]}">
          ${chevron(g.open)}<span>${g.tier.name[lang]}</span><span class="count">${g.parties.length}</span>
        </button>
      </th>`,
    )
    .join('');

  const partyRow = groups
    .map((g) =>
      g.open
        ? g.parties.map(renderPartyHead).join('')
        : `<th scope="col" class="party party--stub" aria-label="${g.tier.name[lang]}"></th>`,
    )
    .join('');

  const body = categories
    .map((cat) => {
      const key = `cat:${cat.id}`;
      const open = !collapsed.has(key);
      const catAspects = aspects.filter((a) => a.category === cat.id);
      const rows = open
        ? catAspects
            .map(
              (a) => `
          <tr>
            <th scope="row" class="aspect">
              <span class="aspect__name">${a.name[lang]}</span>
              <span class="aspect__poles">${a.low[lang]} ↔ ${a.high[lang]}</span>
            </th>
            ${groups
              .map((g) =>
                g.open ? g.parties.map((p) => renderCell(p, a)).join('') : '<td class="cell cell--stub"></td>',
              )
              .join('')}
          </tr>`,
            )
            .join('')
        : '';
      return `
        <tbody>
          <tr class="category">
            <th scope="rowgroup" colspan="${colCount}">
              <button type="button" class="toggle" data-toggle="${key}" aria-expanded="${open}">
                ${chevron(open)}<span>${cat.name[lang]}</span><span class="count">${catAspects.length}</span>
              </button>
            </th>
          </tr>
          ${rows}
        </tbody>`;
    })
    .join('');

  return `
    <div class="matrix-wrap">
      <table class="matrix">
        <thead>
          <tr><th scope="col" class="corner" rowspan="2">${ui.aspect[lang]}</th>${tierRow}</tr>
          <tr>${partyRow}</tr>
        </thead>
        ${body}
      </table>
    </div>`;
}

function render(): void {
  document.documentElement.lang = lang;
  document.title = ui.title[lang];
  const scrollLeft = document.querySelector('.matrix-wrap')?.scrollLeft ?? 0;
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderToolbar()}
      ${renderMatrix()}
    </main>
    <footer class="footer">
      <p>${ui.footer[lang]}</p>
      <p>${ui.minorLists[lang]}</p>
    </footer>`;
  document.querySelector('.matrix-wrap')!.scrollLeft = scrollLeft;
}

const allKeys = () => [...categories.map((c) => `cat:${c.id}`), ...tiers.map((t) => `tier:${t.id}`)];

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  const langBtn = target.closest<HTMLButtonElement>('[data-lang]');
  if (langBtn) {
    lang = langBtn.dataset.lang as Lang;
    saveLang(lang);
    render();
    return;
  }

  const toggle = target.closest<HTMLButtonElement>('[data-toggle]');
  if (toggle) {
    const key = toggle.dataset.toggle!;
    if (collapsed.has(key)) collapsed.delete(key);
    else collapsed.add(key);
  }

  const bulk = target.closest<HTMLButtonElement>('[data-bulk]');
  if (bulk) {
    collapsed.clear();
    if (bulk.dataset.bulk === 'collapse') allKeys().forEach((k) => collapsed.add(k));
  }

  if (toggle || bulk) {
    saveCollapsed(collapsed);
    render();
  }
});

render();
