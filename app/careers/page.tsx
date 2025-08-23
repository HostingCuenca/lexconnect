import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Heart, 
  Target, 
  Award,
  Send,
  Code,
  Scale,
  Headphones
} from 'lucide-react';
import Link from 'next/link';

const jobOpenings = [
  {
    title: 'Desarrollador Full Stack Senior',
    department: 'Tecnología',
    location: 'Guayaquil, Ecuador',
    type: 'Tiempo Completo',
    salary: '$1,500 - $2,200',
    icon: Code,
    description: 'Buscamos un desarrollador experimentado para liderar el desarrollo de nuevas funcionalidades en nuestra plataforma.',
    requirements: [
      '5+ años de experiencia en desarrollo web',
      'Experiencia con React, Node.js y PostgreSQL',
      'Conocimiento de AWS o servicios en la nube',
      'Experiencia en metodologías ágiles'
    ],
    benefits: [
      'Salario competitivo',
      'Trabajo remoto flexible',
      'Capacitación continua',
      'Seguro médico privado'
    ]
  },
  {
    title: 'Abogado Especialista en Derecho Digital',
    department: 'Legal',
    location: 'Guayaquil, Ecuador',
    type: 'Tiempo Completo',
    salary: '$1,200 - $1,800',
    icon: Scale,
    description: 'Únete a nuestro equipo legal para ayudar a desarrollar marcos normativos para tecnología legal.',
    requirements: [
      'Título en Derecho con colegiatura activa',
      '3+ años de experiencia en derecho corporativo',
      'Conocimiento en tecnología y startups',
      'Inglés intermedio-avanzado'
    ],
    benefits: [
      'Crecimiento profesional',
      'Participación en conferencias',
      'Horario flexible',
      'Bonificaciones por resultados'
    ]
  },
  {
    title: 'Especialista en Atención al Cliente',
    department: 'Operaciones',
    location: 'Guayaquil, Ecuador',
    type: 'Tiempo Completo',
    salary: '$600 - $900',
    icon: Headphones,
    description: 'Ayuda a nuestros usuarios a encontrar la mejor solución legal para sus necesidades.',
    requirements: [
      'Experiencia en atención al cliente',
      'Excelentes habilidades de comunicación',
      'Conocimientos básicos de derecho (deseable)',
      'Paciencia y orientación al servicio'
    ],
    benefits: [
      'Ambiente de trabajo positivo',
      'Capacitación en productos legales',
      'Oportunidades de crecimiento',
      'Horario de lunes a viernes'
    ]
  }
];

const benefits = [
  {
    icon: Heart,
    title: 'Ambiente Inclusivo',
    description: 'Valoramos la diversidad y creamos un ambiente donde todos pueden prosperar'
  },
  {
    icon: Target,
    title: 'Crecimiento Profesional',
    description: 'Oportunidades de capacitación, conferencias y desarrollo de habilidades'
  },
  {
    icon: Users,
    title: 'Equipo Colaborativo',
    description: 'Trabajamos juntos hacia objetivos comunes en un ambiente de respeto mutuo'
  },
  {
    icon: Award,
    title: 'Impacto Social',
    description: 'Tu trabajo contribuye directamente a democratizar el acceso a la justicia'
  }
];

const perks = [
  'Salarios competitivos',
  'Trabajo remoto flexible',
  'Seguro médico privado',
  'Días de salud mental',
  'Capacitación y certificaciones',
  'Horarios flexibles',
  'Ambiente startup dinámico',
  'Participación en conferencias',
  'Bonificaciones por desempeño',
  'Café y snacks gratis',
  '15 días de vacaciones',
  'Celebraciones de equipo'
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Briefcase className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Trabaja con{' '}
              <span className="text-secondary">Nosotros</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Únete a nuestro equipo y ayuda a transformar el acceso a la justicia en Ecuador
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué Trabajar en LexConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Somos más que una empresa, somos una misión compartida de hacer la justicia más accesible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <IconComponent className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oportunidades Actuales
            </h2>
            <p className="text-xl text-gray-600">
              Encuentra la posición perfecta para tu carrera
            </p>
          </div>

          <div className="space-y-8">
            {jobOpenings.map((job, index) => {
              const IconComponent = job.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <div className="flex items-start space-x-4 mb-6">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-3 mb-4">
                              <Badge variant="secondary" className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {job.department}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {job.type}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {job.salary}
                              </Badge>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                              {job.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Requisitos:</h4>
                            <ul className="space-y-2">
                              {job.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Beneficios:</h4>
                            <ul className="space-y-2">
                              {job.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-secondary mr-2">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <Button className="w-full mb-4" size="lg">
                          <Send className="h-4 w-4 mr-2" />
                          Aplicar Ahora
                        </Button>
                        <Link href="/contact">
                          <Button variant="outline" className="w-full" size="lg">
                            Más Información
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perks & Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beneficios y Ventajas
            </h2>
            <p className="text-xl text-gray-600">
              Cuidamos de nuestro equipo como familia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-primary mr-3">✓</span>
                <span className="text-gray-700 font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact HR */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿No Encuentras la Posición Ideal?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Envíanos tu CV y cuéntanos cómo te gustaría contribuir a nuestra misión
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary">
                <Send className="h-4 w-4 mr-2" />
                Enviar CV Espontáneo
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              rrhh@lexconnect.com
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}