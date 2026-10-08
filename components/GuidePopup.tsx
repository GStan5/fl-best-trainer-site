import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaTimes, FaDownload, FaEnvelope } from "react-icons/fa";

// Independent for Life — polite free-guide popup (Phase 4, Gavin's spec
// 2026-10-08). Behavior, exactly as specified:
// - Shows ONCE EVER per visitor: localStorage flag `iflGuideSeen` is set
//   the moment the popup appears, and again on dismiss/submit.
// - Never shows on /classes*, /booking, /account*, /admin*.
// - Never shows when signed in (next-auth session).
// - Appears ~8 seconds after page load, as a bottom card that never
//   blocks scrolling or covers the page with an overlay.
// - Dismissible via the X or "No thanks".

const SEEN_KEY = "iflGuideSeen";
const SHOW_DELAY_MS = 8000;
const EXCLUDED_PREFIXES = ["/classes", "/booking", "/account", "/admin"];

function pathIsExcluded(): boolean {
  if (typeof window === "undefined") return true;
  const path = window.location.pathname;
  return EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function hasSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Storage unavailable (private mode etc.) — err on the side of quiet.
    return true;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Non-fatal: worst case the popup can appear again on a later visit.
  }
}

type FormState = "idle" | "submitting" | "success" | "error";

export default function GuidePopup() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Never for signed-in visitors.
    if (status === "authenticated") return;
    // Wait until we know whether there is a session.
    if (status !== "unauthenticated") return;
    if (pathIsExcluded()) return;
    if (hasSeen()) return;

    const timer = setTimeout(() => {
      // Re-check at show time: the visitor may have navigated or signed
      // in during the delay.
      if (pathIsExcluded() || hasSeen()) return;
      markSeen();
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [status]);

  function dismiss() {
    markSeen();
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/guide-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data.error || "Something went wrong. Please check your details and try again."
        );
        setState("error");
        return;
      }
      markSeen();
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again in a moment.");
      setState("error");
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Free 7-day guide offer"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-[#111111] border border-white/15 rounded-2xl shadow-2xl shadow-black/60 p-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-white/50 hover:text-white p-2"
      >
        <FaTimes className="text-lg" />
      </button>

      {state === "success" ? (
        <div className="text-center pt-2">
          <FaEnvelope className="text-royal text-3xl mx-auto mb-3" />
          <h3 className="font-heading text-xl font-bold text-white mb-2">
            Your guide is on its way
          </h3>
          <p className="text-white/80 text-base mb-5 leading-relaxed">
            Check your email — or download it right now:
          </p>
          <a
            href="/downloads/independent-for-life-guide.pdf"
            className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-base py-3 px-6 rounded-xl transition min-h-[52px] w-full mb-3"
          >
            <FaDownload className="mr-2" />
            Download My Free Guide
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="text-white/60 hover:text-white text-base py-2 w-full"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-snug mb-2 pr-8">
            Stronger, steadier, more independent — start with the free 7-day
            guide.
          </h3>
          <p className="text-white/75 text-base leading-relaxed mb-5">
            10–15 minutes a day. Just a chair, a wall, and water bottles. No
            gym, no cost.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="popupFirstName" className="sr-only">
              First name
            </label>
            <input
              id="popupFirstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full mb-3 rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none focus:border-royal min-h-[52px]"
              placeholder="Your first name"
            />
            <label htmlFor="popupEmail" className="sr-only">
              Email
            </label>
            <input
              id="popupEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none focus:border-royal min-h-[52px]"
              placeholder="you@example.com"
            />
            {state === "error" && (
              <p className="text-red-400 text-sm mb-3" role="alert">
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-base py-3 px-6 rounded-xl transition min-h-[52px]"
            >
              {state === "submitting" ? "Sending…" : "Send My Free Guide"}
            </button>
          </form>
          <button
            type="button"
            onClick={dismiss}
            className="text-white/60 hover:text-white text-base py-2 mt-2 w-full"
          >
            No thanks
          </button>
          <p className="text-white/40 text-xs text-center">
            Free forever. No spam, no pressure. Unsubscribe anytime.
          </p>
        </>
      )}
    </div>
  );
}
