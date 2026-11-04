import nodemailer from 'nodemailer';
import { tejlaConfig } from './config';

/*
 * Slanje mailova: Resend (RESEND_API_KEY) ima prednost, inače GoDaddy SMTP
 * (MAIL_* varijable). Ako nijedno nije postavljeno, slanje se preskače:
 * prijava je ionako već spremljena, mail je sekundaran.
 */

export function mailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD)
  );
}

function transport() {
  const port = Number(process.env.MAIL_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: (process.env.MAIL_ENCRYPTION ?? 'ssl') === 'ssl',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}

function from() {
  const address = process.env.MAIL_FROM_ADDRESS ?? process.env.MAIL_USERNAME ?? 'tejla@tejla.app';
  const name = process.env.MAIL_FROM_NAME ?? tejlaConfig.brand;
  return { address, name };
}

interface Mail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

async function deliver(mail: Mail): Promise<void> {
  const sender = from();

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${sender.name} <${sender.address}>`,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        headers: mail.headers,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return;
  }

  await transport().sendMail({
    from: sender,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    headers: mail.headers,
  });
}

export interface SignupRecord {
  email: string;
  token: string;
  ip: string | null;
  referrer: string | null;
  created_at: string;
}

/* Tekst potvrde: Matejina kopija, doslovno (4.11.2026., zamijenila verziju od 13.10.) */
const CONFIRMATION_LINES = [
  'Bok!',
  'Tvoja prijava je stigla. 🤍',
  'Baš nam je drago što želiš isprobati Tejlu!',
  'Zasad ne moraš ništa više napraviti.',
  'Tejla je već počela otvarati vrata prvim korisnicima, a uskoro ćemo i tebi poslati pozivnicu za isprobavanje.',
  'Kad stigne, moći ćeš napraviti svoj račun i početi joj prepuštati sve one stvari koje više ne želiš držati u glavi.',
  'A do tada… slobodno nastavi sa svojim danom.',
];

function confirmationText(unsubscribeUrl: string): string {
  return [
    ...CONFIRMATION_LINES,
    '',
    'Tejla pamti. Ti živiš.',
    '',
    'tejla.',
    '',
    'Ovaj mail stiže ti jer je s tvoje e-mail adrese poslana prijava za rani pristup na tejla.app.',
    `Ako se nisi prijavio/la ili više ne želiš primati obavijesti o ranom pristupu, ukloni se s liste: ${unsubscribeUrl}`,
  ].join('\n\n');
}

function confirmationHtml(unsubscribeUrl: string): string {
  const year = new Date().getFullYear();
  const paragraphs = CONFIRMATION_LINES.map(
    (line) =>
      `<p style="margin:0 0 18px 0; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:1.65; color:#3A3A40;">${line}</p>`
  ).join('\n                        ');
  return `<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tejla</title>
</head>
<body style="margin:0; padding:0; background:#F6F1EC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EC; padding:48px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="max-width:520px; background:#FFFDFA; border:1px solid #E7E1D8; border-radius:20px;">
                <tr>
                    <td style="padding:44px 40px 8px 40px;" align="center">
                        <span style="font-family:Georgia,'Times New Roman',serif; font-size:44px; color:#1F1F23; line-height:1;">t</span><span style="font-family:Georgia,serif; font-size:26px; color:#8D6B78;">&#9679;</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px 40px 0 40px;">
                        ${paragraphs}
                        <p style="margin:0 0 18px 0; font-family:Georgia,'Times New Roman',serif; font-size:17px; line-height:1.65; color:#8D6B78;">
                            Tejla pamti. Ti živiš.
                        </p>
                        <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:22px; line-height:1; color:#1F1F23;">
                            tejla<span style="color:#8D6B78;">.</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px 40px 0 40px;">
                        <div style="height:1px; background:#E7E1D8; line-height:1px; font-size:0;">&nbsp;</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 40px 40px 40px;">
                        <p style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:13px; line-height:1.6; color:#8A8A90;">
                            Ovaj mail stiže ti jer je s tvoje e-mail adrese poslana prijava za rani pristup na
                            <a href="${tejlaConfig.url}" style="color:#8D6B78; text-decoration:none;">tejla.app</a>.
                            Ako se nisi prijavio/la ili više ne želiš primati obavijesti o ranom pristupu,
                            <a href="${unsubscribeUrl}" style="color:#8D6B78;">ukloni se s liste</a>.
                        </p>
                    </td>
                </tr>
            </table>
            <p style="margin:22px 0 0 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#A9A39B;">
                &copy; ${year} Tejla
            </p>
        </td>
    </tr>
</table>
</body>
</html>`;
}

/* Port emails/waitlist-notification.blade.php */
function notificationHtml(signup: SignupRecord, total: number): string {
  const created = new Date(signup.created_at).toLocaleString('hr-HR', {
    timeZone: 'Europe/Zagreb',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `<!DOCTYPE html>
<html lang="hr">
<head><meta charset="utf-8"><title>Nova prijava</title></head>
<body style="font-family:Helvetica,Arial,sans-serif; background:#F6F1EC; padding:32px; color:#1F1F23;">
    <h2 style="margin:0 0 16px 0; font-size:18px;">Nova prijava na listu čekanja</h2>
    <table cellpadding="6" cellspacing="0" style="font-size:14px; background:#fff; border:1px solid #E7E1D8; border-radius:12px;">
        <tr><td style="color:#8A8A90;">E-mail</td><td><strong>${signup.email}</strong></td></tr>
        <tr><td style="color:#8A8A90;">Vrijeme</td><td>${created}</td></tr>
        <tr><td style="color:#8A8A90;">Izvor</td><td>${signup.referrer || 'izravno'}</td></tr>
        <tr><td style="color:#8A8A90;">IP</td><td>${signup.ip || 'nepoznat'}</td></tr>
    </table>
    <p style="font-size:13px; color:#8A8A90;">Ukupno na listi: ${total}</p>
</body>
</html>`;
}

export async function sendConfirmation(signup: SignupRecord): Promise<void> {
  const unsubscribeUrl = `${tejlaConfig.url}/odjava/${signup.token}`;
  await deliver({
    to: signup.email,
    subject: 'Tvoja prijava je stigla. Tejla pamti.',
    html: confirmationHtml(unsubscribeUrl),
    text: confirmationText(unsubscribeUrl),
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
  });
}

/* ---------------------------------------------------------------------------
 * Pozivnica za ulazak u aplikaciju (drugi mail): šalje se postojećim
 * prijavama jednokratno, a budućima 24 h nakon prijave (v. /api/pozivnice).
 * Tekst: Matejina kopija, doslovno (4.11.2026.).
 * ------------------------------------------------------------------------- */

export const INVITE_SUBJECT = 'Tejla te čeka. Možeš krenuti!';

const INVITE_LINES_BEFORE_CTA = [
  'Bok!',
  'E pa, stigao je red i na tvoju prijavu. :)',
  'Tejla ti otvara vrata i baš nam je drago što ćeš je isprobati među prvima!',
  'Od sada joj možeš prepustiti sve one sitnice koje inače moraš držati u glavi. Poruku iz škole, fotografiju obavijesti, neki dogovor ili nešto čega se treba sjetiti za nekoliko dana.',
  'Tejla će ti pomoći prepoznati što treba napraviti, spremiti to i podsjetiti te kada bude vrijeme.',
  'Ovdje možeš krenuti:',
];

const INVITE_LINES_AFTER_CTA = [
  'Napravi svoj račun i isprobaj je s nečim što ti stvarno treba ovih dana. Možeš pozvati i ostale članove obitelji da zajedno koristite Tejlu.',
  'Samo mala napomena: Tejla je još u testnoj fazi. Zato nam puno znači ako javiš što ti se sviđa, što ti nedostaje ili ako nešto ne radi kako bi trebalo.',
  'Dovoljno je odgovoriti na ovaj mail. Čitamo svaki odgovor.',
  'Hvala ti što si tu od samog početka. 🤍',
];

function inviteText(inviteUrl: string, unsubscribeUrl: string): string {
  return [
    ...INVITE_LINES_BEFORE_CTA,
    `Otvori Tejlu: ${inviteUrl}`,
    ...INVITE_LINES_AFTER_CTA,
    '',
    'Tejla pamti. Ti živiš.',
    '',
    'Tim Tejla',
    tejlaConfig.url,
    '',
    'Ovaj mail stiže ti jer je s tvoje e-mail adrese poslana prijava za rani pristup na tejla.app.',
    `Ako se nisi prijavio/la ili više ne želiš primati obavijesti o ranom pristupu, ukloni se s liste: ${unsubscribeUrl}`,
  ].join('\n\n');
}

function inviteHtml(inviteUrl: string, unsubscribeUrl: string): string {
  const year = new Date().getFullYear();
  const paragraph = (line: string) =>
    `<p style="margin:0 0 18px 0; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:1.65; color:#3A3A40;">${line}</p>`;
  const before = INVITE_LINES_BEFORE_CTA.map(paragraph).join('\n                        ');
  const after = INVITE_LINES_AFTER_CTA.map(paragraph).join('\n                        ');
  return `<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tejla</title>
</head>
<body style="margin:0; padding:0; background:#F6F1EC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EC; padding:48px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="max-width:520px; background:#FFFDFA; border:1px solid #E7E1D8; border-radius:20px;">
                <tr>
                    <td style="padding:44px 40px 8px 40px;" align="center">
                        <span style="font-family:Georgia,'Times New Roman',serif; font-size:44px; color:#1F1F23; line-height:1;">t</span><span style="font-family:Georgia,serif; font-size:26px; color:#8D6B78;">&#9679;</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px 40px 0 40px;">
                        ${before}
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 24px 0;">
                            <tr>
                                <td style="border-radius:999px; background:#8D6B78;">
                                    <a href="${inviteUrl}"
                                       style="display:inline-block; padding:14px 36px; font-family:Helvetica,Arial,sans-serif; font-size:16px; font-weight:bold; color:#F6F1EC; text-decoration:none; border-radius:999px;">
                                        Otvori Tejlu
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <p style="margin:0 0 24px 0; font-family:Helvetica,Arial,sans-serif; font-size:13px; line-height:1.6; color:#8A8A90;">
                            Ako gumb ne radi, otvori ovu poveznicu:<br>
                            <a href="${inviteUrl}" style="color:#8D6B78; word-break:break-all;">${inviteUrl}</a>
                        </p>
                        ${after}
                        <p style="margin:0 0 18px 0; font-family:Georgia,'Times New Roman',serif; font-size:17px; line-height:1.65; color:#8D6B78;">
                            Tejla pamti. Ti živiš.
                        </p>
                        <p style="margin:0 0 4px 0; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:1.65; color:#3A3A40;">
                            Tim Tejla
                        </p>
                        <p style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.65;">
                            <a href="${tejlaConfig.url}" style="color:#8D6B78; text-decoration:none;">www.tejla.app</a>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px 40px 0 40px;">
                        <div style="height:1px; background:#E7E1D8; line-height:1px; font-size:0;">&nbsp;</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 40px 40px 40px;">
                        <p style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:13px; line-height:1.6; color:#8A8A90;">
                            Ovaj mail stiže ti jer je s tvoje e-mail adrese poslana prijava za rani pristup na
                            <a href="${tejlaConfig.url}" style="color:#8D6B78; text-decoration:none;">tejla.app</a>.
                            Ako se nisi prijavio/la ili više ne želiš primati obavijesti o ranom pristupu,
                            <a href="${unsubscribeUrl}" style="color:#8D6B78;">ukloni se s liste</a>.
                        </p>
                    </td>
                </tr>
            </table>
            <p style="margin:22px 0 0 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#A9A39B;">
                &copy; ${year} Tejla
            </p>
        </td>
    </tr>
</table>
</body>
</html>`;
}

/** Pozivnica s osobnim beta linkom; unsubscribe ide kroz postojeću /odjava rutu. */
export async function sendInvite(input: {
  email: string;
  inviteUrl: string;
  unsubscribeToken: string;
}): Promise<void> {
  const unsubscribeUrl = `${tejlaConfig.url}/odjava/${input.unsubscribeToken}`;
  await deliver({
    to: input.email,
    subject: INVITE_SUBJECT,
    html: inviteHtml(input.inviteUrl, unsubscribeUrl),
    text: inviteText(input.inviteUrl, unsubscribeUrl),
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
  });
}

export async function sendNotification(signup: SignupRecord, total: number): Promise<void> {
  if (!tejlaConfig.adminEmail) return;
  await deliver({
    to: tejlaConfig.adminEmail,
    subject: `Nova prijava na Tejlu: ${signup.email}`,
    html: notificationHtml(signup, total),
  });
}
