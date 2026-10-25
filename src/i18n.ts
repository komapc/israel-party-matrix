import type { Lang } from './types';

const STORAGE_KEY = 'matrix.lang';

export const LANGS: Lang[] = ['en', 'ru'];

export const ui = {
  title: { en: 'Israeli Parties Matrix', ru: 'Матрица израильских партий' },
  subtitle: {
    en: 'Where each party stands on the key issues',
    ru: 'Позиции партий по ключевым вопросам',
  },
  aspect: { en: 'Issue', ru: 'Вопрос' },
  seats: { en: 'seats', ru: 'мест' },
  noPosition: { en: 'No clear position', ru: 'Нет чёткой позиции' },
  empty: {
    en: 'Party data is coming soon.',
    ru: 'Данные о партиях скоро появятся.',
  },
  legend: { en: 'Scale', ru: 'Шкала' },
  footer: {
    en: 'Positions are summaries of public platforms and voting records. Each cell links to its sources.',
    ru: 'Позиции — краткое изложение публичных программ и голосований. У каждой ячейки есть источники.',
  },
} satisfies Record<string, Record<Lang, string>>;

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // storage unavailable — fall through
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
