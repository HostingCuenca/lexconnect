'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'cliente' | 'abogado' | 'administrador';
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  clientes: number;
  abogados: number;
  administradores: number;
}

export default function UsersManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const authFetch = useAuthenticatedFetch();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    clientes: 0,
    abogados: 0,
    administradores: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'administrador')) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === 'administrador') {
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await authFetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        
        // Calcular estadísticas
        const total = data.users.length;
        const active = data.users.filter((u: User) => u.is_active).length;
        const inactive = total - active;
        const clientes = data.users.filter((u: User) => u.role === 'cliente').length;
        const abogados = data.users.filter((u: User) => u.role === 'abogado').length;
        const administradores = data.users.filter((u: User) => u.role === 'administrador').length;
        
        setStats({
          total,
          active,
          inactive,
          clientes,
          abogados,
          administradores
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await authFetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        await fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'abogado':
        return 'bg-blue-100 text-blue-800';
      case 'cliente':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'abogado':
        return 'Abogado';
      case 'cliente':
        return 'Cliente';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || user.role !== 'administrador') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra todos los usuarios de la plataforma LexConnect
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <UserIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clientes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abogados</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.abogados}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.administradores}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los roles</option>
                  <option value="cliente">Clientes</option>
                  <option value="abogado">Abogados</option>
                  <option value="administrador">Administradores</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando usuarios...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.first_name && userItem.last_name 
                                  ? `${userItem.first_name} ${userItem.last_name}`
                                  : 'Sin nombre'
                                }
                              </div>
                              {userItem.phone && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {userItem.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">{userItem.email}</span>
                            {userItem.email_verified && (
                              <UserCheck className="h-4 w-4 ml-2 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(userItem.role)}>
                            {getRoleTitle(userItem.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userItem.is_active ? "default" : "secondary"}>
                            {userItem.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(userItem.created_at).toLocaleDateString('es-EC')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => toggleUserStatus(userItem.id, userItem.is_active)}
                            variant={userItem.is_active ? "destructive" : "default"}
                            size="sm"
                            className="mr-2"
                          >
                            {userItem.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron usuarios que coincidan con los filtros.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}