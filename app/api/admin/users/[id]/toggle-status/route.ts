import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthError, createAuthSuccess } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación usando función centralizada
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Acceso denegado. Se requieren permisos de administrador.', 403);
    }

    const { id } = params;
    const { is_active } = await request.json();

    // Verificar que no se esté desactivando a sí mismo
    if (id === user.userId && !is_active) {
      return createAuthError('No puedes desactivar tu propia cuenta.', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Actualizar el estado del usuario
      const updateResult = await client.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [is_active, id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      return {
        user: updateResult.rows[0],
        message: `Usuario ${is_active ? 'activado' : 'desactivado'} correctamente.`
      };
    });

    return createAuthSuccess(result, result.message);

  } catch (error: any) {
    console.error('❌ Error updating user status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Usuario no encontrado' ? 404 : 500 }
    );
  }
}