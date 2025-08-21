import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateLawyerService, deleteLawyerService, getLawyerServiceById, getLawyerProfileByUserId } from '@/lib/lawyers';

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
    const service = await getLawyerServiceById(params.id);

    if (!service) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Servicio no encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service
    });
  } catch (error: any) {
    console.error('Error fetching service:', error);
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
    
    // Check if user is a lawyer
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los abogados pueden actualizar servicios' 
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
    
    const data = await request.json();
    data.id = params.id;
    
    const updatedService = await updateLawyerService(data, lawyerProfile.id);
    
    if (!updatedService) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Servicio no encontrado o sin permisos para actualizarlo' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Servicio actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar servicio',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // Check if user is a lawyer
    if (user.role !== 'abogado') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los abogados pueden eliminar servicios' 
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
    
    const deleted = await deleteLawyerService(params.id, lawyerProfile.id);
    
    if (!deleted) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Servicio no encontrado o sin permisos para eliminarlo' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al eliminar servicio',
        message: error.message 
      },
      { status: 500 }
    );
  }
}