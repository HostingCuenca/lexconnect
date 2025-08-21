'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { BLOG_CATEGORIES } from '@/lib/blog-types';
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Image,
  FileText,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPage() {
  const { user, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: '',
    meta_title: '',
    meta_description: '',
    status: 'borrador' as 'borrador' | 'publicado'
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate meta_title if not set manually
    if (field === 'title' && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: value
      }));
    }
    
    // Auto-generate meta_description if not set manually
    if (field === 'excerpt' && !formData.meta_description) {
      setFormData(prev => ({
        ...prev,
        meta_description: value
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.excerpt.trim()) {
      toast({
        title: "Error", 
        description: "El resumen es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "El contenido es obligatorio", 
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.featured_image.trim()) {
      toast({
        title: "Error",
        description: "La imagen destacada es obligatoria",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.category) {
      toast({
        title: "Error",
        description: "La categoría es obligatoria",
        variant: "destructive"
      });
      return false;
    }
    
    if (tags.length === 0) {
      toast({
        title: "Error", 
        description: "Agrega al menos un tag",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSave = async (publishNow = false) => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const dataToSend = {
        ...formData,
        status: publishNow ? 'publicado' : formData.status,
        tags
      };
      
      const response = await authenticatedFetch('/api/blog', {
        method: 'POST',
        body: JSON.stringify(dataToSend)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: publishNow 
            ? "Artículo creado y publicado exitosamente"
            : "Artículo guardado como borrador"
        });
        
        router.push('/dashboard/blog');
      } else {
        throw new Error(result.message || 'Error al crear artículo');
      }
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el artículo",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
          <p className="text-gray-600">Solo los administradores y abogados pueden crear artículos.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Artículo</h1>
              <p className="text-gray-600">Escribe un nuevo artículo para el blog jurídico</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Borrador'}
            </Button>
            <Button 
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-secondary hover:bg-secondary/90 text-primary"
            >
              <Eye className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Información Básica</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Artículo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Nuevas Reformas en el Código Civil 2024"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt">Resumen *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Breve descripción del artículo que se mostrará en las vistas previas..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Contenido del Artículo *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Escribe el contenido completo del artículo aquí. Puedes usar Markdown para formato..."
                    rows={20}
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Usa Markdown para formato (## para títulos, **texto** para negrita, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-accent" />
                  <span>SEO y Meta Tags</span>
                </CardTitle>
                <CardDescription>
                  Optimiza tu artículo para motores de búsqueda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Meta Título</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="Título para SEO (se auto-genera desde el título principal)"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 50-60 caracteres
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="meta_description">Meta Descripción</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="Descripción para SEO (se auto-genera desde el resumen)"
                    rows={2}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 150-160 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Estado del Artículo</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'borrador' | 'publicado') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-secondary" />
                  <span>Imagen Destacada</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featured_image">URL de la Imagen *</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => handleInputChange('featured_image', e.target.value)}
                    placeholder="https://images.pexels.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa URLs de Pexels, Unsplash o similares
                  </p>
                </div>
                
                {formData.featured_image && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                    <img
                      src={formData.featured_image}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%23f3f4f6"/><text x="100" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Error al cargar imagen</text></svg>';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Agrega etiquetas para organizar mejor tu artículo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Agregar tag..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddTag}
                    disabled={!currentTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Presiona Enter o haz clic en + para agregar tags
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}