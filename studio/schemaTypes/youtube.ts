// Extrait l'identifiant (11 caractères) d'un lien YouTube. Renvoie null si le lien n'est pas exploitable.
// Formats acceptés : youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID.
export const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(value: string): string | null {
  let u: URL;
  try { u = new URL(value); } catch { return null; }
  if (u.protocol !== 'https:' || !YOUTUBE_HOSTS.includes(u.hostname)) return null;
  const parts = u.pathname.split('/').filter(Boolean);
  let id: string | undefined;
  if (u.hostname === 'youtu.be') id = parts[0];
  else if (parts[0] === 'watch') id = u.searchParams.get('v') ?? undefined;
  else if (parts[0] === 'embed' || parts[0] === 'shorts') id = parts[1];
  return id && ID.test(id) ? id : null;
}

// Renvoie true si le lien est valide, sinon un message d'erreur en français.
export function validateYoutubeUrl(value: unknown): true | string {
  if (!value) return true; // l'obligation de remplir le champ est gérée à part
  const v = String(value);
  if (/\s/.test(v)) return 'Le lien contient des espaces. Copiez le lien complet de la vidéo, sans rien ajouter.';
  let u: URL;
  try { u = new URL(v); } catch { return 'Adresse non valide. Copiez le lien complet de la vidéo depuis YouTube.'; }
  if (u.protocol !== 'https:') return 'Le lien doit commencer par https://.';
  if (!YOUTUBE_HOSTS.includes(u.hostname)) return `Ce lien ne vient pas de YouTube (${u.hostname}). Collez le lien d’une vidéo YouTube.`;
  return youtubeId(v) ? true : 'Impossible de trouver la vidéo dans ce lien. Utilisez le lien de partage de la vidéo, par exemple https://youtu.be/XXXXXXXXXXX ou https://www.youtube.com/watch?v=XXXXXXXXXXX.';
}
