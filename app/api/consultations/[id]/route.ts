import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getConsultationById, updateConsultation } from '@/lib/consultations';
import { query } from '@/lib/database';

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
        consultation.lawyer_user_id !== user.userId) {
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

    // Get current consultation state for logging
    const currentConsultation = await getConsultationById(params.id);
    if (!currentConsultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta no encontrada' 
        },
        { status: 404 }
      );
    }
    
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

    // Log activity for important changes
    try {
      let actionDescription = 'Consulta actualizada';
      const oldValues: any = {};
      const newValues: any = {};

      if (data.status && currentConsultation.status !== data.status) {
        actionDescription = `Estado cambiado de '${currentConsultation.status}' a '${data.status}'`;
        oldValues.status = currentConsultation.status;
        newValues.status = data.status;
      }

      if (data.lawyer_notes && currentConsultation.lawyer_notes !== data.lawyer_notes) {
        if (actionDescription === 'Consulta actualizada') {
          actionDescription = 'Notas del abogado actualizadas';
        }
        oldValues.lawyer_notes = currentConsultation.lawyer_notes;
        newValues.lawyer_notes = data.lawyer_notes;
      }

      if (Object.keys(newValues).length > 0) {
        await query(`
          INSERT INTO activity_logs (user_id, action, resource_type, resource_id, old_values, new_values)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          user.userId,
          actionDescription,
          'consultation',
          params.id,
          JSON.stringify(oldValues),
          JSON.stringify(newValues)
        ]);
      }
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail the entire request if logging fails
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