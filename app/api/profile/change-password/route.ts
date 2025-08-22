import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';

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
    
    const { currentPassword, newPassword } = data;
    
    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        },
        { status: 400 }
      );
    }

    // Obtener la contraseña actual del usuario
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }

    const currentHashedPassword = userResult.rows[0].password_hash;

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentHashedPassword);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHashedPassword, user.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error: any) {
    console.error('Error cambiando contraseña:', error);
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