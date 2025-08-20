'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Search, 
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Nuevas Reformas en el Código Civil 2024: Guía Completa',
    slug: 'reformas-codigo-civil-2024',
    excerpt: 'Análisis detallado de las últimas modificaciones al código civil mexicano y su impacto directo en contratos, obligaciones y derechos civiles. Una guía esencial para abogados y ciudadanos.',
    content: `Las reformas al Código Civil de 2024 representan uno de los cambios más significativos en la legislación civil mexicana de los últimos años. Estas modificaciones afectan directamente la forma en que se interpretan y ejecutan los contratos, las obligaciones civiles y los derechos fundamentales de los ciudadanos.

## Principales Cambios

### 1. Contratos Digitales
La nueva legislación reconoce plenamente la validez de los contratos firmados digitalmente, estableciendo un marco legal claro para las transacciones electrónicas. Esto incluye:

- Reconocimiento de firmas electrónicas avanzadas
- Validez legal de contratos celebrados por medios digitales
- Nuevos requisitos de seguridad para plataformas digitales

### 2. Protección al Consumidor
Se han fortalecido significativamente los derechos del consumidor, incluyendo:

- Ampliación del plazo para ejercer el derecho de retracto
- Nuevas obligaciones para proveedores de servicios digitales
- Protección especial para adultos mayores en transacciones comerciales

### 3. Responsabilidad Civil Digital
Las reformas abordan específicamente la responsabilidad civil en el entorno digital:

- Responsabilidad de plataformas digitales por contenido de terceros
- Nuevos criterios para determinar daños y perjuicios en el ámbito digital
- Procedimientos expeditos para la protección de datos personales

## Impacto en la Práctica Legal

Estos cambios requieren que los abogados actualicen sus conocimientos y adapten sus prácticas profesionales. Es fundamental comprender las nuevas disposiciones para brindar asesoría efectiva a los clientes.

## Recomendaciones

Para los profesionales del derecho, recomendamos:

1. Actualización inmediata en las nuevas disposiciones
2. Revisión de contratos tipo utilizados en la práctica
3. Capacitación en herramientas digitales para contratos electrónicos
4. Implementación de nuevos protocolos de seguridad digital

La adaptación a estas reformas no solo es necesaria desde el punto de vista legal, sino que también representa una oportunidad para modernizar la práctica jurídica y ofrecer mejores servicios a los clientes.`,
    author: 'Dra. María González',
    authorRole: 'Especialista en Derecho Civil',
    date: '2024-01-15',
    readTime: '8 min',
    image: 'https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Civil',
    tags: ['Código Civil', 'Reformas 2024', 'Contratos Digitales'],
    views: 1247
  },
  {
    id: 2,
    title: 'Guía Completa para Constituir una Empresa en México 2024',
    slug: 'constituir-empresa-mexico-2024',
    excerpt: 'Pasos detallados, requisitos actualizados y costos para la constitución de sociedades en México. Incluye nuevas regulaciones digitales y simplificaciones del proceso.',
    content: `Constituir una empresa en México se ha vuelto más accesible gracias a las reformas digitales implementadas en 2024. Esta guía te llevará paso a paso por todo el proceso actualizado.

## Tipos de Sociedades Disponibles

### Sociedad Anónima (S.A.)
La forma más común para empresas medianas y grandes:
- Capital mínimo: $50,000 pesos
- Mínimo 2 socios
- Responsabilidad limitada al capital aportado

### Sociedad de Responsabilidad Limitada (S. de R.L.)
Ideal para pequeñas y medianas empresas:
- Sin capital mínimo establecido
- Máximo 50 socios
- Gestión más flexible

### Sociedad por Acciones Simplificada (S.A.S.)
Nueva modalidad digital introducida en 2024:
- Constitución 100% digital
- Un solo socio suficiente
- Proceso simplificado de 48 horas

## Proceso de Constitución Paso a Paso

### 1. Denominación Social
- Verificación de disponibilidad en el Registro Público de Comercio
- Reserva del nombre por 30 días
- Costo: $1,500 pesos

### 2. Elaboración de Estatutos
Los estatutos deben incluir:
- Objeto social específico
- Duración de la sociedad
- Domicilio social
- Capital social y forma de pago
- Órganos de administración

### 3. Protocolización ante Notario
- Firma del acta constitutiva
- Costo notarial: $15,000 - $25,000 pesos
- Tiempo estimado: 5-7 días hábiles

### 4. Inscripción en el Registro Público de Comercio
- Presentación de documentos
- Pago de derechos: $3,500 pesos
- Tiempo de procesamiento: 10-15 días hábiles

### 5. Trámites Fiscales
- Inscripción en el RFC
- Obtención de certificado de sello digital
- Registro en el IMSS e INFONAVIT

## Nuevas Facilidades Digitales 2024

El gobierno ha implementado la plataforma "Empresa Fácil" que permite:
- Constitución digital para S.A.S.
- Reducción de tiempos a 48 horas
- Costos reducidos en un 40%
- Seguimiento en tiempo real del proceso

## Costos Totales Estimados

### Sociedad Tradicional (S.A. o S. de R.L.)
- Notario: $15,000 - $25,000
- Registro Público: $3,500
- Permisos municipales: $2,000 - $5,000
- **Total: $20,500 - $33,500**

### Sociedad Simplificada (S.A.S.)
- Plataforma digital: $5,000
- Registro automático: $1,500
- **Total: $6,500**

## Documentos Requeridos

Para personas físicas:
- Identificación oficial vigente
- CURP
- Comprobante de domicilio
- RFC (si se tiene)

Para personas morales:
- Acta constitutiva
- Poder del representante legal
- Identificación del apoderado
- RFC de la empresa

## Recomendaciones Importantes

1. **Asesoría Profesional**: Aunque el proceso se ha simplificado, la asesoría legal sigue siendo fundamental
2. **Planeación Fiscal**: Considerar las implicaciones fiscales desde el inicio
3. **Protección de Marca**: Registrar la marca comercial simultáneamente
4. **Cumplimiento Regulatorio**: Verificar permisos específicos según la actividad

La constitución de empresas en México nunca había sido tan accesible. Las nuevas herramientas digitales, combinadas con asesoría legal profesional, permiten crear empresas de manera eficiente y segura.`,
    author: 'Lic. Carlos Ruiz',
    authorRole: 'Especialista en Derecho Comercial',
    date: '2024-01-10',
    readTime: '12 min',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Comercial',
    tags: ['Constitución', 'Empresas', 'S.A.S.', 'Trámites'],
    views: 2156
  }
];

const categories_blog = ['Todos', 'Derecho Civil', 'Derecho Comercial', 'Derecho Penal', 'Derecho Laboral'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Blog Jurídico LexConnect
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Análisis legal, noticias jurídicas y guías prácticas de nuestros expertos.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories_blog.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículo Destacado</h2>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge>{filteredPosts[0].category}</Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>{filteredPosts[0].views} vistas</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-700 transition-colors">
                    <Link href={`/blog/${filteredPosts[0].slug}`}>
                      {filteredPosts[0].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{filteredPosts[0].author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(filteredPosts[0].date).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{filteredPosts[0].readTime}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${filteredPosts[0].slug}`}>
                      <Button>
                        Leer Más
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Todos los Artículos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post) => (
              <Card key={post.id} className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('es-ES')}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        Leer Más
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mantente Informado
          </h2>
          <p className="text-blue-100 mb-8">
            Recibe los últimos análisis legales y actualizaciones jurídicas directamente en tu correo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Tu correo electrónico"
              className="flex-1"
            />
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}