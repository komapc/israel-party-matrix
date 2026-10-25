import './style.css';
import {
  aspectById,
  aspects,
  blocOf,
  blocs,
  categories,
  esc,
  meta,
  parties,
  partyById,
  positionIndex,
  tiers,
} from './data';
import { initAnalytics, track } from './analytics';
import { HEADINGS, intro, renderFaq, subtitle } from './faq';
import { LANGS, LANG_LABELS, formatDateIn, initialLang, isRtl, saveLang, ui } from './i18n';
import { renderMap } from './map';
import { answers, loadAnswers, renderQuiz, resetQuiz, setAnswer, toggleImportant } from './quiz';
import { DEFAULT_MAP, type Route, VIEWS, decodeAnswers, encodeAnswers, formatRoute, parseRoute } from './route';
import { updateHead } from './seo';
import { loadCollapsed, saveCollapsed } from './state';
import type { Aspect, Lang, Party, Position, Score, Tier } from './types';

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

const HOME: Route = { lang: initialLang(), view: 'matrix', ...DEFAULT_MAP };
let route: Route = HOME;
let lang: Lang = route.lang;
// By default every issue category starts collapsed; party tiers stay open.
const collapsed = loadCollapsed(categories.map((c) => `cat:${c.id}`));

const chevron = (open: boolean) =>
  `<svg class="chevron${open ? ' chevron--open' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const formatDate = (iso: string) => formatDateIn(lang, iso);

/** Column groups as currently displayed: an expanded tier contributes its parties, a collapsed one a single stub. */
function visibleTiers() {
  return tiers
    .map((t) => ({ tier: t, parties: partiesByTier.get(t.id) ?? [], open: !collapsed.has(`tier:${t.id}`) }))
    .filter((g) => g.parties.length > 0);
}

/** The page's own heading: the party on a party page, else the view. */
function heading(): string {
  const id = route.party ?? route.issue?.split('/')[0];
  const party = id && partyById.get(id);
  if (party) return esc(HEADINGS.party[lang].replace('{party}', party.name[lang]));
  return HEADINGS[route.view][lang];
}

function renderHeader(): string {
  const buttons = LANGS.map(
    (l) => `<button type="button" data-lang="${l}" lang="${l}" aria-pressed="${l === lang}">${LANG_LABELS[l]}</button>`,
  ).join('');
  return `
    <header class="masthead">
      <div>
        <h1>${heading()}</h1>
        <p class="subtitle">${subtitle(lang)}</p>
      </div>
      <div class="lang-switch" role="group" aria-label="Language">${buttons}</div>
    </header>`;
}

const MARKS: Record<number, { glyph: string; kind: string }> = {
  2: { glyph: '✓✓', kind: 'yes' },
  1: { glyph: '✓', kind: 'yes' },
  0: { glyph: '~', kind: 'mixed' },
  [-1]: { glyph: '✗', kind: 'no' },
  [-2]: { glyph: '✗✗', kind: 'no' },
};

/** Stance on the aspect's claim: ✓ supports, ✗ opposes, doubled when strong. */
function mark(score: number | null): string {
  if (score === null) return `<span class="mark mark--none">—</span>`;
  const m = MARKS[score];
  return `<span class="mark mark--${m.kind}" aria-label="${stanceLabel(score)}">${m.glyph}</span>`;
}

function stanceLabel(score: number | null): string {
  if (score === null) return ui.noPosition[lang];
  return ui.stance[lang][score + 2];
}

function renderToolbar(): string {
  return `
    <div class="toolbar">
      <dl class="facts">
        <div><dt>${ui.election[lang]}</dt><dd>${formatDate(meta.electionDate)}</dd></div>
        <div><dt>${ui.pollsAsOf[lang]}</dt><dd>${formatDate(meta.pollsAsOf)}</dd></div>
      </dl>
      ${renderBlocs()}
      <div class="legend">${[2, 1, 0, -1, -2]
        .map((n) => `<span class="legend__item">${mark(n)} ${stanceLabel(n)}</span>`)
        .join('')}</div>
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

function renderPartyHead(p: Party): string {
  return `
    <th scope="col" class="party party--${p.bloc}">
      <button type="button" class="party__btn" data-party="${p.id}" title="${esc(p.summary?.[lang] ?? '')}">
        <span class="party__name">${esc(p.name[lang])}</span>
        ${lang !== 'he' ? `<span class="party__he" lang="he" dir="rtl">${esc(p.name.he)}</span>` : ''}
        ${p.leader ? `<span class="party__leader">${esc(p.leader[lang])}</span>` : ''}
        ${renderPolls(p)}
        <span class="party__bloc"><i></i>${blocOf(p).short[lang]}</span>
      </button>
    </th>`;
}

