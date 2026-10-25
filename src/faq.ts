import { aspects, blocs, meta, parties } from './data';
import { formatDateIn } from './i18n';
import type { Lang, Party } from './types';

type Text = Record<Lang, string>;
// Russian, Ukrainian and Belarusian dates end in "г." / "р."; the sentences spell out "года" / "року" themselves.
const day = (lang: Lang, iso: string) => formatDateIn(lang, iso).replace(/\s?(г|р)\.$/, '');
const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

/** Page headings, worded the way people search. */
export const HEADINGS: Record<'matrix' | 'map' | 'quiz' | 'party', Text> = {
  matrix: {
    en: 'Israel Election 2026: Where the Parties Stand',
    ru: 'Выборы в Кнессет 2026: позиции партий',
    uk: 'Вибори до Кнесету 2026: позиції партій',
    be: 'Выбары ў Кнэсет 2026: пазіцыі партый',
    he: 'בחירות 2026: איפה המפלגות עומדות',
    eo: 'Israelaj elektoj 2026: kie staras la partioj',
  },
  map: {
    en: 'Political map of Israeli parties',
    ru: 'Политическая карта партий Израиля',
    uk: 'Політична мапа партій Ізраїлю',
    be: 'Палітычная карта партый Ізраіля',
    he: 'המפה הפוליטית של המפלגות',
    eo: 'Politika mapo de israelaj partioj',
  },
  quiz: {
    en: 'Which party should I vote for? Quiz',
    ru: 'За кого голосовать? Тест на совпадение с партиями',
    uk: 'За кого голосувати? Тест на збіг із партіями',
    be: 'За каго галасаваць? Тэст на супадзенне з партыямі',
    he: 'למי להצביע? מבחן התאמה למפלגות',
    eo: 'Por kiu voĉdoni? Kvizo',
  },
  party: {
    en: '{party}: positions in the 2026 election',
    ru: '{party}: позиции на выборах 2026',
    uk: '{party}: позиції на виборах 2026',
    be: '{party}: пазіцыі на выбарах 2026',
    he: '{party}: העמדות בבחירות 2026',
    eo: '{party}: pozicioj en la elektoj 2026',
  },
};

const SUBTITLE: Text = {
  en: '{parties} parties × {issues} key issues, with sources',
  ru: '{parties} партий × {issues} ключевых вопросов — с источниками',
  uk: '{parties} партій × {issues} ключових питань — із джерелами',
  be: '{parties} партый × {issues} ключавых пытанняў — з крыніцамі',
  he: '{parties} מפלגות × {issues} נושאים מרכזיים, עם מקורות',
  eo: '{parties} partioj × {issues} ĉefaj temoj, kun fontoj',
};

export const subtitle = (lang: Lang) => fill(SUBTITLE[lang], { parties: parties.length, issues: aspects.length });

const INTRO: Text = {
  en: 'On {date} Israel elects its 26th Knesset. Here are the positions of {parties} parties on {issues} key issues — from a Palestinian state and Gaza to the Haredi draft and the cost of living. Tap a party or a cell for the explanation and sources; not sure whom to vote for? <a href="{quiz}">Take the quiz</a>.',
  ru: '{date} года Израиль выбирает 26-й Кнессет. Здесь собраны позиции {parties} партий по {issues} ключевым вопросам — от палестинского государства и Газы до призыва харедим и стоимости жизни. Нажмите на партию или ячейку, чтобы увидеть объяснение и источники; не знаете, за кого голосовать, — <a href="{quiz}">пройдите тест</a>.',
  uk: '{date} року Ізраїль обирає 26-й Кнесет. Тут зібрано позиції {parties} партій щодо {issues} ключових питань — від палестинської держави й Гази до призову харедим і вартості життя. Натисніть на партію чи клітинку, щоб побачити пояснення та джерела; не знаєте, за кого голосувати, — <a href="{quiz}">пройдіть тест</a>.',
  be: '{date} года Ізраіль выбірае 26-ы Кнэсет. Тут сабраны пазіцыі {parties} партый па {issues} ключавых пытаннях — ад палестынскай дзяржавы і Газы да прызыву харэдым і кошту жыцця. Націсніце на партыю або клетку, каб убачыць тлумачэнне і крыніцы; не ведаеце, за каго галасаваць, — <a href="{quiz}">прайдзіце тэст</a>.',
  he: 'ב־{date} ייבחרו חברי הכנסת ה־26. כאן מרוכזות העמדות של {parties} מפלגות ב־{issues} נושאים מרכזיים — ממדינה פלסטינית ועזה ועד גיוס חרדים ויוקר המחיה. לחצו על מפלגה או על משבצת כדי לראות הסבר ומקורות; לא בטוחים למי להצביע? <a href="{quiz}">עשו את מבחן ההתאמה</a>.',
  eo: 'La {date} Israelo elektas sian 26-an Kneseton. Ĉi tie estas la pozicioj de {parties} partioj pri {issues} ĉefaj temoj — de palestina ŝtato kaj Gazao ĝis la konskripcio de ĥaredoj kaj la vivkostoj. Tuŝu partion aŭ ĉelon por la klarigo kaj fontoj; ne certas, por kiu voĉdoni? <a href="{quiz}">Faru la kvizon</a>.',
};

