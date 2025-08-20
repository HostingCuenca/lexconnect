import { generateSitemap, generateSitemapXML } from '@/lib/sitemap';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexconnect.com';
  const sitemapEntries = generateSitemap(baseUrl);
  const sitemapXML = generateSitemapXML(sitemapEntries);

  return new Response(sitemapXML, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}