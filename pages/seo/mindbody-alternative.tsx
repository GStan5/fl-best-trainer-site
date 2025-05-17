import Head from 'next/head';
import Layout from '../../components/Layout';

export default function MindbodyAlternative() {
  return (
    <Layout>
      <Head>
        <title>Mindbody Alternative | FL Best Trainer</title>
        <meta name="description" content="Looking for a Mindbody alternative in Florida? FL Best Trainer offers personal 1-on-1 in-home training without the app hassle." />
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">A Better Alternative to Mindbody</h1>
        <p>FL Best Trainer provides a personalized experience for adults 40+ without the confusion of apps and generic plans. Enjoy flexible scheduling, in-home training, and expert support from a real local trainer.</p>
      </div>
    </Layout>
  );
}