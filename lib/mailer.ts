import nodemailer from "nodemailer";

// Shared Gmail mailer — one transport for the whole site (guide, waiver,
// purchase delivery, follow-up sequence, weekly newsletter).
//
// Before this module, each route built its own nodemailer transport with
// the same GMAIL_USER / GMAIL_PASS pair. Nothing about the sending
// changes: same account, same from name. Callers that used to create a
// transport inline now call sendMail() here instead.
//
// sendMail() is deliberately plain: it sends exactly what it is given
// (transactional mail — waiver, purchase delivery). Marketing mail
// (sequence, weekly, and the guide email that starts the sequence)
// goes through lib/newsletter.ts, which adds the footer and the
// unsubscribe header on top of this.

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    encoding?: string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
}

export function mailerConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);
}

// Channel sender — the seam for SMS later (Gavin 2026-11-23: texting
// is NOT built now, but the email system is built so it can be wired
// in easily later). A channel sender is anything that can deliver one
// message: email today, SMS later. The Gmail sender below is the
// `email` implementation. A future Twilio sender implements this same
// interface — no call site changes, the engine picks the sender by
// channel. There is no Twilio code anywhere yet, no phone field on
// any table, and no SMS sending path.
export type ChannelName = "email";

export interface ChannelSender {
  channel: ChannelName;
  send(opts: MailOptions): Promise<void>;
}

export function defaultFrom(): string {
  // Research B2: the sender NAME is the person, not the brand — a
  // first-name sender lifts opens; "FL Best Trainer" alone sounds
  // like a company sending a blast. The "Name <address>" form renders
  // as "Gavin from FL Best Trainer" in the inbox and still passes
  // DMARC on the address. Note: lib/purchaseDelivery.ts hardcodes its
  // own brand from-name for transactional receipts — this change
  // affects marketing sends only, not receipts.
  return `"Gavin from FL Best Trainer" <${process.env.GMAIL_USER}>`;
}

function getTransporter() {
  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    // Timeouts (added 2026-11-23): the test sends hung after two
    // successes — the button stayed busy, the request never returned,
    // no error surfaced. A transport with no timeouts waits forever
    // on a stuck SMTP connection. These fail fast instead: the route
    // returns its 500, the admin UI shows the error, the cron retries
    // tomorrow. Healthy sends are unaffected.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

// The Gmail sender — the `email` implementation of ChannelSender.
// Sends one email. Throws when Gmail env is missing or the send fails —
// callers decide whether a failure is fatal (waiver, purchase delivery)
// or logged-and-retried (sequence cron).
export const emailSender: ChannelSender = {
  channel: "email",
  async send(opts: MailOptions): Promise<void> {
    const transporter = getTransporter();
    if (!transporter) {
      throw new Error("Gmail env not set — cannot send email");
    }
    await transporter.sendMail({
      from: opts.from ?? defaultFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
      headers: opts.headers,
    });
  },
};

// Sends one email, through the Gmail sender. Kept so every existing
// call site works unchanged — the sender interface is the seam, this
// function is the email door through it.
export async function sendMail(opts: MailOptions): Promise<void> {
  return emailSender.send(opts);
}
