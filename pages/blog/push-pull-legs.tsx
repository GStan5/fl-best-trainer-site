import Head from 'next/head';
import Layout from '../../components/Layout';

export default function PPLBlog() {
  return (
    <Layout>
      <Head>
        <title>Why Push Pull Legs Works | FL Best Trainer</title>
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Why the Push-Pull-Legs Routine Works</h1>
        <p>The Push-Pull-Legs (PPL) workout split is one of the most effective ways to train. It offers optimal muscle recovery, efficient structuring, and flexibility — perfect for beginners and pros alike.</p>
        <p className="mt-4">Experts like <strong>Jeff Cavaliere (Athlean-X)</strong> and <strong>Chris Bumstead</strong> advocate for variations of PPL due to its efficiency in balancing work and recovery.</p>
        <p className="mt-4">It’s especially great for adults over 40, allowing recovery and building strength to improve bone density, mobility, and mental focus.</p>
      </div>
    </Layout>
  );
}
