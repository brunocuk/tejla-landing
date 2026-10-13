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
  });
}

export interface SignupRecord {
  email: string;
  token: string;
  ip: string | null;
  referrer: string | null;
  created_at: string;
}

/* Tekst potvrde: Matejina kopija, doslovno (13.10.2026.) */
const CONFIRMATION_LINES = [
  'Bok!',
  'Tvoja prijava je stigla.',
  'Zasad ne moraš ništa više napraviti.',
  'Kad Tejla bude spremna za prve korisnike, javit ćemo ti se na ovu adresu.',
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
    `Ako se nisi ti prijavio/la, ukloni se s liste: ${unsubscribeUrl}`,
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
                            Dobio/la si ovaj mail jer si se prijavio/la na
                            <a href="${tejlaConfig.url}" style="color:#8D6B78; text-decoration:none;">tejla.app</a>.
                            Ako to nisi bio/la ti,
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
