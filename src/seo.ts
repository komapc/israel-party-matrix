import { aspectById, dimensions, meta, partyById, positionIndex } from './data';
import { faqItems } from './faq';
import { LANGS, LOCALES, ui } from './i18n';
import { type Route, formatRoute, pagePath } from './route';
import type { Lang } from './types';

export const SITE = 'https://elections-2026.lipu.dev';

type Text = Record<Lang, string>;

const SITE_NAME: Text = {
  en: 'Israel Election 2026: Party Positions',
  ru: 'Выборы в Израиле 2026: позиции партий',
  uk: 'Вибори в Ізраїлі 2026: позиції партій',
  he: 'בחירות 2026: עמדות המפלגות',
  eo: 'Israelaj elektoj 2026: pozicioj de la partioj',
};

const MATRIX_TITLE: Text = {
  en: 'Israel Election 2026: Where the Parties Stand on Key Issues',
  ru: 'Выборы в Израиле 2026: позиции партий по ключевым вопросам',
  uk: 'Вибори в Ізраїлі 2026: позиції партій щодо ключових питань',
  he: 'בחירות 2026: עמדות המפלגות בנושאים המרכזיים — טבלת השוואה',
  eo: 'Israelaj elektoj 2026: kie la partioj staras pri la ĉefaj temoj',
};

const MATRIX_DESC: Text = {
  en: 'Compare 16 parties running in the Knesset election on 27 October 2026 on 13 key issues: Palestinian state, settlements, Gaza, Haredi draft, judicial overhaul, cost of living and more — with sources, a political map and a quiz.',
  ru: 'Сравните позиции 16 партий на выборах в Кнессет 27 октября 2026 года по 13 ключевым вопросам: палестинское государство, поселения, Газа, призыв харедим, судебная реформа, стоимость жизни и другие — с источниками, политической картой и тестом.',
  uk: 'Порівняйте позиції 16 партій на виборах до Кнесету 27 жовтня 2026 року щодо 13 ключових питань: палестинська держава, поселення, Газа, призов харедим, судова реформа, вартість життя тощо — з джерелами, політичною мапою та тестом.',
  he: 'השוו בין עמדות 16 המפלגות המתמודדות בבחירות לכנסת ב־27 באוקטובר 2026 ב־13 נושאים: מדינה פלסטינית, התנחלויות, עזה, גיוס חרדים, הרפורמה המשפטית, יוקר המחיה ועוד — עם מקורות, מפה פוליטית ומבחן התאמה.',
  eo: 'Komparu 16 partiojn en la Kneseta elekto de la 27-a de oktobro 2026 pri 13 ĉefaj temoj: palestina ŝtato, kolonioj, Gazao, konskripcio de ĥaredoj, jura reformo, vivkostoj kaj pli — kun fontoj, politika mapo kaj kvizo.',
};

const MAP_TITLE: Text = {
  en: 'Political map of Israeli parties 2026',
  ru: 'Политическая карта партий Израиля 2026',
  uk: 'Політична мапа партій Ізраїлю 2026',
  he: 'המפה הפוליטית של המפלגות בישראל 2026',
  eo: 'Politika mapo de israelaj partioj 2026',
};

const MAP_DESC: Text = {
  en: 'Where Israeli parties sit on a two-dimensional political map ahead of the 27 October 2026 election. Choose the axes: economy, security, religion and state, civil liberties, courts.',
  ru: 'Где находятся израильские партии на двумерной политической карте перед выборами 27 октября 2026 года. Выбирайте оси: экономика, безопасность, религия и государство, гражданские свободы, суды.',
  uk: 'Де розташовані ізраїльські партії на двовимірній політичній мапі перед виборами 27 жовтня 2026 року. Обирайте осі: економіка, безпека, релігія і держава, громадянські свободи, суди.',
  he: 'היכן ממוקמות המפלגות בישראל על מפה פוליטית דו־ממדית לקראת הבחירות ב־27 באוקטובר 2026. בחרו צירים: כלכלה, ביטחון, דת ומדינה, זכויות האזרח, מערכת המשפט.',
  eo: 'Kie la israelaj partioj troviĝas sur dudimensia politika mapo antaŭ la elekto de la 27-a de oktobro 2026. Elektu la aksojn: ekonomio, sekureco, religio kaj ŝtato, civitanaj liberecoj, juĝejoj.',
};

const QUIZ_TITLE: Text = {
  en: 'Which party should I vote for? Israel election 2026 quiz',
  ru: 'За кого голосовать? Тест: какая партия мне ближе — выборы в Израиле 2026',
  uk: 'За кого голосувати? Тест: яка партія мені ближча — вибори в Ізраїлі 2026',
  he: 'למי להצביע? מבחן התאמה למפלגות — בחירות 2026',
  eo: 'Por kiu partio voĉdoni? Kvizo pri la israelaj elektoj 2026',
};

const QUIZ_DESC: Text = {
  en: 'Answer 13 questions on the key issues and see which parties in the 27 October 2026 Knesset election are closest to your views.',
  ru: 'Ответьте на 13 вопросов по ключевым темам и узнайте, какие партии на выборах в Кнессет 27 октября 2026 года ближе всего к вашим взглядам.',
  uk: 'Дайте відповідь на 13 запитань із ключових тем і дізнайтеся, які партії на виборах до Кнесету 27 жовтня 2026 року найближчі до ваших поглядів.',
  he: 'ענו על 13 שאלות בנושאים המרכזיים וגלו אילו מפלגות בבחירות לכנסת ב־27 באוקטובר 2026 הכי קרובות לעמדותיכם.',
  eo: 'Respondu 13 demandojn pri la ĉefaj temoj kaj vidu, kiuj partioj en la Kneseta elekto de la 27-a de oktobro 2026 estas plej proksimaj al viaj vidpunktoj.',
};

