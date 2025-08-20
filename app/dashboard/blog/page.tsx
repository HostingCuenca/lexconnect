'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Calendar,
  User,
  TrendingUp,
  FileText
} from 'lucide-react';

const blogStats = [
  {
    title: 'Artículos Publicados',
    value: '12',
    description: '+3 este mes',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Vistas Totales',
    value: '15.2K',
    description: '+25% vs mes anterior',
    icon: Eye,
    color: 'text-green-600'
  },
  {
    title: 'Artículos Populares',
    value: '5',
    description: 'Más de 1K vistas',
    icon: TrendingUp,
    color: 'text-purple-600'
  },
  {
    title: 'Borradores',
    value: '3',
    description: 'Pendientes de publicar',
    icon: Edit,
    color: 'text-orange-600'
  }
];

const mockPosts = [
  {
    id: 1,
    title: 'Nuevas Reformas en el Código Civil 2024: Guía Completa',
    slug: 'reformas-codigo-civil-2024',
    status: 'published',
    category: 'Derecho Civil',
    author: 'Dra. María González',
    publishDate: '2024-01-15',
    views: 1247,
    comments: 23
  },
  {
    id: 2,
    title: 'Guía Completa para Constituir una Empresa en México 2024',
    slug: 'constituir-empresa-mexico-2024',
    status: 'published',
    category: 'Derecho Comercial',
    author: 'Lic. Carlos Ruiz',
    publishDate: '2024-01-10',
    views: 2156,
    comments: 45
  },
  {
    id: 3,
    title: 'Derechos Laborales en el Trabajo Remoto',
    slug: 'derechos-laborales-trabajo-remoto',
    status: 'draft',
    category: 'Derecho Laboral',
    author: 'Dra. Ana Martín',
    publishDate: null,
    views: 0,
    comments: 0
  }
];

export default function DashboardBlogPage() {
  const [posts] = useState(mockPosts);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Borrador</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archivado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Blog</h1>
            <p className="text-gray-600">
              Crea y gestiona artículos para el blog jurídico de LexConnect.
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Artículo</span>
          </Button>
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

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Categoría: {post.category}</span>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      {post.publishDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.publishDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views} vistas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO and Sitemap Info */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">SEO y Sitemap Automático</CardTitle>
            <CardDescription className="text-green-700">
              Cada artículo se agrega automáticamente al sitemap para mejor indexación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-green-800">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Sitemap XML generado automáticamente</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>URLs optimizadas para SEO</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Meta tags automáticos por artículo</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}