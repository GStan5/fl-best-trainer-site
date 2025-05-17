import Head from 'next/head';
import Layout from '../components/Layout';

export default function Booking() {
  return (
    <Layout>
      <Head>
        <title>Booking | FL Best Trainer</title>
      </Head>
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-blue-900">Book a Session</h1>
        <p className="text-gray-600 mt-2">Choose your time below to get started with personal training.</p>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        <iframe
          src="https://calendly.com/flbesttrainer"
          width="100%"
          height="600"
          className="border-none"
          title="Book a session"
        ></iframe>
      </div>
    </Layout>
  );
}