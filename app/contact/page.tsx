'use client';

import { useState } from 'react';
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
    title: 'Ubicación',
    details: ['Guayaquil, Ecuador']
  },
  {
    icon: Phone,
    title: 'Teléfono',
    details: ['+593 98 831 6157']
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola! Mi nombre es ${formData.firstName} ${formData.lastName}.

*Correo:* ${formData.email}
*Teléfono:* ${formData.phone}
*Asunto:* ${formData.subject}

*Mensaje:*
${formData.message}`;
    
    // Número de WhatsApp (sin +, espacios o guiones)
    const whatsappNumber = '593988316157';
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              <span className="text-secondary">Contáctanos</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-sans">
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
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <span>Envíanos un Mensaje</span>
                  </CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Tu nombre" 
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Tus apellidos" 
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@ejemplo.com" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input 
                        id="phone" 
                        placeholder="+593 98 831 6157" 
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Select onValueChange={(value) => handleChange('subject', value)} required>
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
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                  </form>
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
                        <IconComponent className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
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

              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    ¿Necesitas Ayuda Urgente?
                  </h3>
                  <p className="text-primary/80 mb-4 text-sm">
                    Para emergencias legales, contamos con un servicio de atención 24/7.
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Contacto de Emergencia
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-secondary/10 border-secondary/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">
                    ¿Eres Abogado?
                  </h3>
                  <p className="text-secondary/80 mb-4 text-sm">
                    Únete a nuestra red de profesionales y expande tu práctica legal.
                  </p>
                  <Link href="/auth/register">
                    <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary">
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
              Nos encontramos en Guayaquil, Ecuador
            </p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127481.49115095168!2d-79.97440804956055!3d-2.1894128999816143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d6d0b00d4b30b%3A0xe7bdc5de7b5ff4e1!2sGuayaquil%2C%20Ecuador!5e0!3m2!1sen!2sus!4v1635959999999!5m2!1sen!2sus"
                width="100%"
                height="400"
                style={{border: 0}}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}