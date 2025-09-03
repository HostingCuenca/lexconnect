import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateLawyerSpecialties } from '@/lib/lawyers';

// Helper to verify authentication
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    const data = await request.json();
    const { lawyer_id, specialty_ids } = data;
    
    if (!lawyer_id || !specialty_ids) {
      return NextResponse.json(
        { 
          success: false,
          error: 'lawyer_id y specialty_ids son requeridos' 
        },
        { status: 400 }
      );
    }

    // Only admins or the lawyer themselves can update specialties
    if (user.role !== 'administrador') {
      // Check if the lawyer_id belongs to the authenticated user
      // This would require additional validation
      return NextResponse.json(
        { 
          success: false,
          error: 'Sin permisos para actualizar especialidades' 
        },
        { status: 403 }
      );
    }

    await updateLawyerSpecialties(lawyer_id, specialty_ids);

    return NextResponse.json({
      success: true,
      message: 'Especialidades actualizadas exitosamente'
    });

  } catch (error: any) {
    console.error('Error updating lawyer specialties:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar especialidades',
        message: error.message 
      },
      { status: 500 }
    );
  }
}