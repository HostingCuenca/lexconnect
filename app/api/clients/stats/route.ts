import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { query } from '@/lib/database';

function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    // Solo admins y abogados pueden ver estadísticas de clientes
    if (user.role !== 'administrador' && user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes permisos para ver estadísticas de clientes' 
        },
        { status: 403 }
      );
    }

    let clientFilter = '';
    let queryParams: any[] = [];

    // Si es abogado, solo estadísticas de sus clientes
    if (user.role === 'abogado') {
      const lawyerResult = await query(
        'SELECT id FROM lawyer_profiles WHERE user_id = $1',
        [user.userId]
      );
      
      if (lawyerResult.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Perfil de abogado no encontrado' 
          },
          { status: 404 }
        );
      }

      const lawyerId = lawyerResult.rows[0].id;
      clientFilter = `AND u.id IN (SELECT DISTINCT client_id FROM consultations WHERE lawyer_id = $1)`;
      queryParams.push(lawyerId);
    }

    // Estadísticas generales de clientes
    const statsQuery = `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE u.is_active = true) as active_clients,
        COUNT(*) FILTER (WHERE u.is_active = false) as inactive_clients,
        COUNT(*) FILTER (WHERE u.email_verified = true) as verified_clients,
        COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_last_month,
        COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days') as new_clients_last_week
      FROM users u 
      WHERE u.role = 'cliente' ${clientFilter}
    `;

    // Estadísticas de actividad de clientes
    const activityQuery = `
      SELECT 
        COUNT(DISTINCT c.client_id) as clients_with_consultations,
        COUNT(*) as total_consultations,
        AVG(consultation_counts.consultation_count) as avg_consultations_per_client,
        COALESCE(SUM(p.amount), 0) as total_revenue
      FROM consultations c
      LEFT JOIN payments p ON c.id = p.consultation_id AND p.status = 'completado'
      LEFT JOIN (
        SELECT client_id, COUNT(*) as consultation_count
        FROM consultations
        GROUP BY client_id
      ) consultation_counts ON c.client_id = consultation_counts.client_id
      WHERE 1=1 ${user.role === 'abogado' ? 'AND c.lawyer_id = $1' : ''}
    `;

    // Top clientes por consultas
    const topClientsQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as full_name,
        u.email,
        COUNT(c.id) as consultation_count,
        COALESCE(SUM(p.amount), 0) as total_spent
      FROM users u
      INNER JOIN consultations c ON u.id = c.client_id
      LEFT JOIN payments p ON c.id = p.consultation_id AND p.status = 'completado'
      WHERE u.role = 'cliente' ${user.role === 'abogado' ? 'AND c.lawyer_id = $1' : ''}
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY consultation_count DESC, total_spent DESC
      LIMIT 5
    `;

    // Clientes recientes
    const recentClientsQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as full_name,
        u.email,
        u.created_at,
        COALESCE(consultation_counts.consultation_count, 0) as consultation_count
      FROM users u
      LEFT JOIN (
        SELECT client_id, COUNT(*) as consultation_count
        FROM consultations ${user.role === 'abogado' ? 'WHERE lawyer_id = $1' : ''}
        GROUP BY client_id
      ) consultation_counts ON u.id = consultation_counts.client_id
      WHERE u.role = 'cliente' ${clientFilter}
      ORDER BY u.created_at DESC
      LIMIT 5
    `;

    const [statsResult, activityResult, topClientsResult, recentClientsResult] = await Promise.all([
      query(statsQuery, queryParams),
      query(activityQuery, queryParams),
      query(topClientsQuery, queryParams),
      query(recentClientsQuery, queryParams)
    ]);

    const stats = statsResult.rows[0];
    const activity = activityResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_clients: parseInt(stats.total_clients),
          active_clients: parseInt(stats.active_clients),
          inactive_clients: parseInt(stats.inactive_clients),
          verified_clients: parseInt(stats.verified_clients),
          new_clients_last_month: parseInt(stats.new_clients_last_month),
          new_clients_last_week: parseInt(stats.new_clients_last_week),
          verification_rate: stats.total_clients > 0 ? 
            Math.round((stats.verified_clients / stats.total_clients) * 100) : 0
        },
        activity: {
          clients_with_consultations: parseInt(activity.clients_with_consultations),
          total_consultations: parseInt(activity.total_consultations),
          avg_consultations_per_client: parseFloat(activity.avg_consultations_per_client || 0).toFixed(1),
          total_revenue: parseFloat(activity.total_revenue || 0),
          engagement_rate: stats.total_clients > 0 ? 
            Math.round((activity.clients_with_consultations / stats.total_clients) * 100) : 0
        },
        top_clients: topClientsResult.rows.map(client => ({
          ...client,
          total_spent: parseFloat(client.total_spent || 0)
        })),
        recent_clients: recentClientsResult.rows.map(client => ({
          ...client,
          created_at: new Date(client.created_at).toLocaleDateString('es-ES'),
          consultation_count: parseInt(client.consultation_count)
        }))
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo estadísticas de clientes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      },
      { status: 500 }
    );
  }
}