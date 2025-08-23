'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  Scale,
  FileText,
  Users,
  MessageSquare
} from 'lucide-react';

const suggestions = [
  {
    icon: Home,
    title: 'Ir al Inicio',
    description: 'Vuelve a la página principal',
    href: '/',
    color: 'bg-primary'
  },
  {
    icon: Search,
    title: 'Buscar Abogados',
    description: 'Encuentra el abogado ideal para tu caso',
    href: '/lawyers',
    color: 'bg-secondary'
  },
  {
    icon: FileText,
    title: 'Nuestros Servicios',
    description: 'Explora todos nuestros servicios legales',
    href: '/services',
    color: 'bg-primary'
  },
  {
    icon: MessageSquare,
    title: 'Contáctanos',
    description: 'Habla con nuestro equipo de soporte',
    href: '/contact',
    color: 'bg-secondary'
  }
];

const quickLinks = [
  { href: '/about', label: 'Sobre Nosotros' },
  { href: '/blog', label: 'Blog Jurídico' },
  { href: '/faq', label: 'Preguntas Frecuentes' },
  { href: '/team', label: 'Nuestro Equipo' },
  { href: '/careers', label: 'Únete al Equipo' },
  { href: '/legal', label: 'Términos Legales' },
  { href: '/privacy', label: 'Política de Privacidad' }
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl text-primary font-bold tracking-tight">
              LexConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Error */}
          <div className="mb-12">
            <div className="relative">
              {/* Large 404 */}
              <h1 className="text-9xl sm:text-[12rem] font-bold text-primary/10 select-none">
                404
              </h1>
              
              {/* Overlay Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-6 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-8">
              Página No Encontrada
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Lo sentimos, la página que buscas no existe o ha sido movida. 
              Pero no te preocupes, te ayudamos a encontrar lo que necesitas.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {suggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${suggestion.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {suggestion.description}
                    </p>
                    <Link href={suggestion.href}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full hover:bg-primary hover:text-white"
                      >
                        Ir Ahora
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Enlaces Rápidos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {quickLinks.map((link, index) => (
                  <Link 
                    key={index}
                    href={link.href}
                    className="text-sm text-primary hover:text-secondary transition-colors p-2 rounded hover:bg-primary/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver Atrás
            </Button>
            
            <Link href="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">
              ¿Necesitas Ayuda?
            </h4>
            <p className="text-gray-600 mb-4">
              Nuestro equipo está disponible para asistirte
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                +593 98 831 6157
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Scale className="h-6 w-6 text-secondary" />
              <span className="font-display text-xl font-bold">LexConnect</span>
            </div>
            <p className="text-gray-300 mb-4">
              Conectando abogados y clientes en Ecuador
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-secondary">
                Privacidad
              </Link>
              <Link href="/legal" className="text-gray-400 hover:text-secondary">
                Términos
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-secondary">
                Contacto
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                © 2025 LexConnect Ecuador. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Plataforma desarrollada por{' '}
                <a 
                  href="https://torisoftt.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-secondary hover:text-secondary/80 transition-colors"
                >
                  Torisoftt
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}