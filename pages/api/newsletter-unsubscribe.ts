import type { NextApiRequest, NextApiResponse } from "next";
import { getSql } from "../../lib/programAdmin";
import {
  ensureNewsletterTables,
  verifyUnsubscribeToken,
} from "../../lib/newsletter";

// One-click unsubscribe. GET with a signed token (HMAC with the
// existing NEXTAUTH_SECRET — no new secret, and nobody can unsubscribe
// someone else). Flips unsubscribed_at immediately and clears
// next_send_at so the sequence stops. No login, no "are you sure" maze.
// A valid token for an address that isn't on the list is still a
// success — there is nothing to stop.

// Renders a plain confirmation page (this is a link people click from
// an email, not an API call). POST with { token } returns JSON for
// programmatic use.

function page(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title></head><body style="font-family: Georgia, serif; max-width: 560px; margin: 80px auto; padding: 0 20px; color: #222;"><h1>${title}</h1><p>${body}</p><p><a href="https://flbesttrainer.com">FL Best Trainer</a></p></body></html>`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token =
    req.method === "GET"
      ? typeof req.query.token === "string"
        ? req.query.token
        : ""
      : typeof req.body?.token === "string"
        ? req.body.token
        : "";

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = token ? verifyUnsubscribeToken(token) : null;
  if (!email) {
    if (req.method === "POST") {
      return res.status(400).json({ error: "Invalid unsubscribe link." });
    }
    res.setHeader("Content-Type", "text/html");
    return res
      .status(400)
      .send(
        page(
          "That link doesn't work",
          "This unsubscribe link is invalid or expired. Reply to any email from FL Best Trainer and ask to be removed, and it will be done."
        )
      );
  }

  const sql = await getSql();
  if (!sql) {
    if (req.method === "POST") {
      return res.status(500).json({ error: "Database not configured" });
    }
    res.setHeader("Content-Type", "text/html");
    return res
      .status(500)
      .send(
        page(
          "Something went wrong",
          "We couldn't update your subscription right now. Please try again in a moment, or reply to any email and ask to be removed."
        )
      );
  }

  try {
    await ensureNewsletterTables(sql);
    await sql`
      UPDATE newsletter_subscribers
      SET unsubscribed_at = now(), next_send_at = NULL
      WHERE email = ${email}
    `;
  } catch (err) {
    console.error("[newsletter-unsubscribe] update failed:", err);
    if (req.method === "POST") {
      return res.status(500).json({ error: "Something went wrong." });
    }
    res.setHeader("Content-Type", "text/html");
    return res
      .status(500)
      .send(
        page(
          "Something went wrong",
          "We couldn't update your subscription right now. Please try again in a moment, or reply to any email and ask to be removed."
        )
      );
  }

  if (req.method === "POST") {
    return res.status(200).json({ ok: true, email });
  }
  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(
    page(
      "You're unsubscribed",
      "You won't get any more emails from FL Best Trainer. The free guide is still yours — nothing about that changes. If this was a mistake, sign up again on the website any time."
    )
  );
}
