import { aspects, blocOf, categories, esc, parties, partyById, scoreOf } from './data';
import { ui } from './i18n';
import type { Answer, Lang, Party, Score } from './types';

const STORAGE_KEY = 'matrix.quiz.v1';
const MIN_ANSWERS = 3;
const SCALE: Score[] = [-2, -1, 0, 1, 2];
const GLYPHS: Record<Score, string> = { [-2]: '✗✗', [-1]: '✗', 0: '~', 1: '✓', 2: '✓✓' };

export const answers: Map<string, Answer> = load();

function load(): Map<string, Answer> {
  try {
    return new Map(Object.entries(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')));
  } catch {
    return new Map();
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(answers)));
  } catch {
    // storage unavailable — answers last for this visit only
  }
}

export const isComplete = () => answers.size === aspects.length;

/** Set when the last unanswered question gets its answer, so the result is announced once, not on every re-render. */
let justCompleted = false;

export function takeJustCompleted(): boolean {
  const was = justCompleted;
  justCompleted = false;
  return was;
}

/** Clicking the selected answer again clears it. */
export function setAnswer(aspect: string, score: Score): void {
  const wasComplete = isComplete();
  const prev = answers.get(aspect);
  if (prev?.score === score) answers.delete(aspect);
  else answers.set(aspect, { score, important: prev?.important });
  justCompleted = !wasComplete && isComplete();
  save();
}

export function toggleImportant(aspect: string): void {
  const a = answers.get(aspect);
  if (!a) return;
  a.important = !a.important;
  save();
}

/** Replaces all answers, e.g. with ones from a shared link. */
export function loadAnswers(next: Map<string, Answer>): void {
  answers.clear();
  next.forEach((v, k) => answers.set(k, v));
  save();
}

export function resetQuiz(): void {
  answers.clear();
  save();
}

export const hasEnoughAnswers = () => answers.size >= MIN_ANSWERS;

export interface Match {
  party: Party;
  /** 0..1, weighted agreement over the issues both sides have a position on. */
  match: number;
  compared: number;
}

const thin = (m: { compared: number }) => (m.compared < MIN_ANSWERS ? 1 : 0);

/** Agreement per issue is 1 - |you - party| / 4; important issues weigh double. */
export function matches(): Match[] {
  return parties
    .map((party) => {
      let sum = 0;
      let weight = 0;
      let compared = 0;
      for (const [aspect, a] of answers) {
        const s = scoreOf(party.id, aspect);
        if (s === null) continue;
        const w = a.important ? 2 : 1;
        sum += w * (1 - Math.abs(a.score - s) / 4);
        weight += w;
        compared++;
      }
      return { party, match: weight ? sum / weight : 0, compared };
    })
    .filter((m) => m.compared > 0)
    // A party with a known position on only one or two of your answers can't top the list on a lucky match.
    .sort((a, b) => thin(a) - thin(b) || b.match - a.match || b.compared - a.compared);
}

function renderQuestion(aspectId: string, lang: Lang): string {
  const a = aspects.find((x) => x.id === aspectId)!;
  const ans = answers.get(a.id);
  const buttons = SCALE.map(
    (s) => `
      <button type="button" class="answer answer--${s > 0 ? 'yes' : s < 0 ? 'no' : 'mixed'}" data-answer="${a.id}:${s}"
        aria-pressed="${ans?.score === s}" title="${ui.stance[lang][s + 2]}">
        <span class="answer__glyph">${GLYPHS[s]}</span><span class="answer__label">${ui.stance[lang][s + 2]}</span>
      </button>`,
  ).join('');
  return `
    <li class="question${ans ? ' question--answered' : ''}">
      <div class="question__head">
        <p class="question__topic">${a.name[lang]}</p>
        <h3>${a.question?.[lang] ?? a.claim[lang]}</h3>
        ${a.context ? `<p class="question__context">${a.context[lang]}</p>` : ''}
      </div>
      <div class="answers" role="group" aria-label="${esc(a.claim[lang])}">${buttons}</div>
      <label class="important${ans ? '' : ' important--off'}">
        <input type="checkbox" data-important="${a.id}" ${ans?.important ? 'checked' : ''} ${ans ? '' : 'disabled'} />
        ★ ${ui.important[lang]}
      </label>
    </li>`;
}

const pctOf = (m: Match) => Math.round(m.match * 100);

