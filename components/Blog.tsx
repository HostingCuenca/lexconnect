'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-types';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data.data?.slice(0, 3) || []); // Show only first 3 posts
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-sans">
            Blog Jurídico
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
            Mantente informado con los últimos análisis legales, cambios en la legislación 
            y consejos prácticos de nuestros expertos.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Cargando artículos...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post) => (
              <Card key={post.id} className="h-full hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded font-sans">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl hover:text-primary transition-colors font-sans">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3 font-sans">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 font-sans">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author_name || 'Autor Anónimo'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                      Leer Más
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/blog">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Ver Todos los Artículos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}