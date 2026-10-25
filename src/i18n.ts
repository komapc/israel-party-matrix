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
  tabMatrix: { en: 'Matrix', ru: 'Матрица', he: 'מטריצה', eo: 'Matrico' },
  tabMap: { en: 'Political map', ru: 'Политическая карта', he: 'מפה פוליטית', eo: 'Politika mapo' },
  tabQuiz: { en: 'Which party fits me?', ru: 'Какая партия мне ближе?', he: 'איזו מפלגה מתאימה לי?', eo: 'Kiu partio konvenas al mi?' },
  mapIntro: {
    en: 'Each party is a region, not a point: it stretches across the range of its positions on the issues that make up each axis. Wider means less uniform or less known.',
    ru: 'Каждая партия — область, а не точка: она тянется на весь разброс её позиций по вопросам, из которых сложена ось. Шире — значит позиции менее однородны или менее известны.',
    he: 'כל מפלגה היא אזור ולא נקודה: הוא נפרש על פני טווח עמדותיה בנושאים שמרכיבים כל ציר. אזור רחב יותר פירושו עמדות פחות אחידות או פחות ידועות.',
    eo: 'Ĉiu partio estas regiono, ne punkto: ĝi etendiĝas tra la amplekso de siaj pozicioj pri la temoj, el kiuj konsistas ĉiu akso. Pli larĝa signifas malpli unuecajn aŭ malpli konatajn poziciojn.',
  },
  mapViews: { en: 'Views', ru: 'Варианты', he: 'תצוגות', eo: 'Vidoj' },
  axisX: { en: 'Horizontal', ru: 'По горизонтали', he: 'ציר אופקי', eo: 'Horizontala' },
  axisY: { en: 'Vertical', ru: 'По вертикали', he: 'ציר אנכי', eo: 'Vertikala' },
  mapTiers: { en: 'Show', ru: 'Показать', he: 'הצגה', eo: 'Montri' },
  mapNoData: {
    en: 'Not enough data to place:',
    ru: 'Недостаточно данных, чтобы разместить:',
    he: 'אין די נתונים כדי למקם את:',
    eo: 'Ne sufiĉas datumoj por loki:',
  },
  mapBuiltFrom: { en: 'Built from', ru: 'Из вопросов', he: 'מבוסס על', eo: 'Konstruita el' },
  you: { en: 'You', ru: 'Вы', he: 'את/ה', eo: 'Vi' },
  quizIntro: {
    en: 'Mark how much you agree with each statement. Skip any you have no view on; mark the ones that matter most to you as important — they count double.',
    ru: 'Отметьте, насколько вы согласны с каждым утверждением. Пропускайте те, где нет мнения; самые важные для вас отметьте звёздочкой — они считаются вдвойне.',
    he: 'סמנו עד כמה אתם מסכימים עם כל קביעה. דלגו על מה שאין לכם עמדה לגביו; סמנו בכוכב את הנושאים החשובים לכם — הם נספרים כפול.',
    eo: 'Marku, kiom vi konsentas kun ĉiu aserto. Preterlasu tiujn, pri kiuj vi ne havas opinion; marku la plej gravajn per stelo — ili kalkuliĝas duoble.',
  },
  important: { en: 'Important to me', ru: 'Важно для меня', he: 'חשוב לי', eo: 'Grava por mi' },
  answered: { en: 'answered', ru: 'отвечено', he: 'נענו', eo: 'responditaj' },
  quizResults: { en: 'Your closest parties', ru: 'Ближайшие к вам партии', he: 'המפלגות הקרובות אליכם', eo: 'Viaj plej proksimaj partioj' },
  quizNeedMore: {
    en: 'Answer at least 3 statements to see results.',
    ru: 'Ответьте хотя бы на 3 утверждения, чтобы увидеть результат.',
    he: 'ענו על 3 קביעות לפחות כדי לראות תוצאות.',
    eo: 'Respondu almenaŭ 3 asertojn por vidi rezultojn.',
  },
  quizCompared: { en: 'issues compared', ru: 'вопросов сравнено', he: 'נושאים הושוו', eo: 'temoj komparitaj' },
  quizReset: { en: 'Start over', ru: 'Начать заново', he: 'התחלה מחדש', eo: 'Rekomenci' },
  quizOnMap: { en: 'See yourself on the map', ru: 'Посмотреть себя на карте', he: 'הציגו אותי במפה', eo: 'Vidi min sur la mapo' },
  quizNote: {
    en: 'Match = how close your answers are to each party’s stance, over the issues where the party has a known position. Your answers stay in this browser.',
    ru: 'Совпадение — насколько ваши ответы близки к позициям партии по вопросам, где её позиция известна. Ответы хранятся только в этом браузере.',
    he: 'התאמה = עד כמה תשובותיכם קרובות לעמדת המפלגה, בנושאים שבהם עמדתה ידועה. התשובות נשמרות רק בדפדפן הזה.',
    eo: 'Kongruo = kiom proksimaj viaj respondoj estas al la sinteno de ĉiu partio, pri la temoj kie ĝia pozicio estas konata. Viaj respondoj restas en ĉi tiu retumilo.',
  },
  footAbout: {
    en: 'An independent, non-partisan project. Not affiliated with any party or campaign.',
    ru: 'Независимый внепартийный проект. Не связан ни с одной партией или кампанией.',
    he: 'פרויקט עצמאי ובלתי מפלגתי. אינו קשור לשום מפלגה או קמפיין.',
    eo: 'Sendependa, nepartia projekto. Ne ligita al iu ajn partio aŭ kampanjo.',
  },
  footViews: { en: 'Explore', ru: 'Разделы', he: 'ניווט', eo: 'Esplori' },
  footProject: { en: 'Project', ru: 'Проект', he: 'הפרויקט', eo: 'Projekto' },
  footSource: { en: 'Source code & data', ru: 'Код и данные', he: 'קוד ונתונים', eo: 'Fontkodo kaj datumoj' },
  footReport: { en: 'Report an error', ru: 'Сообщить об ошибке', he: 'דיווח על טעות', eo: 'Raporti eraron' },
  footMore: { en: 'More from lipu.dev', ru: 'Другие проекты lipu.dev', he: 'עוד ב־lipu.dev', eo: 'Pli ĉe lipu.dev' },
  quizShare: { en: 'Copy link to my results', ru: 'Скопировать ссылку на мои ответы', he: 'העתקת קישור לתשובות שלי', eo: 'Kopii ligilon al miaj respondoj' },
  copied: { en: 'Link copied', ru: 'Ссылка скопирована', he: 'הקישור הועתק', eo: 'Ligilo kopiita' },
  footAnalytics: {
    en: 'Visits are counted with Google Analytics.',
    ru: 'Посещения считаются через Google Analytics.',
    he: 'הביקורים נספרים באמצעות Google Analytics.',
    eo: 'Vizitoj estas kalkulataj per Google Analytics.',
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
