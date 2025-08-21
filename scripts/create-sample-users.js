const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: '167.235.20.41',
  port: 5432,
  database: 'lexconnectdb',
  user: 'postgres',
  password: 'AgroCursos2025',
  ssl: false
};

const pool = new Pool(dbConfig);

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createSampleUsers() {
  const dbClient = await pool.connect();
  
  try {
    await dbClient.query('BEGIN');

    console.log('🔄 Creando usuarios de prueba...');

    // Hash password for all test users
    const hashedPassword = await hashPassword('password123');

    // Sample clients
    const clients = [
      {
        email: 'maria.garcia@email.com',
        first_name: 'María',
        last_name: 'García',
        phone: '+52 555 123 4567',
        role: 'cliente'
      },
      {
        email: 'carlos.lopez@email.com',
        first_name: 'Carlos',
        last_name: 'López',
        phone: '+52 555 234 5678',
        role: 'cliente'
      },
      {
        email: 'ana.martinez@email.com',
        first_name: 'Ana',
        last_name: 'Martínez',
        phone: '+52 555 345 6789',
        role: 'cliente'
      }
    ];

    // Sample lawyers
    const lawyers = [
      {
        email: 'dra.gonzalez@lexconnect.mx',
        first_name: 'María',
        last_name: 'González',
        phone: '+52 555 111 2222',
        role: 'abogado'
      },
      {
        email: 'lic.ruiz@lexconnect.mx',
        first_name: 'Carlos',
        last_name: 'Ruiz',
        phone: '+52 555 333 4444',
        role: 'abogado'
      },
      {
        email: 'dr.martin@lexconnect.mx',
        first_name: 'Roberto',
        last_name: 'Martín',
        phone: '+52 555 555 6666',
        role: 'abogado'
      },
      {
        email: 'lic.herrera@lexconnect.mx',
        first_name: 'Ana',
        last_name: 'Herrera',
        phone: '+52 555 777 8888',
        role: 'abogado'
      },
      {
        email: 'dr.fernandez@lexconnect.mx',
        first_name: 'Luis',
        last_name: 'Fernández',
        phone: '+52 555 999 0000',
        role: 'abogado'
      }
    ];

    // Create clients
    console.log('👥 Creando clientes...');
    const clientIds = [];
    for (const clientData of clients) {
      const result = await dbClient.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id
      `, [
        clientData.email,
        hashedPassword,
        clientData.first_name,
        clientData.last_name,
        clientData.phone,
        clientData.role
      ]);
      clientIds.push(result.rows[0].id);
      console.log(`✅ Cliente creado: ${clientData.first_name} ${clientData.last_name}`);
    }

    // Create lawyers
    console.log('⚖️ Creando abogados...');
    const lawyerUserIds = [];
    for (const lawyerData of lawyers) {
      const result = await dbClient.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id
      `, [
        lawyerData.email,
        hashedPassword,
        lawyerData.first_name,
        lawyerData.last_name,
        lawyerData.phone,
        lawyerData.role
      ]);
      lawyerUserIds.push(result.rows[0].id);
      console.log(`✅ Abogado creado: ${lawyerData.first_name} ${lawyerData.last_name}`);
    }

    // Get legal specialties
    const specialtiesResult = await dbClient.query('SELECT id, name FROM legal_specialties ORDER BY name');
    const specialties = specialtiesResult.rows;

    // Create lawyer profiles
    console.log('📋 Creando perfiles de abogados...');
    const lawyerProfiles = [
      {
        user_id: lawyerUserIds[0],
        license_number: 'LIC-001-2020',
        bar_association: 'Colegio de Abogados de México',
        years_experience: 15,
        education: 'Licenciatura en Derecho - UNAM, Maestría en Derecho Civil',
        bio: 'Especialista en derecho civil con más de 15 años de experiencia. Experta en contratos, sucesiones y responsabilidad civil.',
        hourly_rate: 800.00,
        consultation_rate: 200.00,
        office_address: 'Av. Reforma 123, Col. Centro, Ciudad de México',
        languages: 'Español, Inglés',
        availability_schedule: {
          monday: [{ start: '09:00', end: '18:00' }],
          tuesday: [{ start: '09:00', end: '18:00' }],
          wednesday: [{ start: '09:00', end: '18:00' }],
          thursday: [{ start: '09:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '17:00' }]
        },
        specialties: ['Derecho Civil']
      },
      {
        user_id: lawyerUserIds[1],
        license_number: 'LIC-002-2018',
        bar_association: 'Barra de Abogados Mexicana',
        years_experience: 12,
        education: 'Licenciatura en Derecho - ITAM, Especialidad en Derecho Penal',
        bio: 'Abogado penalista con amplia experiencia en defensa de casos complejos. Especialista en procedimiento penal acusatorio.',
        hourly_rate: 900.00,
        consultation_rate: 350.00,
        office_address: 'Insurgentes Sur 456, Col. Roma Norte, Ciudad de México',
        languages: 'Español',
        availability_schedule: {
          monday: [{ start: '10:00', end: '19:00' }],
          tuesday: [{ start: '10:00', end: '19:00' }],
          wednesday: [{ start: '10:00', end: '19:00' }],
          thursday: [{ start: '10:00', end: '19:00' }],
          friday: [{ start: '10:00', end: '18:00' }]
        },
        specialties: ['Derecho Penal']
      },
      {
        user_id: lawyerUserIds[2],
        license_number: 'LIC-003-2015',
        bar_association: 'Colegio Nacional de Abogados',
        years_experience: 18,
        education: 'Licenciatura en Derecho - UP, Maestría en Derecho Corporativo',
        bio: 'Experto en derecho mercantil y corporativo. Especialista en constitución de empresas y fusiones.',
        hourly_rate: 1200.00,
        consultation_rate: 500.00,
        office_address: 'Polanco 789, Col. Polanco, Ciudad de México',
        languages: 'Español, Inglés, Francés',
        availability_schedule: {
          monday: [{ start: '08:00', end: '18:00' }],
          tuesday: [{ start: '08:00', end: '18:00' }],
          wednesday: [{ start: '08:00', end: '18:00' }],
          thursday: [{ start: '08:00', end: '18:00' }],
          friday: [{ start: '08:00', end: '16:00' }]
        },
        specialties: ['Derecho Mercantil']
      },
      {
        user_id: lawyerUserIds[3],
        license_number: 'LIC-004-2019',
        bar_association: 'Colegio de Abogados de México',
        years_experience: 8,
        education: 'Licenciatura en Derecho - UNAM, Especialidad en Derecho Inmobiliario',
        bio: 'Abogada especialista en derecho inmobiliario y urbanístico. Experta en contratos de compraventa y arrendamiento.',
        hourly_rate: 700.00,
        consultation_rate: 180.00,
        office_address: 'Santa Fe 321, Col. Santa Fe, Ciudad de México',
        languages: 'Español, Inglés',
        availability_schedule: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '15:00' }]
        },
        specialties: ['Derecho Inmobiliario']
      },
      {
        user_id: lawyerUserIds[4],
        license_number: 'LIC-005-2017',
        bar_association: 'Barra de Abogados Mexicana',
        years_experience: 20,
        education: 'Licenciatura en Derecho - UAM, Maestría en Derecho Laboral',
        bio: 'Especialista en derecho laboral con más de 20 años de experiencia. Experto en conflictos laborales y despidos.',
        hourly_rate: 850.00,
        consultation_rate: 280.00,
        office_address: 'Doctores 654, Col. Doctores, Ciudad de México',
        languages: 'Español',
        availability_schedule: {
          monday: [{ start: '08:30', end: '17:30' }],
          tuesday: [{ start: '08:30', end: '17:30' }],
          wednesday: [{ start: '08:30', end: '17:30' }],
          thursday: [{ start: '08:30', end: '17:30' }],
          friday: [{ start: '08:30', end: '16:30' }]
        },
        specialties: ['Derecho Laboral']
      }
    ];

    const lawyerProfileIds = [];
    for (let i = 0; i < lawyerProfiles.length; i++) {
      const profile = lawyerProfiles[i];
      
      const result = await dbClient.query(`
        INSERT INTO lawyer_profiles (
          user_id, license_number, bar_association, years_experience,
          education, bio, hourly_rate, consultation_rate, office_address,
          languages, availability_schedule, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        RETURNING id
      `, [
        profile.user_id,
        profile.license_number,
        profile.bar_association,
        profile.years_experience,
        profile.education,
        profile.bio,
        profile.hourly_rate,
        profile.consultation_rate,
        profile.office_address,
        profile.languages,
        JSON.stringify(profile.availability_schedule)
      ]);

      const lawyerProfileId = result.rows[0].id;
      lawyerProfileIds.push(lawyerProfileId);

      // Add specialties
      for (const specialtyName of profile.specialties) {
        const specialty = specialties.find(s => s.name === specialtyName);
        if (specialty) {
          await dbClient.query(`
            INSERT INTO lawyer_specialties (lawyer_id, specialty_id)
            VALUES ($1, $2)
          `, [lawyerProfileId, specialty.id]);
        }
      }

      console.log(`✅ Perfil de abogado creado: ${lawyers[i].first_name} ${lawyers[i].last_name}`);
    }

    // Create sample services for each lawyer
    console.log('🛠️ Creando servicios de abogados...');
    const services = [
      // Services for María González (Civil)
      [
        {
          title: 'Consulta Legal - Derecho Civil',
          description: 'Asesoría especializada en casos de derecho civil, contratos y disputas.',
          price: 200.00,
          duration_minutes: 60,
          service_type: 'consultation'
        },
        {
          title: 'Revisión de Contratos',
          description: 'Análisis detallado y revisión de contratos civiles y comerciales.',
          price: 150.00,
          duration_minutes: 45,
          service_type: 'document_review'
        }
      ],
      // Services for Carlos Ruiz (Penal)
      [
        {
          title: 'Defensa Penal Especializada',
          description: 'Representación legal en casos penales con amplia experiencia en tribunales.',
          price: 350.00,
          duration_minutes: 90,
          service_type: 'consultation'
        },
        {
          title: 'Asesoría en Procedimiento Penal',
          description: 'Orientación legal en procedimientos penales y derechos del imputado.',
          price: 250.00,
          duration_minutes: 60,
          service_type: 'consultation'
        }
      ],
      // Services for Roberto Martín (Mercantil)
      [
        {
          title: 'Constitución de Empresas',
          description: 'Servicio completo para la creación y registro de sociedades comerciales.',
          price: 500.00,
          duration_minutes: 120,
          service_type: 'representation'
        },
        {
          title: 'Consultoría Corporativa',
          description: 'Asesoría integral en derecho corporativo y fusiones.',
          price: 800.00,
          duration_minutes: 90,
          service_type: 'consultation'
        }
      ],
      // Services for Ana Herrera (Inmobiliario)
      [
        {
          title: 'Asesoría Inmobiliaria',
          description: 'Revisión de contratos de compraventa y arrendamiento de propiedades.',
          price: 180.00,
          duration_minutes: 45,
          service_type: 'document_review'
        },
        {
          title: 'Trámites de Escrituración',
          description: 'Apoyo integral en procesos de escrituración de propiedades.',
          price: 400.00,
          duration_minutes: 75,
          service_type: 'representation'
        }
      ],
      // Services for Luis Fernández (Laboral)
      [
        {
          title: 'Derecho Laboral y Despidos',
          description: 'Defensa de derechos laborales y representación en casos de despido.',
          price: 280.00,
          duration_minutes: 75,
          service_type: 'consultation'
        },
        {
          title: 'Revisión de Contratos Laborales',
          description: 'Análisis de contratos de trabajo y relaciones laborales.',
          price: 200.00,
          duration_minutes: 60,
          service_type: 'document_review'
        }
      ]
    ];

    for (let i = 0; i < lawyerProfileIds.length; i++) {
      const lawyerServices = services[i];
      for (const service of lawyerServices) {
        await dbClient.query(`
          INSERT INTO lawyer_services (
            lawyer_id, title, description, price, duration_minutes, service_type
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          lawyerProfileIds[i],
          service.title,
          service.description,
          service.price,
          service.duration_minutes,
          service.service_type
        ]);
      }
      console.log(`✅ Servicios creados para abogado ${i + 1}`);
    }

    await dbClient.query('COMMIT');
    console.log('🎉 ¡Usuarios de prueba creados exitosamente!');
    
    console.log('\n📋 RESUMEN DE USUARIOS CREADOS:');
    console.log('\n👥 CLIENTES (password: password123):');
    clients.forEach(client => {
      console.log(`   • ${client.first_name} ${client.last_name} - ${client.email}`);
    });
    
    console.log('\n⚖️ ABOGADOS (password: password123):');
    lawyers.forEach(lawyer => {
      console.log(`   • ${lawyer.first_name} ${lawyer.last_name} - ${lawyer.email}`);
    });
    
    console.log('\n🔑 ADMINISTRADOR:');
    console.log('   • Administrador Sistema - admin@lexconnect.mx (password: admin123)');

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('❌ Error creando usuarios de prueba:', error);
  } finally {
    dbClient.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createSampleUsers()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

module.exports = { createSampleUsers };