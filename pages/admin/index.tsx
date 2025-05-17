import Head from 'next/head';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  return (
    <Layout>
      <Head>
        <title>Admin | FL Best Trainer</title>
      </Head>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Admin Dashboard</h1>
        <p className="text-gray-700">Client stats, analytics, and tools coming soon.</p>
      </div>
    </Layout>
  );
}