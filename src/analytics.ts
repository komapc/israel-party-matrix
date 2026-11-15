/** Google Analytics 4 measurement ID; empty disables tracking. */
const GA_ID = 'G-6E2LMSF9P7';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    /** Defined by the consent script once GA is allowed to load. */
    gtag?: Gtag;
  }
}

/**
 * Loads the shared lipu.dev consent script, which asks for consent where the visitor's
 * region requires opt-in, shows a one-time notice with an Opt out button elsewhere, and
 * only then loads GA (defining window.gtag). Skipped on localhost so the prerender step
 * never bakes a banner into the static HTML.
 */
export function initAnalytics(): void {
  if (!GA_ID || location.hostname === 'localhost') return;
  const script = document.createElement('script');
  script.src = 'https://geo.lipu.dev/consent.js';
  script.dataset.ga = GA_ID;
  script.dataset.accent = 'var(--accent)';
  document.head.append(script);
}

/** Records a custom event (no-op when analytics is off). */
export function track(event: string, params: Record<string, string> = {}): void {
  window.gtag?.('event', event, params);
}
