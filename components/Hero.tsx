import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award, Users } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Servicios Legales
                <span className="block text-yellow-400">Profesionales</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Plataforma integral para abogados y clientes. Encuentra servicios legales especializados, 
                consulta nuestro blog jurídico y accede a recursos profesionales.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/services">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold">
                  Explorar Servicios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                  Registrarse Como Abogado
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <Shield className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Casos Exitosos</div>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">50+</div>
                <div className="text-blue-200 text-sm">Abogados Expertos</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-blue-200 text-sm">Clientes Satisfechos</div>
              </div>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5668856/pexels-photo-5668856.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Servicios Legales Profesionales"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-blue-900 p-4 rounded-lg shadow-xl">
                <div className="font-bold text-lg">24/7</div>
                <div className="text-sm">Consultas Disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}