import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  isArticle?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = '/images/og-image.jpg',
  url = 'https://flbesttrainer.com',
  isArticle = false,
}: SEOProps) {
  const fullUrl = url.startsWith('http') ? url : `https://flbesttrainer.com${url}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `https://flbesttrainer.com${ogImage}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      <link rel="alternate" href="https://flbesttrainer.com" hreflang="en-us" />
    </Head>
  );
}