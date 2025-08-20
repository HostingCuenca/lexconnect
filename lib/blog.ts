import { updateSitemap } from './sitemap';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  tags: string[];
  views: number;
  status: 'draft' | 'published' | 'archived';
}

export interface CreateBlogPostData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  image: string;
}

// Mock database - in production, this would be replaced with actual database operations
let blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Nuevas Reformas en el Código Civil 2024: Guía Completa',
    slug: 'reformas-codigo-civil-2024',
    excerpt: 'Análisis detallado de las últimas modificaciones al código civil mexicano y su impacto directo en contratos, obligaciones y derechos civiles.',
    content: 'Contenido completo del artículo...',
    author: 'Dra. María González',
    authorRole: 'Especialista en Derecho Civil',
    date: '2024-01-15',
    readTime: '8 min',
    image: 'https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Civil',
    tags: ['Código Civil', 'Reformas 2024', 'Contratos Digitales'],
    views: 1247,
    status: 'published'
  },
  {
    id: 2,
    title: 'Guía Completa para Constituir una Empresa en México 2024',
    slug: 'constituir-empresa-mexico-2024',
    excerpt: 'Pasos detallados, requisitos actualizados y costos para la constitución de sociedades en México.',
    content: 'Contenido completo del artículo...',
    author: 'Lic. Carlos Ruiz',
    authorRole: 'Especialista en Derecho Comercial',
    date: '2024-01-10',
    readTime: '12 min',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Comercial',
    tags: ['Constitución', 'Empresas', 'S.A.S.', 'Trámites'],
    views: 2156,
    status: 'published'
  }
];

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate estimated reading time
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

// Create new blog post
export async function createBlogPost(data: CreateBlogPostData): Promise<BlogPost> {
  const newPost: BlogPost = {
    id: Date.now(),
    ...data,
    slug: generateSlug(data.title),
    date: new Date().toISOString().split('T')[0],
    readTime: calculateReadTime(data.content),
    views: 0,
    status: 'draft'
  };

  // Add to mock database
  blogPosts.push(newPost);

  // Update sitemap when post is published
  if (newPost.status === 'published') {
    await updateSitemap({
      id: newPost.id,
      slug: newPost.slug,
      title: newPost.title,
      date: newPost.date,
      category: newPost.category
    });
  }

  return newPost;
}

// Publish blog post
export async function publishBlogPost(id: number): Promise<BlogPost | null> {
  const postIndex = blogPosts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return null;
  }

  blogPosts[postIndex].status = 'published';
  const publishedPost = blogPosts[postIndex];

  // Update sitemap when post is published
  await updateSitemap({
    id: publishedPost.id,
    slug: publishedPost.slug,
    title: publishedPost.title,
    date: publishedPost.date,
    category: publishedPost.category
  });

  return publishedPost;
}

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get published blog posts
export function getPublishedBlogPosts(): BlogPost[] {
  return blogPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find(post => post.slug === slug) || null;
}

// Get blog posts by category
export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts
    .filter(post => post.category === category && post.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Update blog post views
export function incrementBlogPostViews(slug: string): void {
  const postIndex = blogPosts.findIndex(post => post.slug === slug);
  if (postIndex !== -1) {
    blogPosts[postIndex].views += 1;
  }
}