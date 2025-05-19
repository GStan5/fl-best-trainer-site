import Header from "./shared/Header";
import Footer from "./shared/Footer";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background gradient wrapper */}
      <div className="fixed inset-0 bg-gradient-to-br from-navy via-royal to-navy opacity-5"></div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col z-10">
        <Header />
        <main className="flex-1">
          {/* Page transition wrapper */}
          <div className="animate-fade-in">{children}</div>
        </main>
        <Footer />
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-3 rounded-full bg-navy/80 backdrop-blur-sm
          shadow-lg hover:bg-navy transition-all duration-300 z-50
          opacity-0 hover:opacity-100 focus:opacity-100
          translate-y-8 hover:translate-y-0 focus:translate-y-0"
      >
        <span className="sr-only">Scroll to top</span>
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}
