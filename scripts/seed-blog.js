const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  host: '167.235.20.41',
  port: 5432,
  database: 'lexconnectdb',
  user: 'postgres',
  password: 'AgroCursos2025',
  ssl: false
});

// Función para generar slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Función para calcular tiempo de lectura
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// Artículos de prueba para insertar
const blogPosts = [
  {
    title: '[BD] Nuevas Reformas en el Código Civil 2024: Guía Completa',
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
    featured_image: 'https://images.pexels.com/photos/5668792/pexels-photo-5668792.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Civil',
    tags: ['Código Civil', 'Reformas 2024', 'Contratos Digitales'],
    views: 1247
  },
  {
    title: '[BD] Guía Completa para Constituir una Empresa en México 2024',
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
    featured_image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Mercantil',
    tags: ['Constitución', 'Empresas', 'S.A.S.', 'Trámites'],
    views: 2156
  },
  {
    title: '[BD] Derechos Laborales en Trabajo Remoto: Marco Legal 2024',
    excerpt: 'Análisis completo de los derechos y obligaciones en el trabajo a distancia según las nuevas regulaciones. Guía esencial para empleadores y trabajadores.',
    content: `El trabajo remoto se ha consolidado como una modalidad laboral permanente en México. Las nuevas regulaciones de 2024 establecen un marco legal claro para proteger tanto a trabajadores como empleadores en esta modalidad.

## Marco Legal del Trabajo Remoto

### Ley Federal del Trabajo - Reforma 2024
La reforma introduce el capítulo específico sobre trabajo a distancia que incluye:

- Definición legal del trabajo remoto
- Derechos específicos del teletrabajador
- Obligaciones del empleador
- Condiciones de seguridad y salud ocupacional

### Definición Legal
Se considera trabajo a distancia cuando:
- Se realiza más del 40% de la jornada fuera del centro de trabajo
- Se utiliza tecnología de la información
- No requiere presencia física constante

## Derechos del Trabajador Remoto

### 1. Derecho a la Desconexión Digital
- Respeto a horarios de descanso
- No atención de comunicaciones fuera del horario laboral
- Sanciones por violación del derecho

### 2. Equipamiento y Herramientas
- Provisión de equipos necesarios por parte del empleador
- Mantenimiento de herramientas de trabajo
- Reembolso de gastos de conectividad

### 3. Seguridad y Salud Ocupacional
- Condiciones ergonómicas adecuadas
- Capacitación en prevención de riesgos
- Derecho a inspecciones virtuales

## Obligaciones del Empleador

### Provisión de Equipos
El empleador debe proporcionar:
- Equipo de cómputo adecuado
- Software necesario para las funciones
- Mobiliario ergonómico básico
- Conexión a internet o compensación

### Política de Trabajo Remoto
Debe establecer:
- Horarios de trabajo claros
- Canales de comunicación oficiales
- Procedimientos de reporte
- Medidas de seguridad de la información

### Capacitación y Desarrollo
- Programas de capacitación virtual
- Inclusión en planes de desarrollo profesional
- Acceso igualitario a promociones

## Modalidades de Trabajo Remoto

### 1. Trabajo Remoto Total
- 100% de actividades fuera de la oficina
- Contrato específico de trabajo a distancia
- Evaluación por objetivos

### 2. Trabajo Híbrido
- Combinación de trabajo presencial y remoto
- Flexibilidad en días de trabajo en casa
- Coordinación con equipos presenciales

### 3. Trabajo Remoto Ocasional
- Situaciones excepcionales o temporales
- Autorización específica del empleador
- Mantenimiento de condiciones laborales

## Aspectos Fiscales

### Para el Trabajador
- Deducibilidad de gastos de trabajo en casa
- Comprobación de gastos de conectividad
- Registro de actividades laborales

### Para el Empleador
- Deducción de equipos proporcionados
- Gastos de capacitación virtual
- Inversión en tecnología empresarial

## Resolución de Conflictos

### Jurisdicción
- Competencia del lugar donde se prestan los servicios
- Aplicación de la ley mexicana
- Procedimientos conciliatorios virtuales

### Inspecciones Laborales
- Inspecciones virtuales permitidas
- Verificación de condiciones de trabajo
- Colaboración del trabajador requerida

## Implementación Práctica

### Para Empleadores
1. **Desarrollo de Políticas**: Crear políticas claras de trabajo remoto
2. **Inversión en Tecnología**: Asegurar infraestructura adecuada
3. **Capacitación**: Entrenar a managers en gestión remota
4. **Medición de Productividad**: Implementar sistemas de evaluación por resultados

### Para Trabajadores
1. **Espacio de Trabajo**: Acondicionar área de trabajo en casa
2. **Disciplina Horaria**: Mantener horarios regulares
3. **Comunicación Efectiva**: Usar herramientas de colaboración
4. **Desarrollo Profesional**: Participar activamente en capacitaciones

## Beneficios del Marco Legal

### Para Trabajadores
- Mayor flexibilidad laboral
- Reducción de tiempo de traslado
- Mejor balance vida-trabajo
- Protección legal específica

### Para Empleadores
- Reducción de costos operativos
- Acceso a talento en cualquier ubicación
- Mayor productividad en muchos casos
- Cumplimiento legal claro

## Recomendaciones Legales

1. **Contratos Específicos**: Elaborar contratos que contemplen modalidad remota
2. **Políticas Internas**: Desarrollar reglamentos internos específicos
3. **Documentación**: Mantener registro de equipos y gastos
4. **Asesoría Legal**: Consultar especialistas para implementación

La regulación del trabajo remoto en México marca un hito importante en la modernización laboral. Su correcta implementación beneficia tanto a trabajadores como empleadores, estableciendo un marco de confianza y productividad.`,
    featured_image: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Derecho Laboral',
    tags: ['Trabajo Remoto', 'Derechos Laborales', 'Reforma 2024', 'Teletrabajo'],
    views: 1893
  }
];