export const intro = (lang: Lang, quiz: string) =>
  fill(INTRO[lang], { date: day(lang, meta.electionDate), parties: parties.length, issues: aspects.length, quiz });

const FAQ_TITLE: Text = {
  en: 'Questions and answers',
  ru: 'Вопросы и ответы',
  uk: 'Питання та відповіді',
  be: 'Пытанні і адказы',
  he: 'שאלות ותשובות',
  eo: 'Demandoj kaj respondoj',
};

const QA: { q: Text; a: Text }[] = [
  {
    q: {
      en: 'When is the Knesset election?',
      ru: 'Когда выборы в Кнессет?',
      uk: 'Коли вибори до Кнесету?',
      be: 'Калі выбары ў Кнэсет?',
      he: 'מתי הבחירות לכנסת?',
      eo: 'Kiam okazas la Kneseta elekto?',
    },
    a: {
      en: 'The election to the 26th Knesset is on {date}. Election day is a public holiday.',
      ru: 'Выборы в 26-й Кнессет пройдут {date} года. День выборов — выходной.',
      uk: 'Вибори до 26-го Кнесету відбудуться {date} року. День виборів — вихідний.',
      be: 'Выбары ў 26-ы Кнэсет адбудуцца {date} года. Дзень выбараў — выхадны.',
      he: 'הבחירות לכנסת ה־26 ייערכו ב־{date}. יום הבחירות הוא יום שבתון.',
      eo: 'La elekto de la 26-a Kneseto okazos la {date}. La balotada tago estas libertago.',
    },
  },
  {
    q: {
      en: 'How does the election work?',
      ru: 'Как устроены выборы?',
      uk: 'Як відбуваються вибори?',
      be: 'Як праходзяць выбары?',
      he: 'איך עובדת שיטת הבחירות?',
      eo: 'Kiel funkcias la elekto?',
    },
    a: {
      en: 'You vote for a nationwide party list. The 120 seats are shared in proportion to the vote among the lists that pass the 3.25% threshold (about 4 seats). Forming a government takes a coalition of 61 members.',
      ru: 'Голосуют за общенациональный партийный список. 120 мест делятся пропорционально голосам между списками, преодолевшими барьер 3,25% (около 4 мест). Чтобы сформировать правительство, нужна коалиция из 61 депутата.',
      uk: 'Голосують за загальнонаціональний партійний список. 120 місць розподіляються пропорційно голосам між списками, що подолали бар’єр 3,25% (близько 4 місць). Щоб сформувати уряд, потрібна коаліція з 61 депутата.',
      be: 'Галасуюць за агульнанацыянальны партыйны спіс. 120 месцаў размяркоўваюцца прапарцыйна галасам паміж спісамі, якія пераадолелі бар’ер 3,25% (каля 4 месцаў). Каб сфармаваць урад, патрэбна кааліцыя з 61 дэпутата.',
      he: 'מצביעים לרשימה מפלגתית ארצית. 120 המושבים מתחלקים באופן יחסי בין הרשימות שעברו את אחוז החסימה — 3.25% מהקולות (כ־4 מנדטים). כדי להרכיב ממשלה דרושה קואליציה של 61 חברי כנסת.',
      eo: 'Oni voĉdonas por tutlanda partia listo. La 120 seĝoj estas dividataj proporcie inter la listoj, kiuj superas la sojlon de 3,25% (ĉirkaŭ 4 seĝoj). Por formi registaron necesas koalicio de 61 membroj.',
    },
  },
  {
    q: {
      en: 'Which parties pass the threshold in the polls?',
      ru: 'Какие партии проходят в Кнессет по опросам?',
      uk: 'Які партії проходять до Кнесету за опитуваннями?',
      be: 'Якія партыі праходзяць у Кнэсет паводле апытанняў?',
      he: 'אילו מפלגות עוברות את אחוז החסימה בסקרים?',
      eo: 'Kiuj partioj superas la sojlon laŭ la enketoj?',
    },
    a: {
      en: 'By the poll average as of {polls}, {n} lists pass comfortably: {likely}. Around the threshold: {borderline}.',
      ru: 'По среднему опросов на {polls} года барьер уверенно проходят {n} списков: {likely}. Около барьера: {borderline}.',
      uk: 'За середнім значенням опитувань станом на {polls} року бар’єр упевнено долають {n} списків: {likely}. Біля бар’єра: {borderline}.',
      be: 'Паводле сярэдняга па апытаннях на {polls} года бар’ер упэўнена пераадольваюць {n} спісаў: {likely}. Каля бар’ера: {borderline}.',
      he: 'לפי ממוצע הסקרים נכון ל־{polls}, {n} רשימות עוברות בבטחה: {likely}. סביב אחוז החסימה: {borderline}.',
      eo: 'Laŭ la meznombro de enketoj je la {polls}, {n} listoj sekure superas la sojlon: {likely}. Ĉirkaŭ la sojlo: {borderline}.',
    },
  },
  {
    q: {
      en: 'What is the balance between the blocs?',
      ru: 'Каков расклад между блоками?',
      uk: 'Яке співвідношення сил між блоками?',
      be: 'Якая расстаноўка сіл паміж блокамі?',
      he: 'מה מאזן הגושים?',
      eo: 'Kia estas la ekvilibro inter la blokoj?',
    },
    a: {
      en: 'Seats in the polls, counting only the lists that pass: {blocs}. A majority takes 61.',
      ru: 'Места по опросам, если считать только проходящие списки: {blocs}. Для большинства нужно 61 место.',
      uk: 'Місця за опитуваннями, якщо рахувати лише списки, що проходять: {blocs}. Для більшості потрібно 61 місце.',
      be: 'Месцы паводле апытанняў, калі лічыць толькі спісы, што праходзяць: {blocs}. Для большасці патрэбна 61 месца.',
      he: 'מנדטים בסקרים, בספירת הרשימות שעוברות בלבד: {blocs}. לרוב נדרשים 61 מנדטים.',
      eo: 'Seĝoj laŭ la enketoj, kalkulante nur la listojn, kiuj superas la sojlon: {blocs}. Por plimulto necesas 61 seĝoj.',
    },
  },
  {
    q: {
      en: 'How do I decide whom to vote for?',
      ru: 'Как понять, за кого голосовать?',
      uk: 'Як зрозуміти, за кого голосувати?',
      be: 'Як зразумець, за каго галасаваць?',
      he: 'איך להחליט למי להצביע?',
      eo: 'Kiel decidi, por kiu voĉdoni?',
    },
    a: {
      en: 'Answer the {issues} questions of the <a href="{quiz}">quiz</a> and see which parties match you best. The <a href="{map}">political map</a> shows where the parties sit relative to each other, and the table above gives every party’s stance on every issue, with sources.',
      ru: 'Ответьте на {issues} вопросов <a href="{quiz}">теста</a> и посмотрите, с какими партиями совпадение выше. На <a href="{map}">политической карте</a> видно, где партии находятся относительно друг друга, а в таблице выше — позиция каждой партии по каждому вопросу с источниками.',
      uk: 'Дайте відповідь на {issues} запитань <a href="{quiz}">тесту</a> й подивіться, з якими партіями у вас найбільший збіг. На <a href="{map}">політичній мапі</a> видно, де партії розташовані одна щодо одної, а в таблиці вище — позиція кожної партії щодо кожного питання з джерелами.',
      be: 'Адкажыце на {issues} пытанняў <a href="{quiz}">тэсту</a> і паглядзіце, з якімі партыямі ў вас найбольшае супадзенне. На <a href="{map}">палітычнай карце</a> відаць, дзе партыі знаходзяцца адна адносна адной, а ў табліцы вышэй — пазіцыя кожнай партыі па кожным пытанні з крыніцамі.',
      he: 'ענו על {issues} השאלות ב<a href="{quiz}">מבחן ההתאמה</a> וראו עם אילו מפלגות ההתאמה הגבוהה ביותר. ב<a href="{map}">מפה הפוליטית</a> רואים איפה המפלגות ממוקמות זו ביחס לזו, ובטבלה למעלה — עמדת כל מפלגה בכל נושא, עם מקורות.',
      eo: 'Respondu la {issues} demandojn de la <a href="{quiz}">kvizo</a> kaj vidu, kiuj partioj plej kongruas kun vi. La <a href="{map}">politika mapo</a> montras, kie la partioj troviĝas unu rilate al la alia, kaj la supra tabelo donas la sintenon de ĉiu partio pri ĉiu temo, kun fontoj.',
    },
  },
  {
    q: {
      en: 'Where does the information come from?',
      ru: 'Откуда эти данные?',
      uk: 'Звідки ці дані?',
      be: 'Адкуль гэтыя звесткі?',
      he: 'מאיפה המידע?',
      eo: 'De kie venas la informoj?',
    },
    a: {
      en: 'The positions are based on party platforms, statements by party leaders and press reports; every rating links to its sources. The site is independent and not affiliated with any party. Found a mistake? <a href="{report}">Report it on GitHub</a>.',
      ru: 'Позиции основаны на программах партий, заявлениях их лидеров и публикациях в прессе; у каждой оценки есть ссылки на источники. Сайт независимый и не связан ни с одной партией. Нашли ошибку? <a href="{report}">Сообщите на GitHub</a>.',
      uk: 'Позиції ґрунтуються на програмах партій, заявах їхніх лідерів і публікаціях у пресі; кожна оцінка має посилання на джерела. Сайт незалежний і не пов’язаний із жодною партією. Знайшли помилку? <a href="{report}">Повідомте на GitHub</a>.',
      be: 'Пазіцыі заснаваныя на праграмах партый, заявах іх лідараў і публікацыях у прэсе; кожная ацэнка мае спасылкі на крыніцы. Сайт незалежны і не звязаны ні з адной партыяй. Знайшлі памылку? <a href="{report}">Паведаміце на GitHub</a>.',
      he: 'העמדות מבוססות על מצעי המפלגות, הצהרות ראשיהן ודיווחים בתקשורת; לכל הערכה יש קישורים למקורות. האתר עצמאי ואינו קשור לאף מפלגה. מצאתם טעות? <a href="{report}">דווחו ב־GitHub</a>.',
      eo: 'La pozicioj baziĝas sur partiaj programoj, deklaroj de la partiestroj kaj gazetaraj raportoj; ĉiu takso ligas al siaj fontoj. La retejo estas sendependa kaj ne ligita al iu ajn partio. Ĉu vi trovis eraron? <a href="{report}">Raportu ĝin ĉe GitHub</a>.',
    },
  },
];

