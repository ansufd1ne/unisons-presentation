import type { APIRoute } from 'astro';
import { events, bySlug, longDate } from '../../data/events';
import { site } from '../../data/site';

export function getStaticPaths() {
  return events.map((e) => ({ params: { slug: e.slug } }));
}
const ymd = (iso: string, plus = 0) => {
  const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + plus);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
// Fichier de calendrier (événement sur la journée, l'horaire n'étant pas publié)
export const GET: APIRoute = ({ params }) => {
  const e = bySlug(params.slug!)!;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UNi’SONS//Agenda//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${e.slug}@unisons.fr`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${ymd(e.date)}`, `DTEND;VALUE=DATE:${ymd(e.endDate ?? e.date, 1)}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.summary + ' ' + longDate(e.date))}`,
    `LOCATION:${esc(e.venue + (e.address ? ', ' + e.address : ', Montpellier'))}`, `URL:${site.url}/agenda/${e.slug}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return new Response(lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${e.slug}.ics"` } });
};
