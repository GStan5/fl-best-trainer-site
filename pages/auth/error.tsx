import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import Link from "next/link";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (typeof error !== "string") return "An unknown error occurred";

    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access was denied. Please contact support if you think this is an error.";
      case "Verification":
        return "The verification token has expired or been used already.";
      case "Default":
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 sm:p-12 w-full max-w-md text-center"
        >
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-6" />

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Authentication Error
          </h1>

          <p className="text-white/70 text-lg mb-8">{getErrorMessage(error)}</p>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full px-6 py-3 bg-royal-light text-royal-dark font-semibold rounded-lg hover:bg-white transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </Link>

            <Link
              href="/classes"
              className="block w-full px-6 py-3 bg-transparent border-2 border-royal-light text-royal-light font-semibold rounded-lg hover:bg-royal-light hover:text-royal-dark transition-all duration-300"
            >
              Continue as Guest
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-royal-light hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
