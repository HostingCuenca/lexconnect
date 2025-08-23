import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, Heart, Target, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const teamMembers = [
  {
    name: 'Dra. María González',
    role: 'CEO & Directora Legal',
    specialty: 'Derecho Civil y Comercial',
    experience: '15 años',
    education: 'Universidad Católica de Santiago de Guayaquil',
    image: 'https://images.pexels.com/photos/5668856/pexels-photo-5668856.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Especialista en derecho civil y comercial con amplia experiencia en litigios complejos. Fundadora de LexConnect con la visión de democratizar el acceso a servicios legales de calidad.',
    linkedin: '#',
    email: 'maria@lexconnect.com'
  },
  {
    name: 'Lic. Carlos Ruiz',
    role: 'Director de Operaciones',
    specialty: 'Derecho Penal',
    experience: '12 años',
    education: 'Universidad de Guayaquil',
    image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Experto en derecho penal y procesal penal. Lidera nuestro equipo de operaciones asegurando la calidad de nuestros servicios y la satisfacción de nuestros usuarios.',
    linkedin: '#',
    email: 'carlos@lexconnect.com'
  },
  {
    name: 'Dr. Roberto Martín',
    role: 'CTO & Director de Tecnología',
    specialty: 'Derecho Corporativo y Tecnología',
    experience: '10 años',
    education: 'ESPOL & Universidad San Francisco de Quito',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Abogado especializado en derecho corporativo con formación adicional en tecnología. Responsable del desarrollo y mantenimiento de nuestra plataforma tecnológica.',
    linkedin: '#',
    email: 'roberto@lexconnect.com'
  },
  {
    name: 'Dra. Ana Pérez',
    role: 'Directora de Atención al Cliente',
    specialty: 'Derecho Familiar y Laboral',
    experience: '8 años',
    education: 'Universidad Central del Ecuador',
    image: 'https://images.pexels.com/photos/5668055/pexels-photo-5668055.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Especialista en derecho familiar y laboral. Lidera nuestro equipo de atención al cliente, asegurando que cada usuario reciba el apoyo necesario en su proceso legal.',
    linkedin: '#',
    email: 'ana@lexconnect.com'
  },
  {
    name: 'Lic. Diego Torres',
    role: 'Director de Marketing Legal',
    specialty: 'Derecho Tributario',
    experience: '7 años',
    education: 'Universidad Católica de Santiago de Guayaquil',
    image: 'https://images.pexels.com/photos/5668774/pexels-photo-5668774.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Experto en derecho tributario con experiencia en marketing digital. Responsable de crear contenido educativo y estrategias de comunicación para nuestros usuarios.',
    linkedin: '#',
    email: 'diego@lexconnect.com'
  },
  {
    name: 'Dra. Carmen Salinas',
    role: 'Directora de Calidad',
    specialty: 'Derecho Administrativo',
    experience: '9 años',
    education: 'Universidad San Marcos',
    image: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Especialista en derecho administrativo. Supervisa la calidad de los servicios prestados por los abogados en nuestra plataforma y desarrolla programas de mejora continua.',
    linkedin: '#',
    email: 'carmen@lexconnect.com'
  }
];

const values = [
  {
    icon: Target,
    title: 'Excelencia',
    description: 'Nos comprometemos con los más altos estándares de calidad en todo lo que hacemos.'
  },
  {
    icon: Heart,
    title: 'Compromiso',
    description: 'Cada miembro del equipo está dedicado a mejorar el acceso a la justicia en Ecuador.'
  },
  {
    icon: Users,
    title: 'Colaboración',
    description: 'Trabajamos juntos para crear soluciones innovadoras que beneficien a nuestros usuarios.'
  },
  {
    icon: Award,
    title: 'Integridad',
    description: 'Actuamos con honestidad y transparencia en todas nuestras operaciones.'
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Users className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Nuestro{' '}
              <span className="text-secondary">Equipo</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Profesionales apasionados por democratizar el acceso a la justicia en Ecuador
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Unidos por una Misión
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Somos un equipo multidisciplinario de abogados, tecnólogos y especialistas en atención al cliente 
            que compartimos la visión de hacer que los servicios legales sean más accesibles, transparentes 
            y eficientes para todos los ecuatorianos.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conoce al Equipo
            </h2>
            <p className="text-xl text-gray-600">
              Profesionales experimentados comprometidos con tu éxito
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-secondary font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600 mb-1">{member.specialty}</p>
                    <p className="text-sm text-gray-500">{member.experience} de experiencia</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Educación:</p>
                      <p className="text-gray-600">{member.education}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Sobre {member.name.split(' ')[1]}:</p>
                      <p className="text-gray-600 leading-relaxed text-xs">
                        {member.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-center space-x-3 pt-4">
                      <a 
                        href={`mailto:${member.email}`}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a 
                        href={member.linkedin}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Quieres Ser Parte del Equipo?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Estamos siempre buscando profesionales talentosos que compartan nuestra pasión 
            por mejorar el acceso a la justicia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary">
                Ver Oportunidades
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contactar RRHH
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}