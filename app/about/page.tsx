import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Award, 
  Users, 
  Clock,
  Scale,
  Shield,
  Target,
  Heart
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { icon: CheckCircle, value: '500+', label: 'Casos Resueltos' },
  { icon: Award, value: '15+', label: 'Años de Experiencia' },
  { icon: Users, value: '50+', label: 'Abogados Especialistas' },
  { icon: Clock, value: '24/7', label: 'Atención Disponible' }
];

const values = [
  {
    icon: Scale,
    title: 'Justicia',
    description: 'Creemos en la justicia accesible para todos, sin importar su situación económica o social.'
  },
  {
    icon: Shield,
    title: 'Integridad',
    description: 'Actuamos con transparencia y honestidad en cada caso, manteniendo los más altos estándares éticos.'
  },
  {
    icon: Target,
    title: 'Excelencia',
    description: 'Nos comprometemos a brindar servicios de la más alta calidad con resultados excepcionales.'
  },
  {
    icon: Heart,
    title: 'Compromiso',
    description: 'Cada caso es importante para nosotros. Nos dedicamos completamente a defender tus derechos.'
  }
];

const team = [
  {
    name: 'Dra. María González',
    role: 'Directora General',
    specialty: 'Derecho Civil y Comercial',
    experience: '15 años',
    image: 'https://images.pexels.com/photos/5668856/pexels-photo-5668856.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Lic. Carlos Ruiz',
    role: 'Socio Fundador',
    specialty: 'Derecho Penal',
    experience: '12 años',
    image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Dr. Roberto Martín',
    role: 'Director de Tecnología',
    specialty: 'Derecho Corporativo',
    experience: '10 años',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Sobre LexConnect
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Somos una plataforma innovadora que conecta abogados especializados con clientes 
              que necesitan servicios legales de calidad. Nuestra misión es democratizar el 
              acceso a la justicia a través de la tecnología.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <IconComponent className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Nuestra Misión
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                En LexConnect, creemos que todos merecen acceso a servicios legales de calidad. 
                Nuestra plataforma elimina las barreras tradicionales entre abogados y clientes, 
                creando un ecosistema donde la justicia es accesible, transparente y eficiente.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Utilizamos tecnología de vanguardia para conectar a los mejores abogados 
                especializados con clientes que necesitan sus servicios, garantizando 
                transparencia en precios, calidad en el servicio y resultados excepcionales.
              </p>
              <Link href="/services">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
                  Explorar Servicios
                </Button>
              </Link>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Equipo LexConnect"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión y acción en LexConnect
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <IconComponent className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesionales comprometidos con la excelencia y la innovación en servicios legales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-32 h-32 mx-auto mb-6 overflow-hidden rounded-full">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 mb-2">{member.specialty}</p>
                  <p className="text-sm text-gray-500">{member.experience} de experiencia</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para Conectar con el Abogado Ideal?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de clientes satisfechos que han encontrado soluciones legales 
            efectivas a través de nuestra plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900">
                Explorar Servicios
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Registrarse Como Abogado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}