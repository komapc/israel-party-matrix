import { aspectById, blocOf, dimensions, esc, parties, scoreOf, tiers } from './data';
import { ui } from './i18n';
import { answers, hasEnoughAnswers } from './quiz';
import type { Dimension, Lang, Party, Tier } from './types';

/** Ready-made axis pairs: [horizontal, vertical]. */
export const PRESETS: [string, string][] = [
  ['economy', 'security'],
  ['religion', 'security'],
  ['liberal', 'economy'],
  ['religion', 'judiciary'],
];

export interface MapState {
  x: string;
  y: string;
  show: Tier[];
}

/** Builds the URL of the map with other axes. */
type MapLink = (x: string, y: string) => string;

interface Extent {
  min: number;
  max: number;
  mean: number;
  n: number;
}

/** Where a set of issue scores falls on one axis; null when none of its issues are known. */
function extent(dim: Dimension, score: (aspect: string) => number | null): Extent | null {
  const values = dim.items.flatMap(({ aspect, sign }) => {
    const s = score(aspect);
    return s === null ? [] : [s * sign];
  });
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    n: values.length,
  };
}

// Plot geometry, in SVG user units; scores run -2..2 on both axes.
const SIZE = 640;
const PAD = 72;
/** The plotted range is a little wider than -2..2 so regions at the poles stay inside the frame. */
const SPAN = 2.5;
const UNIT = (SIZE - 2 * PAD) / (2 * SPAN);
const sx = (v: number) => PAD + (v + SPAN) * UNIT;
const sy = (v: number) => SIZE - PAD - (v + SPAN) * UNIT;
/** Minimum half-width of a region; a region built from a single issue is padded more, as it is less certain. */
const radius = (e: Extent) => ((e.max - e.min) / 2 + (e.n > 1 ? 0.18 : 0.38)) * UNIT;

interface Placed {
  party: Party;
  x: Extent;
  y: Extent;
}

/** Nudges labels vertically until they stop overlapping, larger parties first. */
function placeLabels(items: { cx: number; cy: number; w: number }[]): number[] {
  const taken: { x0: number; x1: number; y: number }[] = [];
  const offsets = [0, -15, 15, -30, 30, -45, 45, -60, 60];
  return items.map(({ cx, cy, w }) => {
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const dy = offsets.find((o) => !taken.some((t) => t.x0 < x1 && x0 < t.x1 && Math.abs(t.y - (cy + o)) < 14)) ?? 0;
    taken.push({ x0, x1, y: cy + dy });
    return cy + dy;
  });
}

const dimLabel = (d: Dimension, lang: Lang) => d.name[lang];

function renderControls(lang: Lang, state: MapState, link: MapLink): string {
  const presets = PRESETS.map(([x, y]) => {
    const dx = dimensions.find((d) => d.id === x)!;
    const dy = dimensions.find((d) => d.id === y)!;
    const active = state.x === x && state.y === y;
    return `<a class="chip" href="${link(x, y)}" ${active ? 'aria-current="page"' : ''}>${dimLabel(dx, lang)} × ${dimLabel(dy, lang)}</a>`;
  }).join('');
  const select = (axis: 'x' | 'y') => `
    <label class="axis-select">${axis === 'x' ? ui.axisX[lang] : ui.axisY[lang]}
      <select data-axis="${axis}">
        ${dimensions.map((d) => `<option value="${d.id}" ${state[axis] === d.id ? 'selected' : ''}>${dimLabel(d, lang)}</option>`).join('')}
      </select>
    </label>`;
  const tierBoxes = tiers
    .map(
      (t) => `
      <label class="check"><input type="checkbox" data-map-tier="${t.id}" ${state.show.includes(t.id) ? 'checked' : ''} />${t.name[lang]}</label>`,
    )
    .join('');
  return `
    <div class="map-controls">
      <div class="map-controls__row"><span class="map-controls__label">${ui.mapViews[lang]}</span>${presets}</div>
      <div class="map-controls__row">${select('x')}${select('y')}
        <span class="map-controls__label">${ui.mapTiers[lang]}</span>${tierBoxes}
      </div>
    </div>`;
}

