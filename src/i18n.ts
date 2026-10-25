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
  pollTitle: {
    en: 'Projected seats: poll average (range)',
    ru: 'Прогноз мест: среднее по опросам (разброс)',
  },
  belowThreshold: { en: 'below threshold', ru: 'ниже барьера' },
  notPolled: { en: 'not polled', ru: 'нет в опросах' },
  blocs: { en: 'Blocs (seats in polls)', ru: 'Блоки (места по опросам)' },
  sources: { en: 'Sources', ru: 'Источники' },
  close: { en: 'Close', ru: 'Закрыть' },
  blocBasis: { en: 'Bloc', ru: 'Блок' },
  stance: {
    en: ['Strongly against', 'Against', 'Mixed', 'For', 'Strongly for'],
    ru: ['Решительно против', 'Против', 'Неоднозначно', 'За', 'Решительно за'],
  },
  seatsShort: { en: 'Projected seats', ru: 'Прогноз мест' },
  leader: { en: 'Leader', ru: 'Лидер' },
  members: { en: 'Joint list', ru: 'Состав списка' },
  expandAll: { en: 'Expand all', ru: 'Развернуть всё' },
  collapseAll: { en: 'Collapse all', ru: 'Свернуть всё' },
  partiesCount: { en: 'parties', ru: 'партий' },
  issuesCount: { en: 'issues', ru: 'вопросов' },
  pollsAsOf: { en: 'Polls as of', ru: 'Опросы на' },
  election: { en: 'Election day', ru: 'Выборы' },
  minorLists: {
    en: 'About 20 more minor lists are on the ballot and not shown.',
    ru: 'В бюллетене ещё около 20 малых списков — они не показаны.',
  },
  noPosition: { en: 'No clear position', ru: 'Нет чёткой позиции' },
  empty: {
    en: 'Party data is coming soon.',
    ru: 'Данные о партиях скоро появятся.',
  },
  footer: {
    en: 'Positions summarize public platforms, statements and voting records. Click a party for its profile, or a cell for the explanation and sources.',
    ru: 'Позиции — краткое изложение программ, заявлений и голосований. Нажмите на партию, чтобы открыть её карточку, или на ячейку — для пояснения и источников.',
  },
} satisfies Record<string, Record<Lang, string | string[]>>;

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
