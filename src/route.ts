import { aspects, dimensions, partyById, positionIndex, tiers } from './data';
import { LANGS } from './i18n';
import type { Answer, Lang, Score, Tier } from './types';

export type View = 'matrix' | 'map' | 'quiz';
export const VIEWS: View[] = ['matrix', 'map', 'quiz'];

/**
 * Everything that makes a page distinct, mirrored in the URL hash:
 *   #/ru/matrix?party=raam            party card over the matrix
 *   #/he/map/religion/security?show=likely
 *   #/en/quiz?a=eb-c                  quiz with shared answers
 */
export interface Route {
  lang: Lang;
  view: View;
  /** Map axes (dimension ids). */
  x: string;
  y: string;
  /** Map tier filter. */
  show: Tier[];
  /** Open party card. */
  party?: string;
  /** Open issue cell, as `party/aspect`. */
  issue?: string;
  /** Shared quiz answers, see `encodeAnswers`. */
  answers?: string;
}

export const DEFAULT_MAP = { x: 'economy', y: 'security', show: ['likely', 'borderline'] as Tier[] };

const isDim = (id: string | undefined): id is string => !!id && dimensions.some((d) => d.id === id);

export function parseRoute(hash: string, fallbackLang: Lang): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  // Legacy links (#map, #quiz) carry no language segment.
  const lang = LANGS.includes(parts[0] as Lang) ? (parts.shift() as Lang) : fallbackLang;
  const view = VIEWS.includes(parts[0] as View) ? (parts.shift() as View) : 'matrix';
  const params = new URLSearchParams(query);
  const show = (params.get('show') ?? '')
    .split(',')
    .filter((t): t is Tier => tiers.some((x) => x.id === t));
  const party = params.get('party') ?? undefined;
  const issue = params.get('issue')?.replace('.', '/');
  return {
    lang,
    view,
    x: isDim(parts[0]) ? parts[0] : DEFAULT_MAP.x,
    y: isDim(parts[1]) ? parts[1] : DEFAULT_MAP.y,
    show: params.has('show') ? show : DEFAULT_MAP.show,
    party: party && partyById.has(party) ? party : undefined,
    issue: issue && positionIndex.has(issue) ? issue : undefined,
    answers: params.get('a') ?? undefined,
  };
}

export function formatRoute(r: Route): string {
  let path = `#/${r.lang}/${r.view}`;
  const params = new URLSearchParams();
  if (r.view === 'map') {
    path += `/${r.x}/${r.y}`;
    const show = tiers.map((t) => t.id).filter((t) => r.show.includes(t));
    if (show.join() !== DEFAULT_MAP.show.join()) params.set('show', show.join(','));
  }
  if (r.party) params.set('party', r.party);
  else if (r.issue) params.set('issue', r.issue.replace('/', '.'));
  if (r.answers) params.set('a', r.answers);
  const query = params.toString().replace(/%2C/g, ',');
  return query ? `${path}?${query}` : path;
}

// Quiz answers as one letter per aspect, in aspect order: a..e = -2..+2, uppercase = important, '-' = skipped.
const LETTERS = 'abcde';

export function encodeAnswers(answers: Map<string, Answer>): string {
  return aspects
    .map((a) => {
      const ans = answers.get(a.id);
      if (!ans) return '-';
      const ch = LETTERS[ans.score + 2];
      return ans.important ? ch.toUpperCase() : ch;
    })
    .join('')
    .replace(/-+$/, '');
}

export function decodeAnswers(code: string): Map<string, Answer> {
  const out = new Map<string, Answer>();
  [...code].forEach((ch, i) => {
    const idx = LETTERS.indexOf(ch.toLowerCase());
    if (idx < 0 || !aspects[i]) return;
    out.set(aspects[i].id, { score: (idx - 2) as Score, important: ch !== ch.toLowerCase() || undefined });
  });
  return out;
}
