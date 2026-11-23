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
  });
}

// Sends one email. Throws when Gmail env is missing or the send fails —
// callers decide whether a failure is fatal (waiver, purchase delivery)
// or logged-and-retried (sequence cron).
export async function sendMail(opts: MailOptions): Promise<void> {
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
}
