import { getPublishedBlogPosts } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog-types';
import BlogClient from '@/components/BlogClient';

// ISR: Revalida cada 5 minutos para balance entre performance y frescura de datos
export const revalidate = 300; // 5 minutos

// Server-side page to fetch blog posts from PostgreSQL
export default async function BlogPage() {
  try {
    const posts = await getPublishedBlogPosts();
    const categories = ['Todos', ...BLOG_CATEGORIES];

    return <BlogClient initialPosts={posts} categories={categories} />;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return <BlogClient initialPosts={[]} categories={['Todos']} />;
  }
}