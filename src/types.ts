export type Lang = 'en' | 'ru';

/** Text available in every UI language. */
export type Localized = Record<Lang, string>;

export interface Category {
  id: string;
  name: Localized;
}

/** A policy dimension. Scores run from -2 (`low` pole) to +2 (`high` pole). */
export interface Aspect {
  id: string;
  category: string;
  name: Localized;
  low: Localized;
  high: Localized;
}

/** Chance of crossing the 3.25% threshold, judged from recent polls. */
export type Tier = 'likely' | 'borderline' | 'unlikely';

export interface Tiers {
  id: Tier;
  name: Localized;
  hint: Localized;
}

/** Seat projections across the polls listed in `meta.json`. 0 = below threshold. */
export interface PollRange {
  avg: number;
  min: number;
  max: number;
}

/** Stance toward a Netanyahu-led government. */
export type BlocId = 'pro' | 'anti' | 'other';

export interface Bloc {
  id: BlocId;
  name: Localized;
  /** Compact label for column headers. */
  short: Localized;
}

export interface Party {
  id: string;
  name: Localized & { he?: string };
  leader?: Localized;
  /** Component parties of a joint list. */
  members?: Localized;
  summary?: Localized;
  tier: Tier;
  bloc: BlocId;
  blocNote?: Localized;
  blocSources?: string[];
  polls?: PollRange;
  /** Display color for the column accent — not an official party color. */
  color: string;
}

export type Score = -2 | -1 | 0 | 1 | 2;

export interface Position {
  party: string;
  aspect: string;
  /** null = no clear / no public position. */
  score: Score | null;
  note?: Localized;
  sources?: string[];
}

export interface Meta {
  electionDate: string;
  pollsAsOf: string;
  pollSources: string[];
}
