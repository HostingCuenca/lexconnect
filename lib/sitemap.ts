export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  category: string;
}

// Static pages configuration
const staticPages = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
  { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/auth/login', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/auth/register', priority: 0.5, changeFrequency: 'yearly' as const },
];

// Mock blog posts data - in production, this would come from your database
const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'reformas-codigo-civil-2024',
    title: 'Nuevas Reformas en el Código Civil 2024: Guía Completa',
    date: '2024-01-15',
    category: 'Derecho Civil'
  },
  {
    id: 2,
    slug: 'constituir-empresa-mexico-2024',
    title: 'Guía Completa para Constituir una Empresa en México 2024',
    date: '2024-01-10',
    category: 'Derecho Comercial'
  }
];

export function generateSitemap(baseUrl: string = 'https://lexconnect.com'): SitemapEntry[] {
  const sitemap: SitemapEntry[] = [];

  // Add static pages
  staticPages.forEach(page => {
    sitemap.push({
      url: `${baseUrl}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority
    });
  });

  // Add blog posts
  blogPosts.forEach(post => {
    sitemap.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.7
    });
  });

  // Add blog categories
  const categories = [...new Set(blogPosts.map(post => post.category))];
  categories.forEach(category => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    sitemap.push({
      url: `${baseUrl}/blog/category/${categorySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    });
  });

  return sitemap.sort((a, b) => b.priority - a.priority);
}

export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('');

  return `${xmlHeader}\n${urlsetOpen}${urls}\n${urlsetClose}`;
}

// Function to add new blog post to sitemap
export function addBlogPostToSitemap(post: BlogPost, baseUrl: string = 'https://lexconnect.com'): SitemapEntry {
  return {
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7
  };
}

// Function to regenerate sitemap when new content is added
export async function updateSitemap(newPost?: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexconnect.com';
  
  if (newPost) {
    // Add new blog post to the posts array
    blogPosts.push(newPost);
  }
  
  const sitemapEntries = generateSitemap(baseUrl);
  const sitemapXML = generateSitemapXML(sitemapEntries);
  
  // In production, you would write this to public/sitemap.xml
  // For now, we'll return the XML content
  return sitemapXML;
}