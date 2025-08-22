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

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request);

    let activities: any[] = [];

    if (user.role === 'administrador') {
      activities = await getAdminActivities();
    } else if (user.role === 'abogado') {
      activities = await getLawyerActivities(user.userId);
    } else if (user.role === 'cliente') {
      activities = await getClientActivities(user.userId);
    }

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error: any) {
    console.error('Error obteniendo actividades recientes:', error);
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

async function getAdminActivities() {
  const activitiesQuery = `
    SELECT 
      'consultation' as type,
      'Nueva consulta creada' as title,
      c.title as description,
      c.created_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM consultations c
    INNER JOIN users u ON c.client_id = u.id
    WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'payment' as type,
      'Pago procesado' as title,
      '$' || p.amount::text || ' - ' || c.title as description,
      p.created_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM payments p
    INNER JOIN consultations c ON p.consultation_id = c.id
    INNER JOIN users u ON c.client_id = u.id
    WHERE p.status = 'completado' AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'user' as type,
      'Nuevo usuario registrado' as title,
      CASE 
        WHEN u.role = 'cliente' THEN 'Cliente: ' 
        WHEN u.role = 'abogado' THEN 'Abogado: '
        ELSE 'Usuario: '
      END || u.first_name || ' ' || u.last_name as description,
      u.created_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM users u
    WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    ORDER BY time DESC
    LIMIT 10
  `;

  const result = await query(activitiesQuery);
  return result.rows.map(activity => ({
    ...activity,
    time: formatActivityTime(activity.time)
  }));
}

async function getLawyerActivities(userId: string) {
  const lawyerProfileResult = await query(
    'SELECT id FROM lawyer_profiles WHERE user_id = $1',
    [userId]
  );

  if (lawyerProfileResult.rows.length === 0) {
    throw new Error('Perfil de abogado no encontrado');
  }

  const lawyerId = lawyerProfileResult.rows[0].id;

  const activitiesQuery = `
    SELECT 
      'consultation' as type,
      'Nueva consulta recibida' as title,
      c.title as description,
      c.created_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM consultations c
    INNER JOIN users u ON c.client_id = u.id
    WHERE c.lawyer_id = $1 AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'payment' as type,
      'Pago recibido' as title,
      '$' || p.lawyer_earnings::text || ' - ' || c.title as description,
      p.created_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM payments p
    INNER JOIN consultations c ON p.consultation_id = c.id
    INNER JOIN users u ON c.client_id = u.id
    WHERE c.lawyer_id = $1 AND p.status = 'completado' AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'consultation_update' as type,
      'Consulta actualizada' as title,
      'Estado: ' || c.status || ' - ' || c.title as description,
      c.updated_at as time,
      u.first_name || ' ' || u.last_name as user_name
    FROM consultations c
    INNER JOIN users u ON c.client_id = u.id
    WHERE c.lawyer_id = $1 AND c.updated_at >= CURRENT_DATE - INTERVAL '7 days' AND c.updated_at != c.created_at
    
    ORDER BY time DESC
    LIMIT 10
  `;

  const result = await query(activitiesQuery, [lawyerId]);
  return result.rows.map(activity => ({
    ...activity,
    time: formatActivityTime(activity.time)
  }));
}

async function getClientActivities(userId: string) {
  const activitiesQuery = `
    SELECT 
      'consultation' as type,
      'Consulta creada' as title,
      c.title as description,
      c.created_at as time,
      l.first_name || ' ' || l.last_name as user_name
    FROM consultations c
    INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
    INNER JOIN users l ON lp.user_id = l.id
    WHERE c.client_id = $1 AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'payment' as type,
      'Pago realizado' as title,
      '$' || p.amount::text || ' - ' || c.title as description,
      p.created_at as time,
      l.first_name || ' ' || l.last_name as user_name
    FROM payments p
    INNER JOIN consultations c ON p.consultation_id = c.id
    INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
    INNER JOIN users l ON lp.user_id = l.id
    WHERE c.client_id = $1 AND p.status = 'completado' AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'consultation_update' as type,
      'Consulta actualizada' as title,
      'Estado: ' || c.status || ' - ' || c.title as description,
      c.updated_at as time,
      l.first_name || ' ' || l.last_name as user_name
    FROM consultations c
    INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
    INNER JOIN users l ON lp.user_id = l.id
    WHERE c.client_id = $1 AND c.updated_at >= CURRENT_DATE - INTERVAL '7 days' AND c.updated_at != c.created_at
    
    ORDER BY time DESC
    LIMIT 10
  `;

  const result = await query(activitiesQuery, [userId]);
  return result.rows.map(activity => ({
    ...activity,
    time: formatActivityTime(activity.time)
  }));
}

function formatActivityTime(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Ahora mismo';
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  }
}