/** The announcement once every question is answered: the closest party, large, and the two after it. */
function renderHero(lang: Lang, ranked: Match[], onMap: string): string {
  const [top, ...rest] = ranked;
  const next = rest
    .slice(0, 2)
    .map(
      (m) =>
        `<li><button type="button" class="hero__next-party result--${m.party.bloc}" data-party="${m.party.id}" title="${blocOf(m.party).name[lang]}"><i></i>${esc(m.party.name[lang])} <b>${pctOf(m)}%</b></button></li>`,
    )
    .join('');
  return `
    <div class="hero">
      <p class="hero__kicker">${ui.heroKicker[lang]}</p>
      <p class="hero__lead">${ui.heroLead[lang]}</p>
      <button type="button" class="hero__party" data-party="${top.party.id}">${esc(top.party.name[lang])}</button>
      <span class="bloc-chip bloc-chip--${top.party.bloc}"><i></i>${blocOf(top.party).name[lang]}</span>
      <p class="hero__pct">${pctOf(top)}%</p>
      ${next ? `<p class="hero__next-label">${ui.heroNext[lang]}</p><ol class="hero__next">${next}</ol>` : ''}
      <div class="hero__actions">
        <button type="button" class="btn btn--primary" data-quiz-share>${ui.shareResult[lang]}</button>
      </div>
      ${onMap}
    </div>`;
}

function renderResults(lang: Lang, mapHref: string, mapTeaser: string | null): string {
  if (!hasEnoughAnswers()) return `<p class="results__empty">${ui.quizNeedMore[lang]}</p>`;
  const ranked = matches();
  const rows = ranked
    .map((m) => {
      const { party, compared } = m;
      const pct = pctOf(m);
      return `
        <li>
          <button type="button" class="result result--${party.bloc}${thin(m) ? ' result--thin' : ''}" data-party="${party.id}">
            <span class="result__name"><i></i>${esc(party.name[lang])}</span>
            <span class="result__pct">${pct}%</span>
            <span class="result__bar"><span style="inline-size:${pct}%"></span></span>
            <span class="result__basis">${blocOf(party).name[lang]} · ${compared} ${ui.quizCompared[lang]}</span>
          </button>
        </li>`;
    })
    .join('');
  const complete = isComplete() && ranked.length > 0;
  const onMap = mapTeaser ?? `<a class="btn btn--primary" href="${mapHref}">${ui.quizOnMap[lang]}</a>`;
  return `
    ${complete ? renderHero(lang, ranked, onMap) : onMap}
    <ol class="results__list">${rows}</ol>
    <div class="results__actions">
      ${complete ? '' : `<button type="button" class="btn" data-quiz-share>${ui.shareResult[lang]}</button>`}
      <button type="button" class="btn" data-quiz-reset>${ui.quizReset[lang]}</button>
    </div>`;
}

/** Banner on a shared result link (/ru/quiz/likud/): whose result this is and a way to start afresh. */
function renderShared(lang: Lang, result: string): string {
  const party = partyById.get(result)!;
  return `
    <div class="shared shared--${party.bloc}">
      <p>${ui.sharedResult[lang].replace('{party}', `<b>${esc(party.name[lang])}</b>`)}</p>
      <button type="button" class="btn btn--primary" data-quiz-own>${ui.quizOwn[lang]}</button>
    </div>`;
}

/** `mapTeaser` is the map preview built by the map module, which itself reads the quiz answers. */
export function renderQuiz(lang: Lang, mapHref: string, mapTeaser: string | null, result?: string): string {
  const sections = categories
    .map((c) => {
      const qs = aspects.filter((a) => a.category === c.id).map((a) => renderQuestion(a.id, lang));
      return `<section class="quiz__cat"><h2>${c.name[lang]}</h2><ol class="questions">${qs.join('')}</ol></section>`;
    })
    .join('');
  return `
    <div class="quiz">
      <div class="quiz__main">
        ${result ? renderShared(lang, result) : ''}
        <p class="intro">${ui.quizIntro[lang]}</p>
        ${sections}
      </div>
      <aside class="results" aria-live="polite">
        <h2>${ui.quizResults[lang]}</h2>
        <p class="results__progress">${answers.size} / ${aspects.length} ${ui.answered[lang]}</p>
        ${renderResults(lang, mapHref, mapTeaser)}
        <p class="results__note">${ui.quizNote[lang]}</p>
      </aside>
    </div>`;
}
