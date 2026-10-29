import type { Lang } from './types';

const STORAGE_KEY = 'matrix.lang';

export const LANGS: Lang[] = ['en', 'ru', 'uk', 'be', 'he', 'eo'];

/** Label on the language switch, in the language itself. */
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', ru: 'RU', uk: 'UA', be: 'BY', he: 'עב', eo: 'EO' };

export const LOCALES: Record<Lang, string> = { en: 'en-GB', ru: 'ru-RU', uk: 'uk-UA', be: 'be-BY', he: 'he-IL', eo: 'eo' };

export const isRtl = (lang: Lang) => lang === 'he';

// Browsers ship no Esperanto or Belarusian date names.
const EO_MONTHS = ['januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto', 'septembro', 'oktobro', 'novembro', 'decembro'];
const BE_MONTHS = ['студзеня', 'лютага', 'сакавіка', 'красавіка', 'мая', 'чэрвеня', 'ліпеня', 'жніўня', 'верасня', 'кастрычніка', 'лістапада', 'снежня'];

/** A date like 27 October 2026, in the given language. */
/** A share of the vote, e.g. "3,2%" in Russian. */
export const formatPct = (lang: Lang, n: number) =>
  `${new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)}%`;

export function formatDateIn(lang: Lang, iso: string): string {
  if (lang === 'eo') {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d}-a de ${EO_MONTHS[m - 1]} ${y}`;
  }
  if (lang === 'be') {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${BE_MONTHS[m - 1]} ${y} г.`;
  }
  return new Date(`${iso}T12:00:00`).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric' });
}

