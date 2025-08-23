import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sections = [
  {
    title: '1. Información que Recopilamos',
    icon: Database,
    content: `Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:

**Información Personal:**
• Nombre completo, email y número de teléfono
• Información de ubicación (ciudad, país)
• Información profesional (para abogados: número de colegiatura, especialidades)
• Información de pago y facturación

**Información de Uso:**
• Datos de navegación y comportamiento en la plataforma
• Direcciones IP y información del dispositivo
• Cookies y tecnologías similares
• Registros de comunicaciones dentro de la plataforma

**Información Legal:**
• Detalles de casos y consultas legales
• Documentos y archivos compartidos
• Historial de transacciones y pagos`
  },
  {
    title: '2. Cómo Utilizamos su Información',
    icon: Users,
    content: `Utilizamos la información recopilada para:

**Prestación de Servicios:**
• Conectar clientes con abogados apropiados
• Facilitar comunicaciones seguras
• Procesar pagos y transacciones
• Proporcionar soporte al cliente

**Mejora de la Plataforma:**
• Analizar el uso para mejorar funcionalidades
• Personalizar la experiencia del usuario
• Desarrollar nuevas características
• Realizar investigación y análisis

**Cumplimiento Legal:**
• Cumplir con obligaciones legales
• Prevenir fraude y actividades ilegales
• Proteger derechos y seguridad de usuarios
• Responder a solicitudes de autoridades`
  },
  {
    title: '3. Compartir Información',
    icon: Eye,
    content: `Solo compartimos su información en circunstancias específicas:

**Con Abogados de la Plataforma:**
• Información necesaria para prestar servicios legales
• Solo con abogados que usted elija contactar
• Sujeto a confidencialidad abogado-cliente

**Con Proveedores de Servicios:**
• Procesadores de pago autorizados
• Servicios de hosting y almacenamiento en la nube
• Herramientas de análisis y marketing
• Todos sujetos a estrictos acuerdos de confidencialidad

**Por Requerimientos Legales:**
• Cuando sea requerido por ley
• Para proteger nuestros derechos legales
• Para prevenir fraude o actividad ilegal
• En casos de emergencia para proteger la seguridad

**NUNCA vendemos o alquilamos información personal a terceros.**`
  },
  {
    title: '4. Seguridad de los Datos',
    icon: Lock,
    content: `Implementamos medidas robustas de seguridad:

**Medidas Técnicas:**
• Encriptación SSL/TLS para todas las comunicaciones
• Encriptación de datos en reposo
• Autenticación multifactor disponible
• Monitoreo continuo de seguridad

**Medidas Organizacionales:**
• Acceso limitado a información personal
• Capacitación regular en seguridad para empleados
• Auditorías de seguridad regulares
• Políticas estrictas de manejo de datos

**Respuesta a Incidentes:**
• Plan de respuesta a brechas de seguridad
• Notificación inmediata en caso de incidentes
• Cooperación con autoridades cuando sea necesario`
  },
  {
    title: '5. Sus Derechos de Privacidad',
    icon: Shield,
    content: `Como usuario, usted tiene los siguientes derechos:

**Acceso y Portabilidad:**
• Solicitar una copia de sus datos personales
• Recibir sus datos en formato legible por máquina
• Transferir sus datos a otro proveedor de servicios

**Corrección y Actualización:**
• Corregir información inexacta
• Actualizar información desactualizada
• Completar información incompleta

**Eliminación:**
• Solicitar la eliminación de sus datos personales
• Derecho al "olvido" en circunstancias específicas
• Eliminación automática después de inactividad prolongada

**Control:**
• Optar por no recibir comunicaciones de marketing
• Controlar configuraciones de privacidad
• Retirar consentimientos previamente otorgados

**Objeción y Limitación:**
• Objetar el procesamiento de sus datos
• Solicitar limitación del procesamiento
• Solicitar revisión de decisiones automatizadas`
  },
  {
    title: '6. Retención de Datos',
    content: `• Conservamos datos personales solo mientras sea necesario
• Datos de cuenta: mientras mantenga su cuenta activa
• Datos de transacciones: según requerimientos legales (generalmente 7 años)
• Datos de comunicaciones: 3 años después de la última actividad
• Cookies y datos de navegación: máximo 2 años
• Eliminación segura al final del período de retención`
  },
  {
    title: '7. Cookies y Tecnologías de Seguimiento',
    content: `Utilizamos cookies para mejorar su experiencia:

**Tipos de Cookies:**
• Cookies esenciales: necesarias para el funcionamiento básico
• Cookies de rendimiento: para mejorar velocidad y funcionalidad
• Cookies de análisis: para entender el uso de la plataforma
• Cookies de marketing: para publicidad relevante

**Su Control:**
• Puede administrar cookies desde su navegador
• Opciones de configuración en su perfil
• Algunas funciones pueden limitarse sin cookies esenciales`
  },
  {
    title: '8. Privacidad de Menores',
    content: `• Nuestros servicios son para mayores de 18 años
• No recopilamos intencionalmente datos de menores
• Si detectamos información de menores, la eliminamos inmediatamente
• Los padres pueden contactarnos para eliminar datos de menores`
  },
  {
    title: '9. Transferencias Internacionales',
    content: `• Sus datos se procesan principalmente en Ecuador
• Algunos proveedores pueden estar en otros países
• Todas las transferencias cumplen con estándares internacionales
• Implementamos salvaguardas apropiadas para protección de datos`
  },
  {
    title: '10. Cambios en esta Política',
    content: `• Podemos actualizar esta política ocasionalmente
• Notificaremos cambios significativos por email
• La fecha de última actualización se muestra al final
• Su uso continuado constituye aceptación de cambios`
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Shield className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Política de{' '}
              <span className="text-secondary">Privacidad</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
              Cómo protegemos y manejamos su información personal en LexConnect
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Su Privacidad es Nuestra Prioridad
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  En LexConnect, entendemos la importancia de proteger su información personal. 
                  Esta política describe cómo recopilamos, usamos y protegemos sus datos cuando 
                  utiliza nuestra plataforma de servicios legales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl text-primary flex items-center">
                    {section.icon && <section.icon className="h-5 w-5 mr-3" />}
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

          {/* Contact for Privacy */}
          <Card className="mt-12 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">
                  ¿Preguntas sobre Privacidad?
                </h3>
                <p className="text-gray-600 mb-6">
                  Si tiene preguntas sobre esta política o el manejo de sus datos, contáctenos:
                </p>
                <div className="space-y-2 text-gray-700 mb-6">
                  <p><strong>Email:</strong> privacy@lexconnect.com</p>
                  <p><strong>Teléfono:</strong> +593 98 831 6157</p>
                  <p><strong>Ubicación:</strong> Guayaquil, Ecuador</p>
                </div>
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary/90">
                    Contactar Soporte
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-6">
                  Última actualización: Enero 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}