import aspectsData from './data/aspects.json';
import blocsData from './data/blocs.json';
import categoriesData from './data/categories.json';
import dimensionsData from './data/dimensions.json';
import metaData from './data/meta.json';
import partiesData from './data/parties.json';
import positionsData from './data/positions.json';
import tiersData from './data/tiers.json';
import type { Aspect, Bloc, Category, Dimension, Meta, Party, Position, Tiers } from './types';

export const aspects = aspectsData as Aspect[];
export const categories = categoriesData as Category[];
export const parties = partiesData as Party[];
export const positions = positionsData as Position[];
export const tiers = tiersData as Tiers[];
export const meta = metaData as Meta;
export const blocs = blocsData as Bloc[];
export const dimensions = dimensionsData as Dimension[];

export const positionIndex = new Map(positions.map((p) => [`${p.party}/${p.aspect}`, p]));
export const partyById = new Map(parties.map((p) => [p.id, p]));
export const aspectById = new Map(aspects.map((a) => [a.id, a]));
export const blocOf = (p: Party) => blocs.find((b) => b.id === p.bloc)!;

export const scoreOf = (party: string, aspect: string) => positionIndex.get(`${party}/${aspect}`)?.score ?? null;

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
