import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqData = [
  {
    category: 'General',
    questions: [
      {
        question: '¿Qué es LexConnect?',
        answer: 'LexConnect es una plataforma digital que conecta clientes con abogados especializados en Ecuador. Facilitamos el acceso a servicios legales de calidad de manera transparente y eficiente.'
      },
      {
        question: '¿Cómo funciona la plataforma?',
        answer: 'Simplemente regístrate, describe tu caso legal, y te conectaremos con abogados especializados en tu área. Puedes revisar perfiles, comparar precios y elegir el profesional que mejor se adapte a tus necesidades.'
      },
      {
        question: '¿Es gratuito usar LexConnect?',
        answer: 'El registro y la búsqueda de abogados es completamente gratuita. Solo pagas por los servicios legales que contrates directamente con el abogado de tu elección.'
      },
      {
        question: '¿Qué tipos de servicios legales ofrecen?',
        answer: 'Ofrecemos una amplia gama de servicios: Derecho Civil, Penal, Comercial, Laboral, Familiar, Tributario, y más. Nuestros abogados están especializados en diferentes áreas del derecho.'
      }
    ]
  },
  {
    category: 'Para Clientes',
    questions: [
      {
        question: '¿Cómo elijo al abogado correcto?',
        answer: 'Puedes revisar los perfiles detallados de cada abogado, incluyendo su experiencia, especialidades, calificaciones de otros clientes y tarifas. También puedes solicitar una consulta inicial antes de contratar.'
      },
      {
        question: '¿Cómo se manejan los pagos?',
        answer: 'Los pagos se procesan de manera segura a través de nuestra plataforma. Aceptamos tarjetas de crédito, débito y transferencias bancarias. El pago se libera al abogado una vez completado el servicio satisfactoriamente.'
      },
      {
        question: '¿Qué pasa si no estoy satisfecho con el servicio?',
        answer: 'Tenemos un sistema de resolución de disputas. Si no estás satisfecho, puedes reportar el caso y trabajaremos para encontrar una solución justa para ambas partes.'
      },
      {
        question: '¿Puedo cancelar una consulta?',
        answer: 'Sí, puedes cancelar una consulta hasta 24 horas antes de la cita programada sin penalización. Para cancelaciones con menos tiempo, consulta las políticas específicas del abogado.'
      }
    ]
  },
  {
    category: 'Para Abogados',
    questions: [
      {
        question: '¿Cómo me registro como abogado?',
        answer: 'Completa nuestro formulario de registro, proporciona tus credenciales profesionales, número de colegiatura y documentación requerida. Nuestro equipo verificará tu información antes de activar tu perfil.'
      },
      {
        question: '¿Cuánto cobra LexConnect por sus servicios?',
        answer: 'Cobramos una comisión competitiva solo cuando completas exitosamente un servicio. No hay tarifas de registro ni cuotas mensuales. Ganas más cuando ayudas más clientes.'
      },
      {
        question: '¿Cómo recibo los pagos?',
        answer: 'Los pagos se transfieren directamente a tu cuenta bancaria registrada, generalmente dentro de 3-5 días hábiles después de completar el servicio.'
      },
      {
        question: '¿Puedo establecer mis propias tarifas?',
        answer: 'Absolutamente. Tú estableces tus tarifas según tu experiencia y especialización. Recomendamos revisar el mercado para mantener precios competitivos.'
      }
    ]
  },
  {
    category: 'Seguridad y Privacidad',
    questions: [
      {
        question: '¿Es segura mi información personal?',
        answer: 'Sí, utilizamos encriptación de grado bancario para proteger toda tu información. Cumplimos con estándares internacionales de seguridad y privacidad de datos.'
      },
      {
        question: '¿Cómo verifican a los abogados?',
        answer: 'Todos los abogados pasan por un riguroso proceso de verificación que incluye validación de credenciales, número de colegiatura, referencias profesionales y verificación de antecedentes.'
      },
      {
        question: '¿Puedo mantener la confidencialidad abogado-cliente?',
        answer: 'Por supuesto. La confidencialidad abogado-cliente se mantiene en todo momento. Nuestra plataforma facilita la comunicación segura pero no interfiere con la relación profesional.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Preguntas{' '}
              <span className="text-secondary">Frecuentes</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Encuentra respuestas a las preguntas más comunes sobre LexConnect y nuestros servicios legales
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    Información sobre {category.category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${categoryIndex}-${index}`}
                        className="border border-gray-200 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium text-gray-900">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nuestro equipo de soporte está aquí para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contactar Soporte
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              +593 98 831 6157
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}