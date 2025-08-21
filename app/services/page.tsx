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

export default function ServicesPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Fetch lawyers and specialties
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch lawyers and specialties in parallel
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
      setLoading(false);
    }
  };

  // Search lawyers
  const searchLawyers = async () => {
    try {
      setLoading(true);
      
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
      setLoading(false);
    }
  };

  // Get main service for display
  const getMainService = (services: LawyerService[]) => {
    return services.find(s => s.service_type === 'consultation') || services[0];
  };


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
              Encuentra el abogado perfecto para tu caso. {lawyers.length} especialistas verificados disponibles.
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
                placeholder="Buscar abogados por nombre o especialidad..."
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
              <Button onClick={searchLawyers} disabled={loading}>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lawyers.map((lawyer) => {
                const mainService = getMainService(lawyer.services);
                if (!mainService) return null;

                return (
                  <Card key={lawyer.id} className="h-full hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {lawyer.specialties.map((specialty) => (
                            <Badge key={specialty.id} variant="outline" className="text-xs">
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                        {lawyer.is_verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                        {mainService.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {mainService.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Lawyer Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {lawyer.first_name} {lawyer.last_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{lawyer.years_experience} años exp.</span>
                            <span>•</span>
                            <span>{lawyer.languages}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{Number(lawyer.rating || 0).toFixed(1)}</span>
                          <span className="text-gray-500">({lawyer.total_reviews} reseñas)</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{mainService.duration_minutes} min</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{lawyer.office_address}</span>
                      </div>
                      
                      {/* Price and Action */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center space-x-1 text-2xl font-bold text-green-600">
                          <DollarSign className="h-6 w-6" />
                          <span>{Number(mainService.price).toFixed(0)}</span>
                        </div>
                        <Button 
                          className="group-hover:bg-blue-700"
                          onClick={() => window.location.href = `/lawyers/${lawyer.id}`}
                        >
                          Ver Perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}