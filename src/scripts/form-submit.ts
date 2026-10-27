// Envoi des formulaires (contact, newsletter) : un seul envoi à la fois, 3 s minimum entre deux envois,
// délai maximum de 15 s, bouton désactivé et formulaire en aria-busy pendant l'envoi,
// erreur annoncée par role="alert" et distincte du succès (couleur, icône), nouvel essai possible.
// Champs invalides : aria-invalid + aria-describedby vers le message, qui nomme les champs (data-error-label ou étiquette).
// Les messages s'affichent dans deux zones : `.fs-info` (role="status") et `.fs-error` (role="alert").
const TIMEOUT_MS = 15000;
const GAP_MS = 3000;

export interface FormMessages {
  busy: string;      // libellé du bouton pendant l'envoi
  retry: string;     // libellé du bouton après un échec
  progress: string;  // message d'état pendant l'envoi
  ok: string;
  failed: string;
  timeout: string;
  wait: string;      // deux envois trop rapprochés
  invalid?: string;  // début du message quand des champs sont à corriger (suivi de leurs libellés)
}
export interface FormOptions {
  form: HTMLFormElement;
  honeypot: string;                      // nom du champ piège anti-spam
  endpoint?: string;                     // sans endpoint : onNoEndpoint
  messages: FormMessages;
  onNoEndpoint?: (data: FormData) => string; // renvoie le message d'information à afficher (aucun succès affiché)
}

type FieldEl = HTMLInputElement | HTMLTextAreaElement;
const isField = (el: Element): el is FieldEl => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
// Nom du champ pour le message d'erreur : data-error-label, sinon son étiquette (sans astérisque)
function fieldName(el: FieldEl) {
  const txt = el.dataset.errorLabel
    ?? (el.id ? el.form?.querySelector<HTMLElement>(`label[for="${el.id}"]`)?.textContent : null)
    ?? el.closest('label')?.textContent ?? el.name;
  return txt.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

function zone(form: HTMLFormElement, cls: string) {
  const el = form.parentElement!.querySelector<HTMLElement>(cls) ?? form.querySelector<HTMLElement>(cls);
  return { el, msg: el?.querySelector<HTMLElement>('.fs-msg') ?? el };
}

export function initForm({ form, honeypot, endpoint, messages: m, onNoEndpoint }: FormOptions) {
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
  const label = btn?.querySelector<HTMLElement>('span') ?? btn;
  const info = zone(form, '.fs-info');
  const error = zone(form, '.fs-error');
  if (!btn || !label || !info.el || !error.el) return;
  const errId = error.el.id || (error.el.id = `${form.id || 'form'}-error`);
  const idle = label.textContent ?? '';
  let busy = false;
  let last = 0;

  const show = (kind: 'info' | 'ok' | 'error' | 'none', text = '') => {
    info.el!.dataset.state = kind === 'ok' ? 'ok' : kind === 'info' ? 'info' : '';
    info.msg!.textContent = kind === 'error' ? '' : text;
    info.el!.hidden = kind === 'error' || !text;
    error.msg!.textContent = kind === 'error' ? text : '';
    error.el!.hidden = kind !== 'error';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    if ((form.elements.namedItem(honeypot) as HTMLInputElement | null)?.value) return; // piège anti-spam : on ne répond pas aux robots
    if (!form.checkValidity()) {
      // Pas de bulle native : champs en aria-invalid, liés au message d'erreur (role="alert"), focus sur le premier
      const bad = [...form.elements].filter((el): el is FieldEl => isField(el) && !el.checkValidity());
      bad.forEach((el) => { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', errId); });
      show('error', `${m.invalid ?? 'Merci de renseigner ou de corriger les champs suivants'}\u00a0: ${bad.map(fieldName).join(', ')}.`);
      bad[0]?.focus();
      return;
    }
    if (last && Date.now() - last < GAP_MS) { show('info', m.wait); return; }

    const data = new FormData(form);
    if (!endpoint) {
      last = Date.now();
      show('info', onNoEndpoint ? onNoEndpoint(data) : m.failed);
      return;
    }

    busy = true;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');
    label.textContent = m.busy;
    show('info', m.progress);
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
    let ok = false;
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data, signal: ctrl.signal });
      if (!res.ok) throw new Error(String(res.status));
      ok = true;
      form.reset();
      show('ok', m.ok);
    } catch {
      show('error', timedOut ? m.timeout : m.failed);
    } finally {
      clearTimeout(timer);
      busy = false;
      last = Date.now();
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      form.removeAttribute('aria-busy');
      label.textContent = ok ? idle : m.retry;
      if (!document.activeElement || document.activeElement === document.body) btn.focus();
    }
  });

  // Dès que la personne modifie un champ après un échec, le bouton reprend son libellé d'origine
  form.addEventListener('input', (e) => {
    if (!busy && label.textContent === m.retry) label.textContent = idle;
    const t = e.target;
    if (t instanceof Element && isField(t) && t.getAttribute('aria-invalid') && t.checkValidity()) { t.removeAttribute('aria-invalid'); t.removeAttribute('aria-describedby'); }
  });
  // Les cases à cocher déclenchent « change » plus sûrement que « input » selon les navigateurs
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t instanceof Element && isField(t) && t.getAttribute('aria-invalid') && t.checkValidity()) { t.removeAttribute('aria-invalid'); t.removeAttribute('aria-describedby'); }
  });
}
