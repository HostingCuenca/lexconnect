import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { query } from '@/lib/database';

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
    const data = await request.json();
    
    const { phone } = data;
    
    // Validación básica
    if (phone && typeof phone !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'El teléfono debe ser una cadena de texto válida' 
        },
        { status: 400 }
      );
    }

    // Actualizar el teléfono del usuario
    await query(
      'UPDATE users SET phone = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [phone || null, user.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    });

  } catch (error: any) {
    console.error('Error actualizando perfil:', error);
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