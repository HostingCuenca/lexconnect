import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getBlogPostBySlug, getPublishedBlogPosts, incrementBlogPostViews } from '@/lib/blog';
import { BlogPost } from '@/lib/blog-types';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2,
  Eye,
  Tag
} from 'lucide-react';

// Related Articles Component
async function RelatedArticles({ currentPost }: { currentPost: BlogPost }) {
  try {
    const allPosts = await getPublishedBlogPosts();
    const relatedPosts = allPosts
      .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
      .slice(0, 2);

    if (relatedPosts.length === 0) {
      return null;
    }

    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículos Relacionados</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {relatedPosts.map((relatedPost) => (
            <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={relatedPost.featured_image}
                  alt={relatedPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <Badge variant="outline" className="mb-3">
                  {relatedPost.category}
                </Badge>
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-700 transition-colors">
                  <Link href={`/blog/${relatedPost.slug}`}>
                    {relatedPost.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {relatedPost.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{relatedPost.author_name}</span>
                  <span>{relatedPost.read_time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getPublishedBlogPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Increment view count
  try {
    await incrementBlogPostViews(post.id);
  } catch (error) {
    console.error('Error incrementing views:', error);
  }

  // Convert markdown-like content to HTML (simplified)
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-gray-700">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        if (paragraph.match(/^\d+\./)) {
          const items = paragraph.split('\n').filter(line => line.match(/^\d+\./));
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Blog</span>
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge>{post.category}</Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{post.views} vistas</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{post.author_name}</p>
                    <p className="text-sm text-gray-500">{post.author_role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
              {post.excerpt}
            </div>
            
            <div className="space-y-4">
              {formatContent(post.content)}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Etiquetas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mt-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {post.author_name}
                  </h3>
                  <p className="text-blue-600 mb-2">{post.author_role}</p>
                  <p className="text-gray-600 text-sm">
                    Especialista con más de 15 años de experiencia en {post.category.toLowerCase()}. 
                    Ha participado en más de 200 casos exitosos y es reconocido por su expertise 
                    en la materia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <RelatedArticles currentPost={post} />
        </div>
      </article>

      <Footer />
    </div>
  );
}