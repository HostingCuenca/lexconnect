import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { cancelConsultation } from '@/lib/consultations';

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
    
    const cancelledConsultation = await cancelConsultation(
      params.id, 
      user.userId, 
      user.role
    );
    
    if (!cancelledConsultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se pudo cancelar la consulta. Verifica permisos y estado.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: cancelledConsultation,
      message: 'Consulta cancelada exitosamente'
    });
  } catch (error: any) {
    console.error('Error cancelling consultation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al cancelar consulta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}