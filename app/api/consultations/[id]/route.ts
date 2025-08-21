import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getConsultationById, updateConsultation } from '@/lib/consultations';

// Helper to verify authentication
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
    
    const consultation = await getConsultationById(params.id);

    if (!consultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta no encontrada' 
        },
        { status: 404 }
      );
    }

    // Check access permissions
    if (user.role !== 'administrador' && 
        consultation.client_id !== user.userId && 
        consultation.lawyer_id !== user.userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes permisos para ver esta consulta' 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: consultation
    });
  } catch (error: any) {
    console.error('Error fetching consultation:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    const data = await request.json();
    data.id = params.id;
    
    const updatedConsultation = await updateConsultation(data, user.userId, user.role);
    
    if (!updatedConsultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta no encontrada o sin permisos para actualizarla' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedConsultation,
      message: 'Consulta actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating consultation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar consulta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}