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
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
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
            onClick={() => window.location.href = `/lawyers/${service.lawyer.id}`}
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