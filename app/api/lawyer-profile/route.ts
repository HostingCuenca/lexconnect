import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createLawyerProfile, getLawyerProfileByUserId, updateLawyerProfile } from '@/lib/lawyers';

// Helper to verify authentication
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
    
    const profile = await getLawyerProfileByUserId(user.userId);

    if (!profile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Perfil de abogado no encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Error fetching lawyer profile:', error);
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

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    // Check if user is a lawyer
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los usuarios con rol de abogado pueden crear un perfil' 
        },
        { status: 403 }
      );
    }

    // Check if profile already exists
    const existingProfile = await getLawyerProfileByUserId(user.userId);
    if (existingProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ya tienes un perfil de abogado creado' 
        },
        { status: 409 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['license_number', 'bar_association', 'years_experience', 'education', 'bio', 'hourly_rate', 'consultation_rate', 'office_address', 'languages'];
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
    
    const newProfile = await createLawyerProfile(data, user.userId);
    
    return NextResponse.json({
      success: true,
      data: newProfile,
      message: 'Perfil de abogado creado exitosamente'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lawyer profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear perfil de abogado',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID del perfil requerido' 
        },
        { status: 400 }
      );
    }
    
    const updatedProfile = await updateLawyerProfile(data, user.userId, user.role);
    
    if (!updatedProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Perfil no encontrado o sin permisos para actualizarlo' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating lawyer profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar perfil',
        message: error.message 
      },
      { status: 500 }
    );
  }
}