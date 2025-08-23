import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthError, createAuthSuccess, hashPassword, validatePassword, isValidEmail, validateName } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación usando función centralizada
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Acceso denegado. Se requieren permisos de administrador.', 403);
    }

    // Obtener todos los usuarios
    const result = await withTransaction(async (client: PoolClient) => {
      const queryResult = await client.query(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          role,
          phone,
          avatar_url,
          email_verified,
          is_active,
          created_at,
          updated_at
        FROM users 
        ORDER BY created_at DESC
      `);

      return {
        users: queryResult.rows,
        total: queryResult.rows.length
      };
    });

    return createAuthSuccess(result, 'Usuarios obtenidos exitosamente');

  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Solo administradores pueden crear usuarios', 403);
    }

    const data = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      phone,
      email_verified = false,
      is_active = true
    } = data;

    // Validaciones
    if (!email || !password || !first_name || !last_name || !role) {
      return createAuthError('Todos los campos obligatorios son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return createAuthError('Email inválido', 400);
    }

    if (!validateName(first_name) || !validateName(last_name)) {
      return createAuthError('Nombres inválidos', 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createAuthError(passwordValidation.errors.join(', '), 400);
    }

    if (!['cliente', 'abogado', 'administrador'].includes(role)) {
      return createAuthError('Rol inválido', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Verificar que el email no exista
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const passwordHash = await hashPassword(password);

      // Crear usuario
      const insertResult = await client.query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          phone, email_verified, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role, phone, 
                  email_verified, is_active, created_at, updated_at
      `, [
        email, passwordHash, first_name, last_name, role,
        phone || null, email_verified, is_active
      ]);

      return insertResult.rows[0];
    });

    return createAuthSuccess(result, 'Usuario creado exitosamente');

  } catch (error: any) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}