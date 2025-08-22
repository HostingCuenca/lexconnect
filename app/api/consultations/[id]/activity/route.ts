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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // First verify the consultation exists and user has access
    const consultationResult = await query(`
      SELECT 
        c.id, c.client_id, lp.user_id as lawyer_user_id
      FROM consultations c
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      WHERE c.id = $1
    `, [params.id]);

    if (consultationResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta no encontrada' 
        },
        { status: 404 }
      );
    }

    const consultation = consultationResult.rows[0];

    // Check access permissions
    if (user.role !== 'administrador' && 
        consultation.client_id !== user.userId && 
        consultation.lawyer_user_id !== user.userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes permisos para ver el historial de esta consulta'
        },
        { status: 403 }
      );
    }

    // Get activity log for this consultation
    const activityResult = await query(`
      SELECT 
        al.id,
        al.action,
        al.old_values,
        al.new_values,
        al.created_at,
        u.first_name || ' ' || u.last_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.resource_type = 'consultation' AND al.resource_id = $1
      ORDER BY al.created_at DESC
    `, [params.id]);

    return NextResponse.json({
      success: true,
      data: activityResult.rows
    });
  } catch (error: any) {
    console.error('Error fetching activity log:', error);
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