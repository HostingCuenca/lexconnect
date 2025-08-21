'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  DollarSign,
  Search,
  Filter,
  BarChart3,
  Clock,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';

interface LawyerService {
  id: string;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
  service_type: string;
  status: string;
  requirements: string | null;
  deliverables: string | null;
  created_at: string;
  updated_at: string;
}

interface ServiceStats {
  total_services: number;
  active_services: number;
  draft_services: number;
  total_revenue: number;
  avg_service_price: number;
  most_popular_service: string;
}

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();
  const [services, setServices] = useState<LawyerService[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchStats();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoadingData(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await authenticatedFetch(`/api/services/?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch('/api/services/stats/');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    fetchServices();
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Servicio eliminado exitosamente"
        });
        fetchServices(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(data.message || 'Error al eliminar servicio');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el servicio",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'suspendido':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspendido</Badge>;
      case 'inactivo':
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'administrador' ? 'Gestión de Servicios' : 'Mis Servicios'}
            </h1>
            <p className="text-gray-600">
              {user.role === 'administrador' 
                ? 'Gestiona todos los servicios de la plataforma' 
                : 'Gestiona tus servicios legales y monitorea su rendimiento'}
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/services/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_services}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_services} activos, {stats.draft_services} borradores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.avg_service_price?.toFixed(0) || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Por servicio ofrecido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_revenue?.toFixed(0) || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ingresos acumulados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Más Popular</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">{stats.most_popular_service || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Servicio más solicitado
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar servicios por título o descripción..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activos</SelectItem>
                    <SelectItem value="suspendido">Suspendidos</SelectItem>
                    <SelectItem value="inactivo">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="consultation">Consulta</SelectItem>
                    <SelectItem value="document_review">Revisión de Documentos</SelectItem>
                    <SelectItem value="representation">Representación Legal</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {getServiceTypeLabel(service.service_type)}
                      </Badge>
                      {getStatusBadge(service.status)}
                    </div>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.duration_minutes} minutos</span>
                      </div>
                      <span>•</span>
                      <span>Creado: {formatDate(service.created_at)}</span>
                      {service.updated_at !== service.created_at && (
                        <>
                          <span>•</span>
                          <span>Actualizado: {formatDate(service.updated_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Requirements and Deliverables */}
                {(service.requirements || service.deliverables) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    {service.requirements && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Requisitos:</span>
                        <p className="text-sm text-gray-600">{service.requirements}</p>
                      </div>
                    )}
                    {service.deliverables && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Entregables:</span>
                        <p className="text-sm text-gray-600">{service.deliverables}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-2xl font-bold text-green-600">
                    <DollarSign className="h-6 w-6" />
                    <span>${Number(service.price).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    {user?.role === 'administrador' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && !loadingData && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {user.role === 'administrador' ? 'No hay servicios' : 'No tienes servicios aún'}
                  </h3>
                  <p className="text-gray-500">
                    {user.role === 'administrador' 
                      ? 'No se encontraron servicios con los filtros actuales.'
                      : 'Comienza creando tu primer servicio legal para ofrecer a tus clientes.'}
                  </p>
                </div>
                <Button onClick={() => router.push('/dashboard/services/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {user.role === 'administrador' ? 'Crear Servicio' : 'Crear Primer Servicio'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}