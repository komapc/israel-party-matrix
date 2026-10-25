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

export interface Party {
  id: string;
  name: Localized & { he: string };
  leader?: Localized;
  /** Seats in the current Knesset, if represented. */
  seats?: number;
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
