import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Montserrat } from "next/font/google";
import Head from "next/head";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Removing favicon links from here - keep them only in _document.js */}
      </Head>
      <main className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
