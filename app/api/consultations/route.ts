import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { 
  createConsultation, 
  getClientConsultations, 
  getLawyerConsultations, 
  getAllConsultations 
} from '@/lib/consultations';
import { getLawyerProfileByUserId } from '@/lib/lawyers';

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
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    let consultations;

    if (user.role === 'administrador') {
      // Admin can see all consultations
      consultations = await getAllConsultations(filters);
    } else if (user.role === 'cliente') {
      // Client sees their own consultations
      consultations = await getClientConsultations(user.userId, filters);
    } else if (user.role === 'abogado') {
      // Lawyer sees consultations assigned to them
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
      consultations = await getLawyerConsultations(lawyerProfile.id, filters);
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rol de usuario no válido' 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: consultations,
      total: consultations.length
    });
  } catch (error: any) {
    console.error('Error fetching consultations:', error);
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
    
    // Only clients can create consultations
    if (user.role !== 'cliente') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los clientes pueden crear consultas' 
        },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['lawyer_id', 'title', 'description'];
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
    
    const newConsultation = await createConsultation(data, user.userId);
    
    return NextResponse.json({
      success: true,
      data: newConsultation,
      message: 'Consulta creada exitosamente'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear consulta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}