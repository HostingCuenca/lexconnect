import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { acceptConsultation } from '@/lib/consultations';
import { getLawyerProfileByUserId } from '@/lib/lawyers';

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
    
    // Only lawyers can accept consultations
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los abogados pueden aceptar consultas' 
        },
        { status: 403 }
      );
    }

    // Get lawyer profile
    const lawyerProfile = await getLawyerProfileByUserId(user.userId);
    if (!lawyerProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Perfil de abogado no encontrado' 
        },
        { status: 404 }
      );
    }
    
    const { estimated_price, lawyer_notes } = await request.json();
    
    const acceptedConsultation = await acceptConsultation(
      params.id, 
      lawyerProfile.id, 
      estimated_price,
      lawyer_notes
    );
    
    if (!acceptedConsultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se pudo aceptar la consulta. Verifica que sea tuya y esté pendiente.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: acceptedConsultation,
      message: 'Consulta aceptada exitosamente'
    });
  } catch (error: any) {
    console.error('Error accepting consultation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al aceptar consulta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}