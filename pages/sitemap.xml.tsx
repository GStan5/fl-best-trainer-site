import { GetServerSideProps } from 'next';

const EXTERNAL_DATA_URL = 'https://flbesttrainer.com';

function generateSiteMap(pages: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${pages.map((page) => {
       return `
       <url>
         <loc>${`${EXTERNAL_DATA_URL}${page}`}</loc>
         <lastmod>${new Date().toISOString()}</lastmod>
         <changefreq>weekly</changefreq>
         <priority>${page === '/' ? '1.0' : '0.8'}</priority>
       </url>
     `;
     }).join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Define all your page URLs
  const pages = [
    '/',
    '/about',
    '/training',
    '/plans',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/waiver'
  ];

  // Generate the XML sitemap with the pages data
  const sitemap = generateSiteMap(pages);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;