export const ui = {
  title: {
    en: 'Israeli Parties Matrix',
    ru: 'Матрица израильских партий',
    uk: 'Матриця ізраїльських партій',
    be: 'Матрыца ізраільскіх партый',
    he: 'מטריצת המפלגות בישראל',
    eo: 'Matrico de israelaj partioj',
  },
  subtitle: {
    en: 'Where each party stands on the key issues',
    ru: 'Позиции партий по ключевым вопросам',
    uk: 'Позиції партій щодо ключових питань',
    be: 'Пазіцыі партый па ключавых пытаннях',
    he: 'עמדות המפלגות בנושאים המרכזיים',
    eo: 'Kie ĉiu partio staras pri la ĉefaj temoj',
  },
  aspect: { en: 'Issue', ru: 'Вопрос', uk: 'Питання', be: 'Пытанне', he: 'נושא', eo: 'Temo' },
  seats: { en: 'seats', ru: 'мест', uk: 'місць', be: 'месцаў', he: 'מנדטים', eo: 'seĝoj' },
  pollTitle: {
    en: 'Projected seats: poll average (range)',
    ru: 'Прогноз мест: среднее по опросам (разброс)',
    uk: 'Прогноз місць: середнє за опитуваннями (діапазон)',
    be: 'Прагноз месцаў: сярэдняе па апытаннях (дыяпазон)',
    he: 'מנדטים צפויים: ממוצע הסקרים (טווח)',
    eo: 'Antaŭviditaj seĝoj: meznombro de enketoj (amplekso)',
  },
  belowThreshold: { en: 'below threshold', ru: 'ниже барьера', uk: 'нижче бар’єра', be: 'ніжэй за бар’ер', he: 'מתחת לאחוז החסימה', eo: 'sub la sojlo' },
  notPolled: { en: 'not polled', ru: 'нет в опросах', uk: 'немає в опитуваннях', be: 'няма ў апытаннях', he: 'לא נסקרה', eo: 'ne enketita' },
  blocs: {
    en: 'Blocs (seats in polls)',
    ru: 'Блоки (места по опросам)',
    uk: 'Блоки (місця за опитуваннями)',
    be: 'Блокі (месцы па апытаннях)',
    he: 'גושים (מנדטים בסקרים)',
    eo: 'Blokoj (seĝoj laŭ enketoj)',
  },
  sources: { en: 'Sources', ru: 'Источники', uk: 'Джерела', be: 'Крыніцы', he: 'מקורות', eo: 'Fontoj' },
  close: { en: 'Close', ru: 'Закрыть', uk: 'Закрити', be: 'Закрыць', he: 'סגירה', eo: 'Fermi' },
  blocBasis: { en: 'Bloc', ru: 'Блок', uk: 'Блок', be: 'Блок', he: 'גוש', eo: 'Bloko' },
  stance: {
    en: ['Strongly against', 'Against', 'Mixed', 'For', 'Strongly for'],
    ru: ['Решительно против', 'Против', 'Неоднозначно', 'За', 'Решительно за'],
    uk: ['Рішуче проти', 'Проти', 'Неоднозначно', 'За', 'Рішуче за'],
    be: ['Рашуча супраць', 'Супраць', 'Неадназначна', 'За', 'Рашуча за'],
    he: ['נגד בתוקף', 'נגד', 'עמדה מעורבת', 'בעד', 'בעד בתוקף'],
    eo: ['Forte kontraŭ', 'Kontraŭ', 'Miksita', 'Por', 'Forte por'],
  },
  seatsShort: { en: 'Projected seats', ru: 'Прогноз мест', uk: 'Прогноз місць', be: 'Прагноз месцаў', he: 'מנדטים צפויים', eo: 'Antaŭviditaj seĝoj' },
  leader: { en: 'Leader', ru: 'Лидер', uk: 'Лідер', be: 'Лідар', he: 'יו"ר', eo: 'Gvidanto' },
  members: { en: 'Joint list', ru: 'Состав списка', uk: 'Склад списку', be: 'Склад спіса', he: 'הרכב הרשימה', eo: 'Komuna listo' },
  scrollHint: {
    en: 'Swipe the table sideways to see all parties →',
    ru: 'Листайте таблицу вбок, чтобы увидеть все партии →',
    uk: 'Гортайте таблицю вбік, щоб побачити всі партії →',
    be: 'Гартайце табліцу ўбок, каб убачыць усе партыі →',
    he: 'גללו את הטבלה הצידה כדי לראות את כל המפלגות ←',
    eo: 'Ŝovu la tabelon flanken por vidi ĉiujn partiojn →',
  },
  expandAll: { en: 'Expand all', ru: 'Развернуть всё', uk: 'Розгорнути все', be: 'Разгарнуць усё', he: 'הרחבת הכול', eo: 'Malfaldi ĉion' },
  collapseAll: { en: 'Collapse all', ru: 'Свернуть всё', uk: 'Згорнути все', be: 'Згарнуць усё', he: 'כיווץ הכול', eo: 'Faldi ĉion' },
  partiesCount: { en: 'parties', ru: 'партий', uk: 'партій', be: 'партый', he: 'מפלגות', eo: 'partioj' },
  issuesCount: { en: 'issues', ru: 'вопросов', uk: 'питань', be: 'пытанняў', he: 'נושאים', eo: 'temoj' },
  officialResults: { en: 'Official results', ru: 'Официальные итоги', uk: 'Офіційні підсумки', be: 'Афіцыйныя вынікі', he: 'תוצאות רשמיות', eo: 'Oficialaj rezultoj' },
  cec: { en: 'Central Elections Committee', ru: 'Центральная избирательная комиссия', uk: 'Центральна виборча комісія', be: 'Цэнтральная выбарчая камісія', he: 'ועדת הבחירות המרכזית', eo: 'Centra Balota Komitato' },
  resultsAsOf: { en: 'Results as of', ru: 'Итоги на', uk: 'Підсумки на', be: 'Вынікі на', he: 'תוצאות נכון ל־', eo: 'Rezultoj je' },
  resultsPrelim: { en: 'Preliminary results as of', ru: 'Предварительные итоги на', uk: 'Попередні підсумки на', be: 'Папярэднія вынікі на', he: 'תוצאות חלקיות נכון ל־', eo: 'Antaŭaj rezultoj je' },
  resultTitle: {
    en: 'Seats won (share of the vote)',
    ru: 'Получено мест (доля голосов)',
    uk: 'Отримано місць (частка голосів)',
    be: 'Атрымана месцаў (доля галасоў)',
    he: 'מנדטים שהתקבלו (אחוז מהקולות)',
    eo: 'Gajnitaj seĝoj (parto de la voĉoj)',
  },
  seatsWon: { en: 'Seats won', ru: 'Получено мест', uk: 'Отримано місць', be: 'Атрымана месцаў', he: 'מנדטים', eo: 'Gajnitaj seĝoj' },
  blocsResults: {
    en: 'Blocs (seats won)',
    ru: 'Блоки (места по итогам)',
    uk: 'Блоки (місця за підсумками)',
    be: 'Блокі (месцы па выніках)',
    he: 'גושים (מנדטים בפועל)',
    eo: 'Blokoj (gajnitaj seĝoj)',
  },
  pollsAsOf: { en: 'Polls as of', ru: 'Опросы на', uk: 'Опитування на', be: 'Апытанні на', he: 'סקרים נכון ל־', eo: 'Enketoj ĝis' },
  election: { en: 'Election day', ru: 'Выборы', uk: 'Вибори', be: 'Выбары', he: 'יום הבחירות', eo: 'Balota tago' },
  minorLists: {
    en: 'About 20 more minor lists are on the ballot and not shown.',
    ru: 'В бюллетене ещё около 20 малых списков — они не показаны.',
    uk: 'У бюлетені ще близько 20 малих списків — їх не показано.',
    be: 'У бюлетэні яшчэ каля 20 малых спісаў — яны не паказаны.',
    he: 'כ־20 רשימות קטנות נוספות מתמודדות ואינן מוצגות.',
    eo: 'Ĉirkaŭ 20 pliaj malgrandaj listoj kandidatas kaj ne estas montrataj.',
  },
  noPosition: { en: 'No clear position', ru: 'Нет чёткой позиции', uk: 'Немає чіткої позиції', be: 'Няма выразнай пазіцыі', he: 'אין עמדה ברורה', eo: 'Neniu klara pozicio' },
  empty: {
    en: 'Party data is coming soon.',
    ru: 'Данные о партиях скоро появятся.',
    uk: 'Дані про партії незабаром з’являться.',
    be: 'Звесткі пра партыі неўзабаве з’явяцца.',
    he: 'נתוני המפלגות יתווספו בקרוב.',
    eo: 'Datumoj pri la partioj baldaŭ aperos.',
  },
  footer: {
    en: 'Positions summarize public platforms, statements and voting records. Click a party for its profile, or a cell for the explanation and sources.',
    ru: 'Позиции — краткое изложение программ, заявлений и голосований. Нажмите на партию, чтобы открыть её карточку, или на ячейку — для пояснения и источников.',
    uk: 'Позиції — стислий виклад програм, заяв і голосувань. Натисніть на партію, щоб відкрити її картку, або на клітинку — для пояснення та джерел.',
    be: 'Пазіцыі — сціслы выклад праграм, заяў і галасаванняў. Націсніце на партыю, каб адкрыць яе картку, або на клетку — для тлумачэння і крыніц.',
    he: 'העמדות מסכמות מצעים, הצהרות והצבעות. לחצו על מפלגה לפרופיל שלה, או על תא להסבר ולמקורות.',
    eo: 'La pozicioj resumas publikajn programojn, deklarojn kaj voĉdonojn. Alklaku partion por ĝia profilo, aŭ ĉelon por la klarigo kaj fontoj.',
  },
  tabMatrix: { en: 'Matrix', ru: 'Матрица', uk: 'Матриця', be: 'Матрыца', he: 'מטריצה', eo: 'Matrico' },
  tabMap: { en: 'Political map', ru: 'Политическая карта', uk: 'Політична мапа', be: 'Палітычная карта', he: 'מפה פוליטית', eo: 'Politika mapo' },
  tabQuiz: { en: 'Which party fits me?', ru: 'Какая партия мне ближе?', uk: 'Яка партія мені ближча?', be: 'Якая партыя мне бліжэйшая?', he: 'איזו מפלגה מתאימה לי?', eo: 'Kiu partio konvenas al mi?' },
  mapIntro: {
    en: 'Each party is a region, not a point: it stretches across the range of its positions on the issues that make up each axis. Wider means less uniform or less known.',
    ru: 'Каждая партия — область, а не точка: она тянется на весь разброс её позиций по вопросам, из которых сложена ось. Шире — значит позиции менее однородны или менее известны.',
    uk: 'Кожна партія — це область, а не точка: вона охоплює весь розкид її позицій щодо питань, з яких складається вісь. Ширша область означає, що позиції менш однорідні або менш відомі.',
    be: 'Кожная партыя — гэта вобласць, а не пункт: яна ахоплівае ўвесь разбег яе пазіцый па пытаннях, з якіх складаецца вось. Шырэйшая вобласць азначае, што пазіцыі менш аднародныя або менш вядомыя.',
    he: 'כל מפלגה היא אזור ולא נקודה: הוא נפרש על פני טווח עמדותיה בנושאים שמרכיבים כל ציר. אזור רחב יותר פירושו עמדות פחות אחידות או פחות ידועות.',
    eo: 'Ĉiu partio estas regiono, ne punkto: ĝi etendiĝas tra la amplekso de siaj pozicioj pri la temoj, el kiuj konsistas ĉiu akso. Pli larĝa signifas malpli unuecajn aŭ malpli konatajn poziciojn.',
  },
  mapViews: { en: 'Views', ru: 'Варианты', uk: 'Варіанти', be: 'Варыянты', he: 'תצוגות', eo: 'Vidoj' },
  axisX: { en: 'Horizontal', ru: 'По горизонтали', uk: 'По горизонталі', be: 'Па гарызанталі', he: 'ציר אופקי', eo: 'Horizontala' },
  axisY: { en: 'Vertical', ru: 'По вертикали', uk: 'По вертикалі', be: 'Па вертыкалі', he: 'ציר אנכי', eo: 'Vertikala' },
  mapTiers: { en: 'Show', ru: 'Показать', uk: 'Показати', be: 'Паказаць', he: 'הצגה', eo: 'Montri' },
  mapNoData: {
    en: 'Not enough data to place:',
    ru: 'Недостаточно данных, чтобы разместить:',
    uk: 'Недостатньо даних, щоб розмістити:',
    be: 'Недастаткова звестак, каб размясціць:',
    he: 'אין די נתונים כדי למקם את:',
    eo: 'Ne sufiĉas datumoj por loki:',
  },
  mapBuiltFrom: { en: 'Built from', ru: 'Из вопросов', uk: 'З питань', be: 'З пытанняў', he: 'מבוסס על', eo: 'Konstruita el' },
  you: { en: 'You', ru: 'Вы', uk: 'Ви', be: 'Вы', he: 'את/ה', eo: 'Vi' },
  quizIntro: {
    en: 'Mark how much you agree with each statement. Skip any you have no view on; mark the ones that matter most to you as important — they count double.',
    ru: 'Отметьте, насколько вы согласны с каждым утверждением. Пропускайте те, где нет мнения; самые важные для вас отметьте звёздочкой — они считаются вдвойне.',
    uk: 'Позначте, наскільки ви згодні з кожним твердженням. Пропускайте ті, щодо яких не маєте думки; найважливіші для вас позначте зірочкою — вони враховуються подвійно.',
    be: 'Адзначце, наколькі вы згодныя з кожным сцвярджэннем. Прапускайце тыя, пра якія не маеце меркавання; найважнейшыя для вас адзначце зорачкай — яны лічацца ўдвая.',
    he: 'סמנו עד כמה אתם מסכימים עם כל קביעה. דלגו על מה שאין לכם עמדה לגביו; סמנו בכוכב את הנושאים החשובים לכם — הם נספרים כפול.',
    eo: 'Marku, kiom vi konsentas kun ĉiu aserto. Preterlasu tiujn, pri kiuj vi ne havas opinion; marku la plej gravajn per stelo — ili kalkuliĝas duoble.',
  },
  aboutNow: { en: 'Background', ru: 'Контекст', uk: 'Контекст', be: 'Кантэкст', he: 'רקע', eo: 'Kunteksto' },
  argsFor: { en: 'Arguments for', ru: 'Аргументы за', uk: 'Аргументи за', be: 'Аргументы за', he: 'טיעונים בעד', eo: 'Argumentoj por' },
  argsAgainst: { en: 'Arguments against', ru: 'Аргументы против', uk: 'Аргументи проти', be: 'Аргументы супраць', he: 'טיעונים נגד', eo: 'Argumentoj kontraŭ' },
  important: { en: 'Important to me', ru: 'Важно для меня', uk: 'Важливо для мене', be: 'Важна для мяне', he: 'חשוב לי', eo: 'Grava por mi' },
  answered: { en: 'answered', ru: 'отвечено', uk: 'питань із відповіддю', be: 'адказана', he: 'נענו', eo: 'responditaj' },
  quizResults: { en: 'Your closest parties', ru: 'Ближайшие к вам партии', uk: 'Найближчі до вас партії', be: 'Найбліжэйшыя да вас партыі', he: 'המפלגות הקרובות אליכם', eo: 'Viaj plej proksimaj partioj' },
  quizNeedMore: {
    en: 'Answer at least 3 statements to see results.',
    ru: 'Ответьте хотя бы на 3 утверждения, чтобы увидеть результат.',
    uk: 'Дайте відповідь хоча б на 3 твердження, щоб побачити результат.',
    be: 'Адкажыце хоць бы на 3 сцвярджэнні, каб убачыць вынік.',
    he: 'ענו על 3 קביעות לפחות כדי לראות תוצאות.',
    eo: 'Respondu almenaŭ 3 asertojn por vidi rezultojn.',
  },
  quizCompared: { en: 'issues compared', ru: 'вопросов сравнено', uk: 'питань порівняно', be: 'пытанняў параўнана', he: 'נושאים הושוו', eo: 'temoj komparitaj' },
  quizReset: { en: 'Start over', ru: 'Начать заново', uk: 'Почати знову', be: 'Пачаць нанова', he: 'התחלה מחדש', eo: 'Rekomenci' },
  quizOnMap: { en: 'See yourself on the map', ru: 'Посмотреть себя на карте', uk: 'Побачити себе на мапі', be: 'Убачыць сябе на карце', he: 'הציגו אותי במפה', eo: 'Vidi min sur la mapo' },
  mapTeaser: {
    en: 'Where are you on the political map?',
    ru: 'Где вы на политической карте?',
    uk: 'Де ви на політичній мапі?',
    be: 'Дзе вы на палітычнай карце?',
    he: 'איפה אתם על המפה הפוליטית?',
    eo: 'Kie vi estas sur la politika mapo?',
  },
  quizNote: {
    en: 'Match = how close your answers are to each party’s stance, over the issues where the party has a known position. Your answers stay in this browser.',
    ru: 'Совпадение — насколько ваши ответы близки к позициям партии по вопросам, где её позиция известна. Ответы хранятся только в этом браузере.',
    uk: 'Збіг — наскільки ваші відповіді близькі до позицій партії з питань, де її позиція відома. Відповіді зберігаються лише в цьому браузері.',
    be: 'Супадзенне — наколькі вашы адказы блізкія да пазіцый партыі па пытаннях, дзе яе пазіцыя вядомая. Адказы захоўваюцца толькі ў гэтым браўзеры.',
    he: 'התאמה = עד כמה תשובותיכם קרובות לעמדת המפלגה, בנושאים שבהם עמדתה ידועה. התשובות נשמרות רק בדפדפן הזה.',
    eo: 'Kongruo = kiom proksimaj viaj respondoj estas al la sinteno de ĉiu partio, pri la temoj kie ĝia pozicio estas konata. Viaj respondoj restas en ĉi tiu retumilo.',
  },
  footAbout: {
    en: 'An independent, non-partisan project. Not affiliated with any party or campaign.',
    ru: 'Независимый внепартийный проект. Не связан ни с одной партией или кампанией.',
    uk: 'Незалежний позапартійний проєкт. Не пов’язаний із жодною партією чи кампанією.',
    be: 'Незалежны пазапартыйны праект. Не звязаны ні з адной партыяй або кампаніяй.',
    he: 'פרויקט עצמאי ובלתי מפלגתי. אינו קשור לשום מפלגה או קמפיין.',
    eo: 'Sendependa, nepartia projekto. Ne ligita al iu ajn partio aŭ kampanjo.',
  },
  footViews: { en: 'Explore', ru: 'Разделы', uk: 'Розділи', be: 'Раздзелы', he: 'ניווט', eo: 'Esplori' },
  footProject: { en: 'Project', ru: 'Проект', uk: 'Проєкт', be: 'Праект', he: 'הפרויקט', eo: 'Projekto' },
  footSource: { en: 'Source code & data', ru: 'Код и данные', uk: 'Код і дані', be: 'Код і даныя', he: 'קוד ונתונים', eo: 'Fontkodo kaj datumoj' },
  footReport: { en: 'Report an error', ru: 'Сообщить об ошибке', uk: 'Повідомити про помилку', be: 'Паведаміць пра памылку', he: 'דיווח על טעות', eo: 'Raporti eraron' },
  footMore: { en: 'More from lipu.dev', ru: 'Другие проекты lipu.dev', uk: 'Інші проєкти lipu.dev', be: 'Іншыя праекты lipu.dev', he: 'עוד ב־lipu.dev', eo: 'Pli ĉe lipu.dev' },
  heroKicker: { en: 'Your result', ru: 'Ваш результат', uk: 'Ваш результат', be: 'Ваш вынік', he: 'התוצאה שלכם', eo: 'Via rezulto' },
  heroLead: {
    en: 'Closest to your views',
    ru: 'Ближе всего к вашим взглядам',
    uk: 'Найближча до ваших поглядів',
    be: 'Найбліжэйшая да вашых поглядаў',
    he: 'הכי קרובה לעמדות שלכם',
    eo: 'Plej proksima al viaj vidpunktoj',
  },
  heroNext: { en: 'Next', ru: 'Следом', uk: 'Далі', be: 'Далей', he: 'אחריה', eo: 'Poste' },
  shareResult: {
    en: 'Share my result',
    ru: 'Поделиться результатом',
    uk: 'Поділитися результатом',
    be: 'Падзяліцца вынікам',
    he: 'שיתוף התוצאה',
    eo: 'Kunhavigi mian rezulton',
  },
  shareText: {
    en: 'My quiz result: closest is {party} ({pct}%). What about you?',
    ru: 'Мой результат теста: ближе всего — {party} ({pct}%). А у тебя?',
    uk: 'Мій результат тесту: найближче — {party} ({pct}%). А в тебе?',
    be: 'Мой вынік тэсту: найбліжэй — {party} ({pct}%). А ў цябе?',
    he: 'התוצאה שלי במבחן: הכי קרובה — {party} ({pct}%). ומה אצלכם?',
    eo: 'Mia kviza rezulto: plej proksima estas {party} ({pct}%). Kaj via?',
  },
  sharedResult: {
    en: 'This is a shared quiz result: closest party — {party}. Take the quiz yourself and compare.',
    ru: 'Это результат теста по ссылке: ближе всего — {party}. Пройдите тест сами и сравните.',
    uk: 'Це результат тесту за посиланням: найближча — {party}. Пройдіть тест самі й порівняйте.',
    be: 'Гэта вынік тэсту па спасылцы: найбліжэйшая — {party}. Прайдзіце тэст самі і параўнайце.',
    he: 'זו תוצאת מבחן ששותפה: הכי קרובה — {party}. עשו את המבחן בעצמכם והשוו.',
    eo: 'Jen kunhavigita kviza rezulto: plej proksima partio — {party}. Faru la kvizon mem kaj komparu.',
  },
  quizOwn: {
    en: 'Take the quiz myself',
    ru: 'Пройти тест самому',
    uk: 'Пройти тест самому',
    be: 'Прайсці тэст самому',
    he: 'לעשות את המבחן בעצמי',
    eo: 'Fari la kvizon mem',
  },
  copied: { en: 'Link copied', ru: 'Ссылка скопирована', uk: 'Посилання скопійовано', be: 'Спасылка скапіявана', he: 'הקישור הועתק', eo: 'Ligilo kopiita' },
  footAnalytics: {
    en: 'Visits are counted with Google Analytics.',
    ru: 'Посещения считаются через Google Analytics.',
    uk: 'Відвідування підраховуються за допомогою Google Analytics.',
    be: 'Наведванні падлічваюцца з дапамогай Google Analytics.',
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
