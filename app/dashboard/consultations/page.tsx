'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Eye,
  MessageSquare,
  Briefcase
} from 'lucide-react';

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: 'pendiente' | 'aceptada' | 'en_proceso' | 'completada' | 'cancelada';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_price?: number;
  final_price?: number;
  deadline?: string;
  lawyer_name: string;
  lawyer_email: string;
  service_title?: string;
  service_type?: string;
  client_notes?: string;
  lawyer_notes?: string;
  created_at: string;
  updated_at: string;
}

const getStatusConfig = (status: string) => {
  const configs = {
    pendiente: { 
      label: 'Pendiente', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    aceptada: { 
      label: 'Aceptada', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircle 
    },
    en_proceso: { 
      label: 'En Proceso', 
      color: 'bg-purple-100 text-purple-800', 
      icon: FileText 
    },
    completada: { 
      label: 'Completada', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    cancelada: { 
      label: 'Cancelada', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    }
  };
  return configs[status as keyof typeof configs] || configs.pendiente;
};

const getPriorityConfig = (priority: string) => {
  const configs = {
    low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
  };
  return configs[priority as keyof typeof configs] || configs.medium;
};

export default function ConsultationsPage() {
  const { user, token } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter, priorityFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/consultations?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las consultas');
      }

      const result = await response.json();
      if (result.success) {
        setConsultations(result.data || []);
      } else {
        throw new Error(result.message || 'Error al cargar las consultas');
      }
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const stats = {
      total: consultations.length,
      pendientes: consultations.filter(c => c.status === 'pendiente').length,
      activas: consultations.filter(c => ['aceptada', 'en_proceso'].includes(c.status)).length,
      completadas: consultations.filter(c => c.status === 'completada').length,
    };
    return stats;
  };

  const stats = getStats();

  // Funciones para manejar cambios de estado
  const handleAcceptConsultation = async (consultationId: string) => {
    // Mostrar prompt para comentarios al aceptar
    const acceptanceNotes = window.prompt(
      'Comentarios al aceptar la consulta (opcional):\n\nPuedes incluir detalles sobre el precio estimado, timeline o cualquier aclaración:'
    );
    
    // Si el usuario cancela, no hacer nada
    if (acceptanceNotes === null) return;

    try {
      const estimatedPrice = window.prompt('Precio estimado (opcional):');
      
      const response = await fetch(`/api/consultations/${consultationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
          lawyer_notes: acceptanceNotes || undefined
        })
      });

      if (response.ok) {
        fetchConsultations(); // Refrescar lista
      } else {
        setError('Error al aceptar la consulta');
      }
    } catch (error) {
      setError('Error al aceptar la consulta');
    }
  };

  const handleRejectConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchConsultations(); // Refrescar lista
      } else {
        setError('Error al rechazar la consulta');
      }
    } catch (error) {
      setError('Error al rechazar la consulta');
    }
  };

  const handleStartConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'en_proceso' })
      });

      if (response.ok) {
        fetchConsultations(); // Refrescar lista
      } else {
        setError('Error al iniciar la consulta');
      }
    } catch (error) {
      setError('Error al iniciar la consulta');
    }
  };

  const handleCompleteConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchConsultations(); // Refrescar lista
      } else {
        setError('Error al completar la consulta');
      }
    } catch (error) {
      setError('Error al completar la consulta');
    }
  };

  const handleCancelConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchConsultations(); // Refrescar lista
      } else {
        setError('Error al cancelar la consulta');
      }
    } catch (error) {
      setError('Error al cancelar la consulta');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'administrador' ? 'Todas las Consultas' : 
               user?.role === 'abogado' ? 'Mis Consultas' : 'Mis Consultas'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'administrador' ? 'Gestiona todas las consultas del sistema' :
               user?.role === 'abogado' ? 'Gestiona las consultas asignadas a ti' :
               'Gestiona y da seguimiento a todas tus consultas legales'}
            </p>
          </div>
          {user?.role === 'cliente' && (
            <Button onClick={() => window.location.href = '/lawyers'}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Consulta
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">consultas en total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendientes}</div>
              <p className="text-xs text-muted-foreground">esperando respuesta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activas}</div>
              <p className="text-xs text-muted-foreground">en progreso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completadas}</div>
              <p className="text-xs text-muted-foreground">finalizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="aceptada">Aceptadas</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completadas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Prioridad</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes consultas aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza solicitando una consulta con uno de nuestros abogados especializados
                </p>
                <Button onClick={() => window.location.href = '/lawyers'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Primera Consulta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              const statusConfig = getStatusConfig(consultation.status);
              const priorityConfig = getPriorityConfig(consultation.priority);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{consultation.title}</CardTitle>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge className={priorityConfig.color}>
                            {priorityConfig.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600">
                          {consultation.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Client and Service Info - Vista específica por rol */}
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      {user?.role === 'abogado' || user?.role === 'administrador' ? (
                        /* Vista para Abogados/Admin - Mostrar info del cliente */
                        <>
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{consultation.client_name}</p>
                              <p className="text-sm text-gray-600">{consultation.client_email}</p>
                              <p className="text-xs text-gray-500">Cliente</p>
                            </div>
                          </div>
                          {consultation.service_title && (
                            <div className="flex items-center space-x-3">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{consultation.service_title}</p>
                                <p className="text-sm text-gray-600 capitalize">{consultation.service_type}</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Vista para Clientes - Mostrar info del abogado */
                        <>
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{consultation.lawyer_name}</p>
                              <p className="text-sm text-gray-600">{consultation.lawyer_email}</p>
                              <p className="text-xs text-gray-500">Abogado</p>
                            </div>
                          </div>
                          {consultation.service_title && (
                            <div className="flex items-center space-x-3">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{consultation.service_title}</p>
                                <p className="text-sm text-gray-600 capitalize">{consultation.service_type}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Pricing Info */}
                    {(consultation.estimated_price || consultation.final_price) && (
                      <div className="flex items-center space-x-6 p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        {consultation.final_price ? (
                          <div>
                            <p className="font-medium text-green-900">Precio Final: ${consultation.final_price}</p>
                            <p className="text-sm text-green-700">Consulta completada</p>
                          </div>
                        ) : consultation.estimated_price ? (
                          <div>
                            <p className="font-medium text-green-900">Precio Estimado: ${consultation.estimated_price}</p>
                            <p className="text-sm text-green-700">Pendiente de confirmación</p>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Notes */}
                    {consultation.lawyer_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-blue-900 text-sm">Notas del Abogado:</p>
                            <p className="text-blue-800 text-sm">{consultation.lawyer_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dates and Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Creada: {formatDate(consultation.created_at)}</span>
                        </div>
                        {consultation.deadline && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Fecha límite: {formatDate(consultation.deadline)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/consultations/${consultation.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/consultations/${consultation.id}/chat`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        {/* Acciones específicas por rol */}
                        {user?.role === 'abogado' && consultation.status === 'pendiente' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleAcceptConsultation(consultation.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceptar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 border-red-200"
                              onClick={() => handleRejectConsultation(consultation.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {user?.role === 'abogado' && consultation.status === 'aceptada' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleStartConsultation(consultation.id)}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {user?.role === 'abogado' && consultation.status === 'en_proceso' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => handleCompleteConsultation(consultation.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completar
                          </Button>
                        )}
                        {user?.role === 'cliente' && consultation.status === 'pendiente' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {(user?.role === 'administrador') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleCancelConsultation(consultation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}