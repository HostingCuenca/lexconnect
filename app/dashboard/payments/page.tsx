'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  Calendar,
  User,
  Briefcase,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Database,
  Download
} from 'lucide-react';

interface Payment {
  id: string;
  consultation_id: string;
  client_id: string;
  lawyer_id: string;
  amount: number;
  platform_fee: number;
  lawyer_earnings: number;
  currency: string;
  payment_method: string;
  payment_intent_id?: string;
  status: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'reembolsado';
  paid_at?: string;
  created_at: string;
  // Joined fields
  client_name?: string;
  lawyer_name?: string;
  consultation_title?: string;
}

interface PaymentStats {
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  total_revenue: number;
  platform_revenue: number;
  lawyer_earnings: number;
}

const getStatusConfig = (status: string) => {
  const configs = {
    pendiente: { 
      label: 'Pendiente', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    procesando: { 
      label: 'Procesando', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CreditCard 
    },
    completado: { 
      label: 'Completado', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    fallido: { 
      label: 'Fallido', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    },
    reembolsado: { 
      label: 'Reembolsado', 
      color: 'bg-purple-100 text-purple-800', 
      icon: RotateCcw 
    }
  };
  
  return configs[status as keyof typeof configs] || configs.pendiente;
};

export default function PaymentsPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      fetchPayments();
      fetchStats();
    }
  }, [user, loading]);

  const fetchPayments = async () => {
    try {
      setLoadingData(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/payments/detailed', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPayments(result.data || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Error loading payments:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) return;

      const response = await fetch('/api/payments/stats', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleCreateTestData = async () => {
    try {
      setCreating(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/payments/test-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchPayments();
        await fetchStats();
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Error creating test data:', await response.text());
      }
    } catch (error) {
      console.error('Error creating test data:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditStatus = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status);
    setNotes('');
    setEditStatusOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment || !newStatus) return;
    
    try {
      setUpdating(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/payments/${selectedPayment.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes
        })
      });

      if (response.ok) {
        await fetchPayments();
        await fetchStats();
        setEditStatusOpen(false);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Error updating payment status:', await response.text());
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.lawyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.consultation_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
            <p className="text-gray-600">
              Gestiona y monitorea todos los pagos de consultas legales.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.role === 'administrador' && payments.length === 0 && (
              <Button 
                onClick={handleCreateTestData} 
                disabled={creating}
                className="flex items-center space-x-2"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <span>{creating ? 'Creando...' : 'Crear Datos de Prueba'}</span>
              </Button>
            )}
            {user?.role === 'administrador' && (
              <Button className="flex items-center space-x-2" onClick={() => fetchPayments()}>
                <RefreshCcw className="h-4 w-4" />
                <span>Actualizar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pagos
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_payments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed_payments} completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Comisión: {formatCurrency(stats.platform_revenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_payments}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Abogados
                </CardTitle>
                <Briefcase className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.lawyer_earnings)}</div>
                <p className="text-xs text-muted-foreground">
                  Ganancias totales
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {payments.length > 0 && (
          <>
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por cliente, abogado, consulta o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="procesando">Procesando</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="fallido">Fallido</SelectItem>
                      <SelectItem value="reembolsado">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payments List */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>
                  {filteredPayments.length} de {payments.length} pagos mostrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No se encontraron pagos con los filtros actuales</p>
                    </div>
                  ) : (
                    filteredPayments.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <StatusIcon className={`h-6 w-6 ${statusConfig.color.split(' ')[1]}`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">
                                  {payment.consultation_title || `Consulta #${payment.consultation_id.slice(0, 8)}`}
                                </h3>
                                <Badge className={statusConfig.color}>
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-1">
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Cliente: {payment.client_name || 'N/A'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  Abogado: {payment.lawyer_name || 'N/A'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(payment.created_at)}
                                </span>
                                <span>ID: {payment.id.slice(0, 8)}</span>
                                {payment.payment_method && (
                                  <span>Método: {payment.payment_method}</span>
                                )}
                                {payment.paid_at && (
                                  <span>Pagado: {formatDate(payment.paid_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Comisión: {formatCurrency(payment.platform_fee, payment.currency)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Abogado: {formatCurrency(payment.lawyer_earnings, payment.currency)}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/consultations/${payment.consultation_id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user?.role === 'administrador' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditStatus(payment)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* No Data State */}
        {payments.length === 0 && !loadingData && (
          <Card className="text-center py-16">
            <CardContent>
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
              <p className="text-gray-600 mb-6">
                Aún no se han procesado pagos en el sistema. Los pagos aparecerán aquí cuando los clientes realicen pagos por las consultas.
              </p>
              {user?.role === 'administrador' && (
                <Button onClick={handleCreateTestData} disabled={creating}>
                  {creating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  {creating ? 'Creando datos...' : 'Crear Datos de Prueba'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Status Dialog */}
        <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actualizar Estado de Pago</DialogTitle>
              <DialogDescription>
                Cambiar el estado del pago ID: {selectedPayment?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Nuevo Estado
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="procesando">Procesando</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="fallido">Fallido</SelectItem>
                    <SelectItem value="reembolsado">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Notas (Opcional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar notas sobre la actualización del pago..."
                  rows={3}
                />
              </div>
              
              {selectedPayment && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2">Detalles del Pago:</div>
                  <div>Monto: {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
                  <div>Cliente: {selectedPayment.client_name || 'N/A'}</div>
                  <div>Abogado: {selectedPayment.lawyer_name || 'N/A'}</div>
                  <div>Método: {selectedPayment.payment_method || 'N/A'}</div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditStatusOpen(false)}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateStatus} disabled={updating}>
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                {updating ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}