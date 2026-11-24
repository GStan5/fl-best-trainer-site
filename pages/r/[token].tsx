import type { GetServerSideProps } from "next";
import { getSql } from "../../lib/programAdmin";
import {
  verifyEventToken,
  redirectTargetAllowed,
  logEmailEvent,
} from "../../lib/newsletter";

// First-party click redirect (analytics, Phase 2 — 2026-11-24).
// Every link in a sent email points here with a signed token
// (payload: recipient email, campaign, target URL). The route
// verifies the signature, logs the click to email_events
// (best-effort — a failed log never blocks the redirect), and
// forwards with a 302. The token can only point where our code
// minted it, and the allowlist refuses any host outside it — this
// is never an open redirect. A bad token or a disallowed target is
// a 404, not a redirect.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.params?.token;
  const payload =
    typeof token === "string" ? verifyEventToken(token) : null;
  if (!payload || !payload.u || !redirectTargetAllowed(payload.u)) {
    return { notFound: true };
  }
  try {
    const sql = await getSql();
    await logEmailEvent(sql, {
      email: payload.e,
      eventType: "click",
      campaignId: payload.c,
      url: payload.u,
    });
  } catch {
    // Logging must never block the redirect.
  }
  return {
    redirect: { destination: payload.u, permanent: false },
  };
};

export default function ClickRedirect() {
  return null;
}
