'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Save,
  DollarSign,
  Clock,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
  service_type: string;
  status: string;
  requirements: string | null;
  deliverables: string | null;
  first_name: string;
  last_name: string;
}

export default function EditServicePage() {
  const { user, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<ServiceData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration_minutes: '',
    service_type: '',
    status: 'activo',
    requirements: '',
    deliverables: ''
  });

  // Fetch service data
  useEffect(() => {
    if (!authLoading && user && (user.role === 'administrador' || user.role === 'abogado')) {
      fetchService();
    } else if (!authLoading && (!user || (user.role !== 'administrador' && user.role !== 'abogado'))) {
      setLoading(false);
    }
  }, [authLoading, user, params.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/services/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setService(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description,
          price: data.data.price.toString(),
          duration_minutes: data.data.duration_minutes.toString(),
          service_type: data.data.service_type,
          status: data.data.status,
          requirements: data.data.requirements || '',
          deliverables: data.data.deliverables || ''
        });
      } else {
        throw new Error(data.message || 'Error al cargar servicio');
      }
    } catch (error: any) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el servicio",
        variant: "destructive"
      });
      router.push('/dashboard/services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.price || 
        !formData.duration_minutes || !formData.service_type) {
      toast({
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const response = await authenticatedFetch(`/api/services/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Servicio actualizado exitosamente"
        });
        router.push('/dashboard/services');
      } else {
        throw new Error(data.message || 'Error al actualizar servicio');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el servicio",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const types = {
      consultation: 'Consulta',
      document_review: 'Revisión de Documentos', 
      representation: 'Representación Legal',
      other: 'Otro'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      activo: 'Activo',
      suspendido: 'Suspendido',
      inactivo: 'Inactivo'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {authLoading ? 'Verificando autenticación...' : 'Cargando servicio...'}
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
          <p className="text-gray-600">Solo los administradores y abogados pueden editar servicios.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicio no encontrado</h2>
          <p className="text-gray-600">El servicio solicitado no existe o no tienes permisos para editarlo.</p>
          <Link href="/dashboard/services">
            <Button className="mt-4">Volver a Servicios</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/services">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Servicios
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Servicio</h1>
            <p className="text-gray-600">
              Editando servicio de: {service.first_name} {service.last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tipo: {getServiceTypeLabel(service.service_type)}</p>
            <p className="text-sm text-gray-500">Estado: {getStatusLabel(service.status)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
              <CardDescription>
                Información general sobre el servicio legal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Servicio *</Label>
                  <Input
                    id="title"
                    placeholder="ej. Consulta Legal - Derecho Civil"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_type">Tipo de Servicio *</Label>
                  <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="document_review">Revisión de Documentos</SelectItem>
                      <SelectItem value="representation">Representación Legal</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe detalladamente en qué consiste tu servicio legal..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Precio y Duración</span>
              </CardTitle>
              <CardDescription>
                Configura el precio y tiempo estimado del servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duración (minutos) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="60"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Detalles Adicionales</span>
              </CardTitle>
              <CardDescription>
                Información adicional para los clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  placeholder="¿Qué necesita proporcionar el cliente? (documentos, información, etc.)"
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables">Entregables</Label>
                <Textarea
                  id="deliverables"
                  placeholder="¿Qué recibirá el cliente como resultado del servicio?"
                  rows={3}
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/services">
              <Button variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar Servicio
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}