'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  User,
  Award,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Briefcase,
  Phone,
  Mail,
  Globe,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

interface LawyerService {
  id: string;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
  service_type: string;
  status: string;
}

interface LawyerSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface LawyerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  years_experience: number;
  education: string;
  license_number: string;
  bar_association: string;
  rating: string;
  total_reviews: number;
  total_consultations: number;
  office_address: string;
  languages: string;
  is_verified: boolean;
  hourly_rate: string;
  consultation_rate: string;
  availability_schedule: Record<string, Array<{start: string; end: string}>>;
  specialties: LawyerSpecialty[];
  services: LawyerService[];
}

interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function LawyerAdminPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lawyerToDelete, setLawyerToDelete] = useState<LawyerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verifyingLawyer, setVerifyingLawyer] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (!loading && user && user.role !== 'administrador') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'administrador') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      const [lawyersResponse, specialtiesResponse] = await Promise.all([
        fetch('/api/lawyers/'),
        fetch('/api/legal-specialties/')
      ]);

      if (lawyersResponse.ok) {
        const lawyersData = await lawyersResponse.json();
        setLawyers(lawyersData.data || []);
      }

      if (specialtiesResponse.ok) {
        const specialtiesData = await specialtiesResponse.json();
        setSpecialties(specialtiesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const searchLawyers = async () => {
    try {
      setLoadingData(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialty && selectedSpecialty !== 'all') params.append('specialty', selectedSpecialty);
      
      const response = await fetch(`/api/lawyers/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLawyers(data.data || []);
      }
    } catch (error) {
      console.error('Error searching lawyers:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteClick = (lawyer: LawyerProfile) => {
    setLawyerToDelete(lawyer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lawyerToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/lawyers/${lawyerToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove lawyer from local state
        setLawyers(prev => prev.filter(l => l.id !== lawyerToDelete.id));
        setDeleteDialogOpen(false);
        setLawyerToDelete(null);
      } else {
        alert(data.message || 'Error al eliminar abogado');
      }
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      alert('Error de conexión. Intente nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLawyerToDelete(null);
  };

  // Función para cambiar el estado de verificación de un abogado
  const handleVerifyLawyer = async (lawyerId: string, verify: boolean) => {
    const action = verify ? 'aprobar' : 'rechazar';
    let notes = '';
    
    if (!verify) {
      notes = prompt('Ingrese la razón del rechazo (opcional):') || 'Perfil rechazado por administrador.';
    }

    if (!confirm(`¿Está seguro que desea ${action} este abogado?`)) {
      return;
    }

    setVerifyingLawyer(lawyerId);
    try {
      // Obtener los datos actuales del abogado
      const lawyer = lawyers.find(l => l.id === lawyerId);
      if (!lawyer) {
        alert('Abogado no encontrado');
        return;
      }

      // Usar el endpoint existente de PUT /api/lawyers/[id]
      const response = await fetch(`/api/lawyers/${lawyerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Datos existentes del abogado
          email: lawyer.email,
          first_name: lawyer.first_name,
          last_name: lawyer.last_name,
          phone: lawyer.phone,
          license_number: lawyer.license_number,
          bar_association: lawyer.bar_association || 'Sin especificar',
          years_experience: lawyer.years_experience || 0,
          education: lawyer.education || 'Sin especificar',
          bio: lawyer.bio || 'Sin descripción',
          hourly_rate: lawyer.hourly_rate || 0,
          consultation_rate: lawyer.consultation_rate || 0,
          office_address: lawyer.office_address || 'Sin dirección',
          languages: lawyer.languages || 'Español',
          
          // El cambio importante: actualizar is_verified
          is_verified: verify,
          
          // Mantener especialidades existentes
          specialties: lawyer.specialties?.map(s => s.id) || [],
          availability_schedule: {}
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el estado local
        setLawyers(prev => 
          prev.map(l => 
            l.id === lawyerId 
              ? { ...l, is_verified: verify }
              : l
          )
        );
        alert(`Abogado ${verify ? 'aprobado' : 'rechazado'} exitosamente`);
      } else {
        alert(data.message || `Error al ${action} abogado`);
      }
    } catch (error) {
      console.error(`Error ${action} lawyer:`, error);
      alert('Error de conexión. Intente nuevamente.');
    } finally {
      setVerifyingLawyer(null);
    }
  };

  const getMainService = (services: LawyerService[]) => {
    return services.find(s => s.service_type === 'consultation') || services[0];
  };

  const getStatusColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isVerified: boolean) => {
    return isVerified ? 'Verificado' : 'Pendiente';
  };

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Administración de Abogados
            </h1>
            <p className="text-gray-600">
              Gestiona los perfiles de abogados y sus servicios en la plataforma.
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/lawyers/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Abogado
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Abogados</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyers.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrados en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verificados</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lawyers.filter(l => l.is_verified).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Con verificación completa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lawyers.reduce((total, lawyer) => total + lawyer.services.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Servicios disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lawyers.reduce((total, lawyer) => total + lawyer.total_consultations, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Consultas realizadas
              </p>
            </CardContent>
          </Card>
        </div>

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
                  placeholder="Buscar por nombre, email o especialidad..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchLawyers()}
                />
              </div>
              <div className="flex gap-4">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="verified">Verificados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={searchLawyers} disabled={loadingData}>
                  <Filter className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Abogados</CardTitle>
            <CardDescription>
              {loadingData ? 'Cargando...' : `${lawyers.length} abogados encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando abogados...</p>
              </div>
            ) : lawyers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron abogados</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lawyers.map((lawyer) => {
                  const mainService = getMainService(lawyer.services);
                  
                  return (
                    <div key={lawyer.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center space-x-4 mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {lawyer.first_name} {lawyer.last_name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{lawyer.email}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{lawyer.phone}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getStatusColor(lawyer.is_verified)}>
                                {lawyer.is_verified && <Award className="h-3 w-3 mr-1" />}
                                {getStatusText(lawyer.is_verified)}
                              </Badge>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="text-sm">
                              <span className="text-gray-500">Experiencia:</span>
                              <div className="font-medium">{lawyer.years_experience} años</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Rating:</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="font-medium">{Number(lawyer.rating || 0).toFixed(1)}</span>
                                <span className="text-gray-400">({lawyer.total_reviews})</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Consultas:</span>
                              <div className="font-medium">{lawyer.total_consultations}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Servicios:</span>
                              <div className="font-medium">{lawyer.services.length}</div>
                            </div>
                          </div>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {lawyer.specialties.map((specialty) => (
                              <Badge key={specialty.id} variant="outline" className="text-xs">
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>

                          {/* Bio */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {lawyer.bio}
                          </p>

                          {/* Location and main service */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1 text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{lawyer.office_address}</span>
                              </span>
                              <span className="flex items-center space-x-1 text-gray-500">
                                <Globe className="h-3 w-3" />
                                <span>{lawyer.languages}</span>
                              </span>
                            </div>
                            {mainService && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">Consulta:</span>
                                <span className="font-semibold text-green-600">
                                  ${Number(mainService.price).toFixed(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/lawyers/${lawyer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/lawyers/${lawyer.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Botones de verificación - solo para abogados no verificados */}
                          {!lawyer.is_verified && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleVerifyLawyer(lawyer.id, true)}
                                disabled={verifyingLawyer === lawyer.id}
                                title="Aprobar abogado"
                              >
                                {verifyingLawyer === lawyer.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700"
                                onClick={() => handleVerifyLawyer(lawyer.id, false)}
                                disabled={verifyingLawyer === lawyer.id}
                                title="Rechazar abogado"
                              >
                                {verifyingLawyer === lawyer.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(lawyer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar al abogado{' '}
              <strong>
                {lawyerToDelete?.first_name} {lawyerToDelete?.last_name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Esta acción no se puede deshacer.</p>
                  <p>Se eliminarán:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>El perfil completo del abogado</li>
                    <li>Todos sus servicios</li>
                    <li>Sus especialidades</li>
                    <li>Su cuenta de usuario</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Eliminar Abogado'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}