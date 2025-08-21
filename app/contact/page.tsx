import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageSquare,
  Send
} from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Oficina Principal',
    details: ['Av. Reforma 123, Piso 15', 'Col. Juárez, CDMX 06600']
  },
  {
    icon: Phone,
    title: 'Teléfono',
    details: ['+52 55 1234 5678', '+52 55 8765 4321']
  },
  {
    icon: Mail,
    title: 'Correo Electrónico',
    details: ['contacto@lexconnect.com', 'soporte@lexconnect.com']
  },
  {
    icon: Clock,
    title: 'Horarios',
    details: ['Lun - Vie: 9:00 AM - 7:00 PM', 'Sáb: 9:00 AM - 2:00 PM']
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo de expertos.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 text-blue-700" />
                    <span>Envíanos un Mensaje</span>
                  </CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input id="firstName" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input id="lastName" placeholder="Tus apellidos" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" placeholder="tu@ejemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="+52 55 1234 5678" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consulta Legal</SelectItem>
                        <SelectItem value="partnership">Asociación</SelectItem>
                        <SelectItem value="support">Soporte Técnico</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu consulta o necesidad legal..."
                      rows={6}
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>
                    Múltiples formas de ponerte en contacto con nosotros
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex space-x-3">
                        <IconComponent className="h-5 w-5 text-blue-700 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {info.title}
                          </h3>
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-gray-600 text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    ¿Necesitas Ayuda Urgente?
                  </h3>
                  <p className="text-blue-800 mb-4 text-sm">
                    Para emergencias legales, contamos con un servicio de atención 24/7.
                  </p>
                  <Button className="w-full bg-blue-700 hover:bg-blue-800">
                    Contacto de Emergencia
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    ¿Eres Abogado?
                  </h3>
                  <p className="text-green-800 mb-4 text-sm">
                    Únete a nuestra red de profesionales y expande tu práctica legal.
                  </p>
                  <Link href="/auth/register">
                    <Button className="w-full bg-green-700 hover:bg-green-800">
                      Registrarse Como Abogado
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestra Ubicación
            </h2>
            <p className="text-gray-600">
              Visítanos en nuestra oficina principal en el corazón de Quito
            </p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Mapa Interactivo</p>
                  <p className="text-sm">Av. Reforma 123, Col. Juárez, CDMX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}