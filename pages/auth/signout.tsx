import { signOut, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/router";

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/classes" });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 w-full max-w-md text-center"
        >
          <FaCheckCircle className="text-royal-light text-5xl mx-auto mb-6" />

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sign Out
          </h1>

          <p className="text-white/70 text-lg mb-8">
            Are you sure you want to sign out of your account?
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Yes, Sign Me Out
            </button>

            <button
              onClick={handleCancel}
              className="w-full px-6 py-3 bg-transparent border-2 border-royal-light text-royal-light font-semibold rounded-lg hover:bg-royal-light hover:text-royal-dark transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // If user is not signed in, redirect to signin page
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
