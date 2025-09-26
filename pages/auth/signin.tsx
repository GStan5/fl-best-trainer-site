import { getProviders, signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

interface SignInProps {
  providers: Record<string, any>;
}

export default function SignIn({ providers }: SignInProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Welcome to FL Best Trainer
            </h1>
            <p className="text-white/70 text-lg">
              Sign in with Google to book classes and track your progress
            </p>
          </div>

          <div className="space-y-4">
            {Object.values(providers).map((provider: any) => (
              <div key={provider.name}>
                <button
                  onClick={() =>
                    signIn(provider.id, { callbackUrl: "/classes" })
                  }
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FaGoogle className="text-red-500 text-xl" />
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              New to FL Best Trainer? No problem! Google will automatically
              create your account when you sign in for the first time.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-xs">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // If user is already signed in, redirect to classes page
  if (session) {
    return {
      redirect: {
        destination: "/classes",
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers: providers ?? {},
    },
  };
};
