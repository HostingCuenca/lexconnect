'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Phone,
  Shield,
  Key,
  Settings,
  Save,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

export default function SettingsPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados para abogados
  const [lawyerStatus, setLawyerStatus] = useState<LawyerStatus | null>(null);
  const [loadingLawyerStatus, setLoadingLawyerStatus] = useState(true);
  
  // Estados para edición de perfil
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchLawyerStatus = async () => {
      if (user?.role !== 'abogado') {
        setLoadingLawyerStatus(false);
        return;
      }

      try {
        const currentToken = token || localStorage.getItem('lexconnect_token');
        if (!currentToken) {
          setLoadingLawyerStatus(false);
          return;
        }

        const response = await fetch('/api/lawyers/my-status', {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setLawyerStatus(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching lawyer status:', error);
      } finally {
        setLoadingLawyerStatus(false);
      }
    };

    if (user) {
      fetchLawyerStatus();
    }
  }, [user, token]);

  const handleUpdatePhone = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    
    try {
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Perfil actualizado",
          description: "Tu teléfono ha sido actualizado correctamente",
        });
        setIsEditingPhone(false);
        // Recargar la página para mostrar los datos actualizados
        window.location.reload();
      } else {
        throw new Error(result.error || 'Error al actualizar perfil');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingProfile(true);
    
    try {
      const currentToken = token || localStorage.getItem('lexconnect_token');
      if (!currentToken) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada correctamente",
        });
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(result.error || 'Error al cambiar contraseña');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  const getRoleInfo = () => {
    switch (user.role) {
      case 'administrador':
        return {
          title: 'Administrador',
          description: 'Acceso completo a todas las funcionalidades de la plataforma',
          color: 'bg-red-100 text-red-800',
          icon: Shield
        };
      case 'abogado':
        return {
          title: 'Abogado',
          description: 'Profesional legal verificado con acceso a herramientas de consulta',
          color: 'bg-blue-100 text-blue-800',
          icon: User
        };
      case 'cliente':
        return {
          title: 'Cliente',
          description: 'Usuario cliente con acceso a servicios legales',
          color: 'bg-green-100 text-green-800',
          icon: User
        };
      default:
        return {
          title: 'Usuario',
          description: 'Usuario de la plataforma',
          color: 'bg-gray-100 text-gray-800',
          icon: User
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración
          </h1>
          <p className="text-gray-600">
            Administra tu cuenta y preferencias personales
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
            <CardDescription>
              Información básica de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <RoleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </p>
                <Badge className={`mt-2 ${roleInfo.color}`}>
                  {roleInfo.title}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rol en la plataforma</Label>
                <p className="text-sm text-gray-600">{roleInfo.description}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email verificado</Label>
                <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                  {user.email_verified ? 'Verificado' : 'Pendiente'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Teléfono</Label>
                {isEditingPhone ? (
                  <div className="flex space-x-2">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+52 555 123 4567"
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleUpdatePhone}
                      disabled={isUpdatingProfile}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isUpdatingProfile ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingPhone(false);
                        setPhone(user.phone || '');
                      }}
                      disabled={isUpdatingProfile}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone || 'No especificado'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsEditingPhone(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha de registro</Label>
                <p className="text-sm text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Cambiar Contraseña</span>
            </CardTitle>
            <CardDescription>
              Actualiza tu contraseña para mantener tu cuenta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)}>
                <Key className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={isUpdatingProfile || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {isUpdatingProfile ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    disabled={isUpdatingProfile}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role-specific Information for Lawyers */}
        {user.role === 'abogado' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Información Profesional</span>
              </CardTitle>
              <CardDescription>
                Configuración específica para abogados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingLawyerStatus ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : lawyerStatus ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado de verificación</Label>
                      <Badge variant={lawyerStatus.is_verified ? "default" : "secondary"}>
                        {lawyerStatus.is_verified ? 'Verificado' : 'Pendiente de verificación'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Número de cédula</Label>
                      <p className="text-sm text-gray-600">
                        {lawyerStatus.license_number || 'No especificado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Colegio de abogados</Label>
                      <p className="text-sm text-gray-600">
                        {lawyerStatus.bar_association || 'No especificado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Fecha de registro</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(lawyerStatus.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Actualizar perfil profesional
                    </Button>
                    {!lawyerStatus.is_verified && (
                      <Button variant="outline" size="sm">
                        Verificar documentación
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No se pudo cargar la información profesional
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin-specific settings */}
        {user.role === 'administrador' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configuración de Administrador</span>
              </CardTitle>
              <CardDescription>
                Configuraciones avanzadas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración del sistema
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Gestión de usuarios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}