import './style.css';
import aspectsData from './data/aspects.json';
import blocsData from './data/blocs.json';
import categoriesData from './data/categories.json';
import metaData from './data/meta.json';
import partiesData from './data/parties.json';
import positionsData from './data/positions.json';
import tiersData from './data/tiers.json';
import { LANGS, initialLang, saveLang, ui } from './i18n';
import { loadCollapsed, saveCollapsed } from './state';
import type { Aspect, Bloc, Category, Lang, Meta, Party, Position, Tiers } from './types';

const aspects = aspectsData as Aspect[];
const categories = categoriesData as Category[];
const parties = partiesData as Party[];
const positions = positionsData as Position[];
const tiers = tiersData as Tiers[];
const meta = metaData as Meta;
const blocs = blocsData as Bloc[];

const positionIndex = new Map(positions.map((p) => [`${p.party}/${p.aspect}`, p]));
const partyById = new Map(parties.map((p) => [p.id, p]));
const aspectById = new Map(aspects.map((a) => [a.id, a]));
const blocOrder = (p: Party) => blocs.findIndex((b) => b.id === p.bloc);
/** Within a tier, cluster parties by bloc, then by projected seats. */
const partiesByTier = new Map(
  tiers.map((t) => [
    t.id,
    parties
      .filter((p) => p.tier === t.id)
      .sort((a, b) => blocOrder(a) - blocOrder(b) || (b.polls?.avg ?? 0) - (a.polls?.avg ?? 0)),
  ]),
);

let lang: Lang = initialLang();
// By default every issue category starts collapsed; party tiers stay open.
const collapsed = loadCollapsed(categories.map((c) => `cat:${c.id}`));

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

/** Five-step position marker: ticks for -2..+2 with the party's score as a dot. */
function track(score: number | null, wide = false): string {
  if (score === null) return `<span class="track track--none${wide ? ' track--wide' : ''}">—</span>`;
  const ticks = [-2, -1, 0, 1, 2].map((s) => `<i${s === score ? ' class="on"' : ''}></i>`).join('');
  return `<span class="track${wide ? ' track--wide' : ''}" aria-label="${score > 0 ? '+' : ''}${score}">${ticks}</span>`;
}

function renderToolbar(): string {
  return `
    <div class="toolbar">
      <dl class="facts">
        <div><dt>${ui.election[lang]}</dt><dd>${formatDate(meta.electionDate)}</dd></div>
        <div><dt>${ui.pollsAsOf[lang]}</dt><dd>${formatDate(meta.pollsAsOf)}</dd></div>
      </dl>
      ${renderBlocs()}
      <div class="legend">${track(1)}<span>${ui.legendHint[lang]}</span></div>
      <div class="bulk">
        <button type="button" class="btn" data-bulk="expand">${ui.expandAll[lang]}</button>
        <button type="button" class="btn" data-bulk="collapse">${ui.collapseAll[lang]}</button>
      </div>
    </div>`;
}

/** Seat totals per bloc, counting only parties expected to pass. */
function renderBlocs(): string {
  const chips = blocs
    .map((b) => {
      const seats = parties
        .filter((p) => p.bloc === b.id && p.tier === 'likely')
        .reduce((n, p) => n + (p.polls?.avg ?? 0), 0);
      return `<span class="bloc-chip bloc-chip--${b.id}"><i></i>${b.name[lang]} <b>~${seats}</b></span>`;
    })
    .join('');
  return `<div class="blocs"><span class="blocs__label">${ui.blocs[lang]}</span>${chips}</div>`;
}

function renderPolls(p: Party): string {
  if (!p.polls) return `<span class="party__polls party__polls--none">${ui.notPolled[lang]}</span>`;
  const { avg, min, max } = p.polls;
  if (max === 0) return `<span class="party__polls party__polls--none">${ui.belowThreshold[lang]}</span>`;
  const range = min === max ? '' : ` <span class="party__range">(${min}–${max})</span>`;
  return `<span class="party__polls" title="${ui.pollTitle[lang]}">~${avg}${range}</span>`;
}

const blocOf = (p: Party) => blocs.find((b) => b.id === p.bloc)!;

function renderPartyHead(p: Party): string {
  return `
    <th scope="col" class="party party--${p.bloc}">
      <button type="button" class="party__btn" data-party="${p.id}" title="${esc(p.summary?.[lang] ?? '')}">
        <span class="party__name">${esc(p.name[lang])}</span>
        ${p.name.he ? `<span class="party__he" lang="he" dir="rtl">${esc(p.name.he)}</span>` : ''}
        ${p.leader ? `<span class="party__leader">${esc(p.leader[lang])}</span>` : ''}
        ${renderPolls(p)}
        <span class="party__bloc"><i></i>${blocOf(p).short[lang]}</span>
      </button>
    </th>`;
}

