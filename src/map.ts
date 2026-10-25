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
  /** Distinct values, ascending. */
  values: number[];
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
    values: [...new Set(values)].sort((a, b) => a - b),
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

/**
 * A party's region is the outline of a smooth "field": one bump per combination of its positions on the two axes,
 * so it is round where the positions agree and stretches, or necks in, where they don't. Every score is rounded to
 * a whole step (about ±0.5), so a single position still gets a margin around it; a region built from one issue gets
 * a wider margin, as it is less certain.
 */
const margin = (e: Extent) => (e.n > 1 ? 0.35 : 0.55);
/** The outline is drawn where the field reaches this level; a lone bump peaks at 1. */
const LEVEL = 0.7;
/** Steps between two distant positions get a lighter bump, so the region stays one piece with a thin neck. */
const BRIDGE = 0.75;
/** Grid step for tracing the outline, in score units. */
const STEP = 0.04;

/** Distinct values on one axis, with lighter bridging values filling gaps wider than one step. */
function bumps(e: Extent): { v: number; w: number }[] {
  const out: { v: number; w: number }[] = [];
  e.values.forEach((v, i) => {
    const prev = e.values[i - 1];
    if (prev !== undefined) for (let b = prev + 1; b < v; b++) out.push({ v: b, w: BRIDGE });
    out.push({ v, w: 1 });
  });
  return out;
}

/** Traces the outline of the region as an SVG path (in plot coordinates), with marching squares. */
function outline(x: Extent, y: Extent): string {
  // A bump's width is set so that, alone, it reaches LEVEL exactly `margin` away from its centre.
  const k = Math.sqrt(2 * Math.log(1 / LEVEL));
  const sxg = margin(x) / k;
  const syg = margin(y) / k;
  const bx = bumps(x);
  const by = bumps(y);
  const field = (u: number, v: number) => {
    let f = 0;
    for (const a of bx) for (const b of by) f += a.w * b.w * Math.exp(-((u - a.v) ** 2) / (2 * sxg * sxg) - ((v - b.v) ** 2) / (2 * syg * syg));
    return f;
  };
  const x0 = x.values[0] - 4 * sxg;
  const y0 = y.values[0] - 4 * syg;
  const nx = Math.ceil((x.values[x.values.length - 1] + 4 * sxg - x0) / STEP) + 1;
  const ny = Math.ceil((y.values[y.values.length - 1] + 4 * syg - y0) / STEP) + 1;
  const f: number[][] = [];
  for (let i = 0; i < nx; i++) {
    f.push([]);
    for (let j = 0; j < ny; j++) f[i].push(field(x0 + i * STEP, y0 + j * STEP));
  }

  // Edge crossing between two grid points, as a key-able point in score units.
  const cross = (i0: number, j0: number, i1: number, j1: number): [number, number] => {
    const a = f[i0][j0];
    const b = f[i1][j1];
    const t = (LEVEL - a) / (b - a);
    return [x0 + (i0 + (i1 - i0) * t) * STEP, y0 + (j0 + (j1 - j0) * t) * STEP];
  };
  const segments: [number, number][][] = [];
  for (let i = 0; i < nx - 1; i++) {
    for (let j = 0; j < ny - 1; j++) {
      const c = [f[i][j], f[i + 1][j], f[i + 1][j + 1], f[i][j + 1]].map((v) => v >= LEVEL);
      const code = (c[0] ? 1 : 0) | (c[1] ? 2 : 0) | (c[2] ? 4 : 0) | (c[3] ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const bottom = () => cross(i, j, i + 1, j);
      const right = () => cross(i + 1, j, i + 1, j + 1);
      const top = () => cross(i, j + 1, i + 1, j + 1);
      const left = () => cross(i, j, i, j + 1);
      const centreIn = (f[i][j] + f[i + 1][j] + f[i + 1][j + 1] + f[i][j + 1]) / 4 >= LEVEL;
      const add = (a: [number, number], b: [number, number]) => segments.push([a, b]);
      switch (code) {
        case 1: case 14: add(left(), bottom()); break;
        case 2: case 13: add(bottom(), right()); break;
        case 3: case 12: add(left(), right()); break;
        case 4: case 11: add(right(), top()); break;
        case 6: case 9: add(bottom(), top()); break;
        case 7: case 8: add(left(), top()); break;
        case 5: if (centreIn) { add(left(), top()); add(bottom(), right()); } else { add(left(), bottom()); add(right(), top()); } break;
        case 10: if (centreIn) { add(left(), bottom()); add(right(), top()); } else { add(left(), top()); add(bottom(), right()); } break;
      }
    }
  }

  // Chain the segments into closed loops.
  const key = ([u, v]: [number, number]) => `${u.toFixed(5)},${v.toFixed(5)}`;
  const ends = new Map<string, number[]>();
  segments.forEach((s, n) => s.forEach((p) => ends.set(key(p), [...(ends.get(key(p)) ?? []), n])));
  const used = new Set<number>();
  const loops: string[] = [];
  segments.forEach((first, n) => {
    if (used.has(n)) return;
    used.add(n);
    const loop = [first[0], first[1]];
    for (;;) {
      const tail = loop[loop.length - 1];
      const next = ends.get(key(tail))?.find((m) => !used.has(m));
      if (next === undefined) break;
      used.add(next);
      const s = segments[next];
      loop.push(key(s[0]) === key(tail) ? s[1] : s[0]);
    }
    loops.push(`M${loop.map(([u, v]) => `${sx(u).toFixed(1)} ${sy(v).toFixed(1)}`).join('L')}Z`);
  });
  return loops.join('');
}

/** Outlines are the same on every render, so they are traced once per party and axis pair. */
const outlines = new Map<string, string>();
function outlineOf(party: string, dx: Dimension, dy: Dimension, x: Extent, y: Extent): string {
  const id = `${party}/${dx.id}/${dy.id}`;
  if (!outlines.has(id)) outlines.set(id, outline(x, y));
  return outlines.get(id)!;
}

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
    d: outlineOf(party.id, dx, dy, x, y),
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
        <path d="${s.d}" />
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
