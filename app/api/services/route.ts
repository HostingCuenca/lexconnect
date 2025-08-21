import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorización requerido' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

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
        WHERE 1=1
      `;
      
      const values: any[] = [];
      let paramCount = 0;

      // Authorization: admin can see all, lawyers see only their own
      if (user.role !== 'administrador') {
        paramCount++;
        query += ` AND lp.user_id = $${paramCount}`;
        values.push(user.userId);
      }

      // Search filter
      if (search) {
        paramCount++;
        query += ` AND (ls.title ILIKE $${paramCount} OR ls.description ILIKE $${paramCount})`;
        values.push(`%${search}%`);
      }

      // Status filter
      if (status && status !== 'all') {
        paramCount++;
        query += ` AND ls.status = $${paramCount}`;
        values.push(status);
      }

      // Type filter
      if (type && type !== 'all') {
        paramCount++;
        query += ` AND ls.service_type = $${paramCount}`;
        values.push(type);
      }

      query += ` ORDER BY ls.created_at DESC`;

      const queryResult = await client.query(query, values);
      return queryResult.rows;
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      status = 'activo',
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
      // Get lawyer profile ID
      let lawyerId;
      
      if (user.role === 'administrador') {
        // Admin can create services for any lawyer (would need lawyer_id in request)
        const lawyerIdFromRequest = data.lawyer_id;
        if (!lawyerIdFromRequest) {
          throw new Error('lawyer_id es requerido para administradores');
        }
        lawyerId = lawyerIdFromRequest;
      } else {
        // Get lawyer profile for current user
        const lawyerQuery = await client.query(
          'SELECT id FROM lawyer_profiles WHERE user_id = $1',
          [user.userId]
        );
        
        if (lawyerQuery.rows.length === 0) {
          throw new Error('No se encontró perfil de abogado para este usuario');
        }
        
        lawyerId = lawyerQuery.rows[0].id;
      }

      // Create service
      const insertQuery = `
        INSERT INTO lawyer_services (
          lawyer_id, title, description, price, duration_minutes, 
          service_type, status, requirements, deliverables,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `;

      const insertResult = await client.query(insertQuery, [
        lawyerId,
        title,
        description,
        price,
        duration_minutes,
        service_type,
        status,
        requirements,
        deliverables
      ]);

      return insertResult.rows[0];
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Servicio creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}