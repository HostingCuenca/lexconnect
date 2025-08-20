'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Search, 
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';
import { BlogPost } from '@/lib/blog-types';

interface BlogClientProps {
  initialPosts: BlogPost[];
  categories: string[];
}

export default function BlogClient({ initialPosts, categories }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter posts based on search and category
  useEffect(() => {
    const filterPosts = async () => {
      if (searchTerm.trim() === '' && selectedCategory === 'Todos') {
        setPosts(initialPosts);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.set('search', searchTerm);
        }
        if (selectedCategory !== 'Todos') {
          params.set('category', selectedCategory);
        }

        const response = await fetch(`/api/blog?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.data);
        }
      } catch (error) {
        console.error('Error searching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(filterPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, initialPosts]);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format reading time helper
  const formatReadingTime = (minutes: number) => {
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display mb-4">
              Blog Jurídico <span className="text-secondary">LexConnect</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-serif">
              Análisis legal, noticias jurídicas y guías prácticas de nuestros expertos.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-secondary/20 rounded-full text-sm">
              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
              Datos desde PostgreSQL
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  disabled={loading}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                Buscando artículos...
              </div>
            </div>
          )}
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No se encontraron artículos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `No hay artículos que coincidan con "${searchTerm}"` : 'Aún no hay artículos publicados.'}
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
            }}>
              Ver todos los artículos
            </Button>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Post */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículo Destacado</h2>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={posts[0].featured_image}
                      alt={posts[0].title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className="bg-primary text-white">{posts[0].category}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>{posts[0].views} vistas</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-primary transition-colors">
                      <Link href={`/blog/${posts[0].slug}`}>
                        {posts[0].title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {posts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{posts[0].author_name || 'Anónimo'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatReadingTime(posts[0].reading_time)}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${posts[0].slug}`}>
                        <Button>
                          Leer Más
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Blog Posts Grid */}
          {posts.length > 1 && (
            <section className="py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Más Artículos</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.slice(1).map((post) => (
                    <Card key={post.id} className="h-full hover:shadow-lg transition-shadow duration-300 group">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-primary text-primary">{post.category}</Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span className="truncate">{post.author_name || 'Anónimo'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatReadingTime(post.reading_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                          <Link href={`/blog/${post.slug}`}>
                            <Button variant="outline" size="sm">
                              Leer Más
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mantente Informado
          </h2>
          <p className="text-white/80 mb-8">
            Recibe los últimos análisis legales y actualizaciones jurídicas directamente en tu correo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Tu correo electrónico"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button className="bg-secondary hover:bg-secondary/90 text-primary">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}