import Head from "next/head";
import Layout from "@/components/shared/Layout"; // Fix the import path

export default function AdminDashboard() {
  return (
    <Layout>
      <Head>
        <title>Admin | FL Best Trainer</title>
      </Head>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        <p className="text-white/70">
          Client stats, analytics, and tools coming soon.
        </p>
      </div>
    </Layout>
  );
}
