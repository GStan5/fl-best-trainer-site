import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { GA_TRACKING_ID, pageview, setGATrackingId } from "../utils/gtag";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

interface AppPropsWithGA extends AppProps {
  gaTrackingId?: string;
}

export default function App({
  Component,
  pageProps,
  gaTrackingId,
}: AppPropsWithGA) {
  const router = useRouter();

  useEffect(() => {
    // Set the GA tracking ID from server-side
    if (gaTrackingId) {
      setGATrackingId(gaTrackingId);
    }
  }, [gaTrackingId]);

  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    if (GA_TRACKING_ID) {
      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  }, [router.events]);

  return (
    <main className={`${inter.variable} ${montserrat.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  );
}

// Get the GA tracking ID on the server-side
App.getInitialProps = async () => {
  return {
    gaTrackingId: process.env.GA_TRACKING_ID,
  };
};
