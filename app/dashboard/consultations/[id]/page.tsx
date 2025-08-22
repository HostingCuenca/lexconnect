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
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MessageSquare,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Edit,
  History,
  Save,
  X,
  CreditCard,
  Plus,
  RotateCcw
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
  client_name: string;
  client_email: string;
  service_title?: string;
  service_type?: string;
  client_notes?: string;
  lawyer_notes?: string;
  created_at: string;
  updated_at: string;
  // Payment fields
  payment_id?: string;
  payment_amount?: number;
  payment_status?: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'reembolsado';
  payment_method?: string;
  platform_fee?: number;
  lawyer_earnings?: number;
  currency?: string;
  paid_at?: string;
  payment_created_at?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
  user_name: string;
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

export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editStateOpen, setEditStateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [updating, setUpdating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: '',
    status: 'pendiente',
    notes: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      fetchConsultation();
    }
  }, [user, loading, params.id]);

  const fetchConsultation = async () => {
    try {
      setLoadingData(true);
      
      // Obtener token fresco del localStorage o cookies
      const currentToken = token || localStorage.getItem('lexconnect_token');
      
      if (!currentToken) {
        console.error('No token available');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/consultations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setConsultation(result.data);
      } else if (response.status === 401) {
        // Token inválido, redirigir al login
        router.push('/auth/login');
      } else {
        console.error('Error loading consultation:', await response.text());
        router.push('/dashboard/consultations');
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      router.push('/dashboard/consultations');
    } finally {
      setLoadingData(false);
    }
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

  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Consulta no encontrada</h2>
          <p className="text-gray-600 mb-4">La consulta que buscas no existe o no tienes permisos para verla.</p>
          <Button onClick={() => router.push('/dashboard/consultations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Consultas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(consultation.status);
  const priorityConfig = getPriorityConfig(consultation.priority);
  const StatusIcon = statusConfig.icon;

  const handleEditState = () => {
    setNewStatus(consultation?.status || '');
    setNewNotes(consultation?.lawyer_notes || '');
    setEditStateOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!consultation || !newStatus) return;
    
    try {
      setUpdating(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          lawyer_notes: newNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        setConsultation(result.data);
        setEditStateOpen(false);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Error updating consultation:', await response.text());
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
    } finally {
      setUpdating(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      setLoadingHistory(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/consultations/${consultation?.id}/activity`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setActivityLog(result.data || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Error loading activity log:', await response.text());
        setActivityLog([]);
      }
    } catch (error) {
      console.error('Error fetching activity log:', error);
      setActivityLog([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    setHistoryOpen(true);
    fetchActivityLog();
  };

  const handleRegisterPayment = () => {
    if (consultation?.payment_id) {
      // Updating existing payment
      setPaymentForm({
        amount: consultation.payment_amount?.toString() || '',
        payment_method: consultation.payment_method || '',
        status: consultation.payment_status || 'pendiente',
        notes: ''
      });
    } else {
      // Creating new payment
      setPaymentForm({
        amount: consultation?.estimated_price?.toString() || consultation?.final_price?.toString() || '',
        payment_method: '',
        status: 'pendiente',
        notes: ''
      });
    }
    setPaymentDialogOpen(true);
  };

  const submitPaymentRegistration = async () => {
    if (!consultation?.payment_id && (!paymentForm.amount || !paymentForm.payment_method)) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      setPaymentSubmitting(true);
      
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        router.push('/auth/login');
        return;
      }

      let response;
      
      if (consultation?.payment_id) {
        response = await fetch(`/api/payments/${consultation.payment_id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: paymentForm.status,
            notes: paymentForm.notes || `Estado actualizado por ${user?.email}`
          })
        });
      } else {
        response = await fetch(`/api/consultations/${consultation?.id}/register-payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: parseFloat(paymentForm.amount),
            payment_method: paymentForm.payment_method,
            status: paymentForm.status,
            notes: paymentForm.notes || `Pago registrado manualmente por ${user?.email}`
          })
        });
      }

      if (response.ok) {
        await fetchConsultation();
        setPaymentDialogOpen(false);
        setPaymentForm({
          amount: '',
          payment_method: '',
          status: 'pendiente',
          notes: ''
        });
        alert(consultation?.payment_id ? 'Estado de pago actualizado exitosamente' : 'Pago registrado exitosamente');
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        const error = await response.json();
        console.error('Error with payment:', error.message);
        alert('Error: ' + (error.message || 'Error interno del servidor'));
      }
    } catch (error) {
      console.error('Error with payment:', error);
      alert('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number, currency = 'MXN') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPaymentStatusConfig = (status?: string) => {
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
        label: 'Pagado', 
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
    
    return configs[status as keyof typeof configs] || { 
      label: 'Sin Pago', 
      color: 'bg-gray-100 text-gray-800', 
      icon: AlertCircle 
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/consultations')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{consultation.title}</h1>
              <p className="text-gray-600">Consulta #{consultation.id.slice(0, 8)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge className={priorityConfig.color}>
              {priorityConfig.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.description}</p>
              </CardContent>
            </Card>

            {/* Client Notes */}
            {consultation.client_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <User className="h-5 w-5 mr-2" />
                    Notas del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.client_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Lawyer Notes */}
            {consultation.lawyer_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Notas del Abogado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.lawyer_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => router.push(`/dashboard/consultations/${consultation.id}/chat`)}
                    className="flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ir al Chat
                  </Button>
                  
                  {user?.role === 'administrador' && (
                    <>
                      <Button variant="outline" onClick={handleEditState}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Estado
                      </Button>
                      <Button variant="outline" onClick={handleViewHistory}>
                        <History className="h-4 w-4 mr-2" />
                        Ver Historial
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Creado</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{new Date(consultation.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                {consultation.deadline && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha límite</label>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{new Date(consultation.deadline).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                )}

                {consultation.service_title && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Servicio</label>
                    <div className="flex items-center mt-1">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{consultation.service_title}</span>
                    </div>
                  </div>
                )}

                {(consultation.estimated_price || consultation.final_price) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Precio</label>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm">
                        {consultation.final_price ? (
                          <span className="font-medium text-green-600">
                            ${consultation.final_price.toFixed(2)} (Final)
                          </span>
                        ) : consultation.estimated_price ? (
                          <span>
                            ${consultation.estimated_price.toFixed(2)} (Estimado)
                          </span>
                        ) : (
                          <span className="text-gray-500">No definido</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lawyer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Abogado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">{consultation.lawyer_name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{consultation.lawyer_email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info - Only for admins and lawyers */}
            {(user?.role === 'administrador' || user?.role === 'abogado') && (
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{consultation.client_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{consultation.client_email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Información de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {consultation.payment_id ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estado</label>
                      <div className="flex items-center mt-1">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusConfig(consultation.payment_status).className}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${getPaymentStatusConfig(consultation.payment_status).dotColor}`} />
                          {getPaymentStatusConfig(consultation.payment_status).label}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Monto</label>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">{formatCurrency(consultation.payment_amount || 0)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Método de Pago</label>
                      <div className="flex items-center mt-1">
                        <span className="text-sm capitalize">{consultation.payment_method || 'No especificado'}</span>
                      </div>
                    </div>

                    {consultation.paid_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Pago</label>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{new Date(consultation.paid_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    )}

                    {consultation.platform_fee && (
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Comisión plataforma:</div>
                          <div className="text-right">{formatCurrency(consultation.platform_fee)}</div>
                          <div className="text-gray-500">Ganancias abogado:</div>
                          <div className="text-right font-medium">{formatCurrency(consultation.lawyer_earnings || 0)}</div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'administrador' && (
                      <div className="pt-3 border-t">
                        <Button variant="outline" size="sm" onClick={handleRegisterPayment}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Actualizar Estado
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">No hay pago registrado para esta consulta</p>
                      {user?.role === 'administrador' && (
                        <Button onClick={handleRegisterPayment}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Pago
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Status Dialog */}
        <Dialog open={editStateOpen} onOpenChange={setEditStateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Estado de Consulta</DialogTitle>
              <DialogDescription>
                Cambia el estado y agrega notas sobre la consulta
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Estado
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aceptada">Aceptada</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Notas del Abogado
                </label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Agregar notas sobre el estado de la consulta..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditStateOpen(false)}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleUpdateStatus} disabled={updating}>
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity History Dialog */}
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Historial de Actividad</DialogTitle>
              <DialogDescription>
                Registro de cambios y actividades de la consulta
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando historial...</span>
                </div>
              ) : activityLog.length > 0 ? (
                <div className="space-y-4">
                  {activityLog.map((log) => (
                    <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {log.action}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Por: {log.user_name}
                      </p>
                      {log.old_values && (
                        <div className="mt-2 text-xs">
                          <span className="text-red-600">Anterior: {JSON.stringify(log.old_values)}</span>
                        </div>
                      )}
                      {log.new_values && (
                        <div className="mt-1 text-xs">
                          <span className="text-green-600">Nuevo: {JSON.stringify(log.new_values)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay actividad registrada para esta consulta</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setHistoryOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Registration Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {consultation.payment_id ? 'Actualizar Estado de Pago' : 'Registrar Pago'}
              </DialogTitle>
              <DialogDescription>
                {consultation.payment_id 
                  ? 'Actualiza el estado del pago existente'
                  : 'Registra un nuevo pago para esta consulta'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!consultation.payment_id && (
                <>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">
                      Monto *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
                      Método de Pago *
                    </label>
                    <Select
                      value={paymentForm.payment_method}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Estado *
                </label>
                <Select
                  value={paymentForm.status}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, status: value }))}
                >
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
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Notas adicionales sobre el pago..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitPaymentRegistration} disabled={paymentSubmitting}>
                {paymentSubmitting ? 'Procesando...' : consultation.payment_id ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}