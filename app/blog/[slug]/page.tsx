import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2,
  Eye,
  Tag
} from 'lucide-react';

// This would typically come from a database or CMS
const blogPosts = [
  {
    id: 1,
    title: 'Nuevas Reformas en el Código Civil 2024: Guía Completa',
    slug: 'reformas-codigo-civil-2024',
    excerpt: 'Análisis detallado de las últimas modificaciones al código civil mexicano y su impacto directo en contratos, obligaciones y derechos civiles.',
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

1. **Actualización inmediata** en las nuevas disposiciones
2. **Revisión de contratos** tipo utilizados en la práctica
3. **Capacitación en herramientas digitales** para contratos electrónicos
4. **Implementación de nuevos protocolos** de seguridad digital

La adaptación a estas reformas no solo es necesaria desde el punto de vista legal, sino que también representa una oportunidad para modernizar la práctica jurídica y ofrecer mejores servicios a los clientes.

## Conclusión

Las reformas del Código Civil 2024 marcan un hito en la modernización del derecho mexicano. Los profesionales que se adapten rápidamente a estos cambios estarán mejor posicionados para servir a sus clientes en la nueva era digital del derecho.`,
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
    excerpt: 'Pasos detallados, requisitos actualizados y costos para la constitución de sociedades en México.',
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

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Convert markdown-like content to HTML (simplified)
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-gray-700">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        if (paragraph.match(/^\d+\./)) {
          const items = paragraph.split('\n').filter(line => line.match(/^\d+\./));
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Blog</span>
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge>{post.category}</Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{post.views} vistas</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-500">{post.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
              {post.excerpt}
            </div>
            
            <div className="space-y-4">
              {formatContent(post.content)}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Etiquetas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mt-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {post.author}
                  </h3>
                  <p className="text-blue-600 mb-2">{post.authorRole}</p>
                  <p className="text-gray-600 text-sm">
                    Especialista con más de 15 años de experiencia en {post.category.toLowerCase()}. 
                    Ha participado en más de 200 casos exitosos y es reconocido por su expertise 
                    en la materia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículos Relacionados</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts
                .filter(p => p.id !== post.id && p.category === post.category)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-700 transition-colors">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedPost.author}</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        </div>
      </article>

      <Footer />
    </div>
  );
}