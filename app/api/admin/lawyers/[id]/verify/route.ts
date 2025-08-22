import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthError, createAuthSuccess } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

export async function POST(
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

    const { id: lawyerId } = params;
    const { action, notes } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return createAuthError('Acción inválida. Debe ser "approve" o "reject"', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Verificar que el perfil de abogado existe
      const lawyerCheck = await client.query(`
        SELECT lp.*, u.first_name, u.last_name, u.email 
        FROM lawyer_profiles lp 
        JOIN users u ON lp.user_id = u.id 
        WHERE lp.id = $1
      `, [lawyerId]);

      if (lawyerCheck.rows.length === 0) {
        throw new Error('Perfil de abogado no encontrado');
      }

      const lawyer = lawyerCheck.rows[0];

      // Actualizar el estado de verificación
      const isVerified = action === 'approve';
      const updateResult = await client.query(`
        UPDATE lawyer_profiles 
        SET is_verified = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `, [isVerified, lawyerId]);

      // Crear notificación para el abogado
      const notificationTitle = isVerified 
        ? '¡Tu perfil ha sido verificado!' 
        : 'Tu perfil requiere modificaciones';
      
      const notificationMessage = isVerified
        ? 'Felicidades, tu perfil de abogado ha sido verificado por nuestro equipo. Ya puedes recibir consultas y aparecer en los resultados de búsqueda.'
        : `Tu perfil de abogado ha sido revisado y requiere modificaciones antes de ser aprobado. ${notes || 'Por favor, revisa la información proporcionada.'}`;

      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES ($1, $2, $3, 'system', $4)
      `, [
        lawyer.user_id,
        notificationTitle,
        notificationMessage,
        lawyerId
      ]);

      // Log de la acción administrativa
      await client.query(`
        INSERT INTO activity_logs (user_id, action, resource_type, resource_id, new_values)
        VALUES ($1, $2, 'lawyer_profile', $3, $4)
      `, [
        user.userId,
        `lawyer_${action}`,
        lawyerId,
        JSON.stringify({
          is_verified: isVerified,
          admin_notes: notes,
          action_date: new Date().toISOString()
        })
      ]);

      return {
        lawyer: updateResult.rows[0],
        action,
        message: isVerified 
          ? `Abogado ${lawyer.first_name} ${lawyer.last_name} verificado exitosamente`
          : `Abogado ${lawyer.first_name} ${lawyer.last_name} rechazado`
      };
    });

    return createAuthSuccess(result, result.message);

  } catch (error: any) {
    console.error('❌ Error updating lawyer verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Perfil de abogado no encontrado' ? 404 : 500 }
    );
  }
}

// GET endpoint para obtener el estado actual de verificación
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Acceso denegado. Se requieren permisos de administrador.', 403);
    }

    const { id: lawyerId } = params;

    const result = await withTransaction(async (client: PoolClient) => {
      const lawyerResult = await client.query(`
        SELECT 
          lp.id,
          lp.is_verified,
          lp.created_at,
          lp.updated_at,
          u.first_name,
          u.last_name,
          u.email
        FROM lawyer_profiles lp 
        JOIN users u ON lp.user_id = u.id 
        WHERE lp.id = $1
      `, [lawyerId]);

      if (lawyerResult.rows.length === 0) {
        throw new Error('Perfil de abogado no encontrado');
      }

      // Obtener logs de verificación
      const logsResult = await client.query(`
        SELECT action, new_values, created_at
        FROM activity_logs 
        WHERE resource_type = 'lawyer_profile' 
          AND resource_id = $1 
          AND action IN ('lawyer_approve', 'lawyer_reject')
        ORDER BY created_at DESC
        LIMIT 5
      `, [lawyerId]);

      return {
        lawyer: lawyerResult.rows[0],
        verification_history: logsResult.rows
      };
    });

    return createAuthSuccess(result, 'Información de verificación obtenida');

  } catch (error: any) {
    console.error('❌ Error getting lawyer verification info:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Perfil de abogado no encontrado' ? 404 : 500 }
    );
  }
}