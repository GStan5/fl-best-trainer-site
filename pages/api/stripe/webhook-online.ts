import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
  isOnlineProduct,
  sendPurchaseEmail,
} from "../../../lib/purchaseDelivery";

// Independent for Life — ONLINE purchase webhook (new route, 2026-10-08).
// The existing in-person webhook (pages/api/stripe/webhook.ts) is not
// touched by this file. This endpoint exists so online buyers get their
// product by email the moment Stripe confirms payment — closing the
// "buyer closed the tab and lost the download" gap.
//
// Gavin registers this URL in the Stripe dashboard (per mode):
//   https://www.flbesttrainer.com/api/stripe/webhook-online
//   event: checkout.session.completed
// and the endpoint's signing secret goes in Vercel env as
// STRIPE_ONLINE_WEBHOOK_SECRET. Signatures verified per request.
//
// Idempotency: Stripe retries + duplicates are deduped on the additive
// purchase_emails table keyed by stripe_event_id; a row marked 'sent'
// never re-sends. Failed sends return 500 so Stripe retries, and the
// retry re-attempts delivery.

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

type Claim = "new" | "sent" | "retry" | "no-db";

// Returns what to do with this event. Best-effort when DATABASE_URL is
// unset (delivery still attempted; Stripe is the source of truth).
async function claimEvent(
  eventId: string,
  sessionId: string,
  product: string,
  email: string
): Promise<Claim> {
  if (!process.env.DATABASE_URL) return "no-db";
  const { default: sql } = await import("../../../lib/database");
  await sql`
    CREATE TABLE IF NOT EXISTS purchase_emails (
      id serial primary key,
      stripe_event_id text unique not null,
      session_id text,
      product text,
      email text,
      status text default 'pending',
      created_at timestamptz default now()
    )
  `;
  const inserted = await sql`
    INSERT INTO purchase_emails (stripe_event_id, session_id, product, email, status)
    VALUES (${eventId}, ${sessionId}, ${product}, ${email}, 'pending')
    ON CONFLICT (stripe_event_id) DO NOTHING
    RETURNING id
  `;
  if (inserted.length > 0) return "new";
  const existing = await sql`
    SELECT status FROM purchase_emails WHERE stripe_event_id = ${eventId}
  `;
  return existing[0]?.status === "sent" ? "sent" : "retry";
}

async function setStatus(eventId: string, status: "sent" | "failed") {
  if (!process.env.DATABASE_URL) return;
  try {
    const { default: sql } = await import("../../../lib/database");
    await sql`
      UPDATE purchase_emails SET status = ${status}
      WHERE stripe_event_id = ${eventId}
    `;
  } catch (err) {
    console.error("[webhook-online] status update failed:", err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_ONLINE_WEBHOOK_SECRET || "";
  if (!secretKey || !webhookSecret) {
    console.error(
      "[webhook-online] STRIPE_SECRET_KEY or STRIPE_ONLINE_WEBHOOK_SECRET not set"
    );
    return res.status(500).json({ error: "webhook not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "missing signature" });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil",
  });

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook-online] signature verification failed:", err);
    return res.status(400).json({ error: "invalid signature" });
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const product = session.metadata?.product;
  const email =
    session.customer_details?.email || session.customer_email || "";

  if (!isOnlineProduct(product)) {
    // Not one of ours (e.g. an in-person checkout that also lands here):
    // acknowledge so Stripe stops retrying, but do nothing.
    return res.status(200).json({ received: true, ignored: "product" });
  }
  if (session.payment_status !== "paid") {
    return res.status(200).json({ received: true, ignored: "unpaid" });
  }
  if (!email) {
    console.error("[webhook-online] paid session without email:", session.id);
    return res.status(200).json({ received: true, ignored: "no-email" });
  }

  try {
    const claim = await claimEvent(event.id, session.id, product, email);
    if (claim === "sent") {
      return res.status(200).json({ received: true, deduped: true });
    }
    await sendPurchaseEmail(product, email, session.id);
    await setStatus(event.id, "sent");
    return res.status(200).json({ received: true, emailed: product });
  } catch (err) {
    console.error("[webhook-online] delivery failed:", err);
    await setStatus(event.id, "failed");
    // 500 → Stripe retries with backoff; the dedupe row lets the retry
    // re-attempt instead of skipping.
    return res.status(500).json({ error: "delivery failed, will retry" });
  }
}
