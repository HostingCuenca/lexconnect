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

    let appointments: any[] = [];

    if (user.role === 'administrador') {
      appointments = await getAdminAppointments();
    } else if (user.role === 'abogado') {
      appointments = await getLawyerAppointments(user.userId);
    } else if (user.role === 'cliente') {
      appointments = await getClientAppointments(user.userId);
    }

    return NextResponse.json({
      success: true,
      data: appointments
    });

  } catch (error: any) {
    console.error('Error obteniendo próximas citas:', error);
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

async function getAdminAppointments() {
  const appointmentsQuery = `
    SELECT 
      c.id,
      c.title,
      c.status,
      c.created_at as appointment_date,
      c.client_id,
      c.lawyer_id,
      client.first_name || ' ' || client.last_name as client_name,
      lawyer.first_name || ' ' || lawyer.last_name as lawyer_name,
      'Consulta' as appointment_type
    FROM consultations c
    INNER JOIN users client ON c.client_id = client.id
    INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
    INNER JOIN users lawyer ON lp.user_id = lawyer.id
    WHERE c.status IN ('pendiente', 'aceptada', 'en_proceso')
      AND c.created_at >= CURRENT_DATE - INTERVAL '1 day'
    ORDER BY c.created_at DESC
    LIMIT 10
  `;

  const result = await query(appointmentsQuery);
  return result.rows.map(formatAppointment);
}

async function getLawyerAppointments(userId: string) {
  const lawyerProfileResult = await query(
    'SELECT id FROM lawyer_profiles WHERE user_id = $1',
    [userId]
  );

  if (lawyerProfileResult.rows.length === 0) {
    throw new Error('Perfil de abogado no encontrado');
  }

  const lawyerId = lawyerProfileResult.rows[0].id;

  const appointmentsQuery = `
    SELECT 
      c.id,
      c.title,
      c.status,
      c.created_at as appointment_date,
      c.client_id,
      c.lawyer_id,
      client.first_name || ' ' || client.last_name as client_name,
      'Consulta' as appointment_type
    FROM consultations c
    INNER JOIN users client ON c.client_id = client.id
    WHERE c.lawyer_id = $1 
      AND c.status IN ('pendiente', 'aceptada', 'en_proceso')
      AND c.created_at >= CURRENT_DATE - INTERVAL '1 day'
    ORDER BY c.created_at DESC
    LIMIT 5
  `;

  const result = await query(appointmentsQuery, [lawyerId]);
  return result.rows.map(formatAppointment);
}

async function getClientAppointments(userId: string) {
  const appointmentsQuery = `
    SELECT 
      c.id,
      c.title,
      c.status,
      c.created_at as appointment_date,
      c.client_id,
      c.lawyer_id,
      lawyer.first_name || ' ' || lawyer.last_name as lawyer_name,
      'Consulta' as appointment_type
    FROM consultations c
    INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
    INNER JOIN users lawyer ON lp.user_id = lawyer.id
    WHERE c.client_id = $1 
      AND c.status IN ('pendiente', 'aceptada', 'en_proceso')
      AND c.created_at >= CURRENT_DATE - INTERVAL '1 day'
    ORDER BY c.created_at DESC
    LIMIT 5
  `;

  const result = await query(appointmentsQuery, [userId]);
  return result.rows.map(formatAppointment);
}

function formatAppointment(appointment: any) {
  const appointmentDate = new Date(appointment.appointment_date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let dateDisplay;
  let timeDisplay;

  if (appointmentDate.toDateString() === today.toDateString()) {
    dateDisplay = { day: 'HOY', month: '' };
    timeDisplay = appointmentDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
    dateDisplay = { day: 'MAÑ', month: '' };
    timeDisplay = appointmentDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    dateDisplay = { 
      day: appointmentDate.getDate().toString(),
      month: appointmentDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
    };
    timeDisplay = appointmentDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  const participantName = appointment.client_name || appointment.lawyer_name;
  const statusText = getStatusText(appointment.status);

  return {
    id: appointment.id,
    title: `${appointment.appointment_type} - ${appointment.title}`,
    description: `${timeDisplay} - ${participantName}`,
    status: statusText,
    date: dateDisplay,
    appointment_date: appointment.appointment_date
  };
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pendiente': 'Pendiente',
    'aceptada': 'Confirmada',
    'en_proceso': 'En Proceso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'rechazada': 'Rechazada'
  };
  return statusMap[status] || status;
}