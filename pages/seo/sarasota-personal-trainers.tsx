import Head from 'next/head';
import Layout from '../../components/Layout';

export default function SarasotaTrainers() {
  return (
    <Layout>
      <Head>
        <title>Sarasota Personal Trainers | FL Best Trainer</title>
        <meta name="description" content="Skip crowded gyms. Work 1-on-1 with a NASM-certified trainer in Sarasota for customized in-home personal training." />
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Sarasota’s Best Personal Training Experience</h1>
        <p>No gym memberships, no intimidation — just focused results in your own space. I specialize in personal training for adults 40+ throughout Sarasota and surrounding areas.</p>
      </div>
    </Layout>
  );
}