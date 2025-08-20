import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/database';
import { pool } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const currentUser = await getUserByToken(token);

    if (!currentUser || currentUser.role !== 'administrador') {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
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

      return NextResponse.json({
        success: true,
        users: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}