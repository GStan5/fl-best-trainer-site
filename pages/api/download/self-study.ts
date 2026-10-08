import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

// Independent for Life — Self-Study protected download (new route,
// 2026-10-08). The 6-Week Program PDF is a paid product: it is NOT in
// public/. A buyer's access token is their Stripe checkout session id
// (unguessable), delivered to them in the purchase email. Every hit
// re-verifies with Stripe: session exists, payment_status is 'paid',
// and the session's product metadata is 'self-study'. Anyone else gets
// a 403. In-person Stripe objects are never affected by this route.

const PDF_PATH = path.join(
  process.cwd(),
  "private-documents/independent-for-life-6-week-plan.pdf"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId =
    typeof req.query.session_id === "string" ? req.query.session_id : "";
  if (!sessionId.startsWith("cs_")) {
    return res.status(400).json({ error: "missing session_id" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey) {
    return res.status(500).json({ error: "downloads not configured" });
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const ok =
      session.payment_status === "paid" &&
      session.metadata?.product === "self-study";
    if (!ok) {
      return res.status(403).json({ error: "not a paid self-study purchase" });
    }
  } catch (err) {
    console.error("[download/self-study] Stripe verify failed:", err);
    return res.status(403).json({ error: "could not verify purchase" });
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error("[download/self-study] PDF missing at", PDF_PATH);
    return res.status(500).json({ error: "file unavailable" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Independent-for-Life-6-Week-Program.pdf"'
  );
  fs.createReadStream(PDF_PATH).pipe(res);
}
