import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const serviceType = searchParams.get('service_type');

    const result = await withTransaction(async (client: PoolClient) => {
      let query = `
        SELECT 
          ls.id,
          ls.title,
          ls.description,
          ls.price,
          ls.duration_minutes,
          ls.service_type,
          ls.requirements,
          ls.deliverables,
          ls.status,
          ls.created_at,
          lp.id as lawyer_id,
          u.first_name || ' ' || u.last_name as lawyer_name,
          lp.years_experience,
          lp.rating,
          lp.total_reviews,
          COALESCE(
            array_agg(DISTINCT spec.name) FILTER (WHERE spec.name IS NOT NULL), 
            ARRAY[]::text[]
          ) as specialties
        FROM lawyer_services ls
        INNER JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id
        INNER JOIN users u ON lp.user_id = u.id
        LEFT JOIN lawyer_specialties ls_spec ON lp.id = ls_spec.lawyer_id
        LEFT JOIN legal_specialties spec ON ls_spec.specialty_id = spec.id
        WHERE ls.status = 'activo' AND u.is_active = true
      `;

      const values: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (ls.title ILIKE $${paramCount} OR ls.description ILIKE $${paramCount})`;
        values.push(`%${search}%`);
      }

      if (category) {
        paramCount++;
        query += ` AND spec.id = $${paramCount}`;
        values.push(category);
      }

      if (serviceType) {
        paramCount++;
        query += ` AND ls.service_type = $${paramCount}`;
        values.push(serviceType);
      }

      query += `
        GROUP BY ls.id, ls.title, ls.description, ls.price, ls.duration_minutes, 
                 ls.service_type, ls.requirements, ls.deliverables, ls.status, 
                 ls.created_at, lp.id, u.first_name, u.last_name, 
                 lp.years_experience, lp.rating, lp.total_reviews
        ORDER BY ls.created_at DESC
      `;

      const queryResult = await client.query(query, values);

      return queryResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        duration_minutes: row.duration_minutes,
        service_type: row.service_type,
        requirements: row.requirements,
        deliverables: row.deliverables,
        status: row.status,
        created_at: row.created_at,
        lawyer: {
          id: row.lawyer_id,
          name: row.lawyer_name,
          years_experience: row.years_experience,
          rating: row.rating,
          total_reviews: row.total_reviews,
          specialties: row.specialties || []
        }
      }));
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Error fetching public services:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}