export interface FaqLinks {
  quiz: string;
  map: string;
  report: string;
}

const byPolls = (a: Party, b: Party) => (b.polls?.avg ?? 0) - (a.polls?.avg ?? 0);
const listed = (ps: Party[], lang: Lang) =>
  ps
    .sort(byPolls)
    .map((p) => `${p.name[lang]} (~${p.polls?.avg ?? 0})`)
    .join(', ');

/** Questions with answers (HTML, links included), filled in from the data. */
export function faqItems(lang: Lang, links: FaqLinks): { q: string; a: string }[] {
  const likely = parties.filter((p) => p.tier === 'likely');
  const seats = (bloc: string) => likely.filter((p) => p.bloc === bloc).reduce((n, p) => n + (p.polls?.avg ?? 0), 0);
  const vars = {
    date: day(lang, meta.electionDate),
    polls: day(lang, meta.pollsAsOf),
    n: likely.length,
    likely: listed(likely, lang),
    borderline: listed(
      parties.filter((p) => p.tier === 'borderline'),
      lang,
    ),
    blocs: blocs.map((b) => `${b.name[lang]} — ~${seats(b.id)}`).join('; '),
    issues: aspects.length,
    ...links,
  };
  return QA.map(({ q, a }) => ({ q: q[lang], a: fill(a[lang], vars) }));
}

export function renderFaq(lang: Lang, links: FaqLinks): string {
  const items = faqItems(lang, links)
    .map(({ q, a }) => `<div class="faq__item"><h3>${q}</h3><p>${a}</p></div>`)
    .join('');
  return `<section class="faq" aria-labelledby="faq-title"><h2 id="faq-title">${FAQ_TITLE[lang]}</h2><div class="faq__grid">${items}</div></section>`;
}
