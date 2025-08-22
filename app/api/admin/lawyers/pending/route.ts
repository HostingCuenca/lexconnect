import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthError, createAuthSuccess } from '@/lib/auth';
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // pending, verified, all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await withTransaction(async (client: PoolClient) => {
      let whereClause = '';
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Filtrar por estado de verificación
      if (status === 'pending') {
        whereClause = 'WHERE lp.is_verified = FALSE';
      } else if (status === 'verified') {
        whereClause = 'WHERE lp.is_verified = TRUE';
      }
      // Si status es 'all', no agregamos filtro

      // Consulta principal para obtener abogados
      const lawyersQuery = `
        SELECT 
          lp.id,
          lp.user_id,
          lp.license_number,
          lp.bar_association,
          lp.years_experience,
          lp.education,
          lp.bio,
          lp.hourly_rate,
          lp.consultation_rate,
          lp.is_verified,
          lp.rating,
          lp.total_reviews,
          lp.total_consultations,
          lp.office_address,
          lp.languages,
          lp.created_at,
          lp.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.avatar_url,
          u.is_active
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        ${whereClause}
        ORDER BY lp.created_at ASC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);

      const lawyersResult = await client.query(lawyersQuery, queryParams);

      // Contar total para paginación
      const countQuery = `
        SELECT COUNT(*) as total
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        ${whereClause}
      `;

      const countResult = await client.query(countQuery);
      const total = parseInt(countResult.rows[0].total);

      // Para cada abogado, obtener sus especialidades
      const lawyers = lawyersResult.rows;
      for (const lawyer of lawyers) {
        // Obtener especialidades
        const specialtiesResult = await client.query(`
          SELECT ls.id, ls.name, ls.description, ls.icon
          FROM legal_specialties ls
          JOIN lawyer_specialties lsp ON ls.id = lsp.specialty_id
          WHERE lsp.lawyer_id = $1 AND ls.is_active = true
          ORDER BY ls.name
        `, [lawyer.id]);

        lawyer.specialties = specialtiesResult.rows;

        // Obtener servicios
        const servicesResult = await client.query(`
          SELECT id, title, description, price, duration_minutes, service_type, status
          FROM lawyer_services
          WHERE lawyer_id = $1
          ORDER BY created_at DESC
        `, [lawyer.id]);

        lawyer.services = servicesResult.rows;
      }

      // Obtener estadísticas
      const statsResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE lp.is_verified = TRUE) as verified,
          COUNT(*) FILTER (WHERE lp.is_verified = FALSE) as pending
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE u.is_active = TRUE
      `);

      const stats = {
        total: parseInt(statsResult.rows[0].total),
        verified: parseInt(statsResult.rows[0].verified),
        pending: parseInt(statsResult.rows[0].pending)
      };

      return {
        lawyers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit)
        },
        stats,
        filter: status
      };
    });

    return createAuthSuccess(result, `Se encontraron ${result.lawyers.length} abogados`);

  } catch (error: any) {
    console.error('❌ Error fetching pending lawyers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

// POST endpoint para acciones en lote (aprobar/rechazar múltiples abogados)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Acceso denegado. Se requieren permisos de administrador.', 403);
    }

    const { lawyerIds, action, notes } = await request.json();

    if (!lawyerIds || !Array.isArray(lawyerIds) || lawyerIds.length === 0) {
      return createAuthError('Se requiere una lista de IDs de abogados', 400);
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return createAuthError('Acción inválida. Debe ser "approve" o "reject"', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      const results = [];
      const isVerified = action === 'approve';

      for (const lawyerId of lawyerIds) {
        try {
          // Verificar que el abogado existe
          const lawyerCheck = await client.query(`
            SELECT lp.*, u.first_name, u.last_name, u.email, u.id as user_id
            FROM lawyer_profiles lp 
            JOIN users u ON lp.user_id = u.id 
            WHERE lp.id = $1
          `, [lawyerId]);

          if (lawyerCheck.rows.length === 0) {
            results.push({
              lawyerId,
              success: false,
              error: 'Abogado no encontrado'
            });
            continue;
          }

          const lawyer = lawyerCheck.rows[0];

          // Actualizar verificación
          await client.query(`
            UPDATE lawyer_profiles 
            SET is_verified = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
          `, [isVerified, lawyerId]);

          // Crear notificación
          const notificationTitle = isVerified 
            ? '¡Tu perfil ha sido verificado!' 
            : 'Tu perfil requiere modificaciones';
          
          const notificationMessage = isVerified
            ? 'Felicidades, tu perfil de abogado ha sido verificado por nuestro equipo. Ya puedes recibir consultas y aparecer en los resultados de búsqueda.'
            : `Tu perfil de abogado ha sido revisado y requiere modificaciones. ${notes || 'Por favor, revisa la información proporcionada.'}`;

          await client.query(`
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES ($1, $2, $3, 'system', $4)
          `, [lawyer.user_id, notificationTitle, notificationMessage, lawyerId]);

          // Log de actividad
          await client.query(`
            INSERT INTO activity_logs (user_id, action, resource_type, resource_id, new_values)
            VALUES ($1, $2, 'lawyer_profile', $3, $4)
          `, [
            user.userId,
            `lawyer_${action}_batch`,
            lawyerId,
            JSON.stringify({
              is_verified: isVerified,
              admin_notes: notes,
              action_date: new Date().toISOString(),
              batch_operation: true
            })
          ]);

          results.push({
            lawyerId,
            success: true,
            lawyer: `${lawyer.first_name} ${lawyer.last_name}`,
            action: action
          });

        } catch (error: any) {
          results.push({
            lawyerId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;

      return {
        results,
        summary: {
          total: lawyerIds.length,
          success: successCount,
          errors: errorCount,
          action
        }
      };
    });

    const message = `Operación completada: ${result.summary.success} exitosos, ${result.summary.errors} errores`;
    return createAuthSuccess(result, message);

  } catch (error: any) {
    console.error('❌ Error in batch lawyer operation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}