const PARTY_TITLE: Text = {
  en: '{party}: positions and platform — Israel election 2026',
  ru: '{party}: позиции и программа — выборы в Израиле 2026',
  uk: '{party}: позиції та програма — вибори в Ізраїлі 2026',
  he: '{party}: עמדות ומצע — בחירות 2026',
  eo: '{party}: pozicioj kaj programo — israelaj elektoj 2026',
};

const KEYWORDS: Text = {
  en: 'Israel election 2026, Knesset election, Israeli parties, party positions, voting advice, which party to vote for, political compass Israel, Likud, Yashar, Eisenkot, Bennett, Netanyahu',
  ru: 'выборы в Израиле 2026, выборы в Кнессет, партии Израиля, позиции партий, за кого голосовать, тест какая партия мне подходит, политический компас, Ликуд, Яшар, Айзенкот, Беннет, Нетаньяху, Наш дом Израиль, Либерман',
  uk: 'вибори в Ізраїлі 2026, вибори до Кнесету, партії Ізраїлю, позиції партій, за кого голосувати, тест яка партія мені підходить, політичний компас, Лікуд, Яшар, Айзенкот, Беннет, Нетаньягу',
  he: 'בחירות 2026, בחירות לכנסת, מפלגות, עמדות המפלגות, למי להצביע, מבחן התאמה למפלגות, מצפן פוליטי, הליכוד, ישר, איזנקוט, בנט, נתניהו, מצעי המפלגות',
  eo: 'israelaj elektoj 2026, Kneseto, israelaj partioj, pozicioj de partioj, por kiu voĉdoni, politika kompaso, Likud, Netanjahu',
};

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string, hreflang?: string): void {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.append(el);
  }
  el.href = href;
}

const clip = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Title and description for the current page. */
export function pageMeta(route: Route, lang: Lang): { title: string; description: string } {
  if (route.issue) {
    const [p, a] = route.issue.split('/');
    const pos = positionIndex.get(route.issue)!;
    const stance = pos.score === null ? ui.noPosition[lang] : ui.stance[lang][pos.score + 2];
    return {
      title: `${partyById.get(p)!.name[lang]} — ${aspectById.get(a)!.name[lang]}: ${stance} | ${SITE_NAME[lang]}`,
      description: clip(pos.note?.[lang] ?? MATRIX_DESC[lang]),
    };
  }
  if (route.party) {
    const party = partyById.get(route.party)!;
    return {
      title: PARTY_TITLE[lang].replace('{party}', party.name[lang]),
      description: clip(party.summary?.[lang] ?? MATRIX_DESC[lang]),
    };
  }
  if (route.view === 'map') {
    const name = (id: string) => dimensions.find((d) => d.id === id)!.name[lang];
    return { title: `${MAP_TITLE[lang]}: ${name(route.x)} × ${name(route.y)}`, description: MAP_DESC[lang] };
  }
  if (route.view === 'quiz') return { title: QUIZ_TITLE[lang], description: QUIZ_DESC[lang] };
  return { title: MATRIX_TITLE[lang], description: MATRIX_DESC[lang] };
}

/** Keeps <head> in step with the page: title, description, canonical, language alternates, social cards, JSON-LD. */
export function updateHead(route: Route, lang: Lang): void {
  const { title, description } = pageMeta(route, lang);
  const clean = { ...route, answers: undefined };
  const url = SITE + formatRoute(clean);
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'keywords', KEYWORDS[lang]);
  setLink('canonical', url);
  for (const l of LANGS) setLink('alternate', SITE + formatRoute({ ...clean, lang: l }), l);
  setLink('alternate', SITE + formatRoute({ ...clean, lang: 'en' }), 'x-default');
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', SITE_NAME[lang]);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:locale', LOCALES[lang].replace('-', '_'));
  setMeta('property', 'og:image', `${SITE}/og.png`);
  setMeta('property', 'og:image:width', '1200');
  setMeta('property', 'og:image:height', '630');
  setMeta('name', 'twitter:card', 'summary_large_image');

  let ld = document.head.querySelector<HTMLScriptElement>('script#ld');
  if (!ld) {
    ld = document.createElement('script');
    ld.id = 'ld';
    ld.type = 'application/ld+json';
    document.head.append(ld);
  }
  const page = (view: Route['view']) => SITE + pagePath({ ...clean, view });
  const faq =
    route.view === 'matrix' && !route.party && !route.issue
      ? [
          {
            '@type': 'FAQPage',
            mainEntity: faqItems(lang, {
              quiz: page('quiz'),
              map: page('map'),
              report: 'https://github.com/komapc/israel-party-matrix/issues/new',
            }).map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
          },
        ]
      : [];
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#site`,
        url: `${SITE}/`,
        name: SITE_NAME[lang],
        inLanguage: LANGS.map((l) => LOCALES[l]),
      },
      {
        '@type': 'Dataset',
        name: ui.title[lang],
        description: MATRIX_DESC[lang],
        url: SITE + pagePath({ ...clean, view: 'matrix' }),
        inLanguage: LOCALES[lang],
        keywords: KEYWORDS[lang],
        temporalCoverage: meta.electionDate.slice(0, 4),
        spatialCoverage: 'Israel',
        isAccessibleForFree: true,
        creator: { '@type': 'Person', name: 'Mark Kahn', url: 'https://lipu.dev/' },
      },
      ...faq,
    ],
  });
}