function renderCell(party: Party, aspect: Aspect): string {
  const pos = positionIndex.get(`${party.id}/${aspect.id}`);
  if (!pos) return `<td class="cell" title="${ui.noPosition[lang]}">${mark(null)}</td>`;
  const title = esc(pos.note?.[lang] ?? ui.noPosition[lang]);
  return `<td class="cell cell--link" data-cell="${party.id}/${aspect.id}" tabindex="0" role="button" title="${title}">${mark(pos.score)}</td>`;
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
              <span class="aspect__name">${a.claim[lang]}</span>
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
    <p class="scroll-hint">${ui.scrollHint[lang]}</p>
    <div class="matrix-box">
    <div class="matrix-wrap">
      <table class="matrix">
        <thead>
          <tr><th scope="col" class="corner" rowspan="2">${ui.aspect[lang]}</th>${tierRow}</tr>
          <tr>${partyRow}</tr>
        </thead>
        ${body}
      </table>
    </div>
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

function showDialog(html: string): void {
  const dialog = document.querySelector<HTMLDialogElement>('#details')!;
  dialog.innerHTML = `<form method="dialog" class="details">${html}</form>`;
  dialog.showModal();
  dialog.scrollTop = 0;
}

const closeButton = () =>
  `<button class="details__close" value="close" aria-label="${ui.close[lang]}">×</button>`;

function issueBlock(pos: Position, heading: string): string {
  return `
    <div class="issue">
      ${heading}
      <p class="issue__verdict">${mark(pos.score)} ${stanceLabel(pos.score)}</p>
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
        <h2>${aspect.claim[lang]}</h2>
      </div>
      ${closeButton()}
    </header>
    ${issueBlock(pos, '')}`);
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
          return pos ? issueBlock(pos, `<h4>${a.claim[lang]}</h4>`) : '';
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
        ${lang !== 'he' ? `<p class="details__he" lang="he" dir="rtl">${esc(p.name.he)}</p>` : ''}
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

/** URL of another page, with any open card closed. */
const link = (patch: Partial<Route>) =>
  formatRoute({ ...route, party: undefined, issue: undefined, answers: undefined, ...patch });

type View = Route['view'];

function renderTabs(view: View): string {
  const label: Record<View, string> = { matrix: ui.tabMatrix[lang], map: ui.tabMap[lang], quiz: ui.tabQuiz[lang] };
  return `
    <nav class="tabs" aria-label="Views">
      ${VIEWS.map((v) => `<a class="tab" href="${link({ view: v })}" ${v === view ? 'aria-current="page"' : ''}>${label[v]}</a>`).join('')}
    </nav>`;
}

function renderView(view: View): string {
  if (view === 'map') return renderMap(lang, route, (x, y) => link({ x, y }));
  if (view === 'quiz') return renderQuiz(lang, link({ view: 'map' }));
  const faqLinks = { quiz: link({ view: 'quiz' }), map: link({ view: 'map' }), report: `${REPO}/issues/new` };
  return `<p class="intro">${intro(lang, link({ view: 'quiz' }))}</p>${renderToolbar()}${renderMatrix()}${renderFaq(lang, faqLinks)}`;
}

const REPO = 'https://github.com/komapc/israel-party-matrix';

function renderFooter(): string {
  const label: Record<View, string> = { matrix: ui.tabMatrix[lang], map: ui.tabMap[lang], quiz: ui.tabQuiz[lang] };
  return `
    <footer class="footer">
      <div class="footer__grid">
        <div class="footer__brand">
          <b>${ui.title[lang]}</b>
          <p>${ui.footAbout[lang]}</p>
          <p>${ui.pollsAsOf[lang]} ${formatDate(meta.pollsAsOf)}</p>
        </div>
        <nav aria-label="${ui.footViews[lang]}">
          <h3>${ui.footViews[lang]}</h3>
          <ul>${VIEWS.map((v) => `<li><a href="${link({ view: v })}">${label[v]}</a></li>`).join('')}</ul>
        </nav>
        <nav aria-label="${ui.footProject[lang]}">
          <h3>${ui.footProject[lang]}</h3>
          <ul>
            <li><a href="${REPO}" rel="noopener">${ui.footSource[lang]}</a></li>
            <li><a href="${REPO}/issues/new" rel="noopener">${ui.footReport[lang]}</a></li>
            <li><a href="https://lipu.dev/">${ui.footMore[lang]}</a></li>
          </ul>
        </nav>
      </div>
      <div class="footer__notes">
        <p>${ui.footer[lang]}</p>
        <p>${ui.minorLists[lang]}</p>
        <p>${ui.footAnalytics[lang]}</p>
      </div>
    </footer>`;
}

function render(): void {
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  const view = route.view;
  const scrollLeft = document.querySelector('.matrix-wrap')?.scrollLeft ?? 0;
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    ${renderHeader()}
    ${renderTabs(view)}
    <main class="view view--${view}">
      ${renderView(view)}
    </main>
    ${renderFooter()}
    <dialog id="details"></dialog>`;
  const wrap = document.querySelector('.matrix-wrap');
  if (wrap) wrap.scrollLeft = scrollLeft;
  updateScrollCue();
}

/** Fades the table's far edge while more parties are hidden past it (on phones most of them are). */
function updateScrollCue(): void {
  const wrap = document.querySelector('.matrix-wrap');
  if (!wrap) return;
  const hidden = wrap.scrollWidth - wrap.clientWidth - Math.abs(wrap.scrollLeft); // scrollLeft is negative in RTL
  wrap.parentElement!.classList.toggle('matrix-box--more', hidden > 4);
}

/** Syncs the page with the URL: every distinct page (view, axes, open card, language) has its own address. */
function apply(): void {
  const prev = route;
  // A card opened by URL sits over the page that was showing; on first load that is the matrix.
  const under = { ...prev, party: undefined, issue: undefined };
  route = parseRoute(location.pathname, location.search, under, location.hash);
  if (route.answers) {
    loadAnswers(decodeAnswers(route.answers));
    route = { ...route, answers: undefined };
  }
  const canonical = formatRoute(route);
  if (location.pathname + location.search !== canonical || location.hash) history.replaceState(null, '', canonical);
  const langChanged = lang !== route.lang;
  lang = route.lang;
  saveLang(lang);
  render();
  updateHead(route, lang);
  if (prev.view !== route.view || prev.x !== route.x || prev.y !== route.y) window.scrollTo(0, 0);
  const wrap = document.querySelector('.matrix-wrap');
  if (langChanged && wrap) wrap.scrollLeft = 0; // scroll origin flips with text direction
  if (route.party) openParty(route.party);
  else if (route.issue) openDetails(route.issue);
}

function go(url: string): void {
  if (url !== location.pathname + location.search) history.pushState(null, '', url);
  apply();
}

function navigate(patch: Partial<Route>): void {
  go(formatRoute({ ...route, answers: undefined, ...patch }));
}

window.addEventListener('popstate', apply);
window.addEventListener('resize', updateScrollCue);
document.addEventListener('scroll', (e) => (e.target as Element).classList?.contains('matrix-wrap') && updateScrollCue(), true);

// Closing a card drops it from the URL without adding a history entry.
document.addEventListener(
  'close',
  (e) => {
    const dialog = e.target as HTMLElement;
    if (dialog.id !== 'details' || !dialog.isConnected || !(route.party || route.issue)) return;
    route = { ...route, party: undefined, issue: undefined };
    history.replaceState(null, '', formatRoute(route));
    updateHead(route, lang);
  },
  true,
);

const allKeys = () => [...categories.map((c) => `cat:${c.id}`), ...tiers.map((t) => `tier:${t.id}`)];

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  // Internal links switch pages without a reload.
  const anchor = target.closest<HTMLAnchorElement>('a[href^="/"]');
  if (anchor && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
    e.preventDefault();
    go(anchor.getAttribute('href')!);
    return;
  }

  const langBtn = target.closest<HTMLButtonElement>('[data-lang]');
  if (langBtn) {
    navigate({ lang: langBtn.dataset.lang as Lang });
    track('select_language', { language: lang });
    return;
  }

  const partyBtn = target.closest<HTMLElement>('[data-party]');
  if (partyBtn) {
    e.preventDefault();
    navigate({ party: partyBtn.dataset.party!, issue: undefined });
    track('open_party', { party: partyBtn.dataset.party! });
    return;
  }

  const cell = target.closest<HTMLElement>('[data-cell]');
  if (cell) {
    navigate({ issue: cell.dataset.cell!, party: undefined });
    track('open_cell', { cell: cell.dataset.cell! });
    return;
  }

  const answer = target.closest<HTMLElement>('[data-answer]');
  if (answer) {
    const [aspect, score] = answer.dataset.answer!.split(':');
    setAnswer(aspect, Number(score) as Score);
    render();
    return;
  }

  if (target.closest('[data-quiz-reset]')) {
    resetQuiz();
    render();
    return;
  }

  const share = target.closest<HTMLButtonElement>('[data-quiz-share]');
  if (share) {
    const url = `${location.origin}${link({ view: 'quiz', answers: encodeAnswers(answers) })}`;
    navigator.clipboard?.writeText(url).then(() => (share.textContent = ui.copied[lang]), () => prompt('', url));
    track('share_quiz');
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

document.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement | HTMLSelectElement;
  if (input.dataset.axis === 'x' || input.dataset.axis === 'y') {
    navigate({ [input.dataset.axis]: input.value });
  } else if (input.dataset.mapTier) {
    const tier = input.dataset.mapTier as Tier;
    navigate({
      show: (input as HTMLInputElement).checked ? [...route.show, tier] : route.show.filter((t) => t !== tier),
    });
  } else if (input.dataset.important) {
    toggleImportant(input.dataset.important);
    render();
  }
});

document.addEventListener('keydown', (e) => {
  const region = (e.target as Element).closest?.<SVGElement>('g[data-party]');
  if (region && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    navigate({ party: region.dataset.party!, issue: undefined });
    return;
  }
  const cell = (e.target as HTMLElement).closest?.<HTMLElement>('[data-cell]');
  if (cell && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    navigate({ issue: cell.dataset.cell!, party: undefined });
  }
});

apply();
initAnalytics();
