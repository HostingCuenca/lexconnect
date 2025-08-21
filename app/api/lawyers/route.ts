import { NextRequest, NextResponse } from 'next/server';
import { getAllLawyerProfiles, searchLawyers, createLawyerProfile } from '@/lib/lawyers';
import { getAuthenticatedUser } from '@/lib/auth';
import { withTransaction } from '@/lib/database';
import { hashPassword } from '@/lib/auth';
import { PoolClient } from 'pg';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const specialty = searchParams.get('specialty');

    let lawyers;
    
    if (search || specialty) {
      lawyers = await searchLawyers(search || undefined, specialty || undefined);
    } else {
      lawyers = await getAllLawyerProfiles();
    }

    return NextResponse.json({
      success: true,
      data: lawyers,
      total: lawyers.length
    });
  } catch (error: any) {
    console.error('Error fetching lawyers:', error);
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
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== 'administrador') {
      return NextResponse.json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores pueden crear abogados.' 
      }, { status: 403 });
    }

    const data = await request.json();
    const {
      // User data
      email,
      password,
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
    if (!email || !password || !first_name || !last_name || !license_number || 
        !bar_association || !education || !bio || !office_address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Check if email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Create user account
      const hashedPassword = await hashPassword(password);
      const userResult = await client.query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, phone, 
          role, email_verified, is_active
        ) VALUES ($1, $2, $3, $4, $5, 'abogado', true, true)
        RETURNING id
      `, [email, hashedPassword, first_name, last_name, phone]);

      const userId = userResult.rows[0].id;

      // Create lawyer profile
      const profileResult = await client.query(`
        INSERT INTO lawyer_profiles (
          user_id, license_number, bar_association, years_experience,
          education, bio, hourly_rate, consultation_rate, office_address,
          languages, availability_schedule, is_verified, 
          rating, total_reviews, total_consultations,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, 0, 0, NOW(), NOW())
        RETURNING id
      `, [
        userId,
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
        is_verified || false
      ]);

      const lawyerProfileId = profileResult.rows[0].id;

      // Add specialties
      if (specialties && Array.isArray(specialties)) {
        for (const specialtyId of specialties) {
          await client.query(`
            INSERT INTO lawyer_specialties (lawyer_id, specialty_id)
            VALUES ($1, $2)
          `, [lawyerProfileId, specialtyId]);
        }
      }

      // Return complete lawyer data
      const lawyerQuery = `
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

      const completeResult = await client.query(lawyerQuery, [lawyerProfileId]);
      return completeResult.rows[0];
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Abogado creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error creating lawyer:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}