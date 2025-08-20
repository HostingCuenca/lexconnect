import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/database';
import { pool } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;
    const { is_active } = await request.json();

    // Verificar que no se esté desactivando a sí mismo
    if (userId === currentUser.id && !is_active) {
      return NextResponse.json(
        { success: false, message: 'No puedes desactivar tu propia cuenta.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Actualizar el estado del usuario
      const result = await client.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [is_active, userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Usuario no encontrado.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Usuario ${is_active ? 'activado' : 'desactivado'} correctamente.`,
        user: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error updating user status:', error);
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