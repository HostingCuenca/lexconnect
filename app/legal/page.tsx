import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FileText, AlertCircle } from 'lucide-react';

const sections = [
  {
    title: '1. Aceptación de los Términos',
    content: `Al acceder y utilizar la plataforma LexConnect, usted acepta estar sujeto a estos Términos y Condiciones de uso. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.

Estos términos pueden ser actualizados ocasionalmente, y su uso continuado de la plataforma constituye la aceptación de dichos cambios.`
  },
  {
    title: '2. Descripción del Servicio',
    content: `LexConnect es una plataforma digital que conecta clientes que necesitan servicios legales con abogados licenciados en Ecuador. Actuamos como intermediario facilitando:

• Conexión entre clientes y abogados especializados
• Procesamiento seguro de pagos
• Sistema de comunicación y gestión de casos
• Herramientas de seguimiento y documentación

LexConnect NO proporciona servicios legales directamente, sino que facilita la conexión con profesionales independientes.`
  },
  {
    title: '3. Registro y Cuentas de Usuario',
    content: `Para utilizar nuestros servicios, debe:

• Proporcionar información precisa y actualizada durante el registro
• Mantener la confidencialidad de sus credenciales de acceso
• Notificar inmediatamente cualquier uso no autorizado de su cuenta
• Ser mayor de 18 años o contar con autorización parental

Los abogados deben additionally:
• Proporcionar documentación válida de su licencia profesional
• Mantener al día su colegiatura y certificaciones
• Cumplir con todos los códigos de ética profesional aplicables`
  },
  {
    title: '4. Responsabilidades del Usuario',
    content: `Los usuarios se comprometen a:

• Usar la plataforma solo para fines legales y legítimos
• No violar derechos de propiedad intelectual
• No transmitir contenido ofensivo, difamatorio o ilegal
• Mantener la confidencialidad de la información sensible
• Proporcionar información veraz en todas las comunicaciones
• Respetar los términos acordados con los abogados contratados`
  },
  {
    title: '5. Servicios de Abogados',
    content: `Los abogados en nuestra plataforma son profesionales independientes. LexConnect:

• Verifica las credenciales básicas de los abogados
• NO supervisa ni controla la calidad de los servicios legales prestados
• NO es responsable por las acciones u omisiones de los abogados
• Facilita la comunicación pero no interfiere en la relación abogado-cliente

La relación contractual para servicios legales se establece directamente entre el cliente y el abogado.`
  },
  {
    title: '6. Pagos y Comisiones',
    content: `• Los clientes pagan directamente por los servicios legales contratados
• LexConnect cobra una comisión por facilitar la conexión
• Los pagos se procesan a través de nuestros proveedores de pago autorizados
• Los reembolsos están sujetos a las políticas específicas de cada abogado
• LexConnect no es responsable por disputas de pago entre clientes y abogados`
  },
  {
    title: '7. Privacidad y Confidencialidad',
    content: `• Respetamos la privacidad de todos los usuarios
• La información se maneja según nuestra Política de Privacidad
• Se mantiene la confidencialidad abogado-cliente según la ley
• No compartimos información personal sin consentimiento expreso
• Utilizamos medidas de seguridad apropiadas para proteger los datos`
  },
  {
    title: '8. Limitación de Responsabilidad',
    content: `LexConnect NO será responsable por:

• Errores u omisiones en los servicios prestados por abogados
• Pérdidas económicas resultantes del uso de la plataforma
• Interrupciones temporales del servicio
• Decisiones tomadas basándose en información de la plataforma
• Resultados específicos de casos legales

Nuestra responsabilidad se limita a facilitar conexiones entre usuarios y abogados.`
  },
  {
    title: '9. Propiedad Intelectual',
    content: `• Todo el contenido de LexConnect está protegido por derechos de autor
• Los usuarios conservan los derechos sobre el contenido que publican
• Se prohíbe la reproducción no autorizada de nuestros materiales
• Las marcas registradas de LexConnect no pueden ser utilizadas sin permiso`
  },
  {
    title: '10. Terminación del Servicio',
    content: `Podemos terminar o suspender cuentas por:

• Violación de estos términos
• Actividad fraudulenta o ilegal
• Comportamiento que dañe a otros usuarios
• Falta de pago de comisiones (para abogados)

Los usuarios pueden cancelar su cuenta en cualquier momento desde su panel de control.`
  },
  {
    title: '11. Ley Aplicable',
    content: `Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa será resuelta en los tribunales competentes de Guayaquil, Ecuador.

En caso de conflicto entre versiones en diferentes idiomas, prevalecerá la versión en español.`
  },
  {
    title: '12. Contacto',
    content: `Para preguntas sobre estos términos, contáctanos:

• Email: legal@lexconnect.com
• Teléfono: +593 98 831 6157
• Dirección: Guayaquil, Ecuador

Fecha de última actualización: Enero 2025`
  }
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Scale className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Términos{' '}
              <span className="text-secondary">Legales</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Términos y condiciones de uso de la plataforma LexConnect
            </p>
          </div>
        </div>
      </section>

      {/* Legal Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Aviso Importante
                  </h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    Estos términos y condiciones constituyen un acuerdo legalmente vinculante. 
                    Le recomendamos leer cuidadosamente todo el documento antes de usar nuestros servicios. 
                    Si tiene preguntas, consulte con un abogado independiente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl text-primary flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Notice */}
          <div className="mt-12 text-center">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <Scale className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">
                  LexConnect Ecuador
                </h3>
                <p className="text-gray-600">
                  Facilitando el acceso a la justicia a través de la tecnología
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Última actualización: Enero 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}