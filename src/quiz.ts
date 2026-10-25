import { aspects, blocOf, categories, esc, parties, scoreOf } from './data';
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

/** Clicking the selected answer again clears it. */
export function setAnswer(aspect: string, score: Score): void {
  const prev = answers.get(aspect);
  if (prev?.score === score) answers.delete(aspect);
  else answers.set(aspect, { score, important: prev?.important });
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

interface Match {
  party: Party;
  /** 0..1, weighted agreement over the issues both sides have a position on. */
  match: number;
  compared: number;
}

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
    .sort((a, b) => b.match - a.match || b.compared - a.compared);
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

function renderResults(lang: Lang, mapHref: string): string {
  if (!hasEnoughAnswers()) return `<p class="results__empty">${ui.quizNeedMore[lang]}</p>`;
  const rows = matches()
    .map(({ party, match, compared }) => {
      const pct = Math.round(match * 100);
      return `
        <li>
          <button type="button" class="result result--${party.bloc}${compared < MIN_ANSWERS ? ' result--thin' : ''}" data-party="${party.id}" title="${blocOf(party).name[lang]}">
            <span class="result__name"><i></i>${esc(party.name[lang])}</span>
            <span class="result__pct">${pct}%</span>
            <span class="result__bar"><span style="inline-size:${pct}%"></span></span>
            <span class="result__basis">${compared} ${ui.quizCompared[lang]}</span>
          </button>
        </li>`;
    })
    .join('');
  return `
    <ol class="results__list">${rows}</ol>
    <div class="results__actions">
      <a class="btn btn--primary" href="${mapHref}">${ui.quizOnMap[lang]}</a>
      <button type="button" class="btn" data-quiz-share>${ui.quizShare[lang]}</button>
      <button type="button" class="btn" data-quiz-reset>${ui.quizReset[lang]}</button>
    </div>`;
}

export function renderQuiz(lang: Lang, mapHref: string): string {
  const sections = categories
    .map((c) => {
      const qs = aspects.filter((a) => a.category === c.id).map((a) => renderQuestion(a.id, lang));
      return `<section class="quiz__cat"><h2>${c.name[lang]}</h2><ol class="questions">${qs.join('')}</ol></section>`;
    })
    .join('');
  return `
    <div class="quiz">
      <div class="quiz__main">
        <p class="intro">${ui.quizIntro[lang]}</p>
        ${sections}
      </div>
      <aside class="results" aria-live="polite">
        <h2>${ui.quizResults[lang]}</h2>
        <p class="results__progress">${answers.size} / ${aspects.length} ${ui.answered[lang]}</p>
        ${renderResults(lang, mapHref)}
        <p class="results__note">${ui.quizNote[lang]}</p>
      </aside>
    </div>`;
}