async function seedBlogPosts() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Iniciando seed de blog posts...');

    // Obtener el ID del usuario administrador
    const adminResult = await client.query(
      'SELECT id FROM users WHERE role = $1 ORDER BY created_at ASC LIMIT 1',
      ['administrador']
    );
    
    if (adminResult.rows.length === 0) {
      throw new Error('No se encontró usuario administrador. Ejecuta primero create-admin.js');
    }
    
    const adminId = adminResult.rows[0].id;
    console.log('👨‍💼 Usuario admin encontrado:', adminId);

    // Limpiar blog posts existentes (opcional)
    await client.query('TRUNCATE blog_posts RESTART IDENTITY CASCADE');
    console.log('🗑️ Blog posts existentes eliminados');

    // Insertar cada blog post
    for (const post of blogPosts) {
      const slug = generateSlug(post.title);
      const readingTime = calculateReadTime(post.content);
      const publishedAt = new Date().toISOString();
      
      const result = await client.query(`
        INSERT INTO blog_posts (
          author_id, title, slug, excerpt, content, featured_image, 
          category, tags, status, views, reading_time, meta_title, 
          meta_description, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, title, slug
      `, [
        adminId,
        post.title,
        slug,
        post.excerpt,
        post.content,
        post.featured_image,
        post.category,
        post.tags,
        'publicado', // status
        post.views,
        readingTime,
        post.title, // meta_title
        post.excerpt, // meta_description
        publishedAt
      ]);
      
      const inserted = result.rows[0];
      console.log(`✅ Creado: ${inserted.title} (${inserted.slug})`);
    }

    console.log('🎉 Seed de blog posts completado exitosamente');
    console.log(`📊 Total de artículos creados: ${blogPosts.length}`);
    
    // Mostrar estadísticas
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'publicado') as publicados,
        COUNT(*) FILTER (WHERE status = 'borrador') as borradores
      FROM blog_posts
    `);
    
    console.log('📈 Estadísticas de blog:');
    console.log(`   Total: ${stats.rows[0].total}`);
    console.log(`   Publicados: ${stats.rows[0].publicados}`);
    console.log(`   Borradores: ${stats.rows[0].borradores}`);

  } catch (error) {
    console.error('💥 Error durante el seed:', error.message);
    console.error('📋 Detalles:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
seedBlogPosts().then(() => {
  console.log('🏁 Script completado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});