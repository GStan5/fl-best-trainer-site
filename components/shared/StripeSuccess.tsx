import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

interface StripeSuccessProps {
  packageName?: string;
}

export default function StripeSuccess({ packageName }: StripeSuccessProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/20"
      >
        <FaSpinner className="text-royal-light text-4xl animate-spin mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">
          Processing Payment
        </h3>
        <p className="text-white/70 text-center">
          Please wait while we confirm your purchase and add sessions to your
          account...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-8 border border-green-500/30"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <FaCheckCircle className="text-green-400 text-6xl mx-auto" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white text-2xl font-bold mb-4"
        >
          Payment Successful! 🎉
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 mb-6"
        >
          <p className="text-white/90 text-lg">
            Thank you for your purchase of{" "}
            <span className="font-semibold text-green-400">
              {packageName || "your training package"}
            </span>
          </p>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">
              ✅ Sessions have been added to your account
              <br />
              ✅ You can now book classes from your dashboard
              <br />✅ You'll receive an email confirmation shortly
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/account")}
            className="px-6 py-3 bg-gradient-to-r from-royal to-royal-light text-white font-medium rounded-lg hover:from-royal-light hover:to-royal transition-all duration-300"
          >
            View My Account
          </button>

          <button
            onClick={() => router.push("/classes")}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-all duration-300"
          >
            Book a Class
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
