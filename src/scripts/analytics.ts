// Google Analytics 4 : chargé seulement si un identifiant de mesure est fourni au build (PUBLIC_GA_ID)
// ET si le visiteur a accepté la mesure d'audience. Retiré (cookies effacés) si le visiteur retire son accord.
import { hasConsent } from './consent';

const id = document.querySelector<HTMLMetaElement>('meta[name="ga-id"]')?.content ?? '';
if (/^G-[A-Z0-9]{4,}$/.test(id)) {
  const w = window as unknown as Record<string, unknown> & { dataLayer?: unknown[] };
  let loaded = false;

  const enable = () => {
    w[`ga-disable-${id}`] = false;
    if (loaded) return;
    loaded = true;
    w.dataLayer = w.dataLayer || [];
    function gtag(..._a: unknown[]) { w.dataLayer!.push(arguments); }
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
  };

  const disable = () => {
    w[`ga-disable-${id}`] = true;
    const parts = location.hostname.split('.');
    const domains = ['', location.hostname, ...parts.map((_, i) => '.' + parts.slice(i).join('.')).filter((d) => d.split('.').length > 2)];
    document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid').forEach((n) =>
      domains.forEach((d) => { document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`; }));
  };

  if (hasConsent('analytics')) enable();
  document.addEventListener('consent-change', () => { if (hasConsent('analytics')) enable(); else disable(); });
}