function renderCell(party: Party, aspect: Aspect): string {
  const pos = positionIndex.get(`${party.id}/${aspect.id}`);
  if (!pos) return `<td class="cell" title="${ui.noPosition[lang]}">${track(null)}</td>`;
  const title = esc(pos.note?.[lang] ?? ui.noPosition[lang]);
  return `<td class="cell cell--link" data-cell="${party.id}/${aspect.id}" tabindex="0" role="button" title="${title}">${track(pos.score)}</td>`;
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

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function sourceLinks(urls: string[] = []): string {
  if (urls.length === 0) return '';
  const items = urls
    .map((u) => `<a class="src" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(hostname(u))}</a>`)
    .join('');
  return `<div class="srcs">${items}</div>`;
}

function scoreLabel(pos: Position, aspect: Aspect): string {
  if (pos.score === null) return ui.noPosition[lang];
  if (pos.score === 0) return ui.mixed[lang];
  const pole = pos.score < 0 ? aspect.low[lang] : aspect.high[lang];
  return Math.abs(pos.score) === 2 ? pole : `${ui.leans[lang]} ${pole.toLowerCase()}`;
}

function showDialog(html: string): void {
  const dialog = document.querySelector<HTMLDialogElement>('#details')!;
  dialog.innerHTML = `<form method="dialog" class="details">${html}</form>`;
  dialog.showModal();
  dialog.scrollTop = 0;
}

const closeButton = () =>
  `<button class="details__close" value="close" aria-label="${ui.close[lang]}">×</button>`;

function issueBlock(pos: Position, aspect: Aspect, heading: string): string {
  return `
    <div class="issue">
      ${heading}
      <div class="issue__scale">
        <span>${aspect.low[lang]}</span>${track(pos.score, true)}<span>${aspect.high[lang]}</span>
      </div>
      <p class="issue__verdict">${scoreLabel(pos, aspect)}</p>
      ${pos.note ? `<p class="issue__note">${esc(pos.note[lang])}</p>` : ''}
      ${sourceLinks(pos.sources)}
    </div>`;
}

function openDetails(key: string): void {
  const pos = positionIndex.get(key);
  if (!pos) return;
  const party = partyById.get(pos.party)!;
  const aspect = aspectById.get(pos.aspect)!;
  showDialog(`
    <header class="details__head details__head--${party.bloc}">
      <div>
        <button type="button" class="details__party" data-party="${party.id}">${esc(party.name[lang])} →</button>
        <h2>${aspect.name[lang]}</h2>
      </div>
      ${closeButton()}
    </header>
    ${issueBlock(pos, aspect, '')}`);
}

function openParty(id: string): void {
  const p = partyById.get(id);
  if (!p) return;
  const issues = categories
    .map((cat) => {
      const rows = aspects
        .filter((a) => a.category === cat.id)
        .map((a) => {
          const pos = positionIndex.get(`${p.id}/${a.id}`);
          return pos ? issueBlock(pos, a, `<h4>${a.name[lang]}</h4>`) : '';
        })
        .join('');
      return `<section><h3>${cat.name[lang]}</h3>${rows}</section>`;
    })
    .join('');
  const facts = [
    p.leader && `<div><dt>${ui.leader[lang]}</dt><dd>${esc(p.leader[lang])}</dd></div>`,
    p.members && `<div><dt>${ui.members[lang]}</dt><dd>${esc(p.members[lang])}</dd></div>`,
    `<div><dt>${ui.seatsShort[lang]}</dt><dd>${renderPolls(p)}</dd></div>`,
  ]
    .filter(Boolean)
    .join('');
  showDialog(`
    <header class="details__head details__head--${p.bloc}">
      <div>
        <h2>${esc(p.name[lang])}</h2>
        ${p.name.he ? `<p class="details__he" lang="he" dir="rtl">${esc(p.name.he)}</p>` : ''}
      </div>
      ${closeButton()}
    </header>
    ${p.summary ? `<p class="details__summary">${esc(p.summary[lang])}</p>` : ''}
    <dl class="details__facts">${facts}</dl>
    <div class="details__bloc bloc-chip--${p.bloc}">
      <p><i></i><b>${blocOf(p).name[lang]}</b>${p.blocNote ? ` — ${esc(p.blocNote[lang])}` : ''}</p>
      ${sourceLinks(p.blocSources)}
    </div>
    ${issues}`);
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
    </footer>
    <dialog id="details"></dialog>`;
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

  const partyBtn = target.closest<HTMLElement>('[data-party]');
  if (partyBtn) {
    e.preventDefault();
    openParty(partyBtn.dataset.party!);
    return;
  }

  const cell = target.closest<HTMLElement>('[data-cell]');
  if (cell) {
    openDetails(cell.dataset.cell!);
    return;
  }

  const dialog = target.closest('dialog');
  if (dialog && target === dialog) {
    (dialog as HTMLDialogElement).close(); // backdrop click
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

document.addEventListener('keydown', (e) => {
  const cell = (e.target as HTMLElement).closest?.<HTMLElement>('[data-cell]');
  if (cell && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    openDetails(cell.dataset.cell!);
  }
});

render();
