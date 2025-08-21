'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { BlogPost } from '@/lib/blog-types';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Calendar,
  User,
  TrendingUp,
  FileText,
  ExternalLink
} from 'lucide-react';

export default function DashboardBlogPage() {
  const { user, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
    totalViews: 0,
    popular: 0
  });

  // Fetch blog posts when auth is ready and user is available
  useEffect(() => {
    if (!authLoading && user && (user.role === 'administrador' || user.role === 'abogado')) {
      fetchBlogPosts();
    } else if (!authLoading && (!user || (user.role !== 'administrador' && user.role !== 'abogado'))) {
      setPostsLoading(false);
    }
  }, [authLoading, user]);

  const fetchBlogPosts = async () => {
    try {
      setPostsLoading(true);
      
      // Admin ve todos los artículos, abogado solo los suyos
      const endpoint = user?.role === 'administrador' 
        ? '/api/blog?status=all' 
        : '/api/blog';
        
      const response = await authenticatedFetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
        
        // Calculate stats
        const published = data.data.filter((p: BlogPost) => p.status === 'publicado').length;
        const drafts = data.data.filter((p: BlogPost) => p.status === 'borrador').length;
        const totalViews = data.data.reduce((sum: number, p: BlogPost) => sum + p.views, 0);
        const popular = data.data.filter((p: BlogPost) => p.views > 1000).length;
        
        setStats({ published, drafts, totalViews, popular });
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los artículos del blog",
        variant: "destructive"
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'publicado':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'borrador':
        return <Badge className="bg-yellow-100 text-yellow-800">Borrador</Badge>;
      case 'archivado':
        return <Badge className="bg-gray-100 text-gray-800">Archivado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/blog/${postId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Artículo eliminado exitosamente"
        });
        fetchBlogPosts(); // Refresh the list
      } else {
        throw new Error(data.message || 'Error al eliminar artículo');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el artículo",
        variant: "destructive"
      });
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            Verificando autenticación...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show access denied if not admin or lawyer
  if (!user || (user.role !== 'administrador' && user.role !== 'abogado')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los administradores y abogados pueden gestionar artículos.</p>
        </div>
      </DashboardLayout>
    );
  }

  const blogStats = [
    {
      title: 'Artículos Publicados',
      value: stats.published.toString(),
      description: 'Visibles al público',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Vistas Totales',
      value: stats.totalViews.toLocaleString(),
      description: 'Todas las visualizaciones',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      title: 'Artículos Populares',
      value: stats.popular.toString(),
      description: 'Más de 1K vistas',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Borradores',
      value: stats.drafts.toString(),
      description: 'Pendientes de publicar',
      icon: Edit,
      color: 'text-orange-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'administrador' ? 'Gestión de Blog' : 'Mis Artículos'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'administrador' 
                ? 'Crea y gestiona artículos para el blog jurídico de LexConnect.'
                : 'Crea y gestiona tus artículos como especialista legal.'}
            </p>
          </div>
          <Link href="/dashboard/blog/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Artículo</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Artículos</CardTitle>
            <CardDescription>
              Gestiona todos tus artículos del blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Filtros
              </Button>
            </div>

            {postsLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  Cargando artículos...
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay artículos</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No se encontraron artículos con ese término de búsqueda.' : 'Aún no has creado ningún artículo.'}
                </p>
                <Link href="/dashboard/blog/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer artículo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
                        {getStatusBadge(post.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Categoría: {post.category}</span>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{post.author_name || 'Anónimo'}</span>
                        </div>
                        {(post.published_at || post.created_at) && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views} vistas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="sm" title="Ver artículo">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/blog/edit/${post.id}`}>
                        <Button variant="outline" size="sm" title="Editar artículo">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {user?.role === 'administrador' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePost(post.id)}
                          title="Eliminar artículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PostgreSQL Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <span className="w-3 h-3 bg-secondary rounded-full"></span>
              <span>Sistema de Blog con PostgreSQL</span>
            </CardTitle>
            <CardDescription className="text-primary/80">
              Todos los artículos están almacenados en PostgreSQL con funcionalidades avanzadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-primary/90">
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Base de datos PostgreSQL</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Búsqueda full-text integrada</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Control de versiones de artículos</span>
                </p>
              </div>
              <div className="space-y-3 text-primary/90">
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>SEO automático optimizado</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Estadísticas de visualización</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Gestión de categorías y tags</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}