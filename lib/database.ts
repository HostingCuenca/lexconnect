import 'server-only';
import { Pool, PoolClient } from 'pg';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || '167.235.20.41',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lexconnectdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'AgroCursos2025',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Conexiones limitadas
  min: 1,  // Una conexión mínima
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de conexiones global
let pool: Pool | null = null;
let isInitializing = false;

// Función para obtener el pool de conexiones
export function getPool(): Pool {
  if (!pool && !isInitializing) {
    isInitializing = true;
    try {
      pool = new Pool(dbConfig);
      
      // Manejar errores del pool
      pool.on('error', (err) => {
        console.error('Error en el pool de PostgreSQL:', err);
        // Reiniciar pool en caso de error crítico
        if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
          console.log('Reiniciando pool de conexiones...');
          pool = null;
        }
      });

      // Manejar conexiones perdidas
      pool.on('connect', () => {
        console.log('Nueva conexión establecida con PostgreSQL');
      });

      // Manejar desconexiones
      pool.on('remove', () => {
        console.log('Conexión removida del pool');
      });
      
    } catch (error) {
      console.error('Error inicializando pool:', error);
      pool = null;
    } finally {
      isInitializing = false;
    }
  }
  
  if (!pool) {
    throw new Error('No se pudo establecer conexión con la base de datos');
  }
  
  return pool;
}

// Función para ejecutar queries
export async function query(text: string, params?: any[]): Promise<any> {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
}

// Función para obtener un cliente específico (para transacciones)
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

// Función para cerrar el pool de conexiones
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Función para probar la conexión
export async function testConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  details?: any 
}> {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    return {
      success: true,
      message: 'Conexión exitosa a PostgreSQL',
      details: {
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version,
        database: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error al conectar con PostgreSQL',
      details: {
        error: error.message,
        code: error.code,
        host: dbConfig.host,
        database: dbConfig.database
      }
    };
  }
}

// Función para verificar si las tablas existen
export async function checkTables(): Promise<{
  success: boolean;
  tables: string[];
  message: string;
}> {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = result.rows.map((row: any) => row.table_name);
    
    return {
      success: true,
      tables,
      message: `Se encontraron ${tables.length} tablas en la base de datos`
    };
  } catch (error: any) {
    return {
      success: false,
      tables: [],
      message: `Error al verificar tablas: ${error.message}`
    };
  }
}

// Función helper para transacciones
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Tipos para usuarios
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'cliente' | 'abogado' | 'administrador';
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tipo para usuario con contraseña (solo para autenticación)
export interface UserWithPassword extends User {
  password_hash: string;
}

// Función para obtener usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query(`
      SELECT 
        id, email, first_name, last_name, role, phone, avatar_url, 
        email_verified, is_active, created_at, updated_at
      FROM users WHERE email = $1
    `, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

// Función para obtener usuario con contraseña (solo para autenticación)
export async function getUserWithPasswordByEmail(email: string): Promise<UserWithPassword | null> {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener usuario con contraseña:', error);
    throw error;
  }
}

// Función para crear usuario
export async function createUser(userData: {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role?: 'cliente' | 'abogado' | 'administrador';
  phone?: string;
}): Promise<User> {
  try {
    const result = await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userData.email,
      userData.password_hash,
      userData.first_name,
      userData.last_name,
      userData.role || 'cliente',
      userData.phone
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}