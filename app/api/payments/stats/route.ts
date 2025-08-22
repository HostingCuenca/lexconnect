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
    
    let baseQuery = `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completado' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pending_payments,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(platform_fee), 0) as platform_revenue,
        COALESCE(SUM(lawyer_earnings), 0) as lawyer_earnings
      FROM payments
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter based on user role
    if (user.role === 'cliente') {
      baseQuery += ` WHERE client_id = $${paramIndex++}`;
      params.push(user.userId);
    } else if (user.role === 'abogado') {
      // Find lawyer profile for this user
      const lawyerResult = await query('SELECT id FROM lawyer_profiles WHERE user_id = $1', [user.userId]);
      if (lawyerResult.rows.length > 0) {
        baseQuery += ` WHERE lawyer_id = $${paramIndex++}`;
        params.push(lawyerResult.rows[0].id);
      } else {
        // No lawyer profile found, return zeros
        return NextResponse.json({
          success: true,
          data: {
            total_payments: 0,
            completed_payments: 0,
            pending_payments: 0,
            total_revenue: 0,
            platform_revenue: 0,
            lawyer_earnings: 0
          }
        });
      }
    }
    // Admin sees all payments stats

    const result = await query(baseQuery, params);
    const stats = result.rows[0];

    // Convert string numbers to actual numbers
    const processedStats = {
      total_payments: parseInt(stats.total_payments) || 0,
      completed_payments: parseInt(stats.completed_payments) || 0,
      pending_payments: parseInt(stats.pending_payments) || 0,
      total_revenue: parseFloat(stats.total_revenue) || 0,
      platform_revenue: parseFloat(stats.platform_revenue) || 0,
      lawyer_earnings: parseFloat(stats.lawyer_earnings) || 0
    };

    return NextResponse.json({
      success: true,
      data: processedStats
    });
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
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