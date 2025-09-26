import { useEffect } from "react";
import { useRouter } from "next/router";
import AdminClientsPage from "../classes/admin/clients";
import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";

export default function AdminClientsRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is admin using session data
  const isAdmin = session?.user?.isAdmin;

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not signed in, redirect to sign in
      router.push("/api/auth/signin");
      return;
    }

    if (!isAdmin) {
      // Signed in but not admin, redirect to classes
      router.push("/classes");
      return;
    }
  }, [session, status, isAdmin, router]);

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

  // If user is admin, render the actual admin clients page
  return <AdminClientsPage />;
}
