'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star,
  MapPin,
  Clock,
  DollarSign,
  Award,
  GraduationCap,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Globe,
  Edit,
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Trash2
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

export default function LawyerDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (!loading && user && user.role !== 'administrador') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (params.id && user && user.role === 'administrador') {
      fetchLawyer(params.id as string);
    }
  }, [params.id, user]);

  const fetchLawyer = async (id: string) => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/lawyers/${id}/`);
      
      if (!response.ok) {
        throw new Error('Abogado no encontrado');
      }

      const data = await response.json();
      if (data.success) {
        setLawyer(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar datos');
      }
    } catch (error: any) {
      console.error('Error fetching lawyer:', error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const formatSchedule = (schedule: Record<string, Array<{start: string; end: string}>>) => {
    const daysInSpanish = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    return Object.entries(schedule)
      .filter(([_, times]) => times && times.length > 0)
      .map(([day, times]) => ({
        day: daysInSpanish[day as keyof typeof daysInSpanish] || day,
        times: times.map(t => `${t.start} - ${t.end}`).join(', ')
      }));
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

  const getServiceStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      draft: 'Borrador'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del abogado...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'administrador') {
    return null;
  }

  if (error || !lawyer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Abogado no encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard/lawyers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Lista de Abogados
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const availableSchedule = formatSchedule(lawyer.availability_schedule);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/lawyers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lawyer.first_name} {lawyer.last_name}
              </h1>
              <p className="text-gray-600">Detalles completos del perfil profesional</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/lawyers/${lawyer.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Perfil Público
            </Button>
            <Button onClick={() => router.push(`/dashboard/lawyers/${lawyer.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              {lawyer.is_verified ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lawyer.is_verified ? 'Verificado' : 'Pendiente'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lawyer.is_verified ? 'Perfil completo' : 'Requiere verificación'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(lawyer.rating || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {lawyer.total_reviews} reseñas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyer.total_consultations}</div>
              <p className="text-xs text-muted-foreground">
                Casos completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyer.services.length}</div>
              <p className="text-xs text-muted-foreground">
                Servicios ofrecidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            <TabsTrigger value="professional">Información Profesional</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-lg font-medium">{lawyer.first_name} {lawyer.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={lawyer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {lawyer.is_verified && <Award className="h-3 w-3 mr-1" />}
                        {lawyer.is_verified ? 'Verificado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.email}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.phone}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ubicación</label>
                    <p className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.office_address}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Idiomas</label>
                    <p className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.languages}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Biografía</label>
                  <p className="mt-2 text-gray-700">{lawyer.bio}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Información Profesional</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experiencia</label>
                    <p className="text-lg font-medium">{lawyer.years_experience} años</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cédula Profesional</label>
                    <p className="text-lg font-medium">{lawyer.license_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Educación</label>
                    <p className="mt-2 text-gray-700">{lawyer.education}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Colegio de Abogados</label>
                    <p className="text-gray-700">{lawyer.bar_association}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Especialidades</label>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specialties.map((specialty) => (
                      <Badge key={specialty.id} variant="outline">
                        {specialty.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tarifa por Hora</label>
                    <p className="text-lg font-medium text-green-600">${Number(lawyer.hourly_rate).toFixed(0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tarifa de Consulta</label>
                    <p className="text-lg font-medium text-green-600">${Number(lawyer.consultation_rate).toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Servicios Ofrecidos</CardTitle>
                  <CardDescription>
                    {lawyer.services.length} servicios configurados
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Servicio
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lawyer.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{service.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {getServiceTypeLabel(service.service_type)}
                            </Badge>
                            {getServiceStatusBadge(service.status)}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration_minutes} minutos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-medium text-green-600">
                                ${Number(service.price).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {(service.requirements || service.deliverables) && (
                        <div className="pt-3 border-t">
                          {service.requirements && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500">Requisitos:</span>
                              <p className="text-xs text-gray-600">{service.requirements}</p>
                            </div>
                          )}
                          {service.deliverables && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Entregables:</span>
                              <p className="text-xs text-gray-600">{service.deliverables}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Horarios de Disponibilidad</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableSchedule.length > 0 ? (
                    availableSchedule.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{schedule.day}</span>
                        <span className="text-gray-600">{schedule.times}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay horarios de disponibilidad configurados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}