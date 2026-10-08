import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import AdminNav from "../../components/admin/AdminNav";
import { FaArrowLeft, FaExternalLinkAlt, FaVideo } from "react-icons/fa";

// Independent for Life — Admin form-check queue (Phase 5).
// NEW admin page; gate mirrors pages/admin/index.tsx. Members submit
// video links on /form-check; they queue up here (pending first) and
// Gavin marks them reviewed after covering them in the weekly
// Steady Letter. Data + status toggles: pages/api/form-check.ts.

interface FormCheck {
  id: number;
  email: string;
  name: string;
  videoUrl: string;
  note: string;
  status: string;
  createdAt: string | null;
}

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

export default function AdminOnlineFormChecksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin;

  const [checks, setChecks] = useState<FormCheck[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const loadQueue = useCallback(() => {
    fetch("/api/form-check")
      .then((res) => {
        if (!res.ok) throw new Error("queue failed");
        return res.json();
      })
      .then((json) => {
        setChecks((json.formChecks ?? []) as FormCheck[]);
        setLoaded(true);
      })
      .catch(() => {
        setLoadError(true);
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    loadQueue();
  }, [status, isAdmin, loadQueue]);

  async function toggleStatus(check: FormCheck) {
    const next = check.status === "pending" ? "reviewed" : "pending";
    setUpdatingId(check.id);
    try {
      const res = await fetch("/api/form-check", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: check.id, status: next }),
      });
      if (res.ok) {
        setChecks((prev) =>
          prev.map((c) => (c.id === check.id ? { ...c, status: next } : c))
        );
      }
    } catch {
      // Leave the row as-is; the button re-enables for another try.
    } finally {
      setUpdatingId(null);
    }
  }

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

  const pendingCount = checks.filter((c) => c.status === "pending").length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <AdminNav />
          <Link
            href="/admin/online"
            className="inline-flex items-center text-royal-light text-sm font-semibold mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back to Online Programs
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                Form-check queue
              </h1>
              <p className="text-white/60 mt-1">
                Member videos for the weekly Steady Letter —{" "}
                {pendingCount} pending.
              </p>
            </div>
          </div>

          {loadError && (
            <div className="border border-red-400/40 bg-red-400/10 text-red-100 rounded-2xl p-5 mb-6">
              Couldn&apos;t load the queue. Refresh to try again.
            </div>
          )}

          {loaded && checks.length === 0 && !loadError ? (
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
              <FaVideo className="text-royal text-4xl mx-auto mb-4" />
              <p className="text-white/75">
                No form checks yet. When members submit videos on the
                form-check page, they&apos;ll queue up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {checks.map((check) => (
                <article
                  key={check.id}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold break-all">
                        {check.name ? `${check.name} · ` : ""}
                        {check.email}
                      </p>
                      <p className="text-white/50 text-sm">
                        {formatDate(check.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wide rounded-full px-2.5 py-1 border ${
                        check.status === "pending"
                          ? "text-yellow-200 border-yellow-400/40 bg-yellow-400/10"
                          : "text-green-200 border-green-400/40 bg-green-400/10"
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  {check.note && (
                    <p className="text-white/75 text-sm leading-relaxed mt-3">
                      “{check.note}”
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <a
                      href={check.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center bg-royal hover:bg-royal-dark text-white font-heading font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      Watch video <FaExternalLinkAlt className="ml-2 text-xs" />
                    </a>
                    <button
                      type="button"
                      disabled={updatingId === check.id}
                      onClick={() => toggleStatus(check)}
                      className="inline-flex items-center bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white font-heading font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      {updatingId === check.id
                        ? "Saving…"
                        : check.status === "pending"
                          ? "Mark reviewed"
                          : "Back to pending"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
