import { NextRequest, NextResponse } from 'next/server';
import { getLawyerProfileById, updateLawyerProfile } from '@/lib/lawyers';
import { getAuthenticatedUser } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lawyer = await getLawyerProfileById(params.id);

    if (!lawyer) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Abogado no encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lawyer
    });
  } catch (error: any) {
    console.error('Error fetching lawyer:', error);
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
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== 'administrador') {
      return NextResponse.json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores pueden editar abogados.' 
      }, { status: 403 });
    }

    const data = await request.json();
    const {
      // User data
      email,
      first_name,
      last_name,
      phone,
      
      // Lawyer profile data
      license_number,
      bar_association,
      years_experience,
      education,
      bio,
      hourly_rate,
      consultation_rate,
      office_address,
      languages,
      is_verified,
      specialties,
      availability_schedule
    } = data;

    // Validation
    if (!email || !first_name || !last_name || !license_number || 
        !bar_association || !education || !bio || !office_address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Get lawyer profile to get user_id
      const lawyerResult = await client.query(
        'SELECT user_id FROM lawyer_profiles WHERE id = $1',
        [params.id]
      );

      if (lawyerResult.rows.length === 0) {
        throw new Error('Abogado no encontrado');
      }

      const userId = lawyerResult.rows[0].user_id;

      // Check if email is taken by another user
      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        throw new Error('El email ya está en uso por otro usuario');
      }

      // Update user information
      await client.query(`
        UPDATE users SET 
          email = $1, first_name = $2, last_name = $3, phone = $4, updated_at = NOW()
        WHERE id = $5
      `, [email, first_name, last_name, phone, userId]);

      // Update lawyer profile
      await client.query(`
        UPDATE lawyer_profiles SET 
          license_number = $1, bar_association = $2, years_experience = $3,
          education = $4, bio = $5, hourly_rate = $6, consultation_rate = $7,
          office_address = $8, languages = $9, availability_schedule = $10,
          is_verified = $11, updated_at = NOW()
        WHERE id = $12
      `, [
        license_number,
        bar_association,
        years_experience || 0,
        education,
        bio,
        hourly_rate || 0,
        consultation_rate || 0,
        office_address,
        languages || 'Español',
        JSON.stringify(availability_schedule || {}),
        is_verified || false,
        params.id
      ]);

      // Update specialties
      // First, remove existing specialties
      await client.query(
        'DELETE FROM lawyer_specialties WHERE lawyer_id = $1',
        [params.id]
      );

      // Add new specialties
      if (specialties && Array.isArray(specialties)) {
        for (const specialtyId of specialties) {
          await client.query(`
            INSERT INTO lawyer_specialties (lawyer_id, specialty_id)
            VALUES ($1, $2)
          `, [params.id, specialtyId]);
        }
      }

      // Return updated lawyer data
      const updatedLawyerQuery = `
        SELECT 
          lp.*,
          u.email, u.first_name, u.last_name, u.phone, u.created_at as user_created_at,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ls.id,
                'name', ls.name,
                'description', ls.description,
                'icon', ls.icon
              )
            ) FILTER (WHERE ls.id IS NOT NULL), 
            '[]'
          ) as specialties
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        LEFT JOIN lawyer_specialties lspec ON lp.id = lspec.lawyer_id
        LEFT JOIN legal_specialties ls ON lspec.specialty_id = ls.id
        WHERE lp.id = $1
        GROUP BY lp.id, u.id
      `;

      const updatedResult = await client.query(updatedLawyerQuery, [params.id]);
      return updatedResult.rows[0];
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Abogado actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('Error updating lawyer:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== 'administrador') {
      return NextResponse.json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores pueden eliminar abogados.' 
      }, { status: 403 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Get lawyer profile to get user_id
      const lawyerResult = await client.query(
        'SELECT user_id, first_name, last_name FROM lawyer_profiles lp JOIN users u ON lp.user_id = u.id WHERE lp.id = $1',
        [params.id]
      );

      if (lawyerResult.rows.length === 0) {
        throw new Error('Abogado no encontrado');
      }

      const { user_id, first_name, last_name } = lawyerResult.rows[0];

      // Delete in correct order (foreign key constraints)
      // 1. Delete lawyer specialties
      await client.query('DELETE FROM lawyer_specialties WHERE lawyer_id = $1', [params.id]);
      
      // 2. Delete lawyer services
      await client.query('DELETE FROM lawyer_services WHERE lawyer_id = $1', [params.id]);
      
      // 3. Update consultations to remove lawyer reference (if any)
      await client.query('UPDATE consultations SET lawyer_id = NULL WHERE lawyer_id = $1', [params.id]);
      
      // 4. Delete lawyer profile
      await client.query('DELETE FROM lawyer_profiles WHERE id = $1', [params.id]);
      
      // 5. Delete user account
      await client.query('DELETE FROM users WHERE id = $1', [user_id]);

      return { first_name, last_name };
    });

    return NextResponse.json({ 
      success: true, 
      message: `Abogado ${result.first_name} ${result.last_name} eliminado exitosamente`
    });

  } catch (error: any) {
    console.error('Error deleting lawyer:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}