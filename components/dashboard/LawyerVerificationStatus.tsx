'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Shield,
  Calendar,
  Mail,
  FileText
} from 'lucide-react';

interface LawyerStatus {
  id: string;
  is_verified: boolean;
  license_number: string;
  bar_association: string;
  created_at: string;
  updated_at: string;
  lawyer_name: string;
  email: string;
  verification_status: 'aprobado' | 'pendiente';
}

const getVerificationConfig = (status: string) => {
  const configs = {
    aprobado: {
      label: 'Verificado',
      className: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      dotColor: 'bg-green-500',
      message: 'Tu perfil ha sido verificado exitosamente. Tienes acceso completo a la plataforma.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    pendiente: {
      label: 'Pendiente de Verificación',
      className: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      dotColor: 'bg-yellow-500',
      message: 'Tu perfil está siendo revisado por nuestro equipo. Te notificaremos cuando esté aprobado.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  };
  return configs[status as keyof typeof configs] || configs.pendiente;
};

export default function LawyerVerificationStatus() {
  const { user, token } = useAuth();
  const [lawyerStatus, setLawyerStatus] = useState<LawyerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'abogado') {
      fetchLawyerStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLawyerStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/lawyers/my-status', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estado de verificación');
      }

      const data = await response.json();
      if (data.success) {
        setLawyerStatus(data.data);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error fetching lawyer status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar para abogados
  if (user?.role !== 'abogado') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !lawyerStatus) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error al cargar estado</p>
              <p className="text-sm text-red-500">{error || 'No se pudo obtener la información'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = getVerificationConfig(lawyerStatus.verification_status);
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.borderColor} ${config.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Estado de Verificación
        </CardTitle>
        <CardDescription>
          Información sobre el estado de tu perfil profesional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className="h-6 w-6 text-gray-600" />
            <div>
              <Badge className={config.className}>
                <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`} />
                {config.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="p-3 rounded-lg bg-white/50 border border-white/20">
          <p className="text-sm text-gray-700">{config.message}</p>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Licencia:</span>
            <span>{lawyerStatus.license_number}</span>
          </div>
          
          {lawyerStatus.bar_association && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Colegio:</span>
              <span>{lawyerStatus.bar_association}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Registrado:</span>
            <span>{new Date(lawyerStatus.created_at).toLocaleDateString('es-ES')}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="font-medium">Email:</span>
            <span>{lawyerStatus.email}</span>
          </div>
        </div>

        {/* Información adicional para pendientes */}
        {lawyerStatus.verification_status === 'pendiente' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Qué sigue?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Nuestro equipo está revisando tu documentación</li>
              <li>• Verificaremos tu licencia profesional</li>
              <li>• Te notificaremos por email cuando esté aprobado</li>
              <li>• El proceso puede tomar de 1-3 días hábiles</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}