function renderSvg(lang: Lang, dx: Dimension, dy: Dimension, placed: Placed[]): string {
  const grid = [-2, -1, 0, 1, 2]
    .map(
      (v) => `
      <line class="grid${v === 0 ? ' grid--zero' : ''}" x1="${sx(v)}" y1="${sy(-SPAN)}" x2="${sx(v)}" y2="${sy(SPAN)}" />
      <line class="grid${v === 0 ? ' grid--zero' : ''}" x1="${sx(-SPAN)}" y1="${sy(v)}" x2="${sx(SPAN)}" y2="${sy(v)}" />`,
    )
    .join('');

  const axes = `
    <text class="pole" x="${sx(-SPAN)}" y="${sy(-SPAN) + 28}" text-anchor="start">← ${esc(dx.low[lang])}</text>
    <text class="pole" x="${sx(SPAN)}" y="${sy(-SPAN) + 28}" text-anchor="end">${esc(dx.high[lang])} →</text>
    <text class="axis-name" x="${sx(0)}" y="${sy(-SPAN) + 52}" text-anchor="middle">${esc(dx.name[lang])}</text>
    <text class="pole" transform="translate(${sx(-SPAN) - 28} ${sy(-SPAN)}) rotate(-90)" text-anchor="start">← ${esc(dy.low[lang])}</text>
    <text class="pole" transform="translate(${sx(-SPAN) - 28} ${sy(SPAN)}) rotate(-90)" text-anchor="end">${esc(dy.high[lang])} →</text>
    <text class="axis-name" transform="translate(${sx(-SPAN) - 52} ${sy(0)}) rotate(-90)" text-anchor="middle">${esc(dy.name[lang])}</text>`;

  // Larger parties are drawn first (underneath) and get first pick of label spots.
  const ordered = [...placed].sort((a, b) => (b.party.polls?.avg ?? 0) - (a.party.polls?.avg ?? 0));
  const shapes = ordered.map(({ party, x, y }) => ({
    party,
    cx: sx((x.min + x.max) / 2),
    cy: sy((y.min + y.max) / 2),
    rx: radius(x),
    ry: radius(y),
    w: party.name[lang].length * 6.6 + 8,
    x,
    y,
  }));
  const labelYs = placeLabels(shapes);

  const fmt = (e: Extent) => (e.min === e.max ? e.min.toFixed(1) : `${e.min.toFixed(1)}…${e.max.toFixed(1)}`);
  const regions = shapes
    .map(
      (s) => `
      <g class="region region--${s.party.bloc}" data-party="${s.party.id}" tabindex="0" role="button" aria-label="${esc(s.party.name[lang])}">
        <title>${esc(s.party.name[lang])} — ${blocOf(s.party).short[lang]}
${esc(dx.name[lang])}: ${fmt(s.x)}
${esc(dy.name[lang])}: ${fmt(s.y)}</title>
        <ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" />
      </g>`,
    )
    .join('');
  const labels = shapes
    .map(
      (s, i) =>
        `<text class="region-label" x="${s.cx}" y="${labelYs[i]}" dy="0.35em" text-anchor="middle">${esc(s.party.name[lang])}</text>`,
    )
    .join('');

  let me = '';
  if (hasEnoughAnswers()) {
    const mine = (aspect: string) => answers.get(aspect)?.score ?? null;
    const ex = extent(dx, mine);
    const ey = extent(dy, mine);
    if (ex && ey) {
      me = `
        <g class="me">
          <circle cx="${sx(ex.mean)}" cy="${sy(ey.mean)}" r="7" />
          <text x="${sx(ex.mean)}" y="${sy(ey.mean) - 16}" text-anchor="middle">${ui.you[lang]}</text>
        </g>`;
    }
  }

  return `
    <svg class="map-svg" viewBox="0 0 ${SIZE} ${SIZE}" dir="ltr" role="img" aria-label="${esc(ui.tabMap[lang])}">
      ${grid}${axes}
      <g class="regions">${regions}</g>
      ${me}
      <g class="labels" aria-hidden="true">${labels}</g>
    </svg>`;
}

export function renderMap(lang: Lang, state: MapState, link: MapLink): string {
  const dx = dimensions.find((d) => d.id === state.x)!;
  const dy = dimensions.find((d) => d.id === state.y)!;
  const shown = parties.filter((p) => state.show.includes(p.tier));
  const placed: Placed[] = [];
  const missing: Party[] = [];
  for (const party of shown) {
    const score = (aspect: string) => scoreOf(party.id, aspect);
    const x = extent(dx, score);
    const y = extent(dy, score);
    if (x && y) placed.push({ party, x, y });
    else missing.push(party);
  }

  const builtFrom = (d: Dimension) =>
    `<b>${d.name[lang]}</b>: ${d.items.map((i) => `${i.sign < 0 ? '−' : '+'} ${aspectById.get(i.aspect)!.claim[lang]}`).join(', ')}`;

  return `
    <div class="map">
      <p class="intro">${ui.mapIntro[lang]}</p>
      ${renderControls(lang, state, link)}
      <div class="map-figure">
        ${renderSvg(lang, dx, dy, placed)}
        <div class="map-legend">
          ${['pro', 'anti', 'other']
            .map((b) => `<span class="bloc-chip bloc-chip--${b}"><i></i>${blocOf({ bloc: b } as Party).name[lang]}</span>`)
            .join('')}
        </div>
        ${missing.length ? `<p class="map-missing">${ui.mapNoData[lang]} ${missing.map((p) => esc(p.name[lang])).join(', ')}</p>` : ''}
        <p class="map-basis">${ui.mapBuiltFrom[lang]} — ${builtFrom(dx)}; ${builtFrom(dy)}</p>
      </div>
    </div>`;
}
