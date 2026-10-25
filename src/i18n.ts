import type { Lang } from './types';

const STORAGE_KEY = 'matrix.lang';

export const LANGS: Lang[] = ['en', 'ru', 'he', 'eo'];

/** Label on the language switch, in the language itself. */
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', ru: 'RU', he: 'עב', eo: 'EO' };

export const LOCALES: Record<Lang, string> = { en: 'en-GB', ru: 'ru-RU', he: 'he-IL', eo: 'eo' };

export const isRtl = (lang: Lang) => lang === 'he';

export const ui = {
  title: {
    en: 'Israeli Parties Matrix',
    ru: 'Матрица израильских партий',
    he: 'מטריצת המפלגות בישראל',
    eo: 'Matrico de israelaj partioj',
  },
  subtitle: {
    en: 'Where each party stands on the key issues',
    ru: 'Позиции партий по ключевым вопросам',
    he: 'עמדות המפלגות בנושאים המרכזיים',
    eo: 'Kie ĉiu partio staras pri la ĉefaj temoj',
  },
  aspect: { en: 'Issue', ru: 'Вопрос', he: 'נושא', eo: 'Temo' },
  seats: { en: 'seats', ru: 'мест', he: 'מנדטים', eo: 'seĝoj' },
  pollTitle: {
    en: 'Projected seats: poll average (range)',
    ru: 'Прогноз мест: среднее по опросам (разброс)',
    he: 'מנדטים צפויים: ממוצע הסקרים (טווח)',
    eo: 'Antaŭviditaj seĝoj: meznombro de enketoj (amplekso)',
  },
  belowThreshold: { en: 'below threshold', ru: 'ниже барьера', he: 'מתחת לאחוז החסימה', eo: 'sub la sojlo' },
  notPolled: { en: 'not polled', ru: 'нет в опросах', he: 'לא נסקרה', eo: 'ne enketita' },
  blocs: {
    en: 'Blocs (seats in polls)',
    ru: 'Блоки (места по опросам)',
    he: 'גושים (מנדטים בסקרים)',
    eo: 'Blokoj (seĝoj laŭ enketoj)',
  },
  sources: { en: 'Sources', ru: 'Источники', he: 'מקורות', eo: 'Fontoj' },
  close: { en: 'Close', ru: 'Закрыть', he: 'סגירה', eo: 'Fermi' },
  blocBasis: { en: 'Bloc', ru: 'Блок', he: 'גוש', eo: 'Bloko' },
  stance: {
    en: ['Strongly against', 'Against', 'Mixed', 'For', 'Strongly for'],
    ru: ['Решительно против', 'Против', 'Неоднозначно', 'За', 'Решительно за'],
    he: ['נגד בתוקף', 'נגד', 'עמדה מעורבת', 'בעד', 'בעד בתוקף'],
    eo: ['Forte kontraŭ', 'Kontraŭ', 'Miksita', 'Por', 'Forte por'],
  },
  seatsShort: { en: 'Projected seats', ru: 'Прогноз мест', he: 'מנדטים צפויים', eo: 'Antaŭviditaj seĝoj' },
  leader: { en: 'Leader', ru: 'Лидер', he: 'יו"ר', eo: 'Gvidanto' },
  members: { en: 'Joint list', ru: 'Состав списка', he: 'הרכב הרשימה', eo: 'Komuna listo' },
  expandAll: { en: 'Expand all', ru: 'Развернуть всё', he: 'הרחבת הכול', eo: 'Malfaldi ĉion' },
  collapseAll: { en: 'Collapse all', ru: 'Свернуть всё', he: 'כיווץ הכול', eo: 'Faldi ĉion' },
  partiesCount: { en: 'parties', ru: 'партий', he: 'מפלגות', eo: 'partioj' },
  issuesCount: { en: 'issues', ru: 'вопросов', he: 'נושאים', eo: 'temoj' },
  pollsAsOf: { en: 'Polls as of', ru: 'Опросы на', he: 'סקרים נכון ל־', eo: 'Enketoj ĝis' },
  election: { en: 'Election day', ru: 'Выборы', he: 'יום הבחירות', eo: 'Balota tago' },
  minorLists: {
    en: 'About 20 more minor lists are on the ballot and not shown.',
    ru: 'В бюллетене ещё около 20 малых списков — они не показаны.',
    he: 'כ־20 רשימות קטנות נוספות מתמודדות ואינן מוצגות.',
    eo: 'Ĉirkaŭ 20 pliaj malgrandaj listoj kandidatas kaj ne estas montrataj.',
  },
  noPosition: { en: 'No clear position', ru: 'Нет чёткой позиции', he: 'אין עמדה ברורה', eo: 'Neniu klara pozicio' },
  empty: {
    en: 'Party data is coming soon.',
    ru: 'Данные о партиях скоро появятся.',
    he: 'נתוני המפלגות יתווספו בקרוב.',
    eo: 'Datumoj pri la partioj baldaŭ aperos.',
  },
  footer: {
    en: 'Positions summarize public platforms, statements and voting records. Click a party for its profile, or a cell for the explanation and sources.',
    ru: 'Позиции — краткое изложение программ, заявлений и голосований. Нажмите на партию, чтобы открыть её карточку, или на ячейку — для пояснения и источников.',
    he: 'העמדות מסכמות מצעים, הצהרות והצבעות. לחצו על מפלגה לפרופיל שלה, או על תא להסבר ולמקורות.',
    eo: 'La pozicioj resumas publikajn programojn, deklarojn kaj voĉdonojn. Alklaku partion por ĝia profilo, aŭ ĉelon por la klarigo kaj fontoj.',
  },
} satisfies Record<string, Record<Lang, string | string[]>>;

const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // storage unavailable — fall through
  }
  const nav = navigator.language.toLowerCase().slice(0, 2);
  if (nav === 'iw') return 'he';
  return isLang(nav) ? nav : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
