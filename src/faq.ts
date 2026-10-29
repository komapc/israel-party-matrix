import { aspects, blocs, counted, meta, parties, seatsOf } from './data';
import { formatDateIn, formatPct } from './i18n';
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
  en: 'On {date} Israel elected its 26th Knesset. Here are the positions of {parties} parties on {issues} key issues — from a Palestinian state and Gaza to the Haredi draft and the cost of living. Tap a party or a cell for the explanation and sources, or <a href="{quiz}">take the quiz</a> to see which parties are closest to your views.',
  ru: '{date} года Израиль избрал 26-й Кнессет. Здесь собраны позиции {parties} партий по {issues} ключевым вопросам — от палестинского государства и Газы до призыва харедим и стоимости жизни. Нажмите на партию или ячейку, чтобы увидеть объяснение и источники, или <a href="{quiz}">пройдите тест</a>, чтобы узнать, какие партии ближе к вашим взглядам.',
  uk: '{date} року Ізраїль обрав 26-й Кнесет. Тут зібрано позиції {parties} партій щодо {issues} ключових питань — від палестинської держави й Гази до призову харедим і вартості життя. Натисніть на партію чи клітинку, щоб побачити пояснення та джерела, або <a href="{quiz}">пройдіть тест</a>, щоб дізнатися, які партії ближчі до ваших поглядів.',
  be: '{date} года Ізраіль абраў 26-ы Кнэсет. Тут сабраны пазіцыі {parties} партый па {issues} ключавых пытаннях — ад палестынскай дзяржавы і Газы да прызыву харэдым і кошту жыцця. Націсніце на партыю або клетку, каб убачыць тлумачэнне і крыніцы, або <a href="{quiz}">прайдзіце тэст</a>, каб даведацца, якія партыі бліжэйшыя да вашых поглядаў.',
  he: 'ב־{date} נבחרה הכנסת ה־26. כאן מרוכזות העמדות של {parties} מפלגות ב־{issues} נושאים מרכזיים — ממדינה פלסטינית ועזה ועד גיוס חרדים ויוקר המחיה. לחצו על מפלגה או על משבצת כדי לראות הסבר ומקורות, או <a href="{quiz}">עשו את מבחן ההתאמה</a> כדי לגלות אילו מפלגות הכי קרובות לעמדותיכם.',
  eo: 'La {date} Israelo elektis sian 26-an Kneseton. Ĉi tie estas la pozicioj de {parties} partioj pri {issues} ĉefaj temoj — de palestina ŝtato kaj Gazao ĝis la konskripcio de ĥaredoj kaj la vivkostoj. Tuŝu partion aŭ ĉelon por la klarigo kaj fontoj, aŭ <a href="{quiz}">faru la kvizon</a> por vidi, kiuj partioj estas plej proksimaj al viaj vidpunktoj.',
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

