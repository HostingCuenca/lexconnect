import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

// GET /api/services/[id] - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorización requerido' 
      }, { status: 401 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      let query = `
        SELECT 
          ls.*,
          u.first_name,
          u.last_name,
          lp.id as lawyer_profile_id
        FROM lawyer_services ls
        JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id
        JOIN users u ON lp.user_id = u.id
        WHERE ls.id = $1
      `;
      
      const values = [params.id];

      // Authorization: admin can see all, lawyers see only their own
      if (user.role !== 'administrador') {
        query += ` AND lp.user_id = $2`;
        values.push(user.userId);
      }

      const queryResult = await client.query(query, values);
      return queryResult.rows[0] || null;
    });

    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: 'Servicio no encontrado o no autorizado' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorización requerido' 
      }, { status: 401 });
    }

    const data = await request.json();
    const {
      title,
      description,
      price,
      duration_minutes,
      service_type,
      status,
      requirements,
      deliverables
    } = data;

    // Validation
    if (!title || !description || !price || !duration_minutes || !service_type) {
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // First check if service exists and user has permission
      let checkQuery = `
        SELECT ls.*, lp.user_id 
        FROM lawyer_services ls
        JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id
        WHERE ls.id = $1
      `;
      
      const checkValues = [params.id];

      // Authorization: admin can update all, lawyers can update only their own
      if (user.role !== 'administrador') {
        checkQuery += ` AND lp.user_id = $2`;
        checkValues.push(user.userId);
      }

      const checkResult = await client.query(checkQuery, checkValues);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Servicio no encontrado o no autorizado para editar');
      }

      // Update service
      const updateQuery = `
        UPDATE lawyer_services 
        SET 
          title = $2,
          description = $3,
          price = $4,
          duration_minutes = $5,
          service_type = $6,
          status = $7,
          requirements = $8,
          deliverables = $9,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [
        params.id,
        title,
        description,
        price,
        duration_minutes,
        service_type,
        status || 'activo',
        requirements,
        deliverables
      ]);

      return updateResult.rows[0];
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Servicio actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Delete service (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorización requerido' 
      }, { status: 401 });
    }

    // Only admin can delete services
    if (user.role !== 'administrador') {
      return NextResponse.json({ 
        success: false, 
        message: 'Solo los administradores pueden eliminar servicios' 
      }, { status: 403 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Check if service exists
      const checkQuery = `
        SELECT ls.*, lp.user_id 
        FROM lawyer_services ls
        JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id
        WHERE ls.id = $1
      `;
      
      const checkResult = await client.query(checkQuery, [params.id]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Servicio no encontrado');
      }

      // Delete service
      const deleteQuery = `
        DELETE FROM lawyer_services 
        WHERE id = $1
        RETURNING id
      `;

      const deleteResult = await client.query(deleteQuery, [params.id]);
      return deleteResult.rows.length > 0;
    });

    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error al eliminar servicio' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Servicio eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}