import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Gavel, 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Car,
  Search,
  Filter,
  Star,
  MapPin,
  Clock
} from 'lucide-react';

const allServices = [
  {
    id: 1,
    title: 'Consulta Legal Especializada',
    description: 'Asesoría personalizada en derecho civil con más de 10 años de experiencia.',
    lawyer: 'Dra. María González',
    rating: 4.9,
    reviews: 127,
    price: 200,
    duration: '60 min',
    location: 'CDMX',
    category: 'Derecho Civil',
    image: 'https://images.pexels.com/photos/5668856/pexels-photo-5668856.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true
  },
  {
    id: 2,
    title: 'Defensa Penal Especializada',
    description: 'Representación legal en casos penales con amplia experiencia en tribunales.',
    lawyer: 'Lic. Carlos Ruiz',
    rating: 4.8,
    reviews: 89,
    price: 350,
    duration: '90 min',
    location: 'Guadalajara',
    category: 'Derecho Penal',
    image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true
  },
  {
    id: 3,
    title: 'Constitución de Empresas',
    description: 'Servicio completo para la creación y registro de sociedades comerciales.',
    lawyer: 'Dr. Roberto Martín',
    rating: 4.7,
    reviews: 156,
    price: 500,
    duration: '120 min',
    location: 'Monterrey',
    category: 'Derecho Comercial',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true
  },
  {
    id: 4,
    title: 'Asesoría Inmobiliaria',
    description: 'Revisión de contratos de compraventa y arrendamiento de propiedades.',
    lawyer: 'Lic. Ana Herrera',
    rating: 4.6,
    reviews: 73,
    price: 180,
    duration: '45 min',
    location: 'CDMX',
    category: 'Derecho Inmobiliario',
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: false
  },
  {
    id: 5,
    title: 'Derecho Laboral y Despidos',
    description: 'Defensa de derechos laborales y representación en casos de despido.',
    lawyer: 'Dr. Luis Fernández',
    rating: 4.9,
    reviews: 201,
    price: 280,
    duration: '75 min',
    location: 'Puebla',
    category: 'Derecho Laboral',
    image: 'https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true
  },
  {
    id: 6,
    title: 'Accidentes de Tránsito',
    description: 'Representación especializada en casos de accidentes vehiculares.',
    lawyer: 'Lic. Patricia Vega',
    rating: 4.8,
    reviews: 94,
    price: 300,
    duration: '60 min',
    location: 'CDMX',
    category: 'Seguros y Accidentes',
    image: 'https://images.pexels.com/photos/5668800/pexels-photo-5668800.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true
  }
];

const categories = [
  'Todos',
  'Derecho Civil',
  'Derecho Penal',
  'Derecho Comercial',
  'Derecho Inmobiliario',
  'Derecho Laboral',
  'Seguros y Accidentes'
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Servicios Legales Especializados
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Encuentra el abogado perfecto para tu caso. Más de 50 especialistas disponibles.
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
              />
            </div>
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdmx">Ciudad de México</SelectItem>
                  <SelectItem value="guadalajara">Guadalajara</SelectItem>
                  <SelectItem value="monterrey">Monterrey</SelectItem>
                  <SelectItem value="puebla">Puebla</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices.map((service) => (
              <Card key={service.id} className="h-full hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                    {!service.available && (
                      <Badge variant="destructive" className="text-xs">
                        No Disponible
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-500">({service.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{service.lawyer}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${service.price}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!service.available}
                  >
                    {service.available ? 'Contratar Servicio' : 'No Disponible'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}