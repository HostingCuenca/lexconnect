import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'Nuevas Reformas en el Código Civil: Lo que Debes Saber',
    excerpt: 'Análisis detallado de las últimas modificaciones al código civil y su impacto en los contratos.',
    author: 'Dr. María González',
    date: '15 de Enero, 2024',
    image: 'https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Derecho Civil'
  },
  {
    id: 2,
    title: 'Guía Completa para Constituir una Empresa en 2024',
    excerpt: 'Pasos detallados, requisitos y costos actualizados para la constitución de sociedades.',
    author: 'Lic. Carlos Ruiz',
    date: '10 de Enero, 2024',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Derecho Comercial'
  },
  {
    id: 3,
    title: 'Derechos Laborales: Cambios en la Ley de Trabajo Remoto',
    excerpt: 'Análisis de las nuevas regulaciones sobre teletrabajo y sus implicaciones legales.',
    author: 'Dra. Ana Martín',
    date: '8 de Enero, 2024',
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Derecho Laboral'
  }
];

export default function Blog() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Blog Jurídico
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mantente informado con los últimos análisis legales, cambios en la legislación 
            y consejos prácticos de nuestros expertos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post) => (
            <Card key={post.id} className="h-full hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {post.category}
                  </span>
                </div>
                <CardTitle className="text-xl hover:text-blue-700 transition-colors">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <Link href={`/blog/${post.id}`}>
                  <Button variant="outline" className="w-full">
                    Leer Más
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/blog">
            <Button size="lg" variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white">
              Ver Todos los Artículos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}