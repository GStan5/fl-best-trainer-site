import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import AdminNav from "../../components/admin/AdminNav";
import { PROGRAMS } from "../../lib/programs";
import {
  FaDownload,
  FaVideo,
  FaExternalLinkAlt,
  FaArrowRight,
  FaCircle,
} from "react-icons/fa";

// Independent for Life — Admin Online Program hub (Phase 5, redesigned
// 2026-10-08 at Gavin's request). Dashboard layout: a slim status strip
// (checkout mode + headline numbers), one programs table with REAL
// per-program signup counts (lead source resolved per program — niche
// founding-list counts included), funnel + attention rail, recent
// signups, quick actions. Data: /api/program-admin; catalog:
// lib/programs.ts. Existing admin pages are not modified beyond the
// shared AdminNav "Online Program" tab (Gavin, 2026-10-08).

interface AdminData {
  totals: {
    leads: number;
    signupsBySource: Record<string, number>;
    last7d: number;
    last30d: number;
  };
  recentLeads: Array<{
    firstName: string;
    email: string;
    source: string;
    createdAt: string | null;
  }>;
  funnel: Array<{ page: string; views: number }>;
  formChecks: {
    pending: number;
    latest: Array<{
      email: string;
      videoUrl: string;
      note: string;
      createdAt: string | null;
      status: string;
    }>;
  };
  checkoutMode: "test" | "live" | "off";
}

// Lead source each program collects through guide-signup. null means the
// program has no email-capture path (sales-only) — show "—", not 0.
const PROGRAM_SOURCE: Record<string, string | null> = {
  guide: "guide",
  starter: "starter",
  flagship: "flagship",
  "self-study": null,
  monthly: null,
};

// Funnel page → the lead source a view on that page can turn into.
const PAGE_SOURCE: Record<string, string> = {
  "/start": "guide",
  "/starter": "starter",
  "/flagship": "flagship",
  "/plans": "plans",
};

const PAGE_LABEL: Record<string, string> = {
  "/start": "Free Guide",
  "/starter": "Starter Plan",
  "/flagship": "Flagship",
  "/self-study": "Self-Study",
  "/monthly": "Monthly",
  "/plans": "Programs page",
  "/thank-you-starter": "Starter thank-you",
  "/library": "Video Library",
  "/form-check": "Form Check",
};

// Human label for a lead source (recent-signups chips).
function sourceLabel(source: string): string {
  if (source === "guide") return "Free Guide";
  if (source === "plans") return "Guide · /plans";
  if (source === "starter") return "Starter";
  if (source === "flagship") return "Flagship waitlist";
  if (source.startsWith("niche-")) {
    const slug = source.replace("niche-", "");
    const niche = PROGRAMS.find((p) => p.slug === source);
    return niche
      ? niche.name.replace(" — Independent for Life", "")
      : `Niche · ${slug}`;
  }
  return source;
}

const CHECKOUT_STATUS: Record<
  AdminData["checkoutMode"],
  { dot: string; label: string; body: string }
> = {
  test: {
    dot: "text-yellow-300",
    label: "Checkout: TEST",
    body: "Test key — buy buttons create test checkouts. No real money can move.",
  },
  live: {
    dot: "text-green-400",
    label: "Checkout: LIVE",
    body: "Live sales are ON — the online buy buttons take real payments.",
  },
  off: {
    dot: "text-white/40",
    label: "Checkout: OFF",
    body: "Buy buttons refuse politely. Flip ONLINE_SALES_LIVE after the test-mode pass to sell.",
  },
};

interface NewsletterStats {
  subscribed: number;
  joined7d: number;
  unsubscribed: number;
  byStep: Array<{ step: number; count: number }>;
  drafts: Array<{
    id: number;
    subject: string;
    status: string;
    created_at: string | null;
    sent_at: string | null;
  }>;
  recentSends: Array<{
    email: string;
    kind: string;
    subject: string;
    sent_at: string | null;
    status: string;
  }>;
}

