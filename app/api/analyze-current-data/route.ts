import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Obtener especialidades actuales
    const specialtiesResult = await query(`
      SELECT * FROM legal_specialties ORDER BY name
    `);
    
    // Obtener servicios actuales
    const servicesResult = await query(`
      SELECT 
        ls.*,
        lp.license_number,
        u.first_name,
        u.last_name
      FROM lawyer_services ls
      LEFT JOIN lawyer_profiles lp ON ls.lawyer_id = lp.id
      LEFT JOIN users u ON lp.user_id = u.id
      ORDER BY ls.service_type, ls.price
    `);
    
    // Obtener abogados actuales
    const lawyersResult = await query(`
      SELECT 
        lp.*,
        u.first_name,
        u.last_name,
        u.email
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
      ORDER BY lp.created_at
    `);

    // Contar datos
    const countsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM lawyer_profiles) as total_lawyers,
        (SELECT COUNT(*) FROM lawyer_services) as total_services,
        (SELECT COUNT(*) FROM legal_specialties) as total_specialties,
        (SELECT COUNT(*) FROM consultations) as total_consultations
    `);

    return NextResponse.json({
      success: true,
      data: {
        counts: countsResult.rows[0],
        specialties: specialtiesResult.rows,
        services: servicesResult.rows,
        lawyers: lawyersResult.rows,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error analyzing current data:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}