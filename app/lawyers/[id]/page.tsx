'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  MessageSquare,
  ChevronLeft,
  Users
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
  avatar_url?: string;
  availability_schedule: Record<string, Array<{start: string; end: string}>>;
  specialties: LawyerSpecialty[];
  services: LawyerService[];
}

export default function LawyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, login } = useAuth();
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<LawyerService | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showExistingAccount, setShowExistingAccount] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Login modal states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLawyer(params.id as string);
    }
  }, [params.id]);

  const fetchLawyer = async (id: string) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: LawyerService) => {
    setSelectedService(service);
    setTitle(`Consulta: ${service.title}`);
    setConsultationOpen(true);
  };

  // Check if email already exists
  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/register?action=check-email&email=${encodeURIComponent(email)}`);
      const result = await response.json();
      return !result.available; // true if email exists
    } catch (error) {
      return false;
    }
  };

  // Handle email blur to check for existing accounts
  const handleEmailBlur = async () => {
    if (clientEmail && clientEmail.includes('@')) {
      const exists = await checkEmailExists(clientEmail);
      setShowExistingAccount(exists);
    }
  };

  // Handle quick login using AuthContext
  const handleQuickLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Por favor ingresa email y contraseña');
      return;
    }

    try {
      setLoginLoading(true);

      // Use the login function from AuthContext to properly save session
      await login(loginEmail, loginPassword);
      
      // Close login modal and reset fields
      setLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      
      // No need to reload - the context will update automatically
      // The consultation modal will now detect user is logged in
      alert('¡Inicio de sesión exitoso! Ahora puedes solicitar tu consulta.');
      
    } catch (error: any) {
      console.error('Error in quick login:', error);
      alert(`Error al iniciar sesión: ${error.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle consultation for logged-in user
  const handleLoggedUserConsultation = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa el título y descripción de la consulta');
      return;
    }

    try {
      setIsSubmitting(true);

      const consultationData = {
        lawyer_id: lawyer?.id,
        service_id: selectedService?.id || null,
        title: title.trim(),
        description: description.trim(),
        priority,
        preferred_contact: preferredContact
      };

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultationData)
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
        
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setPreferredContact('email');
        setSelectedService(null);
        
        setTimeout(() => {
          setConsultationOpen(false);
          setShowSuccess(false);
          
          if (confirm('¡Solicitud enviada exitosamente! ¿Quieres ir a tu dashboard para ver el estado de tu consulta?')) {
            window.location.href = '/dashboard/consultations';
          }
        }, 2000);
      } else {
        alert(`Error al enviar la consulta: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending consultation:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitConsultation = async () => {
    // Validaciones básicas solamente
    if (!firstName.trim() || !lastName.trim() || !clientEmail.trim() || !clientPassword.trim() || !confirmPassword.trim() || !title.trim() || !description.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validación básica de contraseña
    if (clientPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Email básico
    if (!clientEmail.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create client account
      const registerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: clientEmail.trim(),
        password: clientPassword.trim(),
        confirmPassword: confirmPassword.trim(),
        phone: clientPhone.trim() || undefined,
        role: 'cliente'
      };

      console.log('Sending registration data:', registerData);

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const registerResult = await registerResponse.json();
      console.log('Registration result:', registerResult);

      if (!registerResult.success) {
        if (registerResult.message.includes('existe') || registerResult.message.includes('registrado')) {
          alert('Ya existe una cuenta con este email. Por favor inicia sesión o usa otro email.');
        } else {
          alert(`Error al crear la cuenta: ${registerResult.message}`);
        }
        return;
      }

      // Step 2: Use the token from registration (automatic login)
      const token = registerResult.data.token;

      // Step 3: Create consultation with authenticated user
      const consultationData = {
        lawyer_id: lawyer?.id,
        service_id: selectedService?.id || null,
        title: title.trim(),
        description: description.trim(),
        priority,
        preferred_contact: preferredContact
      };

      console.log('Sending consultation data:', consultationData);

      const consultationResponse = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultationData)
      });

      const consultationResult = await consultationResponse.json();
      console.log('Consultation result:', consultationResult);

      if (consultationResult.success) {
        setShowSuccess(true);
        
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setFirstName('');
        setLastName('');
        setClientEmail('');
        setClientPhone('');
        setClientPassword('');
        setConfirmPassword('');
        setPreferredContact('email');
        setSelectedService(null);
        
        // Show success and redirect option
        setTimeout(() => {
          setConsultationOpen(false);
          setShowSuccess(false);
          
          if (confirm('¡Cuenta creada y solicitud enviada exitosamente! ¿Quieres ir a tu dashboard para ver el estado de tu consulta?')) {
            window.location.href = '/dashboard';
          }
        }, 3000);
      } else {
        alert(`Error al enviar la consulta: ${consultationResult.message}`);
      }
    } catch (error) {
      console.error('Error in consultation flow:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
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

  // Generate avatar placeholder or use real avatar
  const getAvatarUrl = (lawyer: LawyerProfile) => {
    if (lawyer.avatar_url) return lawyer.avatar_url;
    
    // Generate placeholder with initials
    const initials = `${lawyer.first_name[0]}${lawyer.last_name[0]}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=ffffff&size=200`;
  };

  // Get city from address
  const getCity = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || address;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información del abogado...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Abogado no encontrado</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/services')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a Servicios
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availableSchedule = formatSchedule(lawyer.availability_schedule);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header with back button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push('/services')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Servicios
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lawyer Profile Card */}
            <Card className="overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatarUrl(lawyer)}
                      alt={`${lawyer.first_name} ${lawyer.last_name}`}
                      className="w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-lg"
                    />
                    {lawyer.is_verified && (
                      <div className="absolute -bottom-2 -right-2">
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <Award className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h1 className="text-3xl font-bold text-white">
                        {lawyer.first_name} {lawyer.last_name}
                      </h1>
                      {lawyer.is_verified && (
                        <Badge className="bg-green-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lawyer.specialties.map((specialty) => (
                        <Badge key={specialty.id} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                          {specialty.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-blue-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-bold text-white text-lg">{Number(lawyer.rating).toFixed(1)}</span>
                        </div>
                        <span className="text-xs">{lawyer.total_reviews} reseñas</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="font-bold text-white text-lg">{lawyer.total_consultations}</span>
                        </div>
                        <span className="text-xs">Consultas</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-bold text-white text-lg">{lawyer.years_experience}</span>
                        </div>
                        <span className="text-xs">Años exp.</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Globe className="h-4 w-4" />
                          <span className="font-bold text-white text-lg">{lawyer.languages.split(',').length}</span>
                        </div>
                        <span className="text-xs">Idiomas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* About Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Acerca del Abogado</h3>
                  <p className="text-gray-700 leading-relaxed">{lawyer.bio}</p>
                </div>

                {/* Location and Languages */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Ubicación</h4>
                      <p className="text-gray-600">{getCity(lawyer.office_address)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Idiomas</h4>
                      <p className="text-gray-600">{lawyer.languages}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda legal?</h3>
                  <p className="text-blue-700 mb-4">Solicita una consulta directamente a través de nuestra plataforma</p>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => setConsultationOpen(true)}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Solicitar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Education & Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Educación y Credenciales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Educación</h4>
                  <p className="text-gray-600">{lawyer.education}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cédula Profesional</h4>
                  <p className="text-gray-600">{lawyer.license_number}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Colegio de Abogados</h4>
                  <p className="text-gray-600">{lawyer.bar_association}</p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Servicios Disponibles</CardTitle>
                <CardDescription className="text-base">
                  Selecciona un servicio para solicitar una consulta personalizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {lawyer.services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {service.title}
                            </h3>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {getServiceTypeLabel(service.service_type)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                          
                          {/* Service details */}
                          <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{service.duration_minutes} minutos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold text-green-600">
                                ${Number(service.price).toFixed(0)}
                              </span>
                            </div>
                          </div>

                          {/* Additional info if available */}
                          {(service.requirements || service.deliverables) && (
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              {service.requirements && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Requisitos:</h4>
                                  <p className="text-gray-600 text-sm">{service.requirements}</p>
                                </div>
                              )}
                              {service.deliverables && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Entregables:</h4>
                                  <p className="text-gray-600 text-sm">{service.deliverables}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6 flex flex-col items-end space-y-2">
                          <Button 
                            size="lg"
                            onClick={() => handleServiceSelect(service)}
                            className="bg-blue-600 hover:bg-blue-700 group-hover:scale-105 transition-transform"
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Solicitar Ahora
                          </Button>
                          <span className="text-xs text-gray-500">Respuesta en 24h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Información Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarifa por hora</span>
                  <span className="font-medium">${Number(lawyer.hourly_rate).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consulta</span>
                  <span className="font-medium">${Number(lawyer.consultation_rate).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experiencia</span>
                  <span className="font-medium">{lawyer.years_experience} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultas</span>
                  <span className="font-medium">{lawyer.total_consultations}</span>
                </div>
              </CardContent>
            </Card>

            {/* Availability Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Horarios Disponibles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableSchedule.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.times}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {user ? 'Solicitar Consulta Legal' : 'Solicitar Consulta y Crear Cuenta'}
            </DialogTitle>
            <DialogDescription>
              {user ? (
                `Hola ${user.first_name}, completa el formulario para solicitar una consulta con ${lawyer.first_name} ${lawyer.last_name}.`
              ) : (
                `Completa el formulario para solicitar una consulta con ${lawyer.first_name} ${lawyer.last_name}. Te contactaremos en las próximas 24 horas.`
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedService && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">{selectedService.title}</h4>
                <p className="text-blue-700 mb-3">{selectedService.description}</p>
                <div className="flex items-center space-x-6 text-sm text-blue-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{selectedService.duration_minutes} minutos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold text-lg">${Number(selectedService.price).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <>
                {/* Prominent Login Option */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">🔐 Creación de Cuenta</h3>
                      <p className="text-blue-700 text-sm">
                        Para solicitar una consulta, necesitamos crear una cuenta segura donde podrás dar seguimiento a tu caso.
                      </p>
                    </div>
                    <div className="ml-4 text-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">¿Ya tienes cuenta?</p>
                      <Button
                        variant="outline"
                        onClick={() => setLoginModalOpen(true)}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100 font-medium"
                      >
                        Iniciar Sesión
                      </Button>
                    </div>
                  </div>
                  
                  {/* Existing account detection (additional detection) */}
                  {showExistingAccount && (
                    <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm font-medium mb-2">
                        ✉️ Detectamos que ya tienes una cuenta con este email
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLoginEmail(clientEmail);
                          setLoginModalOpen(true);
                        }}
                        className="text-orange-700 border-orange-300 hover:bg-orange-200"
                      >
                        Iniciar Sesión Ahora
                      </Button>
                    </div>
                  )}
                </div>

                {/* Client Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej: Juan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej: Pérez García"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="tu@email.com"
                        required
                      />
                      <p className="text-xs text-gray-500">Usaremos este email para crear tu cuenta</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Teléfono (opcional)</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Tu teléfono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPassword">Contraseña *</Label>
                      <Input
                        id="clientPassword"
                        type="password"
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="preferredContact">Método de contacto preferido</Label>
                      <Select value={preferredContact} onValueChange={setPreferredContact}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Teléfono</SelectItem>
                          <SelectItem value="both">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Consultation Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Detalles de la Consulta</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título de la consulta *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Revisión de contrato de compraventa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción detallada del caso *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu situación legal con el mayor detalle posible. Incluye fechas relevantes, documentos disponibles, y cualquier información que consideres importante..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Nivel de urgencia</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja - Puedo esperar varias semanas</SelectItem>
                    <SelectItem value="medium">Media - Necesito respuesta en unos días</SelectItem>
                    <SelectItem value="high">Alta - Es urgente, necesito ayuda pronto</SelectItem>
                    <SelectItem value="urgent">Crítica - Necesito ayuda inmediata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Next Steps Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">¿Qué pasa después?</h4>
              <ul className="text-green-700 text-sm space-y-1">
                {user ? (
                  <>
                    <li>• <strong>Tu consulta se enviará</strong> directamente a {lawyer.first_name} {lawyer.last_name}</li>
                    <li>• <strong>Recibirás una notificación</strong> en tu dashboard</li>
                    <li>• <strong>El abogado te contactará</strong> dentro de 24 horas</li>
                    <li>• <strong>Podrás dar seguimiento</strong> desde tu panel de consultas</li>
                    <li>• <strong>Coordinarás tu cita</strong> a través de la plataforma</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Se creará tu cuenta</strong> automáticamente con los datos proporcionados</li>
                    <li>• <strong>Iniciarás sesión</strong> automáticamente en la plataforma</li>
                    <li>• <strong>Tu consulta se enviará</strong> directamente a {lawyer.first_name} {lawyer.last_name}</li>
                    <li>• <strong>Podrás acceder a tu dashboard</strong> para dar seguimiento al caso</li>
                    <li>• <strong>El abogado te contactará</strong> dentro de 24 horas</li>
                    <li>• <strong>Coordinarás tu cita</strong> a través de la plataforma</li>
                  </>
                )}
              </ul>
            </div>

            {showSuccess && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                <div className="animate-pulse">
                  <h4 className="font-semibold text-green-900 mb-2">✅ ¡Procesando tu solicitud!</h4>
                  <p className="text-green-700 text-sm">
                    Creando tu cuenta y enviando la consulta...
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setConsultationOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={user ? handleLoggedUserConsultation : handleSubmitConsultation}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {user ? 'Enviando consulta...' : 'Creando cuenta y enviando consulta...'}
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {user ? 'Solicitar Consulta' : 'Crear Cuenta y Solicitar Consulta'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Login Modal */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inicio de Sesión Rápido</DialogTitle>
            <DialogDescription>
              Ya tienes una cuenta. Inicia sesión para continuar con tu consulta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Contraseña</Label>
              <Input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>¿Olvidaste tu contraseña? 
                <a href="/auth/login" className="text-blue-600 hover:underline ml-1">
                  Ir a página de login
                </a>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setLoginModalOpen(false)}
              disabled={loginLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleQuickLogin}
              disabled={loginLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loginLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}