const STEP_LABEL: Record<number, string> = {
  0: "On the list only (no sequence)",
  1: "Due email 1 (day 2)",
  2: "Due email 2 (day 4)",
  3: "Due email 3 (day 7, Starter)",
  4: "Finished the sequence",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CARD = "bg-white/[0.04] border border-white/10 rounded-2xl";

export default function AdminOnlinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin;

  const [data, setData] = useState<AdminData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [news, setNews] = useState<NewsletterStats | null>(null);
  const [newsError, setNewsError] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftMsg, setDraftMsg] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);

  const loadNewsletter = () => {
    fetch("/api/newsletter-admin")
      .then((res) => {
        if (!res.ok) throw new Error("newsletter feed failed");
        return res.json();
      })
      .then((json) => {
        setNews(json as NewsletterStats);
        setNewsError(false);
      })
      .catch(() => setNewsError(true));
  };

  const newsletterAction = async (
    url: string,
    body: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDraftMsg(data.error || "That didn't work — try again.");
        return false;
      }
      setDraftMsg("");
      loadNewsletter();
      return true;
    } catch {
      setDraftMsg("Something went wrong — try again.");
      return false;
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (!isAdmin) {
      router.push("/classes");
      return;
    }
  }, [session, status, isAdmin, router]);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    let cancelled = false;
    fetch("/api/program-admin")
      .then((res) => {
        if (!res.ok) throw new Error("admin feed failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json as AdminData);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    if (!cancelled) loadNewsletter();
    return () => {
      cancelled = true;
    };
  }, [status, isAdmin]);

  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-light"></div>
        </div>
      </Layout>
    );
  }

  if (!session || !isAdmin) {
    return null; // Will redirect
  }

  const bySource = data?.totals.signupsBySource ?? {};
  const programCount = (slug: string): number | null => {
    const source =
      slug in PROGRAM_SOURCE ? PROGRAM_SOURCE[slug] : slug; // niche slugs ARE their source
    if (source === null || source === undefined) return null;
    return bySource[source] ?? 0;
  };
  const programsSorted = [...PROGRAMS].sort(
    (a, b) => (programCount(b.slug) ?? -1) - (programCount(a.slug) ?? -1)
  );
  const checkout = data ? CHECKOUT_STATUS[data.checkoutMode] : null;

  const miniStats = [
    { label: "Total signups", value: data?.totals.leads ?? 0 },
    { label: "Last 7 days", value: data?.totals.last7d ?? 0 },
    { label: "Last 30 days", value: data?.totals.last30d ?? 0 },
    { label: "Form checks pending", value: data?.formChecks.pending ?? 0 },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <AdminNav />

          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                Online Programs
              </h1>
              <p className="text-white/60 mt-1">
                Independent for Life — signups, funnel, and member tools.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/program-leads?format=csv"
                className="inline-flex items-center bg-royal hover:bg-royal-dark text-white font-heading font-bold py-3 px-5 rounded-xl transition"
              >
                <FaDownload className="mr-2" /> Download leads CSV
              </a>
              <Link
                href="/admin/online-form-checks"
                className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white font-heading font-bold py-3 px-5 rounded-xl transition"
              >
                <FaVideo className="mr-2" /> Form-check queue
                {(data?.formChecks.pending ?? 0) > 0 && (
                  <span className="ml-2 bg-royal text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {data?.formChecks.pending}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {loadError && (
            <div className="border border-red-400/40 bg-red-400/10 text-red-100 rounded-2xl p-5 mb-6">
              Couldn&apos;t load the program data. The numbers below may be
              incomplete — refresh to try again.
            </div>
          )}

          {/* Status strip: checkout mode + headline numbers */}
          <div className={`${CARD} px-5 py-4 mb-6`}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {checkout && (
                <div className="flex items-center gap-2.5 min-w-[220px]">
                  <FaCircle className={`${checkout.dot} text-[10px]`} />
                  <span className="font-heading font-bold text-white">
                    {checkout.label}
                  </span>
                  <span className="text-white/50 text-sm hidden xl:inline">
                    {checkout.body}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-x-8 gap-y-2 ml-auto">
                {miniStats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-bold text-white">
                      {s.value}
                    </span>
                    <span className="text-white/55 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {checkout && (
              <p className="text-white/50 text-sm mt-2 xl:hidden">
                {checkout.body}
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            {/* Programs with real signup counts */}
            <section className={`${CARD} p-6 lg:col-span-2`}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="font-heading text-xl font-bold text-white">
                  Your programs
                </h2>
                <span className="text-white/45 text-xs">
                  sorted by signups
                </span>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Every signup your pages collect, counted under the program
                that earned it — niche founding lists included.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="py-2 pr-3 font-medium">Program</th>
                      <th className="py-2 pr-3 font-medium">Price</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 pr-3 font-medium text-right">
                        Signups
                      </th>
                      <th className="py-2 font-medium text-right">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programsSorted.map((program) => {
                      const count = programCount(program.slug);
                      return (
                        <tr
                          key={program.slug}
                          className="border-b border-white/5 text-white/85"
                        >
                          <td className="py-3 pr-3 font-medium text-white">
                            {program.name}
                          </td>
                          <td className="py-3 pr-3 text-white/60 whitespace-nowrap">
                            {program.price}
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-xs text-white/55 border border-white/15 rounded-full px-2.5 py-1 whitespace-nowrap">
                              {program.status}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-right font-heading font-bold text-white">
                            {count === null ? "—" : count}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={program.page}
                              className="inline-flex items-center text-royal-light text-sm font-semibold whitespace-nowrap"
                            >
                              View{" "}
                              <FaExternalLinkAlt className="ml-1.5 text-xs" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-white/40 text-xs mt-3">
                “—” = sales-only program (no email capture). Niche counts are
                founding-list joins — your demand signal for what to build
                first.
              </p>
            </section>

            {/* Attention rail */}
            <div className="space-y-6">
              <section className={`${CARD} p-6`}>
                <h2 className="font-heading text-xl font-bold text-white mb-1">
                  Needs you
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  Form checks waiting for the weekly Steady Letter.
                </p>
                {(data?.formChecks.latest.length ?? 0) === 0 ? (
                  <p className="text-white/60 text-sm">
                    Nothing waiting. Member submissions land here.
                  </p>
                ) : (
                  <ul className="space-y-3 mb-4">
                    {data?.formChecks.latest.slice(0, 3).map((fc, i) => (
                      <li
                        key={`${fc.email}-${i}`}
                        className="text-sm border-b border-white/5 pb-3"
                      >
                        <div className="text-white/85 font-medium break-all">
                          {fc.email}
                        </div>
                        <div className="text-white/50 text-xs mt-0.5">
                          {formatDate(fc.createdAt)} · {fc.status}
                        </div>
                        <a
                          href={fc.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-royal-light text-sm font-semibold mt-1"
                        >
                          Watch video{" "}
                          <FaExternalLinkAlt className="ml-1.5 text-xs" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/admin/online-form-checks"
                  className="inline-flex items-center text-royal-light font-semibold text-sm"
                >
                  Open the queue <FaArrowRight className="ml-2 text-xs" />
                </Link>
              </section>

              <section className={`${CARD} p-6`}>
                <h2 className="font-heading text-xl font-bold text-white mb-4">
                  Quick links
                </h2>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { label: "Free Guide page", href: "/start" },
                    { label: "Programs lineup", href: "/plans" },
                    { label: "Video Library", href: "/library" },
                    { label: "Form-check page", href: "/form-check" },
                    { label: "Flagship waitlist", href: "/flagship" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center text-white/80 hover:text-white font-medium"
                      >
                        {l.label}{" "}
                        <FaExternalLinkAlt className="ml-2 text-xs text-white/40" />
                      </Link>
                    </li>
                  ))}
                  <li className="pt-1">
                    <a
                      href="/api/program-leads?format=csv"
                      className="inline-flex items-center text-white/80 hover:text-white font-medium"
                    >
                      Download all leads (CSV){" "}
                      <FaDownload className="ml-2 text-xs text-white/40" />
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Newsletter — subscribers, sequence, weekly drafts */}
          <section className={`${CARD} p-6 mb-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
              <h2 className="font-heading text-xl font-bold text-white">
                Newsletter
              </h2>
              <span className="text-white/45 text-xs">
                follow-up sequence + weekly send
              </span>
            </div>
            <p className="text-white/50 text-sm mb-5">
              The guide list, the 3-email sequence, and the weekly draft.
              Only an approved draft can be sent — your tap is the trigger,
              every time.
            </p>

            {newsError && (
              <p className="text-red-300 text-sm mb-4">
                Couldn&apos;t load the newsletter numbers — refresh to try
                again.
              </p>
            )}

            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5">
              {[
                { label: "Subscribers", value: news?.subscribed ?? 0 },
                { label: "Joined last 7 days", value: news?.joined7d ?? 0 },
                { label: "Unsubscribed", value: news?.unsubscribed ?? 0 },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-white">
                    {s.value}
                  </span>
                  <span className="text-white/55 text-sm">{s.label}</span>
                </div>
              ))}
            </div>

            <h3 className="font-heading font-bold text-white mb-2">
              Where people are in the sequence
            </h3>
            {(news?.byStep.length ?? 0) === 0 ? (
              <p className="text-white/60 text-sm mb-5">
                Nobody on the list yet.
              </p>
            ) : (
              <ul className="text-sm text-white/85 mb-5 space-y-1">
                {(news?.byStep ?? []).map((row) => (
                  <li key={row.step} className="flex justify-between gap-4">
                    <span>{STEP_LABEL[row.step] ?? `Step ${row.step}`}</span>
                    <span className="font-heading font-bold text-white">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="font-heading font-bold text-white mb-2">
              Weekly drafts
            </h3>
            {(news?.drafts.length ?? 0) === 0 ? (
              <p className="text-white/60 text-sm mb-5">
                No weekly drafts yet — write one below.
              </p>
            ) : (
              <ul className="space-y-3 mb-5">
                {(news?.drafts ?? []).slice(0, 5).map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 text-sm"
                  >
                    <div>
                      <div className="text-white font-medium">{d.subject}</div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {d.status}
                        {d.sent_at ? ` · sent ${formatDate(d.sent_at)}` : ""}
                        {` · ${formatDate(d.created_at)}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {d.status === "draft" && (
                        <button
                          type="button"
                          onClick={() =>
                            newsletterAction("/api/newsletter-drafts", {
                              action: "approve",
                              id: d.id,
                            })
                          }
                          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl transition"
                        >
                          Approve
                        </button>
                      )}
                      {d.status === "approved" && (
                        <button
                          type="button"
                          disabled={sendingId === d.id}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Send "${d.subject}" to ${news?.subscribed ?? 0} subscriber(s)?`
                              )
                            )
                              return;
                            setSendingId(d.id);
                            await newsletterAction("/api/newsletter-send", {
                              draftId: d.id,
                            });
                            setSendingId(null);
                          }}
                          className="bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl transition"
                        >
                          {sendingId === d.id ? "Sending…" : "Send"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="font-heading font-bold text-white mb-2">
              New weekly draft
            </h3>
            <div className="space-y-3 max-w-2xl">
              <input
                type="text"
                value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-royal"
              />
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Body — one useful idea, then one nudge. Blank lines make paragraphs."
                rows={5}
                className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-royal"
              />
              {draftMsg && (
                <p className="text-red-400 text-sm" role="alert">
                  {draftMsg}
                </p>
              )}
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await newsletterAction(
                      "/api/newsletter-drafts",
                      { subject: draftSubject, body: draftBody }
                    );
                    if (ok) {
                      setDraftSubject("");
                      setDraftBody("");
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Save draft
                </button>
              </div>
              <p className="text-white/40 text-xs">
                Drafts are never sent automatically. Approve one above, then
                press Send — and only an approved draft can be sent.
              </p>
            </div>

            {(news?.recentSends.length ?? 0) > 0 && (
              <>
                <h3 className="font-heading font-bold text-white mt-6 mb-2">
                  Recent sends
                </h3>
                <ul className="text-sm text-white/70 space-y-1">
                  {(news?.recentSends ?? []).slice(0, 5).map((s, i) => (
                    <li key={`${s.email}-${s.sent_at}-${i}`}>
                      {s.kind} · {s.subject} · {s.email} · {s.status} ·{" "}
                      {formatDate(s.sent_at)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Funnel */}
            <section className={`${CARD} p-6 lg:col-span-1`}>
              <h2 className="font-heading text-xl font-bold text-white mb-4">
                Funnel — views → signups
              </h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 pr-3 font-medium">Page</th>
                    <th className="py-2 pr-3 font-medium text-right">Views</th>
                    <th className="py-2 pr-3 font-medium text-right">
                      Signups
                    </th>
                    <th className="py-2 font-medium text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.funnel ?? []).map((row) => {
                    const source = PAGE_SOURCE[row.page];
                    const signups = source ? bySource[source] ?? 0 : null;
                    const conv =
                      signups !== null && row.views > 0
                        ? `${Math.round((signups / row.views) * 100)}%`
                        : "—";
                    return (
                      <tr
                        key={row.page}
                        className="border-b border-white/5 text-white/85"
                      >
                        <td className="py-3 pr-3">
                          <div className="text-white font-medium">
                            {PAGE_LABEL[row.page] ?? row.page}
                          </div>
                          <div className="text-white/40 text-xs">{row.page}</div>
                        </td>
                        <td className="py-3 pr-3 text-right">{row.views}</td>
                        <td className="py-3 pr-3 text-right">
                          {signups ?? "—"}
                        </td>
                        <td className="py-3 text-right text-white/60">{conv}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-white/40 text-xs mt-3">
                First-party tracking (no cookies). Google Analytics covers raw
                traffic; this ties views to signups.
              </p>
            </section>

            {/* Recent signups */}
            <section className={`${CARD} p-6 lg:col-span-2`}>
              <h2 className="font-heading text-xl font-bold text-white mb-4">
                Recent signups
              </h2>
              {(data?.recentLeads.length ?? 0) === 0 ? (
                <p className="text-white/60 text-sm">
                  No signups yet — they&apos;ll appear here the moment your
                  pages collect them.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[540px]">
                    <thead>
                      <tr className="text-white/50 border-b border-white/10">
                        <th className="py-2 pr-3 font-medium">Name</th>
                        <th className="py-2 pr-3 font-medium">Email</th>
                        <th className="py-2 pr-3 font-medium">Came from</th>
                        <th className="py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentLeads.map((lead, i) => (
                        <tr
                          key={`${lead.email}-${i}`}
                          className="border-b border-white/5 text-white/85"
                        >
                          <td className="py-3 pr-3">{lead.firstName}</td>
                          <td className="py-3 pr-3 break-all">{lead.email}</td>
                          <td className="py-3 pr-3">
                            <span className="text-xs text-royal-light border border-royal/40 bg-royal/10 rounded-full px-2.5 py-1 whitespace-nowrap">
                              {sourceLabel(lead.source)}
                            </span>
                          </td>
                          <td className="py-3 text-white/60 whitespace-nowrap">
                            {formatDate(lead.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
