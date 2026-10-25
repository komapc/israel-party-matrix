/** Google Analytics 4 measurement ID; empty disables tracking. */
const GA_ID = 'G-6E2LMSF9P7';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

export function initAnalytics(): void {
  if (!GA_ID || location.hostname === 'localhost') return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.append(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

/** Records a custom event (no-op when analytics is off). */
export function track(event: string, params: Record<string, string> = {}): void {
  window.gtag?.('event', event, params);
}
