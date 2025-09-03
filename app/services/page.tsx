'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Award
} from 'lucide-react';

interface LawyerService {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  service_type: string;
}

interface LawyerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  years_experience: number;
  rating: number;
  total_reviews: number;
  office_address: string;
  languages: string;
  is_verified: boolean;
  specialties: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  services: LawyerService[];
}

interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Fetch services and specialties
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch services and specialties in parallel
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

  // Search services
  const searchServices = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialty && selectedSpecialty !== 'all') params.append('category', selectedSpecialty);
      
      const response = await fetch(`/api/services/public/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (error) {
      console.error('Error searching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search term and specialty
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
      service.lawyer.specialties.some(specialty => specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    
    return matchesSearch && matchesSpecialty;
  });

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
              <span className="text-secondary">Especializados</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Descubre nuestros {services.length} servicios legales especializados con precios transparentes.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar servicios legales..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchServices()}
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
              <Button onClick={searchServices} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando servicios legales...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
              <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <Card key={service.id} className="h-full hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {service.service_type}
                      </Badge>
                      <div className="text-2xl font-bold text-green-600">
                        ${Number(service.price).toFixed(0)} + IVA
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Service Details */}
                    <div className="space-y-3 text-sm">
                      {service.requirements && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium text-blue-800 mb-1">Requisitos:</p>
                          <p className="text-blue-700">{service.requirements}</p>
                        </div>
                      )}
                      {service.deliverables && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="font-medium text-green-800 mb-1">Entregables:</p>
                          <p className="text-green-700">{service.deliverables}</p>
                        </div>
                      )}
                    </div>

                    {/* Lawyer Info */}
                    <div className="flex items-center justify-between pt-3 border-t">
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
                    
                    {/* Action Button */}
                    <Button 
                      className="w-full group-hover:bg-blue-700"
                      onClick={() => window.location.href = `/lawyers/${service.lawyer.id}`}
                    >
                      Solicitar Servicio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}