import Head from 'next/head';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | FL Best Trainer</title>
      </Head>
      <h1 className="text-3xl font-bold">About Page</h1>
      <p className="mt-2">Content coming soon.</p>
    </Layout>
  );
}