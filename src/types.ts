export type Lang = 'en' | 'ru' | 'uk' | 'be' | 'he' | 'eo';

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
  /** The `high` pole phrased as a proposition: ✓ = party supports it. */
  claim: Localized;
  /** Full neutral statement for the quiz. */
  question?: Localized;
  /** Background: the current situation and what is at stake. */
  context?: Localized;
  /** Main arguments for the statement as worded (the `high` pole). */
  pro?: Localized;
  /** Main arguments against it. */
  con?: Localized;
  low: Localized;
  high: Localized;
}

/** Chance of crossing the 3.25% threshold, judged from recent polls. */
export type Tier = 'likely' | 'borderline' | 'unlikely';

export interface Tiers {
  id: Tier;
  name: Localized;
  hint: Localized;
  /** Name and hint once results are in (`meta.results`). */
  results: { name: Localized; hint: Localized };
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
  /** `he` is the official Hebrew name. */
  name: Localized;
  leader?: Localized;
  /** Component parties of a joint list. */
  members?: Localized;
  summary?: Localized;
  tier: Tier;
  bloc: BlocId;
  blocNote?: Localized;
  blocSources?: string[];
  polls?: PollRange;
  /** Seats won (0 = below threshold); used instead of `polls` once `meta.results` is set. */
  result?: { seats: number; pct?: number };
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
  /** The Central Elections Committee's official results page (linked from the toolbar). */
  resultsSource?: string;
  /** Set once votes are counted: the site then shows each party's `result` instead of its polls. */
  results?: {
    asOf: string;
    /** false while the count (soldiers' and other double-envelope votes) is still going on. */
    final: boolean;
    source: string;
  };
}

/** A map axis: the signed mean of several issue scores, from `low` (-2) to `high` (+2). */
export interface Dimension {
  id: string;
  name: Localized;
  low: Localized;
  high: Localized;
  items: { aspect: string; sign: 1 | -1 }[];
}

/** A quiz answer: stance on the aspect's claim, optionally marked as important. */
export interface Answer {
  score: Score;
  important?: boolean;
}
