const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const pool = new Pool({
  host: '167.235.20.41',
  port: 5432,
  database: 'lexconnectdb',
  user: 'postgres',
  password: 'AgroCursos2025',
  ssl: false
});

async function createAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creando usuario administrador...');

    // Credenciales del administrador principal
    const adminEmail = 'lexconnectadmin@lexconnect.mx';
    const adminPassword = 'admin123';

    // Verificar si el admin ya existe
    const existingAdmin = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('❌ El usuario administrador ya existe');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Crear usuario administrador
    const result = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      adminEmail,
      hashedPassword,
      'Administrador',
      'Sistema',
      'administrador',
      '+52 800 123 4567',
      true,
      true
    ]);

    const newAdmin = result.rows[0];

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 ID:', newAdmin.id);
    console.log('📅 Creado:', newAdmin.created_at);
    
    console.log('\n🚨 IMPORTANTE: Cambia esta contraseña después del primer login');

  } catch (error) {
    console.error('💥 Error creando administrador:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
createAdmin().then(() => {
  console.log('🏁 Script completado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});