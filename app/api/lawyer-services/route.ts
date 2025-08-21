import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createLawyerService, getLawyerProfileByUserId } from '@/lib/lawyers';

// Helper to verify authentication
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    // Check if user is a lawyer
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los abogados pueden crear servicios' 
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
          error: 'Debes completar tu perfil de abogado primero' 
        },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'duration_minutes', 'service_type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { 
            success: false,
            error: `Campo requerido: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    const newService = await createLawyerService(data, lawyerProfile.id);
    
    return NextResponse.json({
      success: true,
      data: newService,
      message: 'Servicio creado exitosamente'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lawyer service:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear servicio',
        message: error.message 
      },
      { status: 500 }
    );
  }
}