/** `counted` replaces the question or answer once election results are in. */
const QA: { q: Text; a: Text; counted?: { q?: Text; a: Text } }[] = [
  {
    q: {
      en: 'When was the Knesset election?',
      ru: 'Когда прошли выборы в Кнессет?',
      uk: 'Коли відбулися вибори до Кнесету?',
      be: 'Калі адбыліся выбары ў Кнэсет?',
      he: 'מתי התקיימו הבחירות לכנסת?',
      eo: 'Kiam okazis la Kneseta elekto?',
    },
    a: {
      en: 'The election to the 26th Knesset was held on {date}.',
      ru: 'Выборы в 26-й Кнессет прошли {date} года.',
      uk: 'Вибори до 26-го Кнесету відбулися {date} року.',
      be: 'Выбары ў 26-ы Кнэсет адбыліся {date} года.',
      he: 'הבחירות לכנסת ה־26 התקיימו ב־{date}.',
      eo: 'La elekto de la 26-a Kneseto okazis la {date}.',
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
    counted: {
      q: {
        en: 'Which parties made it into the Knesset?',
        ru: 'Какие партии прошли в Кнессет?',
        uk: 'Які партії пройшли до Кнесету?',
        be: 'Якія партыі прайшлі ў Кнэсет?',
        he: 'אילו מפלגות נכנסו לכנסת?',
        eo: 'Kiuj partioj eniris la Kneseton?',
      },
      a: {
        en: '{results} {asOf}, {n} lists won seats: {likely}.{close}',
        ru: '{results} {asOf} года места получили {n} списков: {likely}.{close}',
        uk: '{results} {asOf} року місця отримали {n} списків: {likely}.{close}',
        be: '{results} {asOf} года месцы атрымалі {n} спісаў: {likely}.{close}',
        he: '{results}{asOf}, {n} רשימות זכו במנדטים: {likely}.{close}',
        eo: '{results} la {asOf}, {n} listoj gajnis seĝojn: {likely}.{close}',
      },
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
    counted: {
      a: {
        en: 'Seats won: {blocs}. A majority takes 61.',
        ru: 'Места по итогам выборов: {blocs}. Для большинства нужно 61 место.',
        uk: 'Місця за підсумками виборів: {blocs}. Для більшості потрібно 61 місце.',
        be: 'Месцы па выніках выбараў: {blocs}. Для большасці патрэбна 61 месца.',
        he: 'מנדטים בפועל: {blocs}. לרוב נדרשים 61 מנדטים.',
        eo: 'Gajnitaj seĝoj: {blocs}. Por plimulto necesas 61 seĝoj.',
      },
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

/** Lead-in of the results answer, before the date. */
const RESULTS: Record<'final' | 'prelim', Text> = {
  final: { en: 'By the official results of', ru: 'По официальным итогам на', uk: 'За офіційними підсумками станом на', be: 'Паводле афіцыйных вынікаў на', he: 'לפי התוצאות הרשמיות נכון ל־', eo: 'Laŭ la oficialaj rezultoj je' },
  prelim: { en: 'By the preliminary results of', ru: 'По предварительным итогам на', uk: 'За попередніми підсумками станом на', be: 'Паводле папярэдніх вынікаў на', he: 'לפי התוצאות החלקיות נכון ל־', eo: 'Laŭ la antaŭaj rezultoj je' },
};
/** Mid-count sentence on lists still at the threshold. */
const CLOSE: Text = {
  en: ' Still around the threshold: {borderline}.',
  ru: ' Пока на грани барьера: {borderline}.',
  uk: ' Поки на межі бар’єра: {borderline}.',
  be: ' Пакуль на мяжы бар’ера: {borderline}.',
  he: ' עדיין על סף אחוז החסימה: {borderline}.',
  eo: ' Ankoraŭ ĉe la sojlo: {borderline}.',
};

const bySeats = (a: Party, b: Party) => seatsOf(b) - seatsOf(a);
const listed = (ps: Party[], lang: Lang) =>
  ps
    .sort(bySeats)
    // Mid-count, a list at the threshold has no seats yet: its share of the vote says more.
    .map((p) => `${p.name[lang]} (${!counted ? `~${seatsOf(p)}` : seatsOf(p) || p.result?.pct === undefined ? seatsOf(p) : formatPct(lang, p.result.pct)})`)
    .join(', ');

/** Questions with answers (HTML, links included), filled in from the data. */
export function faqItems(lang: Lang, links: FaqLinks): { q: string; a: string }[] {
  const likely = parties.filter((p) => p.tier === 'likely');
  const borderline = listed(
    parties.filter((p) => p.tier === 'borderline'),
    lang,
  );
  const seats = (bloc: string) =>
    (counted ? parties : likely).filter((p) => p.bloc === bloc).reduce((n, p) => n + seatsOf(p), 0);
  const vars = {
    date: day(lang, meta.electionDate),
    polls: day(lang, meta.pollsAsOf),
    n: likely.length,
    likely: listed(likely, lang),
    borderline,
    blocs: blocs.map((b) => `${b.name[lang]} — ${counted ? '' : '~'}${seats(b.id)}`).join('; '),
    results: meta.results ? RESULTS[meta.results.final ? 'final' : 'prelim'][lang] : '',
    asOf: meta.results ? day(lang, meta.results.asOf) : '',
    close: borderline ? fill(CLOSE[lang], { borderline }) : '',
    issues: aspects.length,
    ...links,
  };
  return QA.map(({ q, a, counted: c }) => {
    const use = counted && c ? { q: c.q ?? q, a: c.a } : { q, a };
    return { q: use.q[lang], a: fill(use.a[lang], vars) };
  });
}

export function renderFaq(lang: Lang, links: FaqLinks): string {
  const items = faqItems(lang, links)
    .map(({ q, a }) => `<div class="faq__item"><h3>${q}</h3><p>${a}</p></div>`)
    .join('');
  return `<section class="faq" aria-labelledby="faq-title"><h2 id="faq-title">${FAQ_TITLE[lang]}</h2><div class="faq__grid">${items}</div></section>`;
}
