'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  User,
  Award,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MessageSquare
} from 'lucide-react';

interface LawyerService {
  id: string;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
  service_type: string;
}

interface LawyerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  years_experience: number;
  rating: string;
  total_reviews: number;
  total_consultations: number;
  office_address: string;
  languages: string;
  is_verified: boolean;
  hourly_rate: string;
  consultation_rate: string;
  avatar_url?: string;
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

export default function LawyersDirectoryPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Get city from address
  const getCity = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || address;
  };

  // Generate avatar placeholder
  const getAvatarUrl = (lawyer: LawyerProfile) => {
    if (lawyer.avatar_url) return lawyer.avatar_url;
    
    // Generate placeholder with initials
    const initials = `${lawyer.first_name[0]}${lawyer.last_name[0]}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=ffffff&size=128`;
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
              Directorio de{' '}
              <span className="text-secondary">Abogados</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Encuentra abogados especializados verificados. {lawyers.length} profesionales disponibles para ayudarte.
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
                placeholder="Buscar por nombre, especialidad o ciudad..."
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
              {lawyers.map((lawyer) => (
                <Card key={lawyer.id} className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  {/* Profile Photo Header */}
                  <div className="bg-brand-gradient p-6 text-white relative">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={getAvatarUrl(lawyer)}
                          alt={`${lawyer.first_name} ${lawyer.last_name}`}
                          className="w-16 h-16 rounded-full border-4 border-white/20 object-cover"
                        />
                        {lawyer.is_verified && (
                          <div className="absolute -bottom-1 -right-1">
                            <Badge className="bg-green-500 text-white p-1 rounded-full">
                              <Award className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {lawyer.first_name} {lawyer.last_name}
                        </h3>
                        <div className="flex items-center space-x-2 text-blue-100 text-sm">
                          <Briefcase className="h-4 w-4" />
                          <span>{lawyer.years_experience} años exp.</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{Number(lawyer.rating).toFixed(1)}</span>
                          <span className="text-blue-100 text-sm">({lawyer.total_reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lawyer.specialties.map((specialty) => (
                        <Badge key={specialty.id} variant="outline" className="text-xs">
                          {specialty.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {lawyer.bio}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{getCity(lawyer.office_address)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Globe className="h-4 w-4" />
                        <span>{lawyer.languages}</span>
                      </div>
                    </div>

                    {/* Services Count */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-600">
                        {lawyer.services.length} servicios disponibles
                      </span>
                      <span className="text-gray-600">
                        {lawyer.total_consultations} consultas
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Consulta desde:</span>
                        <span className="font-bold text-green-600 text-lg">
                          ${Number(lawyer.consultation_rate).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Por hora:</span>
                        <span className="font-medium text-gray-900">
                          ${Number(lawyer.hourly_rate).toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/lawyers/${lawyer.id}`} className="flex-1">
                        <Button className="w-full group-hover:bg-blue-700">
                          Ver Perfil
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`mailto:${lawyer.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`tel:${lawyer.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
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