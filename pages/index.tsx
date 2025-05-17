import Head from 'next/head';
import Layout from '../components/Layout';
import HeroAnimation from '../components/HeroAnimation';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Home | FL Best Trainer</title>
      </Head>
      <section className="flex flex-col-reverse md:flex-row items-center gap-8 px-4 py-12 bg-gray-50">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Elite Personal Training at Your Doorstep</h1>
          <p className="text-lg text-gray-700 mb-6">
            I help adults of all ages get stronger, leaner, and more confident — specializing in training for 40+ clients with 20 years of experience.
          </p>
          <a href="/booking" className="inline-block bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition">
            Book Your First Session
          </a>
        </div>
        <div className="md:w-1/2">
          <HeroAnimation />
        </div>
      </section>
    </Layout>
  );
}