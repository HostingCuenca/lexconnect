'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  User,
  Award,
  MessageSquare,
  ChevronRight,
  FileText,
  Scale,
  Heart,
  Calculator,
  Home,
  Briefcase,
  Building,
  Globe,
  Shield,
  Lightbulb
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
  service_type: string;
  requirements: string;
  deliverables: string;
  status: string;
  created_at: string;
  lawyer: {
    id: string;
    name: string;
    years_experience: number;
    rating: string;
    total_reviews: number;
    specialties: string[];
  };
}

interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const getIcon = (iconName: string) => {
  const icons = {
    FileText,
    Scale,
    Heart,
    Calculator,
    Home,
    Briefcase,
    Building,
    Globe,
    Shield,
    Lightbulb
  };
  return icons[iconName as keyof typeof icons] || FileText;
};

export default function AllServicesPage() {
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  
  // Consultation Modal States
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [preferredContact, setPreferredContact] = useState('email');
  
  // Guest User States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showExistingAccount, setShowExistingAccount] = useState(false);
  
  // Login Modal States
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [servicesResponse, specialtiesResponse] = await Promise.all([
        fetch('/api/services/public/'),
        fetch('/api/legal-specialties/')
      ]);

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.data || []);
      }

      if (specialtiesResponse.ok) {
        const specialtiesData = await specialtiesResponse.json();
        setSpecialties(specialtiesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle service selection to open consultation modal
  const handleServiceSelect = (service: Service) => {
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

  // Handle consultation submission (reusing existing logic)
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      alert('Error: Servicio no seleccionado');
      return;
    }

    // Validation
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa el título y descripción de tu consulta');
      return;
    }

    if (!user) {
      // Guest user validation
      if (!firstName.trim() || !lastName.trim() || !clientEmail.trim() || !clientPassword) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      if (clientPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      if (clientPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      let token = null;
      
      if (!user) {
        // Create account first
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: clientEmail.trim(),
            phone: clientPhone.trim(),
            password: clientPassword,
            role: 'cliente'
          })
        });

        const registerResult = await registerResponse.json();
        
        if (!registerResult.success) {
          if (registerResult.message?.includes('ya existe')) {
            setShowExistingAccount(true);
            alert('Este email ya está registrado. Por favor inicia sesión.');
            return;
          }
          throw new Error(registerResult.message || 'Error al crear la cuenta');
        }
        
        token = registerResult.token;
      } else {
        token = localStorage.getItem('token');
      }

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      // Create consultation
      const consultationData = {
        lawyer_id: selectedService.lawyer.id, // Use lawyer ID from service
        service_id: selectedService.id,
        title: title.trim(),
        description: description.trim(),
        priority,
        preferred_contact: preferredContact
      };

      const consultationResponse = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultationData)
      });

      const consultationResult = await consultationResponse.json();

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
          
          if (confirm('¡Solicitud enviada exitosamente! ¿Quieres ir a tu dashboard para ver el estado de tu consulta?')) {
            window.location.href = '/dashboard';
          }
        }, 3000);
      } else {
        alert(`Error al enviar la consulta: ${consultationResult.message}`);
      }
    } catch (error: any) {
      console.error('Error in consultation flow:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter services based on current filters
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedServiceType === 'all' || service.service_type === selectedServiceType;
    
    return matchesSearch && matchesType;
  });

  // Group services by category/specialty
  const categorizedServices = specialties.reduce((acc, specialty) => {
    acc[specialty.id] = {
      specialty,
      services: filteredServices.filter(service => 
        // We'll need to implement the specialty linking later
        // For now, categorize by service type or keywords
        getCategoryByKeywords(service, specialty.name)
      )
    };
    return acc;
  }, {} as Record<string, { specialty: LegalSpecialty; services: Service[] }>);

  // Add uncategorized services
  const categorizedServiceIds = Object.values(categorizedServices).flatMap(cat => cat.services.map(s => s.id));
  const uncategorizedServices = filteredServices.filter(service => !categorizedServiceIds.includes(service.id));

  function getCategoryByKeywords(service: Service, specialtyName: string): boolean {
    const title = service.title.toLowerCase();
    const description = service.description.toLowerCase();
    
    switch (specialtyName) {
      case 'Propiedad Intelectual':
        return title.includes('marca') || title.includes('registro') || title.includes('autor') || title.includes('patente');
      case 'Derecho Civil':
        return title.includes('divorcio') || title.includes('sucesión') || title.includes('testamento') || title.includes('inquilinato') || title.includes('usucapión');
      case 'Derecho Penal':
        return title.includes('defensa') || title.includes('delito') || title.includes('contravención');
      case 'Derecho Laboral':
        return title.includes('laboral') || title.includes('trabajador') || title.includes('beneficios sociales') || title.includes('contrato laboral');
      case 'Derecho Inmobiliario':
        return title.includes('inmueble') || title.includes('propiedad') || title.includes('arrendamiento') || title.includes('compraventa');
      case 'Derecho Mercantil':
        return title.includes('sociedad') || title.includes('mercantil') || title.includes('comercial') || title.includes('empresa');
      case 'Derecho Fiscal':
        return title.includes('tributario') || title.includes('fiscal') || title.includes('impuesto');
      case 'Derecho Administrativo':
        return title.includes('administrativo') || title.includes('recurso') || title.includes('nacionalización') || title.includes('trámite');
      case 'Derecho Migratorio':
        return title.includes('migra') || title.includes('visa') || title.includes('nacionalización');
      default:
        return false;
    }
  }

  const getServiceTypes = () => {
    const types = [...new Set(services.map(s => s.service_type))];
    return types.map(type => ({
      value: type,
      label: getServiceTypeLabel(type)
    }));
  };

  const getServiceTypeLabel = (type: string) => {
    const types = {
      registro: 'Registro',
      renovacion: 'Renovación',
      oposicion: 'Oposición',
      consulta: 'Consulta',
      contrato: 'Contrato',
      juicio: 'Juicio',
      accion_administrativa: 'Acción Administrativa',
      defensa: 'Defensa',
      impugnacion: 'Impugnación',
      asesoria: 'Asesoría',
      redaccion: 'Redacción',
      liquidacion: 'Liquidación',
      tramite: 'Trámite',
      recurso: 'Recurso',
      reclamacion: 'Reclamación',
      transaccion: 'Transacción',
      regularizacion: 'Regularización',
      constitucion: 'Constitución',
      representacion: 'Representación',
      testamento: 'Testamento',
      sucesion: 'Sucesión',
      mediacion: 'Mediación',
      consultoria: 'Consultoría'
    };
    return types[type as keyof typeof types] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando servicios legales...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Servicios Legales 
              <span className="text-secondary">Completos</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Explora nuestros {services.length} servicios legales especializados organizados por categorías
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar servicios..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {getServiceTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2"
            >
              Todos ({services.length})
            </Button>
            {specialties.map((specialty) => {
              const count = categorizedServices[specialty.id]?.services.length || 0;
              return (
                <Button 
                  key={specialty.id}
                  variant={selectedCategory === specialty.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(specialty.id)}
                  className="mb-2"
                >
                  {specialty.name.replace('Derecho ', '')} ({count})
                </Button>
              );
            })}
          </div>

          {/* Show services based on selected category */}
          {selectedCategory === 'all' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div>
              {/* Category header */}
              {specialties.find(s => s.id === selectedCategory) && (
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    {React.createElement(getIcon(specialties.find(s => s.id === selectedCategory)!.icon), { className: "h-6 w-6 text-primary" })}
                    <h2 className="text-2xl font-bold text-gray-900">{specialties.find(s => s.id === selectedCategory)!.name}</h2>
                  </div>
                  <p className="text-gray-600">{specialties.find(s => s.id === selectedCategory)!.description}</p>
                </div>
              )}
              
              {/* Category services */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(categorizedServices[selectedCategory]?.services || []).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>

              {(categorizedServices[selectedCategory]?.services.length || 0) === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {React.createElement(getIcon(specialties.find(s => s.id === selectedCategory)!.icon), { className: "h-12 w-12 text-gray-400" })}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios en esta categoría</h3>
                  <p className="text-gray-600">Próximamente agregaremos servicios especializados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Consultation Modal */}
      <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {user ? 'Solicitar Consulta Legal' : 'Solicitar Consulta y Crear Cuenta'}
            </DialogTitle>
            <DialogDescription>
              {user ? (
                `Hola ${user.first_name}, completa el formulario para solicitar una consulta sobre este servicio.`
              ) : (
                `Completa el formulario para solicitar una consulta sobre este servicio. Te contactaremos en las próximas 24 horas.`
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
                    <span className="font-bold text-lg">${Number(selectedService.price).toFixed(0)} + IVA</span>
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
                  
                  {/* Existing account detection */}
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
                    <li>• <strong>Tu consulta se enviará</strong> directamente al equipo de LexConnect</li>
                    <li>• <strong>Recibirás una notificación</strong> en tu dashboard</li>
                    <li>• <strong>Te contactaremos</strong> dentro de 24 horas</li>
                    <li>• <strong>Podrás dar seguimiento</strong> desde tu panel de consultas</li>
                    <li>• <strong>Coordinarás tu cita</strong> a través de la plataforma</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Se creará tu cuenta</strong> automáticamente con los datos proporcionados</li>
                    <li>• <strong>Iniciarás sesión</strong> automáticamente en la plataforma</li>
                    <li>• <strong>Tu consulta se enviará</strong> directamente al equipo de LexConnect</li>
                    <li>• <strong>Podrás acceder a tu dashboard</strong> para dar seguimiento al caso</li>
                    <li>• <strong>Te contactaremos</strong> dentro de 24 horas</li>
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
              onClick={handleConsultationSubmit}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => alert('Función de login pendiente de implementar')}>
              Iniciar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {service.service_type}
          </Badge>
          <span className="text-2xl font-bold text-green-600">
            ${Number(service.price).toFixed(0)} + IVA
          </span>
        </div>
        
        <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
          {service.title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          {service.description.length > 150 ? service.description.substring(0, 150) + '...' : service.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lawyer Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {service.lawyer.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{service.lawyer.years_experience} años exp.</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{Number(service.lawyer.rating || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements & Deliverables - Compact */}
        <div className="space-y-2 text-xs">
          {service.requirements && (
            <div className="bg-blue-50 p-2 rounded-md border-l-2 border-blue-200">
              <p className="font-medium text-blue-800 text-xs mb-1">Requisitos:</p>
              <p className="text-blue-700 text-xs">
                {service.requirements.length > 80 ? service.requirements.substring(0, 80) + '...' : service.requirements}
              </p>
            </div>
          )}
          {service.deliverables && (
            <div className="bg-green-50 p-2 rounded-md border-l-2 border-green-200">
              <p className="font-medium text-green-800 text-xs mb-1">Entregables:</p>
              <p className="text-green-700 text-xs">
                {service.deliverables.length > 80 ? service.deliverables.substring(0, 80) + '...' : service.deliverables}
              </p>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full group-hover:bg-blue-700"
            onClick={() => handleServiceSelect(service)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Solicitar Servicio
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}