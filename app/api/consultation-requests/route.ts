import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/database';
import { PoolClient } from 'pg';

export const dynamic = 'force-dynamic';

interface ConsultationRequest {
  lawyer_id: string;
  service_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferred_contact: 'email' | 'phone' | 'both';
}

export async function POST(request: NextRequest) {
  try {
    const data: ConsultationRequest = await request.json();
    
    // Validations
    const {
      lawyer_id,
      service_id,
      client_name,
      client_email,
      client_phone,
      title,
      description,
      priority,
      preferred_contact
    } = data;

    if (!lawyer_id || !client_name || !client_email || !title || !description) {
      return NextResponse.json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client_email)) {
      return NextResponse.json({
        success: false,
        message: 'Email inválido'
      }, { status: 400 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      // Verify lawyer exists
      const lawyerCheck = await client.query(`
        SELECT 
          lp.id, 
          u.first_name, 
          u.last_name, 
          u.email 
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE lp.id = $1
      `, [lawyer_id]);

      if (lawyerCheck.rows.length === 0) {
        throw new Error('Abogado no encontrado');
      }

      const lawyer = lawyerCheck.rows[0];

      // Verify service exists if provided
      let service = null;
      if (service_id) {
        const serviceCheck = await client.query(
          'SELECT id, title, price, duration_minutes FROM lawyer_services WHERE id = $1 AND lawyer_id = $2',
          [service_id, lawyer_id]
        );

        if (serviceCheck.rows.length === 0) {
          throw new Error('Servicio no encontrado');
        }
        service = serviceCheck.rows[0];
      }

      // First create a temporary client user entry or use existing consultations table
      // For now, we'll store the request as a consultation with status 'pendiente'
      const requestResult = await client.query(`
        INSERT INTO consultations (
          lawyer_id,
          title,
          description,
          priority,
          status,
          client_notes,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, 'pendiente', $5, NOW(), NOW())
        RETURNING id, created_at
      `, [
        lawyer_id,
        title,
        description,
        priority,
        JSON.stringify({
          client_name,
          client_email,
          client_phone: client_phone || null,
          preferred_contact: preferred_contact || 'email',
          service_id: service_id || null
        })
      ]);

      const consultationRequest = requestResult.rows[0];

      // TODO: Send notification email to lawyer
      // TODO: Send confirmation email to client

      return {
        request_id: consultationRequest.id,
        lawyer: {
          name: `${lawyer.first_name} ${lawyer.last_name}`,
          email: lawyer.email
        },
        service: service ? {
          title: service.title,
          price: service.price,
          duration: service.duration_minutes
        } : null,
        created_at: consultationRequest.created_at,
        estimated_response: '24 horas'
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de consulta enviada exitosamente',
      data: result
    });

  } catch (error: any) {
    console.error('❌ Error creating consultation request:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

// GET - Para que los abogados puedan ver sus solicitudes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lawyer_id = searchParams.get('lawyer_id');
    const status = searchParams.get('status');

    if (!lawyer_id) {
      return NextResponse.json({
        success: false,
        message: 'lawyer_id es requerido'
      }, { status: 400 });
    }

    const result = await withTransaction(async (client: PoolClient) => {
      let query = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email as lawyer_email
        FROM consultations c
        JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
        JOIN users u ON lp.user_id = u.id
        WHERE c.lawyer_id = $1 AND c.status = 'pendiente'
      `;
      
      const params = [lawyer_id];

      if (status && status !== 'pending') {
        query += ` AND c.status = $2`;
        params.push(status);
      }

      query += ` ORDER BY c.created_at DESC`;

      const requests = await client.query(query, params);
      return requests.rows.map(row => ({
        ...row,
        client_data: row.client_notes ? JSON.parse(row.client_notes) : {}
      }));
    });

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching consultation requests:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}