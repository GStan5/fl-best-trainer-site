import { useEffect } from "react";
import { useRouter } from "next/router";
import { TRACKED_PAGES } from "../lib/programs";

// Independent for Life — first-party funnel tracker (Phase 5).
// Mounted once in components/shared/Layout next to the guide popup.
// Sends a tiny view beacon to /api/track for the funnel pages, plus a
// "checkout_success" event when a buyer lands back on /self-study or
// /monthly with ?checkout=success. No cookies, no identifiers —
// the server only stores (page, event, time). Renders nothing.

let lastSentUrl = "";

export default function FunnelTracker() {
  const router = useRouter();

  useEffect(() => {
    const url = router.asPath;
    if (url === lastSentUrl) return;
    lastSentUrl = url;

    const [path, query] = url.split("?");
    if (!TRACKED_PAGES.includes(path)) return;

    const send = (page: string, event?: string) => {
      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event ? { page, event } : { page }),
          keepalive: true,
        }).catch(() => {
          // Tracking must never surface an error to the visitor.
        });
      } catch {
        // Same: silent by design.
      }
    };

    send(path);

    if (
      (path === "/self-study" || path === "/monthly") &&
      query &&
      new URLSearchParams(query).get("checkout") === "success"
    ) {
      send(path, "checkout_success");
    }
  }, [router.asPath]);

  return null;
}
