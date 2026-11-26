// Staff email for `autopack` (docs/spec/qr-tooling.md §5). Uses any SMTP account; Gmail with an app password by default.
import nodemailer from 'nodemailer';
import './config.js'; // loads .env before the settings below are read

const env = process.env;

export const mailConfig = {
  host: (env.SMTP_HOST || 'smtp.gmail.com').trim(),
  port: Number.parseInt(env.SMTP_PORT || '465', 10),
  user: (env.SMTP_USER || '').trim(),
  // Gmail shows app passwords in groups of four ("abcd efgh ijkl mnop"); spaces are not part of it.
  pass: (env.SMTP_PASS || '').replace(/\s+/g, ''),
  to: (env.MAIL_TO || env.SMTP_USER || '').trim(),
};

export const mailEnabled = () => Boolean(mailConfig.user && mailConfig.pass && mailConfig.to);

export async function sendMail({ subject, text }) {
  const transport = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.port === 465,
    auth: { user: mailConfig.user, pass: mailConfig.pass },
  });
  await transport.sendMail({ from: `EvlveX packing <${mailConfig.user}>`, to: mailConfig.to, subject, text });
}
