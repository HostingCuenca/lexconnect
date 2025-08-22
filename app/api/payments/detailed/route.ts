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
    
    let queryText = `
      SELECT 
        p.*,
        c.title as consultation_title,
        uc.first_name || ' ' || uc.last_name as client_name,
        uc.email as client_email,
        ul.first_name || ' ' || ul.last_name as lawyer_name,
        ul.email as lawyer_email
      FROM payments p
      LEFT JOIN consultations c ON p.consultation_id = c.id
      LEFT JOIN users uc ON p.client_id = uc.id
      LEFT JOIN lawyer_profiles lp ON p.lawyer_id = lp.id
      LEFT JOIN users ul ON lp.user_id = ul.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter based on user role
    if (user.role === 'cliente') {
      queryText += ` WHERE p.client_id = $${paramIndex++}`;
      params.push(user.userId);
    } else if (user.role === 'abogado') {
      // Find lawyer profile for this user
      const lawyerResult = await query('SELECT id FROM lawyer_profiles WHERE user_id = $1', [user.userId]);
      if (lawyerResult.rows.length > 0) {
        queryText += ` WHERE p.lawyer_id = $${paramIndex++}`;
        params.push(lawyerResult.rows[0].id);
      } else {
        // No lawyer profile found, return empty
        return NextResponse.json({
          success: true,
          data: []
        });
      }
    }
    // Admin sees all payments (no WHERE clause needed)

    queryText += ` ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching detailed payments:', error);
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