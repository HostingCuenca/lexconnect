import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Award, Users, Clock } from 'lucide-react';

const stats = [
  { icon: CheckCircle, value: '500+', label: 'Casos Resueltos' },
  { icon: Award, value: '15+', label: 'Años de Experiencia' },
  { icon: Users, value: '50+', label: 'Abogados Especialistas' },
  { icon: Clock, value: '24/7', label: 'Atención Disponible' }
];

const features = [
  'Experiencia comprobada en múltiples áreas del derecho',
  'Atención personalizada para cada cliente',
  'Tarifas competitivas y transparentes',
  'Tecnología avanzada para mejor servicio',
  'Red nacional de abogados especializados',
  'Consultas iniciales gratuitas'
];

export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              ¿Por Qué Elegirnos?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Somos una plataforma líder que conecta clientes con los mejores abogados 
              especializados del país. Nuestra misión es democratizar el acceso a 
              servicios legales de calidad.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <IconComponent className="h-8 w-8 text-blue-700 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <img
              src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Equipo legal profesional"
              className="rounded-lg shadow-xl"
            />
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  Compromiso con la Excelencia
                </h3>
                <p className="text-blue-800">
                  Nuestro compromiso es brindar servicios legales de la más alta calidad, 
                  combinando experiencia tradicional con tecnología moderna para ofrecer 
                  soluciones eficientes y accesibles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}