import type { NextApiRequest, NextApiResponse } from "next";
import { getSql } from "../../lib/programAdmin";
import { verifyEventToken, logEmailEvent } from "../../lib/newsletter";

// First-party open pixel (analytics, Phase 2 — 2026-11-24). A 1x1
// transparent GIF, served from our own domain (not a third-party
// tracker). The token is signed (recipient email + campaign); a bad
// token still returns the pixel — a broken token must never show a
// broken image in the email. Opens are approximate (Gmail image
// proxy, Apple Mail Privacy Protection) and are reported as such;
// clicks are the decision metric.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = typeof req.query.t === "string" ? req.query.t : null;
  const payload = token ? verifyEventToken(token) : null;
  if (payload) {
    try {
      const sql = await getSql();
      await logEmailEvent(sql, {
        email: payload.e,
        eventType: "open",
        campaignId: payload.c,
      });
    } catch {
      // Logging must never break the pixel.
    }
  }
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Length", String(PIXEL.length));
  return res.status(200).send(PIXEL);
}
