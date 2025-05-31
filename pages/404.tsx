import Link from "next/link";
import Head from "next/head";
import { FaHome, FaDumbbell, FaArrowRight } from "react-icons/fa";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | FL Best Trainer</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0A0A0A] to-[#121212] text-center px-4 py-16">
        <div className="max-w-md w-full mx-auto">
          {/* Top design element */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-royal/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-royal/40 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-royal flex items-center justify-center animate-pulse">
                  <FaDumbbell className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          <h1 className="text-7xl font-bold text-white mb-2">404</h1>
          <div className="h-1 w-20 mx-auto bg-gradient-to-r from-transparent via-royal to-transparent my-6"></div>
          <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
          <p className="text-white/70 mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track with your fitness journey.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              <FaHome />
              Back to Home
            </Link>
            <Link
              href="/training"
              className="flex items-center justify-center gap-2 bg-royal hover:bg-royal-light text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              Start Training
              <FaArrowRight />
            </Link>
          </div>

          {/* Visual element */}
          <div className="mt-12 text-white/40 flex items-center justify-center gap-2">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-sm whitespace-nowrap px-4">
              FL BEST TRAINER
            </span>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
}
