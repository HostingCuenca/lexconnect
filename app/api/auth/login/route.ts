import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/database';
import { 
  verifyPassword, 
  generateToken, 
  createAuthError, 
  createAuthSuccess, 
  isValidEmail,
  checkRateLimit,
  resetRateLimit,
  sanitizeUser,
  JWTPayload
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validación básica
    if (!email || !password) {
      return createAuthError('Email y contraseña son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return createAuthError('Formato de email inválido', 400);
    }

    // Rate limiting por IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (!checkRateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000)) {
      return createAuthError('Demasiados intentos de login. Intenta de nuevo en 15 minutos.', 429);
    }

    // Rate limiting por email
    if (!checkRateLimit(`login:${email}`, 3, 15 * 60 * 1000)) {
      return createAuthError('Demasiados intentos para este email. Intenta de nuevo en 15 minutos.', 429);
    }

    console.log(`🔐 Intento de login para: ${email}`);

    // Buscar usuario en la base de datos
    const user = await getUserByEmail(email.toLowerCase());
    
    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      return createAuthError('Credenciales inválidas', 401);
    }

    if (!user.is_active) {
      console.log(`🚫 Usuario inactivo: ${email}`);
      return createAuthError('Cuenta desactivada. Contacta al administrador.', 403);
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log(`❌ Contraseña incorrecta para: ${email}`);
      return createAuthError('Credenciales inválidas', 401);
    }

    // Reset rate limit en login exitoso
    resetRateLimit(`login:${clientIP}`);
    resetRateLimit(`login:${email}`);

    // Crear payload para JWT
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    };

    // Generar token JWT
    const token = generateToken(jwtPayload);

    // Sanitizar datos del usuario para la respuesta
    const sanitizedUser = sanitizeUser(user);

    console.log(`✅ Login exitoso para: ${email} (${user.role})`);

    return createAuthSuccess({
      user: sanitizedUser,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }, 'Login exitoso');

  } catch (error: any) {
    console.error('💥 Error en login:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Endpoint para verificar si un email existe (para ayudar en el frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !isValidEmail(email)) {
      return createAuthError('Email válido requerido', 400);
    }

    const user = await getUserByEmail(email.toLowerCase());
    
    return NextResponse.json({
      success: true,
      exists: !!user,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error verificando email:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error verificando email',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}