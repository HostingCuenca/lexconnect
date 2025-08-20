import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Creando usuario administrador...');

    // Credenciales del administrador principal
    const adminEmail = 'lexconnectadmin@lexconnect.mx';
    const adminPassword = 'admin123';

    // Verificar si el admin ya existe
    const existingAdmin = await getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'El usuario administrador ya existe',
        email: adminEmail,
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(adminPassword);

    // Crear usuario administrador
    const adminData = {
      email: adminEmail,
      password_hash: hashedPassword,
      first_name: 'Administrador',
      last_name: 'Sistema',
      role: 'administrador' as const,
      phone: '+52 800 123 4567'
    };

    const newAdmin = await createUser(adminData);

    console.log('✅ Usuario administrador creado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Usuario administrador creado exitosamente',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: `${newAdmin.first_name} ${newAdmin.last_name}`,
        role: newAdmin.role,
        created_at: newAdmin.created_at
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: 'Cambia esta contraseña después del primer login'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error: any) {
    console.error('💥 Error creando administrador:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error creando usuario administrador',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET para verificar si existe admin
export async function GET(request: NextRequest) {
  try {
    const adminEmail = 'lexconnectadmin@lexconnect.mx';
    const existingAdmin = await getUserByEmail(adminEmail);
    
    return NextResponse.json({
      success: true,
      adminExists: !!existingAdmin,
      email: adminEmail,
      message: existingAdmin ? 'Admin existe' : 'Admin no encontrado',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error verificando admin:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error verificando administrador',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}