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
    
    // Solo abogados pueden consultar su estado
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los abogados pueden consultar su estado de verificación' 
        },
        { status: 403 }
      );
    }

    // Obtener información del perfil del abogado
    const result = await query(`
      SELECT 
        lp.id,
        lp.is_verified,
        lp.license_number,
        lp.bar_association,
        lp.created_at,
        lp.updated_at,
        u.first_name,
        u.last_name,
        u.email
      FROM lawyer_profiles lp
      JOIN users u ON lp.user_id = u.id
      WHERE lp.user_id = $1
    `, [user.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Perfil de abogado no encontrado' 
        },
        { status: 404 }
      );
    }

    const lawyerProfile = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: lawyerProfile.id,
        is_verified: lawyerProfile.is_verified,
        license_number: lawyerProfile.license_number,
        bar_association: lawyerProfile.bar_association,
        created_at: lawyerProfile.created_at,
        updated_at: lawyerProfile.updated_at,
        lawyer_name: `${lawyerProfile.first_name} ${lawyerProfile.last_name}`,
        email: lawyerProfile.email,
        verification_status: lawyerProfile.is_verified ? 'aprobado' : 'pendiente'
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo estado del abogado:', error);
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