import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Car,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Gavel,
    title: 'Derecho Penal',
    description: 'Defensa especializada en casos penales con amplia experiencia en tribunales.',
    price: 'Desde $200',
    features: ['Consulta inicial gratuita', 'Seguimiento 24/7', 'Experiencia comprobada']
  },
  {
    icon: Home,
    title: 'Derecho Inmobiliario',
    description: 'Asesoría completa en compraventa, arrendamientos y trámites inmobiliarios.',
    price: 'Desde $150',
    features: ['Revisión de contratos', 'Trámites notariales', 'Asesoría personalizada']
  },
  {
    icon: Briefcase,
    title: 'Derecho Comercial',
    description: 'Constitución de empresas, contratos comerciales y asesoría empresarial.',
    price: 'Desde $300',
    features: ['Constitución de sociedades', 'Contratos comerciales', 'Asesoría continua']
  },
  {
    icon: Users,
    title: 'Derecho Familiar',
    description: 'Divorcios, custodia, pensiones alimenticias y otros temas familiares.',
    price: 'Desde $180',
    features: ['Mediación familiar', 'Procesos de divorcio', 'Custodia de menores']
  },
  {
    icon: FileText,
    title: 'Derecho Laboral',
    description: 'Defensa de derechos laborales, despidos injustificados y demandas.',
    price: 'Desde $220',
    features: ['Demandas laborales', 'Asesoría en despidos', 'Negociación colectiva']
  },
  {
    icon: Car,
    title: 'Accidentes de Tránsito',
    description: 'Representación en casos de accidentes vehiculares y seguros.',
    price: 'Desde $250',
    features: ['Sin pago hasta ganar', 'Negociación con seguros', 'Peritajes especializados']
  }
];

export default function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios Legales
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios legales especializados para satisfacer 
            todas tus necesidades jurídicas con la máxima profesionalidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-700">{service.price}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-700 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full">
                    Consultar Ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white">
              Ver Todos los Servicios
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}