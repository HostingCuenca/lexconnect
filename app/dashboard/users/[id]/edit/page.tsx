'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, User, Mail, Phone, Lock, Shield, Loader } from 'lucide-react';
import Link from 'next/link';

interface EditUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: 'cliente' | 'abogado' | 'administrador';
  phone: string;
  email_verified: boolean;
  is_active: boolean;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'cliente' | 'abogado' | 'administrador';
  phone?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<EditUserForm>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'cliente',
    phone: '',
    email_verified: false,
    is_active: true
  });
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (params.id && token) {
      fetchUser();
    }
  }, [params.id, token]);

  // Redirect if not admin
  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || user.role !== 'administrador') {
    router.push('/dashboard');
    return null;
  }

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        setUserData(user);
        setFormData({
          email: user.email || '',
          password: '',
          confirmPassword: '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role || 'cliente',
          phone: user.phone || '',
          email_verified: user.email_verified || false,
          is_active: user.is_active !== undefined ? user.is_active : true
        });
      } else {
        setErrors([result.message || 'Error al cargar usuario']);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrors(['Error de conexión. Inténtalo de nuevo.']);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.email.trim()) {
      newErrors.push('El email es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email inválido');
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.push('La contraseña es obligatoria');
      } else if (formData.password.length < 8) {
        newErrors.push('La contraseña debe tener al menos 8 caracteres');
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Las contraseñas no coinciden');
      }
    }

    if (!formData.first_name.trim()) {
      newErrors.push('El nombre es obligatorio');
    }

    if (!formData.last_name.trim()) {
      newErrors.push('El apellido es obligatorio');
    }

    if (!formData.role) {
      newErrors.push('El rol es obligatorio');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const updateData: any = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        phone: formData.phone.trim() || null,
        email_verified: formData.email_verified,
        is_active: formData.is_active
      };

      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/users');
      } else {
        setErrors([result.message || 'Error al actualizar usuario']);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors(['Error de conexión. Inténtalo de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader className="h-6 w-6 animate-spin" />
            <span>Cargando usuario...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900">Usuario no encontrado</h3>
          <Link href="/dashboard/users">
            <Button className="mt-4">Volver a la lista</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
            <p className="text-gray-600">
              Modificar información de {userData.first_name} {userData.last_name}
            </p>
          </div>
          <Link href="/dashboard/users">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Información del Usuario
            </CardTitle>
            <CardDescription>
              Modifica los campos que desees actualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mostrar errores */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800 text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Ej: Pérez"
                    required
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+593 999 999 999"
                  />
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="changePassword" className="text-sm text-gray-700">
                    Cambiar contraseña
                  </Label>
                </div>

                {changePassword && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center">
                        <Lock className="mr-1 h-4 w-4" />
                        Nueva Contraseña *
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 8 caracteres"
                        required={changePassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repite la contraseña"
                        required={changePassword}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rol y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center">
                    <Shield className="mr-1 h-4 w-4" />
                    Rol *
                  </Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="abogado">Abogado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Verificado</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email_verified"
                      name="email_verified"
                      checked={formData.email_verified}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="email_verified" className="text-sm text-gray-700">
                      Marcar como verificado
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="is_active" className="text-sm text-gray-700">
                      Usuario activo
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard/users">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Creado:</span> {new Date(userData.created_at).toLocaleString('es-EC')}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span> {new Date(userData.updated_at).toLocaleString('es-EC')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}