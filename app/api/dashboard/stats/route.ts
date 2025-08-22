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

    let stats;

    if (user.role === 'administrador') {
      stats = await getAdminStats();
    } else if (user.role === 'abogado') {
      stats = await getLawyerStats(user.userId);
    } else if (user.role === 'cliente') {
      stats = await getClientStats(user.userId);
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rol de usuario no válido' 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
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

async function getAdminStats() {
  // Estadísticas para administradores
  const consultationsStatsQuery = `
    SELECT 
      COUNT(*) as total_consultations,
      COUNT(*) FILTER (WHERE status IN ('pendiente', 'aceptada', 'en_proceso')) as active_consultations,
      COUNT(*) FILTER (WHERE status = 'completada') as completed_consultations,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_consultations_month
    FROM consultations
  `;

  const usersStatsQuery = `
    SELECT 
      COUNT(*) FILTER (WHERE role = 'cliente') as total_clients,
      COUNT(*) FILTER (WHERE role = 'abogado') as total_lawyers,
      COUNT(*) FILTER (WHERE role = 'cliente' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_month,
      COUNT(*) FILTER (WHERE role = 'abogado' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_lawyers_month
    FROM users
  `;

  const paymentsStatsQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(platform_fee), 0) as platform_earnings,
      COUNT(*) FILTER (WHERE status = 'completado') as completed_payments,
      COALESCE(SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_this_month
    FROM payments
  `;

  const verificationStatsQuery = `
    SELECT 
      COUNT(*) FILTER (WHERE is_verified = true) as verified_lawyers,
      COUNT(*) FILTER (WHERE is_verified = false) as pending_lawyers
    FROM lawyer_profiles
  `;

  const [consultationsResult, usersResult, paymentsResult, verificationResult] = await Promise.all([
    query(consultationsStatsQuery),
    query(usersStatsQuery),
    query(paymentsStatsQuery),
    query(verificationStatsQuery)
  ]);

  const consultations = consultationsResult.rows[0];
  const users = usersResult.rows[0];
  const payments = paymentsResult.rows[0];
  const verification = verificationResult.rows[0];

  return {
    role: 'administrador',
    metrics: [
      {
        title: 'Consultas Activas',
        value: consultations.active_consultations || '0',
        description: `+${consultations.new_consultations_month || 0} este mes`,
        icon: 'FileText',
        color: 'text-blue-600',
        trend: 'up'
      },
      {
        title: 'Total Usuarios',
        value: (parseInt(users.total_clients || 0) + parseInt(users.total_lawyers || 0)).toString(),
        description: `${users.total_clients || 0} clientes, ${users.total_lawyers || 0} abogados`,
        icon: 'Users',
        color: 'text-green-600',
        trend: 'up'
      },
      {
        title: 'Ingresos Plataforma',
        value: parseFloat(payments.platform_earnings || 0),
        description: `${payments.completed_payments || 0} pagos completados`,
        icon: 'DollarSign',
        color: 'text-yellow-600',
        trend: 'up',
        format: 'currency'
      },
      {
        title: 'Abogados Verificados',
        value: verification.verified_lawyers || '0',
        description: `${verification.pending_lawyers || 0} pendientes`,
        icon: 'TrendingUp',
        color: 'text-purple-600',
        trend: 'neutral'
      }
    ]
  };
}

async function getLawyerStats(userId: string) {
  // Obtener el perfil del abogado
  const lawyerProfileResult = await query(
    'SELECT id, is_verified FROM lawyer_profiles WHERE user_id = $1',
    [userId]
  );

  if (lawyerProfileResult.rows.length === 0) {
    throw new Error('Perfil de abogado no encontrado');
  }

  const lawyerProfile = lawyerProfileResult.rows[0];
  const lawyerId = lawyerProfile.id;

  // Estadísticas para abogados
  const consultationsStatsQuery = `
    SELECT 
      COUNT(*) as total_consultations,
      COUNT(*) FILTER (WHERE status IN ('pendiente', 'aceptada', 'en_proceso')) as active_consultations,
      COUNT(*) FILTER (WHERE status = 'completada') as completed_consultations,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_consultations_month
    FROM consultations
    WHERE lawyer_id = $1
  `;

  const clientsStatsQuery = `
    SELECT 
      COUNT(DISTINCT client_id) as total_clients,
      COUNT(DISTINCT client_id) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_month
    FROM consultations
    WHERE lawyer_id = $1
  `;

  const earningsStatsQuery = `
    SELECT 
      COALESCE(SUM(lawyer_earnings), 0) as total_earnings,
      COALESCE(SUM(lawyer_earnings) FILTER (WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as earnings_this_month,
      COUNT(*) FILTER (WHERE p.status = 'completado') as completed_payments
    FROM payments p
    INNER JOIN consultations c ON p.consultation_id = c.id
    WHERE c.lawyer_id = $1
  `;

  const [consultationsResult, clientsResult, earningsResult] = await Promise.all([
    query(consultationsStatsQuery, [lawyerId]),
    query(clientsStatsQuery, [lawyerId]),
    query(earningsStatsQuery, [lawyerId])
  ]);

  const consultations = consultationsResult.rows[0];
  const clients = clientsResult.rows[0];
  const earnings = earningsResult.rows[0];

  return {
    role: 'abogado',
    verification_status: lawyerProfile.is_verified,
    metrics: [
      {
        title: 'Consultas Activas',
        value: consultations.active_consultations || '0',
        description: `${consultations.completed_consultations || 0} completadas`,
        icon: 'FileText',
        color: 'text-blue-600',
        trend: 'up'
      },
      {
        title: 'Mis Clientes',
        value: clients.total_clients || '0',
        description: `+${clients.new_clients_month || 0} este mes`,
        icon: 'Users',
        color: 'text-green-600',
        trend: 'up'
      },
      {
        title: 'Ganancias Totales',
        value: parseFloat(earnings.total_earnings || 0),
        description: `${earnings.completed_payments || 0} pagos recibidos`,
        icon: 'DollarSign',
        color: 'text-yellow-600',
        trend: 'up',
        format: 'currency'
      },
      {
        title: 'Total Consultas',
        value: consultations.total_consultations || '0',
        description: `+${consultations.new_consultations_month || 0} este mes`,
        icon: 'TrendingUp',
        color: 'text-purple-600',
        trend: 'up'
      }
    ]
  };
}

async function getClientStats(userId: string) {
  // Estadísticas para clientes
  const consultationsStatsQuery = `
    SELECT 
      COUNT(*) as total_consultations,
      COUNT(*) FILTER (WHERE status IN ('pendiente', 'aceptada', 'en_proceso')) as active_consultations,
      COUNT(*) FILTER (WHERE status = 'completada') as completed_consultations,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_consultations_month
    FROM consultations
    WHERE client_id = $1
  `;

  const paymentsStatsQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) as total_spent,
      COALESCE(SUM(amount) FILTER (WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as spent_this_month,
      COUNT(*) FILTER (WHERE p.status = 'completado') as completed_payments
    FROM payments p
    INNER JOIN consultations c ON p.consultation_id = c.id
    WHERE c.client_id = $1
  `;

  const lawyersStatsQuery = `
    SELECT 
      COUNT(DISTINCT lawyer_id) as lawyers_contacted
    FROM consultations
    WHERE client_id = $1
  `;

  const [consultationsResult, paymentsResult, lawyersResult] = await Promise.all([
    query(consultationsStatsQuery, [userId]),
    query(paymentsStatsQuery, [userId]),
    query(lawyersStatsQuery, [userId])
  ]);

  const consultations = consultationsResult.rows[0];
  const payments = paymentsResult.rows[0];
  const lawyers = lawyersResult.rows[0];

  return {
    role: 'cliente',
    metrics: [
      {
        title: 'Consultas Activas',
        value: consultations.active_consultations || '0',
        description: `${consultations.completed_consultations || 0} completadas`,
        icon: 'FileText',
        color: 'text-blue-600',
        trend: 'neutral'
      },
      {
        title: 'Abogados Contactados',
        value: lawyers.lawyers_contacted || '0',
        description: 'Profesionales consultados',
        icon: 'Users',
        color: 'text-green-600',
        trend: 'up'
      },
      {
        title: 'Total Invertido',
        value: parseFloat(payments.total_spent || 0),
        description: `${payments.completed_payments || 0} pagos realizados`,
        icon: 'DollarSign',
        color: 'text-yellow-600',
        trend: 'up',
        format: 'currency'
      },
      {
        title: 'Total Consultas',
        value: consultations.total_consultations || '0',
        description: `+${consultations.new_consultations_month || 0} este mes`,
        icon: 'TrendingUp',
        color: 'text-purple-600',
        trend: 'up'
      }
    ]
  };
}