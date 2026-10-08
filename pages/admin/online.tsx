import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { PROGRAMS } from "../../lib/programs";
import {
  FaDownload,
  FaVideo,
  FaUsers,
  FaCalendarWeek,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

// Independent for Life — Admin Online Program hub (Phase 5).
// NEW admin page; gate mirrors pages/admin/index.tsx (session isAdmin,
// loading → spinner, signed-out → sign-in, non-admin → /classes).
// Data comes from /api/program-admin; programs catalog from
// lib/programs.ts. Existing admin pages are not modified.

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

// Lead source each program's page collects through guide-signup.
// Programs without a lead source show 0 signups here.
const PROGRAM_SOURCE: Record<string, string> = {
  guide: "guide",
  starter: "starter",
  flagship: "flagship",
};

// Funnel page → the lead source a view on that page can turn into.
const PAGE_SOURCE: Record<string, string> = {
  "/start": "guide",
  "/starter": "starter",
  "/flagship": "flagship",
  "/plans": "plans",
};

const CHECKOUT_BANNERS: Record<
  AdminData["checkoutMode"],
  { title: string; body: string; classes: string }
> = {
  test: {
    title: "Checkout mode: TEST",
    body: "Stripe test key detected — the online buy buttons create test checkouts only. No real money can move.",
    classes: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
  },
  live: {
    title: "Checkout mode: LIVE",
    body: "ONLINE_SALES_LIVE is on with a live Stripe key — the online buy buttons take real payments.",
    classes: "border-green-400/40 bg-green-400/10 text-green-100",
  },
  off: {
    title: "Checkout mode: OFF",
    body: "Online checkout is guarded off (no test key, and live sales are not enabled). Buy buttons refuse politely.",
    classes: "border-white/15 bg-white/[0.04] text-white/80",
  },
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

export default function AdminOnlinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin;

  const [data, setData] = useState<AdminData | null>(null);
  const [loadError, setLoadError] = useState(false);

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

  const banner = data ? CHECKOUT_BANNERS[data.checkoutMode] : null;

  const statCards = [
    {
      label: "Total signups",
      value: data?.totals.leads ?? 0,
      icon: <FaUsers className="text-royal-light" />,
    },
    {
      label: "Last 7 days",
      value: data?.totals.last7d ?? 0,
      icon: <FaCalendarWeek className="text-royal-light" />,
    },
    {
      label: "Last 30 days",
      value: data?.totals.last30d ?? 0,
      icon: <FaCalendarAlt className="text-royal-light" />,
    },
    {
      label: "Pending form checks",
      value: data?.formChecks.pending ?? 0,
      icon: <FaVideo className="text-royal-light" />,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
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
              </Link>
            </div>
          </div>

          {loadError && (
            <div className="border border-red-400/40 bg-red-400/10 text-red-100 rounded-2xl p-5 mb-6">
              Couldn&apos;t load the program data. The numbers below may be
              incomplete — refresh to try again.
            </div>
          )}

          {/* (a) Checkout mode banner */}
          {banner && (
            <div className={`border rounded-2xl p-5 mb-6 ${banner.classes}`}>
              <p className="font-heading font-bold text-lg">{banner.title}</p>
              <p className="text-sm mt-1 opacity-90">{banner.body}</p>
            </div>
          )}

          {/* (b) Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-5"
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="font-heading text-3xl font-bold text-white">
                  {card.value}
                </div>
                <div className="text-white/60 text-sm mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* (c) Signups by program */}
            <section className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-white mb-4">
                Signups by program
              </h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 pr-3 font-medium">Program</th>
                    <th className="py-2 pr-3 font-medium">Price</th>
                    <th className="py-2 font-medium text-right">Signups</th>
                  </tr>
                </thead>
                <tbody>
                  {PROGRAMS.map((program) => {
                    const source = PROGRAM_SOURCE[program.slug];
                    const count = source
                      ? data?.totals.signupsBySource[source] ?? 0
                      : 0;
                    return (
                      <tr
                        key={program.slug}
                        className="border-b border-white/5 text-white/85"
                      >
                        <td className="py-3 pr-3">{program.name}</td>
                        <td className="py-3 pr-3 text-white/60">
                          {program.price}
                        </td>
                        <td className="py-3 text-right font-semibold text-white">
                          {count}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* (d) Funnel */}
            <section className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-white mb-4">
                Funnel — views → signups
              </h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 pr-3 font-medium">Page</th>
                    <th className="py-2 pr-3 font-medium text-right">Views</th>
                    <th className="py-2 pr-3 font-medium text-right">Signups</th>
                    <th className="py-2 font-medium text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.funnel ?? []).map((row) => {
                    const source = PAGE_SOURCE[row.page];
                    const signups = source
                      ? data?.totals.signupsBySource[source] ?? 0
                      : null;
                    const conv =
                      signups !== null && row.views > 0
                        ? `${Math.round((signups / row.views) * 100)}%`
                        : "—";
                    return (
                      <tr
                        key={row.page}
                        className="border-b border-white/5 text-white/85"
                      >
                        <td className="py-3 pr-3">{row.page}</td>
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
                First-party tracking (no cookies). GA in the site header
                covers raw traffic; this is views against guide signups.
              </p>
            </section>
          </div>

          {/* (e) Recent signups */}
          <section className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="font-heading text-xl font-bold text-white mb-4">
              Recent signups
            </h2>
            {(data?.recentLeads.length ?? 0) === 0 ? (
              <p className="text-white/60 text-sm">
                No signups yet. They&apos;ll appear here as the guide forms
                collect them.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[540px]">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 pr-3 font-medium">Email</th>
                      <th className="py-2 pr-3 font-medium">Source</th>
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
                        <td className="py-3 pr-3">{lead.email}</td>
                        <td className="py-3 pr-3 text-white/60">
                          {lead.source}
                        </td>
                        <td className="py-3 text-white/60">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* (f) Programs catalog */}
          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-4">
              What you&apos;re selling
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROGRAMS.map((program) => (
                <article
                  key={program.slug}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading text-lg font-bold text-white">
                      {program.name}
                    </h3>
                    <span className="text-royal-light font-heading font-bold whitespace-nowrap">
                      {program.price}
                    </span>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wide text-white/50 border border-white/15 rounded-full px-2.5 py-1">
                      {program.status}
                    </span>
                    <Link
                      href={program.page}
                      className="inline-flex items-center text-royal-light text-sm font-semibold"
                    >
                      View page <FaExternalLinkAlt className="ml-1.5 text-xs" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
