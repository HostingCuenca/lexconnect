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
    const { searchParams } = new URL(request.url);
    
    // Solo admins y abogados pueden ver clientes
    if (user.role !== 'administrador' && user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes permisos para ver la lista de clientes' 
        },
        { status: 403 }
      );
    }

    // Parámetros de filtrado
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereConditions = ["u.role = 'cliente'"];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Filtro de búsqueda (nombre o email)
    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro de estado activo
    if (status === 'active') {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      queryParams.push(true);
      paramIndex++;
    } else if (status === 'inactive') {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      queryParams.push(false);
      paramIndex++;
    }

    // Si es abogado, solo mostrar clientes que han contactado a este abogado
    if (user.role === 'abogado') {
      // Obtener el perfil del abogado
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
      whereConditions.push(`u.id IN (SELECT DISTINCT client_id FROM consultations WHERE lawyer_id = $${paramIndex})`);
      queryParams.push(lawyerId);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Query principal para obtener clientes con estadísticas
    const clientsQuery = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.created_at,
        u.updated_at,
        COALESCE(stats.total_consultations, 0) as total_consultations,
        COALESCE(stats.active_consultations, 0) as active_consultations,
        COALESCE(stats.completed_consultations, 0) as completed_consultations,
        COALESCE(stats.total_spent, 0) as total_spent,
        stats.last_consultation_date,
        stats.last_consultation_title
      FROM users u
      LEFT JOIN (
        SELECT 
          c.client_id,
          COUNT(*) as total_consultations,
          COUNT(*) FILTER (WHERE c.status IN ('pendiente', 'aceptada', 'en_proceso')) as active_consultations,
          COUNT(*) FILTER (WHERE c.status = 'completada') as completed_consultations,
          COALESCE(SUM(p.amount), 0) as total_spent,
          MAX(c.created_at) as last_consultation_date,
          (SELECT title FROM consultations WHERE client_id = c.client_id ORDER BY created_at DESC LIMIT 1) as last_consultation_title
        FROM consultations c
        LEFT JOIN payments p ON c.id = p.consultation_id AND p.status = 'completado'
        GROUP BY c.client_id
      ) stats ON u.id = stats.client_id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      WHERE ${whereClause}
    `;

    const [clientsResult, countResult] = await Promise.all([
      query(clientsQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const clients = clientsResult.rows.map(client => ({
      ...client,
      full_name: `${client.first_name} ${client.last_name}`,
      status: client.is_active ? 'Activo' : 'Inactivo',
      last_consultation_date: client.last_consultation_date ? 
        new Date(client.last_consultation_date).toLocaleDateString('es-ES') : null,
      total_spent: parseFloat(client.total_spent || 0)
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        clients,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo clientes:', error);
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