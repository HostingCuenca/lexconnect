import { getPublishedBlogPosts } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog-types';
import BlogClient from '@/components/BlogClient';

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