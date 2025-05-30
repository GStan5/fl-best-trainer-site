import React from "react";

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  image?: string;
  telephone?: string;
  areaServed?: string[];
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = "FL Best Trainer",
  description = "Premium in-home personal training in Bradenton, Sarasota, Anna Maria Island, & Longboat Key",
  image = "https://flbesttrainer.com/images/og-image.jpg",
  telephone = "+19285871309",
  areaServed = ["Bradenton", "Anna Maria Island", "Longboat Key", "Sarasota"],
  priceRange = "$$$",
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: name,
    description: description,
    image: image,
    telephone: telephone,
    address: {
      "@type": "PostalAddress",
      addressRegion: "FL",
      addressCountry: "US",
    },
    priceRange: priceRange,
    areaServed: areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    sameAs: [
      "https://instagram.com/flbesttrainer",
      "https://facebook.com/flbesttrainer",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  provider?: string;
  area?: string;
  price?: string;
}

export function ServiceSchema({
  serviceName,
  description,
  provider = "FL Best Trainer",
  area = "Southwest Florida",
  price,
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description,
    provider: {
      "@type": "LocalBusiness",
      name: provider,
    },
    areaServed: area,
    offers: price
      ? {
          "@type": "Offer",
          price: price.replace(/[^0-9.]/g, ""),
          priceCurrency: "USD",
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
