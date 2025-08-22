'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  status: string;
  created_at: string;
  total_consultations: number;
  active_consultations: number;
  completed_consultations: number;
  total_spent: number;
  last_consultation_date?: string;
  last_consultation_title?: string;
}

interface ClientStats {
  overview: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    verified_clients: number;
    new_clients_last_month: number;
    new_clients_last_week: number;
    verification_rate: number;
  };
  activity: {
    clients_with_consultations: number;
    total_consultations: number;
    avg_consultations_per_client: string;
    total_revenue: number;
    engagement_rate: number;
  };
  top_clients: Array<{
    id: string;
    full_name: string;
    email: string;
    consultation_count: number;
    total_spent: number;
  }>;
  recent_clients: Array<{
    id: string;
    full_name: string;
    email: string;
    created_at: string;
    consultation_count: number;
  }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ClientsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && (user.role === 'administrador' || user.role === 'abogado')) {
      fetchClients();
      fetchStats();
    } else if (user && user.role === 'cliente') {
      router.push('/dashboard');
    }
  }, [user, loading, router, searchTerm, statusFilter, currentPage]);

  const fetchClients = async () => {
    try {
      setLoadingData(true);
      setError(null);

      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/clients?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener clientes');
      }

      const data = await response.json();
      if (data.success) {
        setClients(data.data.clients);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) return;

      const response = await fetch('/api/clients/stats', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching client stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusBadge = (client: Client) => {
    if (!client.is_active) {
      return <Badge variant="destructive">Inactivo</Badge>;
    }
    if (!client.email_verified) {
      return <Badge variant="secondary">Sin verificar</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || (user.role !== 'administrador' && user.role !== 'abogado')) {
    return <div>No tienes permisos para acceder a esta página.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'administrador' ? 'Gestión de Clientes' : 'Mis Clientes'}
            </h1>
            <p className="text-gray-600">
              {user.role === 'administrador' 
                ? 'Administra todos los clientes de la plataforma'
                : 'Clientes que han solicitado tus servicios'
              }
            </p>
          </div>
          <Button onClick={fetchClients} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.total_clients}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.overview.new_clients_last_month} este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.active_clients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.verification_rate}% verificados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activity.engagement_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activity.clients_with_consultations} con consultas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.activity.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {stats.activity.avg_consultations_per_client} consultas/cliente
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {pagination && `Mostrando ${pagination.itemsPerPage} de ${pagination.totalItems} clientes`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchClients} className="mt-4">
                  Reintentar
                </Button>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center p-8">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No se encontraron clientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium">{client.full_name}</h3>
                          {getStatusBadge(client)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Registrado: {new Date(client.created_at).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{client.total_consultations} consultas</span>
                          </div>
                        </div>

                        {client.total_consultations > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Activas:</span> {client.active_consultations}
                              </div>
                              <div>
                                <span className="font-medium">Completadas:</span> {client.completed_consultations}
                              </div>
                              <div>
                                <span className="font-medium">Total gastado:</span> {formatCurrency(client.total_spent)}
                              </div>
                            </div>
                            {client.last_consultation_title && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Última consulta:</span> {client.last_consultation_title}
                                {client.last_consultation_date && ` (${client.last_consultation_date})`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(pagination.currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage(pagination.currentPage + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Clients and Recent Clients */}
        {stats && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Clientes con más consultas y gasto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_clients.map((client, index) => (
                    <div key={client.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{client.consultation_count} consultas</p>
                        <p className="text-sm text-green-600">{formatCurrency(client.total_spent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes Recientes</CardTitle>
                <CardDescription>Últimos clientes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{client.created_at}</p>
                        <p className="text-sm text-gray-600">
                          {client.consultation_count} consultas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}