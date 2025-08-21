import Link from 'next/link';
import { Scale, MapPin, Phone, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';

const footerSections = [
  {
    title: 'Servicios',
    links: [
      { href: '/services/penal', label: 'Derecho Penal' },
      { href: '/services/civil', label: 'Derecho Civil' },
      { href: '/services/comercial', label: 'Derecho Comercial' },
      { href: '/services/laboral', label: 'Derecho Laboral' },
    ]
  },
  {
    title: 'Empresa',
    links: [
      { href: '/about', label: 'Nosotros' },
      { href: '/team', label: 'Nuestro Equipo' },
      { href: '/careers', label: 'Trabaja con Nosotros' },
      { href: '/contact', label: 'Contacto' },
    ]
  },
  {
    title: 'Recursos',
    links: [
      { href: '/blog', label: 'Blog Jurídico' },
      { href: '/faq', label: 'Preguntas Frecuentes' },
      { href: '/legal', label: 'Términos Legales' },
      { href: '/privacy', label: 'Política de Privacidad' },
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Scale className="h-8 w-8 text-secondary" />
              <span className="font-display text-2xl font-bold">LexConnect</span>
            </div>
            <p className="text-gray-300 mb-6 font-sans">
              Conectando abogados y clientes de manera eficiente. 
              Conectamos clientes con los mejores abogados especializados en Ecuador.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span className="font-sans">Av. 9 de Octubre 123, Guayaquil</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="font-sans">+593 4 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="font-sans">contacto@lexconnect.com</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4 font-sans">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href} 
                      className="text-gray-300 hover:text-secondary transition-colors font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 mb-4 md:mb-0 font-sans">
              © 2024 LexConnect Ecuador. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}