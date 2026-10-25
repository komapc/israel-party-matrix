import { aspects, dimensions, partyById, positionIndex, tiers } from './data';
import { LANGS } from './i18n';
import type { Answer, Lang, Score, Tier } from './types';

export type View = 'matrix' | 'map' | 'quiz';
export const VIEWS: View[] = ['matrix', 'map', 'quiz'];

/**
 * Everything that makes a page distinct, mirrored in the URL path:
 *   /ru/                              matrix
 *   /he/map/religion/security/?show=likely
 *   /en/quiz/?a=eb-c                  quiz with shared answers
 *   /ru/party/raam/                   party card (over the page it was opened from)
 *   /ru/party/raam/lgbt/              one party × issue cell
 */
export interface Route {
  lang: Lang;
  /** The page itself, or the page under an open card. */
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

/**
 * Reads a route from a path and query string. `under` supplies the page beneath a card and the language
 * for the bare root path. Legacy hash links (#/ru/map/…, #map) are accepted as `hash`.
 */
export function parseRoute(path: string, search: string, under: Route, hash = ''): Route {
  if (hash.length > 1) [path, search = ''] = hash.replace(/^#\/?/, '/').split('?');
  const parts = path.split('/').filter(Boolean);
  const lang = LANGS.includes(parts[0] as Lang) ? (parts.shift() as Lang) : under.lang;
  const params = new URLSearchParams(search);
  const show = (params.get('show') ?? '')
    .split(',')
    .filter((t): t is Tier => tiers.some((x) => x.id === t));
  const answers = params.get('a') ?? undefined;

  if (parts[0] === 'party' && partyById.has(parts[1])) {
    const issue = parts[2] && positionIndex.has(`${parts[1]}/${parts[2]}`) ? `${parts[1]}/${parts[2]}` : undefined;
    return { ...under, lang, party: issue ? undefined : parts[1], issue, answers };
  }

  // Legacy query-style cards: ?party=raam, ?issue=raam.lgbt
  const party = params.get('party') ?? undefined;
  const issue = params.get('issue')?.replace('.', '/');
  const view = VIEWS.includes(parts[0] as View) ? (parts.shift() as View) : 'matrix';
  return {
    lang,
    view,
    x: view === 'map' && isDim(parts[0]) ? parts[0] : DEFAULT_MAP.x,
    y: view === 'map' && isDim(parts[1]) ? parts[1] : DEFAULT_MAP.y,
    show: params.has('show') ? show : DEFAULT_MAP.show,
    party: party && partyById.has(party) ? party : undefined,
    issue: issue && positionIndex.has(issue) ? issue : undefined,
    answers,
  };
}

/** Path of the page under any open card. */
export function pagePath(r: Route): string {
  if (r.view === 'matrix') return `/${r.lang}/`;
  if (r.view === 'quiz') return `/${r.lang}/quiz/`;
  const show = tiers.map((t) => t.id).filter((t) => r.show.includes(t));
  const query = show.join() === DEFAULT_MAP.show.join() ? '' : `?show=${show.join(',')}`;
  return `/${r.lang}/map/${r.x}/${r.y}/${query}`;
}

export function formatRoute(r: Route): string {
  let url: string;
  if (r.issue) {
    const [party, aspect] = r.issue.split('/');
    url = `/${r.lang}/party/${party}/${aspect}/`;
  } else if (r.party) {
    url = `/${r.lang}/party/${r.party}/`;
  } else {
    url = pagePath(r);
  }
  if (r.answers) url += `${url.includes('?') ? '&' : '?'}a=${r.answers}`;
  return url;
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
