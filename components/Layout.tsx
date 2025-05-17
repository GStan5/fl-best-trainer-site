import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 text-gray-900 p-4">{children}</main>
      <Footer />
    </>
  );
}