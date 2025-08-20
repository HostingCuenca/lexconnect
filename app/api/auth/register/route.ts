import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, query } from '@/lib/database';
import { 
  hashPassword,
  generateToken, 
  createAuthError, 
  createAuthSuccess, 
  isValidEmail,
  validatePassword,
  validateName,
  validateMexicanPhone,
  isValidRole,
  checkRateLimit,
  sanitizeUser,
  JWTPayload
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      confirmPassword,
      firstName, 
      lastName, 
      phone, 
      role = 'cliente'
    } = body;

    console.log(`📝 Intento de registro para: ${email} como ${role}`);

    // Rate limiting por IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (!checkRateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000)) {
      return createAuthError('Demasiados intentos de registro. Intenta de nuevo en 1 hora.', 429);
    }

    // Validaciones básicas
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return createAuthError('Todos los campos requeridos deben ser completados', 400);
    }

    // Validación de email
    if (!isValidEmail(email)) {
      return createAuthError('Formato de email inválido', 400);
    }

    // Validación de nombres
    if (!validateName(firstName)) {
      return createAuthError('Nombre inválido. Debe tener al menos 2 caracteres y solo letras', 400);
    }

    if (!validateName(lastName)) {
      return createAuthError('Apellido inválido. Debe tener al menos 2 caracteres y solo letras', 400);
    }

    // Validación de contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createAuthError(passwordValidation.errors.join('. '), 400);
    }

    // Confirmar contraseña
    if (password !== confirmPassword) {
      return createAuthError('Las contraseñas no coinciden', 400);
    }

    // Validación de teléfono (opcional)
    if (phone && !validateMexicanPhone(phone)) {
      return createAuthError('Formato de teléfono inválido. Usa formato mexicano: +52 xxx xxx xxxx', 400);
    }

    // Validación de rol
    if (!isValidRole(role)) {
      return createAuthError('Rol inválido. Debe ser: cliente, abogado o administrador', 400);
    }

    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser) {
      console.log(`❌ Email ya registrado: ${email}`);
      return createAuthError('Este email ya está registrado', 409);
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario en la base de datos
    const userData = {
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: role as 'cliente' | 'abogado' | 'administrador',
      phone: phone ? phone.replace(/\s/g, '') : undefined
    };

    const newUser = await createUser(userData);

    // Si es abogado, crear perfil de abogado
    if (role === 'abogado') {
      try {
        await query(`
          INSERT INTO lawyer_profiles (user_id, license_number)
          VALUES ($1, $2)
        `, [newUser.id, `TEMP-${Date.now()}`]); // Número temporal, se actualizará después

        console.log(`⚖️ Perfil de abogado creado para: ${email}`);
      } catch (error) {
        console.error('Error creando perfil de abogado:', error);
        // No fallar el registro por esto, se puede crear después
      }
    }

    // Crear payload para JWT
    const jwtPayload: JWTPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name
    };

    // Generar token JWT
    const token = generateToken(jwtPayload);

    // Sanitizar datos del usuario para la respuesta
    const sanitizedUser = sanitizeUser(newUser);

    console.log(`✅ Registro exitoso para: ${email} (${role})`);

    // Crear notificación de bienvenida
    try {
      await query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, 'system')
      `, [
        newUser.id,
        '¡Bienvenido a LexConnect!',
        `Hola ${firstName}, tu cuenta como ${role} ha sido creada exitosamente.`
      ]);
    } catch (error) {
      console.error('Error creando notificación de bienvenida:', error);
      // No fallar por esto
    }

    return createAuthSuccess({
      user: sanitizedUser,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }, 'Registro exitoso. ¡Bienvenido a LexConnect!');

  } catch (error: any) {
    console.error('💥 Error en registro:', error);
    
    // Manejar errores específicos de PostgreSQL
    if (error.code === '23505') { // Violación de unicidad
      if (error.constraint === 'users_email_key') {
        return createAuthError('Este email ya está registrado', 409);
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Endpoint para verificar disponibilidad de email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const action = searchParams.get('action');

    if (action === 'check-email') {
      if (!email || !isValidEmail(email)) {
        return NextResponse.json({
          success: false,
          message: 'Email válido requerido'
        }, { status: 400 });
      }

      const existingUser = await getUserByEmail(email.toLowerCase());
      
      return NextResponse.json({
        success: true,
        available: !existingUser,
        message: existingUser ? 'Email no disponible' : 'Email disponible'
      });
    }

    // Obtener roles disponibles
    if (action === 'roles') {
      return NextResponse.json({
        success: true,
        roles: [
          { 
            value: 'cliente', 
            label: 'Cliente', 
            description: 'Buscar servicios legales' 
          },
          { 
            value: 'abogado', 
            label: 'Abogado', 
            description: 'Ofrecer servicios legales' 
          }
          // Note: 'administrador' no está disponible para registro público
        ]
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Acción no válida'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error en GET /api/auth/register:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error verificando datos',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}