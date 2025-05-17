import Head from 'next/head';
import Layout from '../components/Layout';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <Layout>
      <Head>
        <title>Contact | FL Best Trainer</title>
      </Head>
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-blue-900">Contact Me</h1>
        <p className="text-gray-600 mt-2">Get in touch with questions or book a training consultation.</p>
      </div>
      <ContactForm />
    </Layout>
  );
}
