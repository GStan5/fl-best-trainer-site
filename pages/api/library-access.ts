import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// Independent for Life — exercise video library gate (Phase 3).
// NEW route. The library page (pages/library.tsx) checks the `ifl_library`
// cookie server-side before rendering any exercise content.
//
// Flow: POST { password } → if it matches LIBRARY_PASSWORD, set an
// httpOnly cookie holding an HMAC of a fixed message (never the password
// itself), valid 30 days. If LIBRARY_PASSWORD is not configured, the
// library is not open yet and this route refuses with 501.

const COOKIE_NAME = "ifl_library";
const COOKIE_MESSAGE = "ifl-library-access";
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Tiny in-memory rate limit: ip -> { count, windowStart }
const attempts = new Map<string, { count: number; windowStart: number }>();

function cookieSecret(): string {
  return process.env.LIBRARY_COOKIE_SECRET || "dev-only-secret";
}

export function libraryCookieValue(): string {
  return crypto
    .createHmac("sha256", cookieSecret())
    .update(COOKIE_MESSAGE)
    .digest("hex");
}

export function hasLibraryAccess(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  const value = match.slice(COOKIE_NAME.length + 1);
  const expected = libraryCookieValue();
  if (value.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
    return false;
  }
  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const libraryPassword = process.env.LIBRARY_PASSWORD || "";
  if (!libraryPassword) {
    return res.status(501).json({ error: "library not open yet" });
  }

  const ip =
    (typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : "") ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many attempts. Please try again later." });
  }

  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  const expectedBuf = Buffer.from(libraryPassword);
  const givenBuf = Buffer.from(password);
  const matches =
    expectedBuf.length === givenBuf.length &&
    crypto.timingSafeEqual(expectedBuf, givenBuf);

  if (!matches) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const maxAge = 30 * 24 * 60 * 60; // 30 days, seconds
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${libraryCookieValue()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  );
  return res.status(200).json({ ok: true });
}
