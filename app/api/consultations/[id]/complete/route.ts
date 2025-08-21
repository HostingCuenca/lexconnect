import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { completeConsultation } from '@/lib/consultations';

// Helper to verify authentication
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    const { final_price } = await request.json();
    
    const completedConsultation = await completeConsultation(
      params.id, 
      user.userId, 
      final_price
    );
    
    if (!completedConsultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se pudo completar la consulta. Verifica permisos y estado.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: completedConsultation,
      message: 'Consulta completada exitosamente'
    });
  } catch (error: any) {
    console.error('Error completing consultation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al completar consulta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}