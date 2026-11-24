import nodemailer from "nodemailer";

// Shared mailer — one transport for the whole site (guide, waiver,
// purchase delivery, follow-up sequence, weekly newsletter).
//
// Two transports behind one interface, picked per send from env:
//   - RESEND_API_KEY set → Resend SMTP (smtp.resend.com). From is an
//     address on flbesttrainer.com; replies go to the Gmail inbox.
//   - No key → Gmail SMTP, exactly as before. The code is safe to
//     deploy before the key exists (Gavin 2026-11-24: build the code
//     now, create the Resend account last — the free tier has no
//     expiry, but the account is created last so the first real sends
//     go through a finished system).
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
  // Optional override for Reply-To. When unset, the Resend path sets
  // it to the Gmail inbox (see emailSender.send) and the Gmail path
  // leaves it unset (replies already go to the Gmail From).
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    encoding?: string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
}

// Resend is the active transport when its key is set. The gate is
// read per send (not at module load), so setting or removing the key
// in Vercel takes effect on the next send with no code change.
export function resendActive(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Which transport a send would use — "resend" | "gmail" | "none".
// Exported so the gate is provable without sending anything.
export function mailerTransportName(): "resend" | "gmail" | "none" {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) return "gmail";
  return "none";
}

export function mailerConfigured(): boolean {
  return mailerTransportName() !== "none";
}

// From address on the verified domain (Resend 2026-11-24). The domain
// has no mail hosting (no MX), so replies must go to the Gmail inbox
// — see replyTo in emailSender.send. One constant, no hardcoding
// elsewhere. Local part "hello" is the generic contact address; the
// sender NAME ("Gavin from FL Best Trainer") is what the inbox shows.
export const RESEND_FROM_ADDRESS = "hello@flbesttrainer.com";

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
  if (resendActive()) {
    return `"Gavin from FL Best Trainer" <${RESEND_FROM_ADDRESS}>`;
  }
  return `"Gavin from FL Best Trainer" <${process.env.GMAIL_USER}>`;
}

// Receipts keep the brand from-name (not Gavin's name) — deliberate,
// unchanged from before. Only the address follows the active
// transport, so receipts stay DMARC-aligned on either path.
export function receiptFrom(): string {
  if (resendActive()) {
    return `"FL Best Trainer" <${RESEND_FROM_ADDRESS}>`;
  }
  return `"FL Best Trainer" <${process.env.GMAIL_USER}>`;
}

// Exported (was module-private) so the gate is provable without
// sending: a verification script can assert the transport's host /
// auth user / timeouts from the constructed object. createTransport
// does not connect, so constructing it sends nothing.
export function getTransporter() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
      // Same timeouts as the Gmail path (2026-11-23 mailer fix): a
      // stuck SMTP connection fails fast instead of hanging the route.
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
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

// The email sender — the `email` implementation of ChannelSender.
// Sends one email. Throws when no transport is configured or the send
// fails — callers decide whether a failure is fatal (waiver, purchase
// delivery) or logged-and-retried (sequence cron).
export const emailSender: ChannelSender = {
  channel: "email",
  async send(opts: MailOptions): Promise<void> {
    const transporter = getTransporter();
    if (!transporter) {
      throw new Error(
        "No mail transport configured — set RESEND_API_KEY or GMAIL_USER/GMAIL_PASS"
      );
    }
    await transporter.sendMail({
      from: opts.from ?? defaultFrom(),
      // Reply-To: the domain From has no mailbox behind it (no MX),
      // so replies must land in the monitored Gmail inbox. Only set
      // on the Resend path — Gmail sends already reply to the Gmail
      // From. A caller may override with opts.replyTo. If Resend is
      // active and GMAIL_USER is unset, replyTo is omitted and
      // replies to the domain address bounce — the runbook says to
      // keep GMAIL_USER set in Vercel, so this should not happen.
      replyTo:
        opts.replyTo ??
        (resendActive() ? process.env.GMAIL_USER : undefined),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
      headers: opts.headers,
    });
  },
};

// Sends one email, through the email sender. Kept so every existing
// call site works unchanged — the sender interface is the seam, this
// function is the email door through it.
export async function sendMail(opts: MailOptions): Promise<void> {
  return emailSender.send(opts);
}
