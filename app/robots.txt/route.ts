export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexconnect.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

# Allow public pages
Allow: /
Allow: /services
Allow: /blog
Allow: /about
Allow: /contact`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}