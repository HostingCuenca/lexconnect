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

    const result = await withTransaction(async (client: PoolClient) => {
      let whereClause = '';
      const values: any[] = [];
      
      // Authorization: admin can see all stats, lawyers see only their own
      if (user.role !== 'administrador') {
        whereClause = `
          JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id 
          WHERE lp.user_id = $1
        `;
        values.push(user.userId);
      }

      // Get basic service stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN ls.status = 'active' THEN 1 END) as active_services,
          COUNT(CASE WHEN ls.status = 'draft' THEN 1 END) as draft_services,
          COUNT(CASE WHEN ls.status = 'inactive' THEN 1 END) as inactive_services,
          AVG(CAST(ls.price AS NUMERIC)) as avg_service_price,
          SUM(CAST(ls.price AS NUMERIC)) as total_potential_revenue
        FROM lawyer_services ls
        ${whereClause}
      `;

      const statsResult = await client.query(statsQuery, values);
      const stats = statsResult.rows[0];

      // Get most popular service (by consultation count)
      let popularServiceQuery = `
        SELECT ls.title, COUNT(c.id) as consultation_count
        FROM lawyer_services ls
        LEFT JOIN consultations c ON c.service_id = ls.id
      `;
      
      if (user.role !== 'administrador') {
        popularServiceQuery += `
          JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id 
          WHERE lp.user_id = $1
        `;
      }
      
      popularServiceQuery += `
        GROUP BY ls.id, ls.title
        ORDER BY consultation_count DESC
        LIMIT 1
      `;

      const popularServiceResult = await client.query(popularServiceQuery, values);
      const mostPopularService = popularServiceResult.rows[0]?.title || 'N/A';

      return {
        total_services: parseInt(stats.total_services) || 0,
        active_services: parseInt(stats.active_services) || 0,
        draft_services: parseInt(stats.draft_services) || 0,
        inactive_services: parseInt(stats.inactive_services) || 0,
        avg_service_price: parseFloat(stats.avg_service_price) || 0,
        total_revenue: parseFloat(stats.total_potential_revenue) || 0,
        most_popular_service: mostPopularService
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}