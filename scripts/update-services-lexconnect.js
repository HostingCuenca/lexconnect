// Script para actualizar servicios de LexConnect con tarifario real
// Solo actualiza servicios, mantiene todas las demás funcionalidades intactas

const path = require('path');
const bcrypt = require('bcryptjs');

// Ajustar path para importar desde el directorio correcto
const { getPool, withTransaction } = require(path.join(__dirname, '..', 'lib', 'database.ts').replace('.ts', '.js'));

async function updateLexConnectServices() {
  console.log('🚀 Iniciando actualización de servicios LexConnect...');
  
  try {
    await withTransaction(async (client) => {
      
      // 1. CREAR USUARIO "EQUIPO LEXCONNECT" (si no existe)
      console.log('👥 Creando usuario Equipo LexConnect...');
      
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['equipo@lexconnect.mx']
      );
      
      let userId;
      if (existingUser.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('lexconnect2025', 12);
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, ['equipo@lexconnect.mx', hashedPassword, 'Equipo', 'LexConnect', 'abogado', true, true]);
        
        userId = userResult.rows[0].id;
        console.log('✅ Usuario creado:', userId);
      } else {
        userId = existingUser.rows[0].id;
        console.log('✅ Usuario ya existe:', userId);
      }

      // 2. CREAR PERFIL DE ABOGADO (si no existe)
      console.log('👨‍💼 Creando perfil de abogado...');
      
      const existingProfile = await client.query(
        'SELECT id FROM lawyer_profiles WHERE user_id = $1',
        [userId]
      );
      
      let lawyerId;
      if (existingProfile.rows.length === 0) {
        const profileResult = await client.query(`
          INSERT INTO lawyer_profiles (
            user_id, license_number, bar_association, years_experience,
            education, bio, hourly_rate, consultation_rate, is_verified,
            office_address, languages, rating, total_reviews, total_consultations
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id
        `, [
          userId,
          'LEX-TEAM-2025',
          'Colegio de Abogados del Ecuador',
          10,
          'Equipo multidisciplinario con especialización en múltiples ramas del derecho',
          'LexConnect es un equipo de abogados especializados que ofrece servicios legales integrales en todas las áreas del derecho, con tarifas transparentes y atención personalizada.',
          100.00, // hourly_rate
          30.00,  // consultation_rate  
          true,   // is_verified
          'Ecuador - Servicios virtuales y presenciales disponibles',
          'Español',
          5.00,   // rating perfecto inicial
          0,      // total_reviews
          0       // total_consultations
        ]);
        
        lawyerId = profileResult.rows[0].id;
        console.log('✅ Perfil de abogado creado:', lawyerId);
      } else {
        lawyerId = existingProfile.rows[0].id;
        console.log('✅ Perfil ya existe:', lawyerId);
      }

      // 3. AGREGAR ESPECIALIDAD "DERECHO DE TRÁNSITO" (si no existe)
      console.log('🚗 Agregando especialidad Derecho de Tránsito...');
      
      await client.query(`
        INSERT INTO legal_specialties (name, description, icon, is_active)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [
        'Derecho de Tránsito',
        'Infracciones de tránsito, impugnación de multas, licencias de conducir',
        'Car',
        true
      ]);

      // 4. OBTENER IDs DE ESPECIALIDADES
      console.log('🏷️ Obteniendo IDs de especialidades...');
      
      const specialties = await client.query(`
        SELECT name, id FROM legal_specialties WHERE is_active = true
      `);
      
      const specialtyMap = {};
      specialties.rows.forEach(row => {
        specialtyMap[row.name] = row.id;
      });

      // 5. ASIGNAR TODAS LAS ESPECIALIDADES AL ABOGADO
      console.log('🎯 Asignando especialidades al abogado...');
      
      // Limpiar especialidades existentes
      await client.query('DELETE FROM lawyer_specialties WHERE lawyer_id = $1', [lawyerId]);
      
      // Agregar todas las especialidades
      for (const specialtyId of Object.values(specialtyMap)) {
        await client.query(`
          INSERT INTO lawyer_specialties (lawyer_id, specialty_id)
          VALUES ($1, $2)
        `, [lawyerId, specialtyId]);
      }

      // 6. LIMPIAR TODOS LOS SERVICIOS EXISTENTES
      console.log('🧹 Limpiando servicios existentes...');
      await client.query('DELETE FROM lawyer_services');

      // 7. INSERTAR LOS 42 SERVICIOS REALES
      console.log('📋 Insertando servicios reales de LexConnect...');
      
      const services = [
        // PROPIEDAD INTELECTUAL
        {
          title: 'Registro de Marca',
          description: 'Registro completo de marca ante SENADI, incluye búsqueda de antecedentes y tramitación',
          price: 400.00,
          duration_minutes: 120,
          service_type: 'registro',
          requirements: 'Documento de identidad, logo o nombre a registrar, especificación de productos/servicios',
          deliverables: 'Certificado de registro de marca, expediente completo'
        },
        {
          title: 'Registro de Nombre Comercial',
          description: 'Registro de nombre comercial para identificación de establecimiento o empresa',
          price: 400.00,
          duration_minutes: 90,
          service_type: 'registro',
          requirements: 'RUC vigente, documento de identidad, nombre comercial propuesto',
          deliverables: 'Certificado de registro de nombre comercial'
        },
        {
          title: 'Renovación de Marca',
          description: 'Renovación de marca registrada por 10 años adicionales',
          price: 300.00,
          duration_minutes: 60,
          service_type: 'renovacion',
          requirements: 'Certificado de marca vigente, documento de identidad',
          deliverables: 'Certificado de renovación de marca'
        },
        {
          title: 'Oposición a Solicitud de Marca',
          description: 'Presentación de oposición a solicitud de registro de marca de terceros',
          price: 300.00,
          duration_minutes: 90,
          service_type: 'oposicion',
          requirements: 'Documentos que sustenten el derecho, certificados de marcas propias',
          deliverables: 'Escrito de oposición presentado, seguimiento del proceso'
        },
        {
          title: 'Acciones Administrativas ante SENADI',
          description: 'Quejas y acciones administrativas por uso indebido de marca o violación de derechos',
          price: 400.00,
          duration_minutes: 120,
          service_type: 'accion_administrativa',
          requirements: 'Evidencias de violación, certificados de marca, documentación del caso',
          deliverables: 'Acción administrativa presentada, seguimiento del proceso'
        },
        {
          title: 'Búsqueda Fonética y Viabilidad de Marca',
          description: 'Análisis de viabilidad de registro y búsqueda de marcas similares',
          price: 50.00,
          duration_minutes: 30,
          service_type: 'consulta',
          requirements: 'Nombre o logo propuesto, especificación de clase',
          deliverables: 'Reporte de búsqueda fonética y recomendaciones'
        },
        {
          title: 'Contratos de Licencia de Uso de Marca',
          description: 'Elaboración de contratos para licenciar uso de marca a terceros',
          price: 100.00,
          duration_minutes: 60,
          service_type: 'contrato',
          requirements: 'Certificado de marca, datos de licenciatario, términos de licencia',
          deliverables: 'Contrato de licencia de marca legalizado'
        },
        {
          title: 'Registro de Derechos de Autor',
          description: 'Registro de obras literarias, software, logos y creaciones intelectuales',
          price: 1750.00,
          duration_minutes: 180,
          service_type: 'registro',
          requirements: 'Obra original, documento de identidad, descripción detallada',
          deliverables: 'Certificado de registro de derechos de autor'
        },

        // DERECHO CIVIL
        {
          title: 'Prescripción Adquisitiva Extraordinaria (Usucapión)',
          description: 'Juicio para adquirir dominio de bien inmueble por posesión',
          price: 1000.00,
          duration_minutes: 240,
          service_type: 'juicio',
          requirements: 'Documentos de posesión, certificados de no tener escrituras, testigos',
          deliverables: 'Sentencia de prescripción adquisitiva, inscripción en Registro'
        },
        {
          title: 'Juicio de Inquilinato (Desahucio)',
          description: 'Desahucio por falta de pago o terminación de contrato de arrendamiento',
          price: 250.00,
          duration_minutes: 120,
          service_type: 'juicio',
          requirements: 'Contrato de arrendamiento, comprobantes de falta de pago',
          deliverables: 'Sentencia de desahucio, lanzamiento si es necesario'
        },
        {
          title: 'Contratos Civiles (Compraventa, Arrendamiento)',
          description: 'Elaboración de contratos civiles de compraventa, arrendamiento, comodato',
          price: 100.00,
          duration_minutes: 60,
          service_type: 'contrato',
          requirements: 'Datos de las partes, objeto del contrato, términos específicos',
          deliverables: 'Contrato civil legalizado y registrado si corresponde'
        },
        {
          title: 'Sucesiones (Declaratoria de Herederos)',
          description: 'Proceso sucesoral para declaratoria de herederos y partición de herencia',
          price: 500.00,
          duration_minutes: 180,
          service_type: 'juicio',
          requirements: 'Certificado de defunción, documentos del causante, herederos',
          deliverables: 'Auto de declaratoria de herederos, partición de bienes'
        },

        // DERECHO FAMILIAR
        {
          title: 'Divorcio por Mutuo Acuerdo',
          description: 'Divorcio consensual con y sin hijos menores de edad',
          price: 250.00,
          duration_minutes: 90,
          service_type: 'juicio',
          requirements: 'Acta de matrimonio, cédulas, acuerdo de separación',
          deliverables: 'Sentencia de divorcio ejecutoriada'
        },
        {
          title: 'Divorcio Contencioso',
          description: 'Juicio de divorcio por causal cuando no hay acuerdo',
          price: 500.00,
          duration_minutes: 180,
          service_type: 'juicio',
          requirements: 'Acta de matrimonio, pruebas de la causal invocada',
          deliverables: 'Sentencia de divorcio, liquidación sociedad conyugal'
        },
        {
          title: 'Juicio de Alimentos (Fijación/Aumento)',
          description: 'Fijación, aumento o rebaja de pensión alimenticia',
          price: 500.00,
          duration_minutes: 150,
          service_type: 'juicio',
          requirements: 'Documentos que prueben ingresos, gastos del alimentado',
          deliverables: 'Resolución de pensión alimenticia'
        },
        {
          title: 'Tenencia y Régimen de Visitas',
          description: 'Determinación de tenencia de menores y régimen de visitas',
          price: 450.00,
          duration_minutes: 150,
          service_type: 'juicio',
          requirements: 'Acta de nacimiento, documentos sobre bienestar del menor',
          deliverables: 'Resolución de tenencia y régimen de visitas'
        },
        {
          title: 'Impugnación de Paternidad',
          description: 'Impugnación de paternidad con pruebas de ADN',
          price: 1000.00,
          duration_minutes: 240,
          service_type: 'juicio',
          requirements: 'Acta de nacimiento, documentos médicos, prueba de ADN',
          deliverables: 'Sentencia de impugnación de paternidad'
        },

        // DERECHO DE TRÁNSITO
        {
          title: 'Impugnación de Multas de Tránsito',
          description: 'Impugnación administrativa de multas de tránsito',
          price: 30.00,
          duration_minutes: 30,
          service_type: 'impugnacion',
          requirements: 'Citación de la multa, licencia de conducir, documentos del vehículo',
          deliverables: 'Recurso de impugnación presentado, seguimiento'
        },

        // DERECHO PENAL
        {
          title: 'Asesoría en Versiones e Investigaciones',
          description: 'Acompañamiento y asesoría durante versiones en investigaciones previas',
          price: 100.00,
          duration_minutes: 60,
          service_type: 'asesoria',
          requirements: 'Citación fiscal, documentos del caso',
          deliverables: 'Asesoría especializada, acompañamiento en diligencias'
        },
        {
          title: 'Patrocinio en Audiencias de Flagrancia',
          description: 'Defensa técnica en audiencias de calificación de flagrancia',
          price: 400.00,
          duration_minutes: 120,
          service_type: 'patrocinio',
          requirements: 'Documentos del detenido, parte policial',
          deliverables: 'Defensa en audiencia, solicitud de medidas alternativas'
        },
        {
          title: 'Presentación de Denuncias',
          description: 'Presentación de denuncias penales ante Fiscalía',
          price: 150.00,
          duration_minutes: 60,
          service_type: 'denuncia',
          requirements: 'Evidencias del delito, documentos de identidad',
          deliverables: 'Denuncia formal presentada, número de caso'
        },
        {
          title: 'Defensa en Contravenciones',
          description: 'Defensa técnica en procesos por contravenciones penales',
          price: 800.00,
          duration_minutes: 180,
          service_type: 'defensa',
          requirements: 'Citación, documentos del proceso',
          deliverables: 'Defensa técnica completa, alegatos'
        },
        {
          title: 'Medidas Cautelares y Prisión Preventiva',
          description: 'Solicitud o revisión de medidas cautelares (precio según complejidad)',
          price: 0.00,
          duration_minutes: 120,
          service_type: 'medidas',
          requirements: 'Expediente penal, documentos de arraigo',
          deliverables: 'Solicitud de medidas, audiencia de revisión'
        },

        // DERECHO LABORAL
        {
          title: 'Visto Bueno (Empleador y Trabajador)',
          description: 'Tramitación de visto bueno para terminación de contrato laboral',
          price: 400.00,
          duration_minutes: 90,
          service_type: 'tramite',
          requirements: 'Contrato de trabajo, documentos que justifiquen la causa',
          deliverables: 'Resolución de visto bueno del Inspector de Trabajo'
        },
        {
          title: 'Despido Intempestivo',
          description: 'Cálculo e impugnación de despido intempestivo (incluye fee de éxito 10%)',
          price: 500.00,
          duration_minutes: 150,
          service_type: 'juicio',
          requirements: 'Contrato de trabajo, roles de pago, documentos del despido',
          deliverables: 'Demanda laboral, liquidación de haberes'
        },
        {
          title: 'Contratos Individuales de Trabajo',
          description: 'Elaboración de contratos individuales de trabajo',
          price: 25.00,
          duration_minutes: 30,
          service_type: 'contrato',
          requirements: 'Datos del empleador y trabajador, condiciones laborales',
          deliverables: 'Contrato de trabajo legalizado'
        },
        {
          title: 'Reglamentos Internos de Trabajo',
          description: 'Elaboración de reglamentos internos de trabajo para empresas',
          price: 500.00,
          duration_minutes: 180,
          service_type: 'documento',
          requirements: 'Datos de la empresa, políticas internas deseadas',
          deliverables: 'Reglamento interno aprobado por Ministerio de Trabajo'
        },
        {
          title: 'Reclamaciones por Actas de Finiquito',
          description: 'Reclamación de valores en actas de finiquito (25% de lo recuperado)',
          price: 100.00,
          duration_minutes: 90,
          service_type: 'reclamacion',
          requirements: 'Acta de finiquito, contratos, roles de pago',
          deliverables: 'Reclamo administrativo o judicial'
        },
        {
          title: 'Juicios de Cobro de Haberes Laborales',
          description: 'Cobro judicial de haberes laborales (25% de lo recuperado)',
          price: 300.00,
          duration_minutes: 120,
          service_type: 'juicio',
          requirements: 'Contratos, roles de pago, documentos laborales',
          deliverables: 'Demanda laboral, ejecución de sentencia'
        },

        // DERECHO MERCANTIL
        {
          title: 'Cobro Ejecutivo de Pagaré a la Orden',
          description: 'Juicio ejecutivo para cobro de pagaré a la orden',
          price: 450.00,
          duration_minutes: 120,
          service_type: 'juicio',
          requirements: 'Pagaré original, documentos del deudor',
          deliverables: 'Sentencia ejecutiva, embargo de bienes'
        },
        {
          title: 'Cobro de Letra de Cambio',
          description: 'Juicio ejecutivo para cobro de letra de cambio',
          price: 450.00,
          duration_minutes: 120,
          service_type: 'juicio',
          requirements: 'Letra de cambio original, endosos',
          deliverables: 'Sentencia ejecutiva, cobro efectivo'
        },
        {
          title: 'Contratos Mercantiles',
          description: 'Contratos de distribución, suministro, franquicia y otros comerciales',
          price: 450.00,
          duration_minutes: 90,
          service_type: 'contrato',
          requirements: 'Datos de las partes, objeto del contrato, términos comerciales',
          deliverables: 'Contrato mercantil legalizado'
        },
        {
          title: 'Constitución de Compañías',
          description: 'Constitución de compañías limitadas, anónimas y otras formas societarias',
          price: 450.00,
          duration_minutes: 240,
          service_type: 'constitucion',
          requirements: 'Socios, capital, actividad económica, estatutos',
          deliverables: 'Escritura de constitución, RUC, permisos básicos'
        },
        {
          title: 'Reformas Estatutarias',
          description: 'Reformas de estatutos de compañías existentes',
          price: 450.00,
          duration_minutes: 120,
          service_type: 'reforma',
          requirements: 'Escritura vigente, acta de junta, reformas deseadas',
          deliverables: 'Escritura de reforma inscrita'
        },
        {
          title: 'Disolución y Liquidación de Compañías',
          description: 'Proceso completo de disolución y liquidación de sociedades',
          price: 450.00,
          duration_minutes: 180,
          service_type: 'disolucion',
          requirements: 'Documentos societarios, balances, inventarios',
          deliverables: 'Escritura de disolución, liquidación final'
        },
        {
          title: 'Recuperación de Cartera',
          description: 'Cobranza extrajudicial y judicial (10% de éxito)',
          price: 300.00,
          duration_minutes: 90,
          service_type: 'cobranza',
          requirements: 'Documentos de deuda, contratos, garantías',
          deliverables: 'Gestión de cobranza, demanda si es necesario'
        },

        // DERECHO TRIBUTARIO - Precios por consulta personalizada
        {
          title: 'Devolución de ISD',
          description: 'Trámite de devolución de Impuesto a la Salida de Divisas',
          price: 0.00,
          duration_minutes: 60,
          service_type: 'devolucion',
          requirements: 'Documentos de la operación, formularios ISD',
          deliverables: 'Solicitud de devolución, seguimiento'
        },
        {
          title: 'Reclamos Administrativos ante SRI',
          description: 'Presentación de reclamos administrativos tributarios',
          price: 0.00,
          duration_minutes: 90,
          service_type: 'reclamo',
          requirements: 'Notificaciones del SRI, documentos tributarios',
          deliverables: 'Reclamo administrativo presentado'
        },
        {
          title: 'Asesoría en Declaraciones Sustitutivas',
          description: 'Asesoría para presentación de declaraciones sustitutivas',
          price: 0.00,
          duration_minutes: 60,
          service_type: 'asesoria',
          requirements: 'Declaraciones originales, documentos soporte',
          deliverables: 'Declaración sustitutiva presentada'
        },
        {
          title: 'Impugnación de Glosas Tributarias',
          description: 'Impugnación de glosas y liquidaciones tributarias',
          price: 0.00,
          duration_minutes: 120,
          service_type: 'impugnacion',
          requirements: 'Acto administrativo, documentos contables',
          deliverables: 'Recurso de impugnación presentado'
        },
        {
          title: 'Revisión de Planillas de Retenciones',
          description: 'Revisión y corrección de planillas de retenciones',
          price: 0.00,
          duration_minutes: 30,
          service_type: 'revision',
          requirements: 'Planillas de retenciones, comprobantes',
          deliverables: 'Planillas revisadas y corregidas'
        },
        {
          title: 'Inscripción y Actualización de RUC',
          description: 'Tramitación de inscripción y actualización de RUC',
          price: 0.00,
          duration_minutes: 45,
          service_type: 'tramite',
          requirements: 'Documentos personales, actividad económica',
          deliverables: 'RUC actualizado, clave fiscal'
        },
        {
          title: 'Solicitud de Exoneraciones',
          description: 'Solicitud de exoneraciones por tercera edad o discapacidad',
          price: 0.00,
          duration_minutes: 60,
          service_type: 'tramite',
          requirements: 'Documentos médicos, cédula de discapacidad',
          deliverables: 'Solicitud de exoneración presentada'
        },

        // MOVILIDAD HUMANA
        {
          title: 'Tramitación de Visas',
          description: 'Tramitación completa de visas de residencia y trabajo',
          price: 650.00,
          duration_minutes: 120,
          service_type: 'visa',
          requirements: 'Pasaporte, documentos del país de origen, antecedentes penales',
          deliverables: 'Visa aprobada, cédula de extranjería'
        },

        // SERVICIOS TRANSVERSALES
        {
          title: 'Consultas Jurídicas Rápidas (30 min)',
          description: 'Consultas jurídicas en línea de 30 minutos',
          price: 30.00,
          duration_minutes: 30,
          service_type: 'consulta',
          requirements: 'Descripción del caso, documentos relevantes',
          deliverables: 'Asesoría jurídica especializada, recomendaciones'
        },
        {
          title: 'Redacción y Revisión de Contratos',
          description: 'Redacción y revisión de contratos en general',
          price: 30.00,
          duration_minutes: 45,
          service_type: 'revision',
          requirements: 'Tipo de contrato, datos de las partes',
          deliverables: 'Contrato redactado o revisado'
        },
        {
          title: 'Mediaciones Privadas',
          description: 'Acompañamiento en acuerdos extrajudiciales y mediaciones',
          price: 100.00,
          duration_minutes: 120,
          service_type: 'mediacion',
          requirements: 'Documentos del conflicto, partes involucradas',
          deliverables: 'Acta de mediación, acuerdo firmado'
        },
        {
          title: 'Eliminación de Antecedentes Penales',
          description: 'Tramitación de eliminación de antecedentes penales',
          price: 150.00,
          duration_minutes: 60,
          service_type: 'tramite',
          requirements: 'Certificado de antecedentes, documentos personales',
          deliverables: 'Certificado de antecedentes limpio'
        }
      ];

      console.log(`📝 Insertando ${services.length} servicios...`);

      for (const service of services) {
        await client.query(`
          INSERT INTO lawyer_services (
            lawyer_id, title, description, price, duration_minutes,
            service_type, status, requirements, deliverables
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          lawyerId,
          service.title,
          service.description,
          service.price,
          service.duration_minutes,
          service.service_type,
          'activo',
          service.requirements,
          service.deliverables
        ]);
      }

      console.log('✅ Todos los servicios insertados correctamente');
      
      // Estadísticas finales
      const stats = await client.query(`
        SELECT 
          COUNT(*) as total_servicios,
          MIN(price) as precio_minimo,
          MAX(price) as precio_maximo,
          AVG(price) as precio_promedio
        FROM lawyer_services 
        WHERE lawyer_id = $1
      `, [lawyerId]);

      console.log('📊 Estadísticas finales:');
      console.log(`   Total servicios: ${stats.rows[0].total_servicios}`);
      console.log(`   Precio mínimo: $${stats.rows[0].precio_minimo}`);
      console.log(`   Precio máximo: $${stats.rows[0].precio_maximo}`);
      console.log(`   Precio promedio: $${Number(stats.rows[0].precio_promedio).toFixed(2)}`);

    });

    console.log('🎉 ¡Actualización de servicios LexConnect completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateLexConnectServices()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { updateLexConnectServices };