import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthError, createAuthSuccess, hashPassword, validatePassword, isValidEmail, validateName } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

// GET - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Solo administradores pueden ver usuarios', 403);
    }

    const { id } = params;
    if (!id) {
      return createAuthError('ID de usuario requerido', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      const queryResult = await client.query(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          role,
          phone,
          avatar_url,
          email_verified,
          is_active,
          created_at,
          updated_at
        FROM users 
        WHERE id = $1
      `, [id]);

      if (queryResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      return queryResult.rows[0];
    });

    return createAuthSuccess(result, 'Usuario obtenido exitosamente');

  } catch (error: any) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Usuario no encontrado' ? 404 : 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Solo administradores pueden editar usuarios', 403);
    }

    const { id } = params;
    if (!id) {
      return createAuthError('ID de usuario requerido', 400);
    }

    const data = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      phone,
      email_verified,
      is_active
    } = data;

    // Validaciones básicas
    if (!email || !first_name || !last_name || !role) {
      return createAuthError('Campos obligatorios son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return createAuthError('Email inválido', 400);
    }

    if (!validateName(first_name) || !validateName(last_name)) {
      return createAuthError('Nombres inválidos', 400);
    }

    if (!['cliente', 'abogado', 'administrador'].includes(role)) {
      return createAuthError('Rol inválido', 400);
    }

    // Validar contraseña solo si se proporciona
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return createAuthError(passwordValidation.errors.join(', '), 400);
      }
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Verificar que el usuario existe
      const existingUser = await client.query(
        'SELECT id, email FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que el email no esté en uso por otro usuario
      if (email !== existingUser.rows[0].email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, id]
        );

        if (emailCheck.rows.length > 0) {
          throw new Error('El email ya está en uso por otro usuario');
        }
      }

      // Construir query de actualización dinámicamente
      const updateFields = [];
      const updateValues = [];
      let valueIndex = 1;

      updateFields.push(`email = $${valueIndex++}`);
      updateValues.push(email);

      updateFields.push(`first_name = $${valueIndex++}`);
      updateValues.push(first_name);

      updateFields.push(`last_name = $${valueIndex++}`);
      updateValues.push(last_name);

      updateFields.push(`role = $${valueIndex++}`);
      updateValues.push(role);

      updateFields.push(`phone = $${valueIndex++}`);
      updateValues.push(phone || null);

      updateFields.push(`email_verified = $${valueIndex++}`);
      updateValues.push(email_verified !== undefined ? email_verified : false);

      updateFields.push(`is_active = $${valueIndex++}`);
      updateValues.push(is_active !== undefined ? is_active : true);

      updateFields.push(`updated_at = NOW()`);

      // Actualizar contraseña si se proporciona
      if (password) {
        const passwordHash = await hashPassword(password);
        updateFields.push(`password_hash = $${valueIndex++}`);
        updateValues.push(passwordHash);
      }

      updateValues.push(id);

      const updateResult = await client.query(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING id, email, first_name, last_name, role, phone, 
                  email_verified, is_active, created_at, updated_at
      `, updateValues);

      return updateResult.rows[0];
    });

    return createAuthSuccess(result, 'Usuario actualizado exitosamente');

  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Usuario no encontrado' ? 404 : 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return createAuthError('Token de autenticación requerido');
    }

    if (user.role !== 'administrador') {
      return createAuthError('Solo administradores pueden eliminar usuarios', 403);
    }

    const { id } = params;
    if (!id) {
      return createAuthError('ID de usuario requerido', 400);
    }

    // Prevenir auto-eliminación
    if (user.userId === id) {
      return createAuthError('No puedes eliminar tu propia cuenta', 400);
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Verificar que el usuario existe
      const existingUser = await client.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const userToDelete = existingUser.rows[0];

      // Verificar relaciones antes de eliminar
      const dependencies = [];

      // Verificar si es abogado con perfil
      const lawyerProfile = await client.query(
        'SELECT id FROM lawyer_profiles WHERE user_id = $1',
        [id]
      );
      if (lawyerProfile.rows.length > 0) {
        dependencies.push('perfil de abogado');
      }

      // Verificar consultas
      const consultations = await client.query(
        'SELECT id FROM consultations WHERE client_id = $1 OR lawyer_id = $1',
        [id]
      );
      if (consultations.rows.length > 0) {
        dependencies.push('consultas');
      }

      // Verificar pagos
      const payments = await client.query(
        'SELECT id FROM payments WHERE user_id = $1',
        [id]
      );
      if (payments.rows.length > 0) {
        dependencies.push('pagos');
      }

      // Verificar posts de blog
      const blogPosts = await client.query(
        'SELECT id FROM blog_posts WHERE author_id = $1',
        [id]
      );
      if (blogPosts.rows.length > 0) {
        dependencies.push('posts de blog');
      }

      if (dependencies.length > 0) {
        throw new Error(
          `No se puede eliminar el usuario porque tiene ${dependencies.join(', ')} asociados. ` +
          'Considera desactivar el usuario en su lugar.'
        );
      }

      // Eliminar usuario (las dependencias ya fueron verificadas)
      await client.query('DELETE FROM users WHERE id = $1', [id]);

      return {
        id,
        email: userToDelete.email,
        deleted: true
      };
    });

    return createAuthSuccess(result, 'Usuario eliminado exitosamente');

  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error interno del servidor'
      },
      { status: error.message === 'Usuario no encontrado' ? 404 : 500 }
    );
  }
}