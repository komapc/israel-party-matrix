import aspectsData from './data/aspects.json';
import blocsData from './data/blocs.json';
import categoriesData from './data/categories.json';
import dimensionsData from './data/dimensions.json';
import metaData from './data/meta.json';
import partiesData from './data/parties.json';
import positionsData from './data/positions.json';
import tiersData from './data/tiers.json';
import type { Aspect, Bloc, Category, Dimension, Meta, Party, Position, Tier, Tiers } from './types';

export const aspects = aspectsData as Aspect[];
export const categories = categoriesData as Category[];
const rawParties = partiesData as Party[];
export const positions = positionsData as Position[];
export const meta = metaData as Meta;
/** True once election results replace the polls. */
export const counted = meta.results !== undefined;
export const tiers = (tiersData as Tiers[]).map((t) => (counted ? { ...t, ...t.results } : t));

/** How close to the 3.25% threshold a list still counts as undecided while votes are being counted. */
const TOO_CLOSE = 0.15;

/** Once counted, a party's tier follows its result: in, out, or (mid-count) right at the threshold. */
function resultTier(p: Party): Tier {
  const { seats = 0, pct } = p.result ?? {};
  if (!meta.results!.final && pct !== undefined && Math.abs(pct - 3.25) < TOO_CLOSE) return 'borderline';
  return seats > 0 ? 'likely' : 'unlikely';
}

export const parties = counted ? rawParties.map((p) => ({ ...p, tier: resultTier(p) })) : rawParties;
export const blocs = blocsData as Bloc[];
export const dimensions = dimensionsData as Dimension[];

export const positionIndex = new Map(positions.map((p) => [`${p.party}/${p.aspect}`, p]));
export const partyById = new Map(parties.map((p) => [p.id, p]));
export const aspectById = new Map(aspects.map((a) => [a.id, a]));
export const blocOf = (p: Party) => blocs.find((b) => b.id === p.bloc)!;

export const scoreOf = (party: string, aspect: string) => positionIndex.get(`${party}/${aspect}`)?.score ?? null;

/** Seats won once counted, before that the poll average. */
export const seatsOf = (p: Party) => (counted ? (p.result?.seats ?? 0) : (p.polls?.avg ?? 0));

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
